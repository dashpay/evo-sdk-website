import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// Dispatch coverage for the wallet cases in callEvo(): argument mapping,
// injected network, handler-level validation, and the guarantee that wallet
// operations never touch the (null) platform client.
//
// operations.js imports { wallet, getSelectedNetwork } from sdk-client.js,
// which transitively loads the real SDK bundle and browser state; mock the
// whole module so wallet calls are observable and no wasm is initialized.

const mocks = vi.hoisted(() => ({
  wallet: {
    generateMnemonic: vi.fn().mockResolvedValue('mnemonic'),
    validateMnemonic: vi.fn().mockResolvedValue(true),
    mnemonicToSeed: vi.fn().mockResolvedValue(new Uint8Array([0x5e, 0xb0, 0x0b])),
    generateKeyPair: vi.fn().mockResolvedValue('keyPair'),
    generateKeyPairs: vi.fn().mockResolvedValue(['keyPair']),
    keyPairFromWif: vi.fn().mockResolvedValue('keyPairFromWif'),
    keyPairFromHex: vi.fn().mockResolvedValue('keyPairFromHex'),
    pubkeyToAddress: vi.fn().mockResolvedValue('address'),
    validateAddress: vi.fn().mockResolvedValue(true),
    signMessage: vi.fn().mockResolvedValue('signature'),
  },
  getSelectedNetwork: vi.fn().mockReturnValue('testnet'),
}));

vi.mock('../../public/src/sdk-client.js', () => ({
  wallet: mocks.wallet,
  getSelectedNetwork: mocks.getSelectedNetwork,
}));

let callEvo;

beforeAll(async () => {
  // operations.js transitively imports state.js, which touches `document` at
  // import time; stub a minimal shim before dynamically importing (same
  // approach as operations-dispatch.test.js).
  vi.stubGlobal('document', {
    getElementById: () => null,
    querySelectorAll: () => [],
  });
  ({ callEvo } = await import('../../public/src/operations.js'));
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSelectedNetwork.mockReturnValue('testnet');
});

// A proxy client that throws on ANY property access: proves wallet cases
// never touch the platform client (executeSelected passes null for wallet,
// so any access would be a bug either way).
const poisonClient = new Proxy({}, {
  get(_target, prop) {
    // callEvo probes the transition registry first, which only reads the
    // client after matching a transition key; allow standard well-known
    // symbol probes used by the runtime itself.
    if (typeof prop === 'symbol' || prop === 'then') return undefined;
    throw new Error(`wallet operation touched client.${String(prop)}`);
  },
});

function run(itemKey, values = {}, client = null) {
  return callEvo(client, 'wallet', itemKey, [], [], false, values);
}

describe('walletGenerateMnemonic', () => {
  it('passes wordCount and languageCode as a params object', async () => {
    await run('walletGenerateMnemonic', { wordCount: '24', languageCode: 'es' });
    expect(mocks.wallet.generateMnemonic).toHaveBeenCalledWith({ wordCount: 24, languageCode: 'es' });
  });

  it('defaults to 12 words and omits an empty languageCode', async () => {
    await run('walletGenerateMnemonic', { languageCode: '' });
    expect(mocks.wallet.generateMnemonic).toHaveBeenCalledWith({ wordCount: 12 });
  });

  it('rejects an invalid word count', async () => {
    for (const wordCount of ['13', '0', '-12', '12.5']) {
      await expect(run('walletGenerateMnemonic', { wordCount }))
        .rejects.toThrow('Word count must be 12, 15, 18, 21, or 24');
    }
    expect(mocks.wallet.generateMnemonic).not.toHaveBeenCalled();
  });
});

describe('walletValidateMnemonic', () => {
  it('trims the mnemonic and forwards the language', async () => {
    await run('walletValidateMnemonic', { mnemonic: '  abandon about  ', languageCode: 'en' });
    expect(mocks.wallet.validateMnemonic).toHaveBeenCalledWith('abandon about', 'en');
  });

  it('passes undefined for a blank language', async () => {
    await run('walletValidateMnemonic', { mnemonic: 'abandon about', languageCode: '' });
    expect(mocks.wallet.validateMnemonic).toHaveBeenCalledWith('abandon about', undefined);
  });

  it('rejects a whitespace-only mnemonic', async () => {
    await expect(run('walletValidateMnemonic', { mnemonic: '   ' })).rejects.toThrow('Mnemonic is required');
  });
});

