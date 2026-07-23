import fs from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../public/src/sdk-types.js', () => {
  class MockAddress {
    constructor(value) { this.value = value; }
    toHex() { return this.value.replace(/^tdash1:/, ''); }
    toBech32m() { return this.value; }
  }

  class MockPrivateKey {
    constructor(wif) { this.wif = wif; }
    static fromWIF(wif) { return new MockPrivateKey(wif); }
    getPublicKey() { return { toBytes: () => Uint8Array.from([1, 2, 3]) }; }
  }

  class MockPlatformAddressSigner {
    addKey(key) {
      this.key = key;
      return new MockAddress(`tdash1:${key.wif}`);
    }
  }

  class MockIdentitySigner {
    addKeyFromWif(wif) { this.wif = wif; }
    addKey(key) { this.key = key; }
  }

  return {
    AssetLockProof: { fromHex: hex => ({ hex }) },
    CoreScript: {
      fromP2PKH: hash => ({ type: 'p2pkh', hash: [...hash] }),
      fromP2SH: hash => ({ type: 'p2sh', hash: [...hash] }),
    },
    Identifier: { fromBytes: bytes => ({ bytes, toString: () => 'generated-id' }) },
    Identity: class {
      constructor(id) { this.id = id; }
      addPublicKey(key) { this.publicKey = key; }
    },
    IdentityPublicKeyInCreation: class {
      constructor(value) { this.value = value; }
      toIdentityPublicKey() { return this.value; }
    },
    IdentitySigner: MockIdentitySigner,
    KeyType: { ECDSA_SECP256K1: 0 },
    PlatformAddress: {
      fromBech32m(value) {
        if (!value?.startsWith('tdash1:')) throw new Error('invalid address');
        return new MockAddress(value);
      },
    },
    PlatformAddressSigner: MockPlatformAddressSigner,
    PoolingWasm: { Never: 0, IfAvailable: 1, Standard: 2 },
    PrivateKey: MockPrivateKey,
    Purpose: { AUTHENTICATION: 0 },
    SecurityLevel: { MASTER: 0 },
  };
});

const { addressTransitionOperations } = await import('../../public/src/transitions/address-operations.js');

function fundedSdk(balance = 10_000n) {
  return {
    addresses: { get: vi.fn(async () => ({ balance, nonce: 7n })) },
    identities: { fetch: vi.fn(async id => ({ id })) },
  };
}

const transferValues = {
  senderAddress: 'tdash1:key-a',
  recipientAddress: 'tdash1:key-b',
  addressPrivateKeyWif: 'key-a',
  amount: '2500',
};

