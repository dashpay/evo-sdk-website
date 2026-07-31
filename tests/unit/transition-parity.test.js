import fs from 'node:fs';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../public/src/sdk-types.js', () => {
  class IdentitySigner {
    addKeyFromWif(value) { this.privateKeyWif = value; }
  }
  class Document {
    constructor(options) { Object.assign(this, options); }
  }
  class DataContract {
    constructor(options) { Object.assign(this, options); }
    setConfig(config) { this.config = config; }
  }
  return {
    DataContract,
    Document,
    IdentitySigner,
    Identifier: {
      fromBase58: value => ({ kind: 'Identifier', value }),
    },
  };
});

const catalog = JSON.parse(fs.readFileSync(new URL('../../public/sdk-operation-catalog.json', import.meta.url), 'utf8'));
let contractTransitionOperations;
let documentTransitionOperations;
let identityTransitionOperations;
let tokenTransitionOperations;

beforeAll(async () => {
  ({ contractTransitionOperations } = await import('../../public/src/transitions/contract-operations.js'));
  ({ documentTransitionOperations } = await import('../../public/src/transitions/document-operations.js'));
  ({ identityTransitionOperations } = await import('../../public/src/transitions/identity-operations.js'));
  ({ tokenTransitionOperations } = await import('../../public/src/transitions/token-operations.js'));
});

function identity() {
  const identityKey = { id: 3, securityLevel: 'HIGH' };
  return {
    id: 'identity-id',
    publicKeys: [identityKey],
    getPublicKeyById: () => identityKey,
  };
}

function sdk(overrides = {}) {
  return {
    identities: {
      fetch: async () => identity(),
      nonce: async () => 4n,
    },
    ...overrides,
  };
}

function expectPreparedCodeParity(key, operation, prepared, code) {
  expect(code).toContain(`sdk.${operation.sdkMethod}({`);
  const declared = catalog.operations.find(item => item.key === key).parameters[0].properties.map(property => property.name);
  expect(Object.keys(prepared.options).every(name => declared.includes(name))).toBe(true);
  const escapedMethod = operation.sdkMethod.replaceAll('.', '\\.');
  const renderedOptions = code.match(new RegExp(`sdk\\.${escapedMethod}\\(\\{([\\s\\S]*?)\\}\\)`))?.[1] || '';
  for (const name of Object.keys(prepared.options)) expect(renderedOptions).toMatch(new RegExp(`\\b${name}\\b`));
}

describe('prepared transition and rendered-code parity', () => {
  it('keeps document revision preparation aligned with its example', async () => {
    const operation = documentTransitionOperations.documentReplace;
    const prepared = await operation.prepare({
      contractId: 'contract-id', documentType: 'note', documentId: 'document-id', ownerId: 'owner-id',
      documentFields: { data: { message: 'updated' }, revision: 4 }, keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    const code = operation.renderCode({});
    expect(prepared.options.document.revision).toBe(5);
    expect(code).toContain('revision: Number(BigInt(revision) + 1n)');
    expectPreparedCodeParity('documentReplace', operation, prepared, code);
  });

  it('keeps contract construction and publish options aligned', async () => {
    const operation = contractTransitionOperations.dataContractCreate;
    const prepared = await operation.prepare({
      ownerId: 'owner-id', documentSchemas: '{"note":{"type":"object"}}', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    const code = operation.renderCode({});
    expect(prepared.options.dataContract.identityNonce).toBe(5n);
    expect(code).toContain('const dataContract = new DataContract');
    expectPreparedCodeParity('dataContractCreate', operation, prepared, code);
  });

  it('keeps identity bigint conversion and transfer options aligned', async () => {
    const operation = identityTransitionOperations.identityCreditTransfer;
    const prepared = await operation.prepare({
      identityId: 'identity-id', recipientId: 'recipient-id', amount: '42', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    const code = operation.renderCode({});
    expect(prepared.options.amount).toBe(42n);
    expect(code).toContain('amount: BigInt(');
    expectPreparedCodeParity('identityCreditTransfer', operation, prepared, code);
  });

  it('keeps token identifiers, bigint conversion, and options aligned', async () => {
    const operation = tokenTransitionOperations.tokenTransfer;
    const prepared = await operation.prepare({
      contractId: 'contract-id', tokenPosition: '2', identityId: 'sender-id', recipientId: 'recipient-id',
      amount: '17', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    const code = operation.renderCode({});
    expect(prepared.options.amount).toBe(17n);
    expect(prepared.options.tokenPosition).toBe(2);
    expect(prepared.options.dataContractId).toEqual({ kind: 'Identifier', value: 'contract-id' });
    expect(code).toContain('dataContractId: Identifier.fromBase58(contractId)');
    expect(code).toContain('amount: BigInt(amount)');
    expectPreparedCodeParity('tokenTransfer', operation, prepared, code);
  });

  it('preserves canonical token claims and nullable set prices', async () => {
    const claim = await tokenTransitionOperations.tokenClaim.prepare({
      contractId: 'contract-id', tokenPosition: '0', identityId: 'identity-id',
      distributionType: 'preProgrammed', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    expect(claim.options.distributionType).toBe('preProgrammed');
    expect(tokenTransitionOperations.tokenClaim.renderCode({}))
      .toContain('distributionType: distributionType');

    const setPrice = await tokenTransitionOperations.tokenSetPriceForDirectPurchase.prepare({
      contractId: 'contract-id', tokenPosition: '0', identityId: 'identity-id',
      priceData: '', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    expect(setPrice.options.price).toBeNull();

    const zeroPrice = await tokenTransitionOperations.tokenSetPriceForDirectPurchase.prepare({
      contractId: 'contract-id', tokenPosition: '0', identityId: 'identity-id',
      priceData: '0', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    expect(zeroPrice.options.price).toBe(0n);
    expect(tokenTransitionOperations.tokenSetPriceForDirectPurchase.renderCode({}))
      .toContain("priceData == null || priceData === '' ? null : BigInt(priceData)");
  });

  it('requires and converts the direct-purchase maximum cost', async () => {
    const operation = tokenTransitionOperations.tokenDirectPurchase;
    await expect(operation.prepare({
      contractId: 'contract-id', tokenPosition: '0', identityId: 'identity-id', amount: '2',
      totalAgreedPrice: '', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk())).rejects.toThrow('maxTotalCost is required');

    const prepared = await operation.prepare({
      contractId: 'contract-id', tokenPosition: '0', identityId: 'identity-id', amount: '2',
      totalAgreedPrice: '0', keyId: 3, privateKeyWif: 'test-wif',
    }, sdk());
    expect(prepared.options.maxTotalCost).toBe(0n);
    expect(operation.renderCode({})).toContain('maxTotalCost: BigInt(totalAgreedPrice)');
  });
});