describe('walletMnemonicToSeed', () => {
  it('hex-encodes the returned seed bytes', async () => {
    await expect(run('walletMnemonicToSeed', { mnemonic: 'abandon about' })).resolves.toBe('5eb00b');
    expect(mocks.wallet.mnemonicToSeed).toHaveBeenCalledWith('abandon about', undefined);
  });

  it('forwards a passphrase', async () => {
    await run('walletMnemonicToSeed', { mnemonic: 'abandon about', passphrase: 'TREZOR' });
    expect(mocks.wallet.mnemonicToSeed).toHaveBeenCalledWith('abandon about', 'TREZOR');
  });

  it('never trims the passphrase (whitespace changes the derived seed)', async () => {
    await run('walletMnemonicToSeed', { mnemonic: 'abandon about', passphrase: ' TREZOR ' });
    expect(mocks.wallet.mnemonicToSeed).toHaveBeenCalledWith('abandon about', ' TREZOR ');
  });

  it('rejects a missing mnemonic', async () => {
    await expect(run('walletMnemonicToSeed', {})).rejects.toThrow('Mnemonic is required');
  });
});

describe('key pair generation', () => {
  it('walletGenerateKeyPair injects the selected network', async () => {
    mocks.getSelectedNetwork.mockReturnValue('mainnet');
    await run('walletGenerateKeyPair');
    expect(mocks.wallet.generateKeyPair).toHaveBeenCalledWith('mainnet');
  });

  it('walletGenerateKeyPairs injects the network and passes an integer count', async () => {
    await run('walletGenerateKeyPairs', { count: '3' });
    expect(mocks.wallet.generateKeyPairs).toHaveBeenCalledWith('testnet', 3);
  });

  it('walletGenerateKeyPairs rejects out-of-range or non-integer counts', async () => {
    for (const count of ['0', '-1', '101', '2.5', 'abc', '']) {
      await expect(run('walletGenerateKeyPairs', { count }))
        .rejects.toThrow('Count must be an integer between 1 and 100');
    }
    expect(mocks.wallet.generateKeyPairs).not.toHaveBeenCalled();
  });
});

describe('key import and address helpers', () => {
  it('walletKeyPairFromWif trims the WIF and takes no network', async () => {
    await run('walletKeyPairFromWif', { privateKeyWif: ' cWif ' });
    expect(mocks.wallet.keyPairFromWif).toHaveBeenCalledWith('cWif');
    expect(mocks.getSelectedNetwork).not.toHaveBeenCalled();
  });

  it('walletKeyPairFromHex trims the hex and injects the network', async () => {
    await run('walletKeyPairFromHex', { privateKeyHex: ' c4bb ' });
    expect(mocks.wallet.keyPairFromHex).toHaveBeenCalledWith('c4bb', 'testnet');
  });

  it('walletPubkeyToAddress injects the network', async () => {
    await run('walletPubkeyToAddress', { pubkeyHex: '0378d4' });
    expect(mocks.wallet.pubkeyToAddress).toHaveBeenCalledWith('0378d4', 'testnet');
  });

  it('walletValidateAddress injects the network', async () => {
    await run('walletValidateAddress', { address: 'yXSS' });
    expect(mocks.wallet.validateAddress).toHaveBeenCalledWith('yXSS', 'testnet');
  });

  it('rejects whitespace-only trimmed inputs', async () => {
    await expect(run('walletKeyPairFromWif', { privateKeyWif: '  ' })).rejects.toThrow('Private key WIF is required');
    await expect(run('walletKeyPairFromHex', { privateKeyHex: '  ' })).rejects.toThrow('Private key hex is required');
    await expect(run('walletPubkeyToAddress', { pubkeyHex: '  ' })).rejects.toThrow('Public key hex is required');
    await expect(run('walletValidateAddress', { address: '  ' })).rejects.toThrow('Address is required');
  });
});

describe('walletSignMessage', () => {
  it('passes the message through exactly, without trimming', async () => {
    await run('walletSignMessage', { message: '  padded message  ', privateKeyWif: 'cWif' });
    expect(mocks.wallet.signMessage).toHaveBeenCalledWith('  padded message  ', 'cWif');
  });

  it('accepts a whitespace-only message (whitespace is legitimate signed data)', async () => {
    await run('walletSignMessage', { message: '   ', privateKeyWif: 'cWif' });
    expect(mocks.wallet.signMessage).toHaveBeenCalledWith('   ', 'cWif');
  });

  it('rejects only an empty or missing message', async () => {
    await expect(run('walletSignMessage', { message: '', privateKeyWif: 'cWif' })).rejects.toThrow('Message is required');
    await expect(run('walletSignMessage', { privateKeyWif: 'cWif' })).rejects.toThrow('Message is required');
    expect(mocks.wallet.signMessage).not.toHaveBeenCalled();
  });
});

describe('client isolation', () => {
  it('wallet operations never touch the platform client', async () => {
    await run('walletGenerateMnemonic', {}, poisonClient);
    await run('walletGenerateKeyPair', {}, poisonClient);
    await run('walletSignMessage', { message: 'x', privateKeyWif: 'cWif' }, poisonClient);
    expect(mocks.wallet.generateMnemonic).toHaveBeenCalled();
    expect(mocks.wallet.generateKeyPair).toHaveBeenCalled();
    expect(mocks.wallet.signMessage).toHaveBeenCalled();
  });
});