describe('Platform Address transition operations', () => {
  it('prepares a transfer with bigint amounts and the signer-derived sender', async () => {
    const sdk = fundedSdk();
    const prepared = await addressTransitionOperations.addressTransfer.prepare(transferValues, sdk);

    expect(sdk.addresses.get).toHaveBeenCalledWith(expect.objectContaining({
      value: transferValues.senderAddress,
    }));
    expect(prepared.options.inputs).toEqual([{
      address: transferValues.senderAddress,
      amount: 2500n,
    }]);
    expect(prepared.options.outputs).toEqual([{
      address: transferValues.recipientAddress,
      amount: 2500n,
    }]);
    expect(prepared.options.signer.key.wif).toBe(transferValues.addressPrivateKeyWif);
  });

  it('rejects zero and negative amounts', async () => {
    await expect(addressTransitionOperations.addressTransfer.prepare(
      { ...transferValues, amount: '0' },
      fundedSdk(),
    )).rejects.toThrow('Amount must be greater than zero');
    await expect(addressTransitionOperations.addressTransfer.prepare(
      { ...transferValues, amount: '-1' },
      fundedSdk(),
    )).rejects.toThrow('Amount must be greater than zero');
  });

  it('rejects a sender address that does not match its private key', async () => {
    await expect(addressTransitionOperations.addressTransfer.prepare(
      { ...transferValues, senderAddress: 'tdash1:key-c' },
      fundedSdk(),
    )).rejects.toThrow('Sender Platform Address does not match the supplied private key');
  });

  it('rejects unfunded and insufficiently funded senders', async () => {
    await expect(addressTransitionOperations.addressTransfer.prepare(
      transferValues,
      { addresses: { get: vi.fn(async () => undefined) } },
    )).rejects.toThrow('Sender Platform Address is not funded');
    await expect(addressTransitionOperations.addressTransfer.prepare(
      transferValues,
      fundedSdk(2499n),
    )).rejects.toThrow('Sender Platform Address has insufficient balance');
  });

  it('rejects transfers whose output is also the input address', async () => {
    await expect(addressTransitionOperations.addressTransfer.prepare(
      { ...transferValues, recipientAddress: transferValues.senderAddress },
      fundedSdk(),
    )).rejects.toThrow('Sender and recipient Platform Addresses must be different');
  });

  it('builds a P2PKH withdrawal script from a checksum-valid Core address', async () => {
    const prepared = await addressTransitionOperations.addressWithdraw.prepare({
      senderAddress: transferValues.senderAddress,
      addressPrivateKeyWif: transferValues.addressPrivateKeyWif,
      amount: '1000',
      toAddress: 'yQW6TmUFef5CDyhEYwjoN8aUTMmKLYYNDm',
      coreFeePerByte: '2',
    }, fundedSdk());

    expect(prepared.options.outputScript).toMatchObject({ type: 'p2pkh' });
    expect(prepared.options.outputScript.hash).toHaveLength(20);
    expect(prepared.options.pooling).toBe(0);
    expect(prepared.options.coreFeePerByte).toBe(2);
  });

  it('rejects a Core address with an invalid checksum', async () => {
    await expect(addressTransitionOperations.addressWithdraw.prepare({
      senderAddress: transferValues.senderAddress,
      addressPrivateKeyWif: transferValues.addressPrivateKeyWif,
      amount: '1000',
      toAddress: 'yQW6TmUFef5CDyhEYwjoN8aUTMmKLYYNDn',
    }, fundedSdk())).rejects.toThrow('Dash Core address checksum is invalid');
  });

  it('rebuilds inputs once after a stale nonce error', async () => {
    const transfer = vi.fn()
      .mockRejectedValueOnce(new Error('invalid address nonce'))
      .mockResolvedValueOnce(new Map());
    const rebuild = vi.fn(async () => ({ refreshed: true }));
    const sdk = { addresses: { transfer } };
    const prepared = { options: { refreshed: false }, rebuild };

    const result = await addressTransitionOperations.addressTransfer.execute(prepared, sdk);
    expect(transfer).toHaveBeenCalledTimes(2);
    expect(rebuild).toHaveBeenCalledOnce();
    expect(transfer).toHaveBeenLastCalledWith({ refreshed: true });
    expect(result).toMatchObject({ status: 'success', addressInfos: {} });
  });

  it('requires both identity-backed transitions to resolve an identity', async () => {
    const sdk = { identities: { fetch: vi.fn(async () => undefined) } };
    await expect(addressTransitionOperations.addressTransferFromIdentity.prepare(
      { identityId: 'missing' },
      sdk,
    )).rejects.toThrow('Identity not found: missing');
    await expect(addressTransitionOperations.addressTopUpIdentity.prepare(
      { identityId: 'missing' },
      sdk,
    )).rejects.toThrow('Identity not found: missing');
    expect(sdk.identities.fetch).toHaveBeenCalledTimes(2);
  });

  it('normalizes facade results without leaking bigint or WASM objects', async () => {
    const info = { address: { toHex: () => '00aa' }, balance: 12n, nonce: 3n };
    const result = await addressTransitionOperations.addressTransferFromIdentity.execute(
      { options: {}, context: { amount: 5n } },
      { addresses: { transferFromIdentity: async () => ({ newBalance: 99n, addressInfos: new Map([['00aa', info]]) }) } },
    );
    expect(result).toEqual({
      status: 'success',
      newBalance: '99',
      addressInfos: { '00aa': { address: '00aa', balance: '12', nonce: '3' } },
      message: 'Transferred 5 credits from identity',
    });
  });

  it('exposes all six operations and current SDK constructor examples', () => {
    expect(Object.keys(addressTransitionOperations)).toHaveLength(6);
    for (const operation of Object.values(addressTransitionOperations)) {
      expect(operation.disabled).toBeUndefined();
      expect(operation.renderCode({})).not.toContain('new PlatformAddressInput');
      expect(operation.renderCode({})).not.toContain('new PlatformAddressOutput');
    }
    expect(addressTransitionOperations.addressWithdraw.renderCode({})).toContain('CoreScript.fromP2PKH');
    expect(addressTransitionOperations.addressWithdraw.renderCode({})).toContain('pooling: PoolingWasm.Never');
    expect(addressTransitionOperations.addressTopUpIdentity.renderCode({})).toContain('{ identity, inputs:');
    expect(addressTransitionOperations.addressTransferFromIdentity.renderCode({})).toContain('{ identity, outputs, signer }');
  });

  it('keeps generated definitions enabled and nonce-free', () => {
    const definitions = JSON.parse(fs.readFileSync(new URL('../../public/api-definitions.json', import.meta.url), 'utf8'));
    const operations = definitions.transitions.address.transitions;
    expect(Object.values(operations).every(operation => !operation.disabled)).toBe(true);
    expect(Object.values(operations).flatMap(operation => operation.inputs).some(input => input.name === 'senderNonce')).toBe(false);
  });
});
