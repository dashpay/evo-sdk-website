import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../public/src/sdk-types.js', () => {
  class IdentitySigner {
    addKeyFromWif(value) { this.privateKeyWif = value; }
  }
  class Document {
    constructor(options) {
      Object.assign(this, options);
      this.id ??= 'generated-document-id';
    }
  }
  class DataContract {
    constructor(options) {
      Object.assign(this, options);
    }
    setConfig(config) { this.config = config; }
    setSchemas(schemas) { this.schemas = schemas; }
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

function testIdentity(id = 'identity-id') {
  const identityKey = { id: 3, securityLevel: 'HIGH' };
  return {
    id,
    publicKeys: [identityKey],
    getPublicKeyById: () => identityKey,
  };
}

function identitySdk(overrides = {}) {
  return {
    identities: {
      fetch: vi.fn(async id => testIdentity(id)),
      nonce: vi.fn(async () => 4n),
      ...overrides,
    },
  };
}

describe('identity credit transition preparation and execution', () => {
  it('prepares and normalizes an identity credit transfer', async () => {
    const fetchedIdentity = testIdentity('sender-id');
    const creditTransfer = vi.fn(async () => ({
      senderBalance: 900n,
      recipientBalance: 100n,
    }));
    const fetch = vi.fn(async () => fetchedIdentity);
    const sdk = identitySdk({ fetch, creditTransfer });
    const operation = identityTransitionOperations.identityCreditTransfer;
    const prepared = await operation.prepare({
      identityId: 'sender-id',
      recipientId: 'recipient-id',
      amount: '100',
      privateKeyWif: 'transfer-wif',
    }, sdk);

    expect(fetch).toHaveBeenCalledWith('sender-id');
    expect(prepared.options.identity).toBe(fetchedIdentity);
    expect(prepared.options).toMatchObject({
      recipientId: 'recipient-id',
      amount: 100n,
      signer: { privateKeyWif: 'transfer-wif' },
    });
    await expect(operation.execute(prepared, sdk)).resolves.toMatchObject({
      status: 'success',
      senderBalance: '900',
      recipientBalance: '100',
    });
    expect(creditTransfer).toHaveBeenCalledWith(prepared.options);
  });

  it('prepares optional withdrawal fields and normalizes its remaining balance', async () => {
    const creditWithdrawal = vi.fn(async () => 7_500n);
    const sdk = identitySdk({ creditWithdrawal });
    const operation = identityTransitionOperations.identityCreditWithdrawal;
    const prepared = await operation.prepare({
      identityId: 'identity-id',
      amount: '1000000',
      toAddress: 'yTestCoreAddress',
      coreFeePerByte: '2',
      privateKeyWif: 'withdrawal-wif',
    }, sdk);

    expect(prepared.options).toMatchObject({
      amount: 1_000_000n,
      toAddress: 'yTestCoreAddress',
      coreFeePerByte: 2,
      signer: { privateKeyWif: 'withdrawal-wif' },
    });
    await expect(operation.execute(prepared, sdk)).resolves.toMatchObject({
      status: 'success',
      remainingBalance: '7500',
      withdrawnAmount: '1000000',
      toAddress: 'yTestCoreAddress',
    });
    expect(creditWithdrawal).toHaveBeenCalledWith(prepared.options);
  });

  it('rejects a missing signing identity before either credit transition', async () => {
    const sdk = identitySdk({ fetch: vi.fn(async () => undefined) });
    await expect(identityTransitionOperations.identityCreditTransfer.prepare({
      identityId: 'missing',
      privateKeyWif: 'wif',
    }, sdk)).rejects.toThrow('Identity not found: missing');
    await expect(identityTransitionOperations.identityCreditWithdrawal.prepare({
      identityId: 'missing',
      privateKeyWif: 'wif',
    }, sdk)).rejects.toThrow('Identity not found: missing');
  });
});

describe('data contract transition preparation and execution', () => {
  it('constructs and publishes a contract with parsed schemas and configuration', async () => {
    const publishedContract = {
      id: { toString: () => 'published-contract-id' },
      ownerId: { toString: () => 'published-owner-id' },
      version: 2,
    };
    const publish = vi.fn(async () => publishedContract);
    const sdk = {
      ...identitySdk(),
      contracts: { publish },
    };
    const operation = contractTransitionOperations.dataContractCreate;
    const prepared = await operation.prepare({
      ownerId: 'owner-id',
      privateKeyWif: 'contract-wif',
      documentSchemas: '{"note":{"type":"object"}}',
      tokens: '{"0":{"name":"test"}}',
      keepsHistory: true,
    }, sdk);

    expect(prepared.options.dataContract).toMatchObject({
      ownerId: 'owner-id',
      identityNonce: 5n,
      schemas: { note: { type: 'object' } },
      tokens: { 0: { name: 'test' } },
      config: { keepsHistory: true },
    });
    const result = await operation.execute(prepared, sdk);
    expect(publish).toHaveBeenCalledWith(prepared.options);
    expect(result).toMatchObject({
      status: 'success',
      contractId: 'published-contract-id',
      ownerId: 'published-owner-id',
      version: 2,
      documentTypes: ['note'],
    });
  });

  it('merges new schemas and increments the fetched contract version', async () => {
    const fetched = {
      version: 2,
      schemas: { note: { type: 'object' } },
      setSchemas(schemas) { this.schemas = schemas; },
    };
    const update = vi.fn(async () => undefined);
    const sdk = {
      ...identitySdk(),
      contracts: {
        fetch: vi.fn(async () => fetched),
        update,
      },
    };
    const operation = contractTransitionOperations.dataContractUpdate;
    const prepared = await operation.prepare({
      dataContractId: 'contract-id',
      ownerId: 'owner-id',
      privateKeyWif: 'contract-wif',
      newDocumentSchemas: '{"profile":{"type":"object"}}',
    }, sdk);

    expect(prepared.options.dataContract.version).toBe(3);
    expect(prepared.options.dataContract.schemas).toEqual({
      note: { type: 'object' },
      profile: { type: 'object' },
    });
    await expect(operation.execute(prepared, sdk)).resolves.toMatchObject({
      status: 'success',
      contractId: 'contract-id',
      version: 3,
    });
    expect(update).toHaveBeenCalledWith(prepared.options);
  });

  it('rejects invalid schema JSON after resolving the signing prerequisites', async () => {
    const sdk = identitySdk();
    await expect(contractTransitionOperations.dataContractCreate.prepare({
      ownerId: 'owner-id',
      privateKeyWif: 'contract-wif',
      documentSchemas: '{bad json',
    }, sdk)).rejects.toThrow('Invalid JSON in Document Schemas JSON');
    expect(sdk.identities.fetch).toHaveBeenCalledWith('owner-id');
    expect(sdk.identities.nonce).toHaveBeenCalledWith('owner-id');
  });

  it('rejects an unknown contract before preparing its signer', async () => {
    const sdk = {
      ...identitySdk(),
      contracts: { fetch: vi.fn(async () => undefined) },
    };
    await expect(contractTransitionOperations.dataContractUpdate.prepare({
      dataContractId: 'missing',
    }, sdk)).rejects.toThrow('Data contract not found: missing');
  });
});

describe('document transition preparation and execution', () => {
  function documentSdk(document = { id: 'document-id', revision: 4n }) {
    return {
      ...identitySdk(),
      documents: {
        get: vi.fn(async () => ({ ...document })),
        create: vi.fn(async () => undefined),
        replace: vi.fn(async () => undefined),
        delete: vi.fn(async () => undefined),
        transfer: vi.fn(async () => undefined),
        purchase: vi.fn(async () => undefined),
        setPrice: vi.fn(async () => undefined),
      },
    };
  }

  it('constructs, broadcasts, and normalizes document creation', async () => {
    const sdk = documentSdk();
    const operation = documentTransitionOperations.documentCreate;
    const prepared = await operation.prepare({
      contractId: 'contract-id',
      documentType: 'note',
      ownerId: 'owner-id',
      data: { message: 'hello' },
      privateKeyWif: 'document-wif',
    }, sdk);

    expect(prepared.options.document).toMatchObject({
      dataContractId: 'contract-id',
      documentTypeName: 'note',
      ownerId: 'owner-id',
      properties: { message: 'hello' },
    });
    await expect(operation.execute(prepared, sdk)).resolves.toMatchObject({
      status: 'success',
      documentId: 'generated-document-id',
      ownerId: 'owner-id',
      documentType: 'note',
    });
    expect(sdk.documents.create).toHaveBeenCalledWith(prepared.options);
  });

  it('increments and normalizes document replacement revisions', async () => {
    const sdk = documentSdk();
    const operation = documentTransitionOperations.documentReplace;
    const prepared = await operation.prepare({
      contractId: 'contract-id',
      documentType: 'note',
      documentId: 'document-id',
      ownerId: 'owner-id',
      revision: '4',
      data: { message: 'updated' },
      privateKeyWif: 'document-wif',
    }, sdk);

    expect(prepared.options.document.revision).toBe(5);
    await expect(operation.execute(prepared, sdk)).resolves.toMatchObject({
      status: 'success',
      documentId: 'document-id',
      newRevision: '5',
    });
    expect(sdk.documents.replace).toHaveBeenCalledWith(prepared.options);
  });

  it('prepares and executes document deletion', async () => {
    const sdk = documentSdk();
    const operation = documentTransitionOperations.documentDelete;
    const prepared = await operation.prepare({
      contractId: 'contract-id',
      documentType: 'note',
      documentId: 'document-id',
      ownerId: 'owner-id',
      privateKeyWif: 'document-wif',
    }, sdk);

    expect(prepared.options.document).toEqual({
      id: 'document-id',
      ownerId: 'owner-id',
      dataContractId: 'contract-id',
      documentTypeName: 'note',
    });
    await expect(operation.execute(prepared, sdk)).resolves.toMatchObject({
      status: 'success',
      documentId: 'document-id',
    });
    expect(sdk.documents.delete).toHaveBeenCalledWith(prepared.options);
  });

  it.each([
    ['documentTransfer', 'transfer', { ownerId: 'owner-id', recipientId: 'recipient-id' }, { recipientId: { kind: 'Identifier', value: 'recipient-id' } }],
    ['documentPurchase', 'purchase', { buyerId: 'buyer-id', price: '500' }, { buyerId: { kind: 'Identifier', value: 'buyer-id' }, price: 500n }],
    ['documentSetPrice', 'setPrice', { ownerId: 'owner-id', price: '750' }, { price: 750n }],
  ])('increments the fetched revision and executes %s', async (key, method, identityValues, expected) => {
    const sdk = documentSdk();
    const operation = documentTransitionOperations[key];
    const prepared = await operation.prepare({
      contractId: 'contract-id',
      documentType: 'card',
      documentId: 'document-id',
      privateKeyWif: 'document-wif',
      ...identityValues,
    }, sdk);

    expect(prepared.options.document.revision).toBe(5n);
    expect(prepared.options).toMatchObject(expected);
    const result = await operation.execute(prepared, sdk);
    expect(sdk.documents[method]).toHaveBeenCalledWith(prepared.options);
    expect(result).toMatchObject({ status: 'success', documentId: 'document-id' });
  });

  it('rejects missing replacement state and an unknown mutable document', async () => {
    await expect(documentTransitionOperations.documentReplace.prepare({
      data: { message: 'updated' },
    }, documentSdk())).rejects.toThrow('Document revision is missing');

    const sdk = documentSdk();
    sdk.documents.get.mockResolvedValue(undefined);
    await expect(documentTransitionOperations.documentTransfer.prepare({
      contractId: 'contract-id',
      documentType: 'card',
      documentId: 'missing',
      ownerId: 'owner-id',
      recipientId: 'recipient-id',
      privateKeyWif: 'document-wif',
    }, sdk)).rejects.toThrow('Document not found: missing');
  });
});

describe('token transition result normalization', () => {
  const prepared = (options, values = {}) => ({ options, context: { values } });

  it.each([
    ['tokenMint', 'mint', { amount: 5n }, 'Minted 5 tokens'],
    ['tokenBurn', 'burn', { amount: 4n }, 'Burned 4 tokens'],
    ['tokenClaim', 'claim', {}, 'Claimed tokens from distribution'],
    ['tokenDirectPurchase', 'directPurchase', { amount: 3n }, 'Purchased 3 tokens'],
  ])('returns an operation-specific response when %s has no result payload', async (key, method, options, message) => {
    const sdk = { tokens: { [method]: vi.fn(async () => ({})) } };
    const result = await tokenTransitionOperations[key].execute(prepared(options), sdk);

    expect(result).toMatchObject({ status: 'success', message });
    expect(() => JSON.stringify(result)).not.toThrow();
    expect(sdk.tokens[method]).toHaveBeenCalledWith(options);
  });

  it('returns transfer context when the SDK has no result payload', async () => {
    const options = { amount: 6n };
    const transfer = vi.fn(async () => ({}));
    const result = await tokenTransitionOperations.tokenTransfer.execute(
      prepared(options, { recipientId: 'recipient-id' }),
      { tokens: { transfer } },
    );

    expect(result).toEqual({
      status: 'success',
      senderBalance: undefined,
      recipientBalance: undefined,
      message: 'Transferred 6 tokens to recipient-id',
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it.each([
    ['tokenFreeze', 'freeze', { identityToFreeze: 'frozen-id' }, 'Frozen tokens for identity frozen-id'],
    ['tokenUnfreeze', 'unfreeze', { identityToUnfreeze: 'frozen-id' }, 'Unfrozen tokens for identity frozen-id'],
    ['tokenDestroyFrozen', 'destroyFrozen', { frozenIdentityId: 'frozen-id' }, 'Destroyed frozen tokens for identity frozen-id'],
    ['tokenSetPriceForDirectPurchase', 'setPrice', {}, 'Token price set successfully'],
    ['tokenEmergencyAction', 'emergencyAction', {}, 'Emergency action pause performed', { action: 'pause' }],
  ])('returns an operation-specific message for %s', async (key, method, values, message, options = {}) => {
    const sdk = { tokens: { [method]: vi.fn(async () => ({})) } };
    const result = await tokenTransitionOperations[key].execute(prepared(options, values), sdk);
    expect(result).toEqual({ status: 'success', message });
  });
});
