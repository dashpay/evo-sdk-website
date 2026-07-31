import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { documentTransitionOperations } from '../../public/src/transitions/document-operations.js';
import { identityTransitionOperations, parseDisablePublicKeyIds } from '../../public/src/transitions/identity-operations.js';
import { getTransitionOperation, renderTransitionCode, transitionOperations } from '../../public/src/transitions/registry.js';
import { tokenTransitionOperations } from '../../public/src/transitions/token-operations.js';
import { assetLockTransitionOperations } from '../../public/src/transitions/asset-lock-operations.js';
import { contractTransitionOperations } from '../../public/src/transitions/contract-operations.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../../public/sdk-operation-catalog.json', import.meta.url), 'utf8'));
const definitions = JSON.parse(fs.readFileSync(new URL('../../public/api-definitions.json', import.meta.url), 'utf8'));

const expectedOptions = {
  documentCreate: ['document', 'identityKey', 'signer'],
  documentReplace: ['document', 'identityKey', 'signer'],
  documentDelete: ['document', 'identityKey', 'signer'],
  documentTransfer: ['document', 'recipientId', 'identityKey', 'signer'],
  documentPurchase: ['document', 'buyerId', 'price', 'identityKey', 'signer'],
  documentSetPrice: ['document', 'price', 'identityKey', 'signer'],
};

function definitionFor(key) {
  return Object.values(definitions.transitions).flatMap(group => Object.entries(group.transitions || {})).find(([operationKey]) => operationKey === key)?.[1];
}

describe('document transition operation registry', () => {
  it('keeps every registered operation on its catalog facade method', () => {
    for (const [key, operation] of Object.entries(transitionOperations)) {
      expect(operation.sdkMethod, key).toBe(catalog.operations.find(item => item.key === key)?.sdkMethod);
    }
  });

  it('routes every enabled transition through the shared registry', () => {
    const enabled = Object.values(definitions.transitions).flatMap(group =>
      Object.entries(group.transitions || {}).filter(([, definition]) => !definition.disabled).map(([key]) => key),
    );
    expect(enabled.filter(key => !transitionOperations[key])).toEqual([]);
  });

  it('renders SDK methods without exposing supplied credentials', () => {
    const secret = 'L1-DO-NOT-RENDER-THIS-PRIVATE-KEY';
    for (const [key, operation] of Object.entries(transitionOperations)) {
      const code = operation.renderCode({
        identityId: 'identity-id',
        ownerId: 'owner-id',
        privateKeyWif: secret,
        identityPrivateKeyWif: secret,
        assetLockPrivateKeyWif: secret,
        votingKeyWif: secret,
      });
      expect(code, key).toContain(`sdk.${operation.sdkMethod}`);
      expect(code, key).not.toContain(secret);
    }
  });

  it('shows typed construction for a representative operation from each family', () => {
    expect(assetLockTransitionOperations.identityCreate.renderCode({})).toContain('new IdentityPublicKeyInCreation');
    expect(contractTransitionOperations.dataContractCreate.renderCode({})).toContain('new DataContract');
    expect(documentTransitionOperations.documentCreate.renderCode({})).toContain('new Document');
    expect(tokenTransitionOperations.tokenTransfer.renderCode({})).toContain('Identifier.fromBase58');
    expect(tokenTransitionOperations.tokenTransfer.renderCode({})).toContain('BigInt(amount)');
    expect(transitionOperations.addressTransfer.renderCode({})).toContain('new PlatformAddressInput');
    const addressCreateCode = transitionOperations.addressCreateIdentity.renderCode({});
    expect(addressCreateCode).toContain('const identity = new Identity(Identifier.random())');
    expect(addressCreateCode.indexOf('const identity =')).toBeLessThan(addressCreateCode.indexOf('sdk.addresses.createIdentity'));
  });
  it('registers every document write against its declared SDK method', () => {
    for (const [key, operation] of Object.entries(documentTransitionOperations)) {
      const record = catalog.operations.find(item => item.key === key);
      expect(getTransitionOperation(key)).toBe(operation);
      expect(operation.sdkMethod).toBe(record.sdkMethod);
    }
  });

  it('uses only declaration-backed required option names', () => {
    for (const [key, names] of Object.entries(expectedOptions)) {
      const record = catalog.operations.find(item => item.key === key);
      const declared = record.parameters[0].properties.filter(property => !property.optional).map(property => property.name);
      expect(names).toEqual(declared);
    }
  });

  it('renders typed construction without exposing a supplied private key', () => {
    const key = 'documentCreate';
    const definition = definitionFor(key);
    const args = definition.inputs.map(input => ({ contractId: 'contract', documentType: 'note' })[input.name]);
    const code = renderTransitionCode(key, definition.inputs, args, {
      ownerId: 'owner',
      keyId: 3,
      privateKeyWif: 'super-secret-wif',
    });
    expect(code).toContain('new Document');
    expect(code).toContain('sdk.documents.create({ document, identityKey, signer })');
    expect(code).toContain('signer.addKeyFromWif(privateKeyWif)');
    expect(code).not.toContain('super-secret-wif');
  });

  it('groups primitive fields by the typed values they produce', () => {
    expect(documentTransitionOperations.documentCreate.fields).toContainEqual(
      expect.objectContaining({ name: 'contractId', group: 'Document', produces: 'document.dataContractId' }),
    );
    expect(documentTransitionOperations.documentTransfer.fields).toContainEqual(
      expect.objectContaining({ name: 'recipientId', group: 'SDK Options', produces: 'recipientId' }),
    );
  });
});

describe('legacy document transition regression', () => {
  it('does not retain document transition cases in the central dispatcher', () => {
    const source = fs.readFileSync(new URL('../../public/src/operations.js', import.meta.url), 'utf8');
    for (const key of Object.keys(expectedOptions)) expect(source).not.toContain(`case '${key}'`);
  });
});

describe('tested identity transition operations', () => {
  it('parses comma-separated public key IDs for identity updates', () => {
    expect(parseDisablePublicKeyIds('2, 3,5')).toEqual([2, 3, 5]);
    expect(parseDisablePublicKeyIds([2, '3'])).toEqual([2, 3]);
    expect(parseDisablePublicKeyIds('')).toBeUndefined();
  });

  it.each(['-1', '2,nope', '2,,3', '9007199254740992'])(
    'rejects invalid public key IDs for identity updates: %s',
    value => {
      expect(() => parseDisablePublicKeyIds(value)).toThrow(
        'Public key IDs to disable must be comma-separated non-negative integers',
      );
    },
  );

  it('uses the catalog methods and redacts credentials', () => {
    for (const [key, operation] of Object.entries(identityTransitionOperations)) {
      const record = catalog.operations.find(item => item.key === key);
      expect(operation.sdkMethod).toBe(record.sdkMethod);
      expect(operation.renderCode({ identityId: 'identity', privateKeyWif: 'secret' })).not.toContain('secret');
    }
  });

  it('removes their compatibility dispatcher paths', () => {
    const source = fs.readFileSync(new URL('../../public/src/operations.js', import.meta.url), 'utf8');
    for (const key of Object.keys(identityTransitionOperations)) expect(source).not.toContain(`case '${key}'`);
    expect(source).not.toMatch(/case 'identityCreditTransfer'[\s\S]*?n\.senderId \|\| n\.identityId/);
  });
});

describe('token transition operations', () => {
  it('matches every token facade method in the declaration-derived catalog', () => {
    for (const [key, operation] of Object.entries(tokenTransitionOperations)) {
      expect(operation.sdkMethod).toBe(catalog.operations.find(item => item.key === key).sdkMethod);
      const code = operation.renderCode({ privateKeyWif: 'secret' });
      expect(code).toContain(`sdk.${operation.sdkMethod}`);
      expect(code).not.toContain('secret');
    }
  });

  it('preserves direct-purchase and emergency-action result messages', async () => {
    const directPurchase = await tokenTransitionOperations.tokenDirectPurchase.execute(
      { options: { amount: 3n }, context: {} },
      { tokens: { directPurchase: async () => ({ balance: 7n, creditsPaid: 9n }) } },
    );
    expect(directPurchase).toMatchObject({ status: 'success', balance: '7', creditsPaid: '9' });
    expect(directPurchase.message).toContain('Purchased 3');

    const emergency = await tokenTransitionOperations.tokenEmergencyAction.execute(
      { options: { action: 'pause' }, context: {} },
      { tokens: { emergencyAction: async () => ({}) } },
    );
    expect(emergency.message).toContain('pause');
  });

  it('models mint recipientId as optional', () => {
    const source = fs.readFileSync(new URL('../../public/src/transitions/token-operations.js', import.meta.url), 'utf8');
    expect(source).toContain("optionalIds: { recipientId: 'issuedToIdentityId' }");
  });
});

describe('contract transition result compatibility', () => {
  it('returns contractId for contract updates', async () => {
    const sdk = { contracts: { update: async () => undefined } };
    const result = await contractTransitionOperations.dataContractUpdate.execute(
      { options: {}, context: { contractId: 'contract-id', version: 2 } },
      sdk,
    );
    expect(result).toMatchObject({ status: 'success', contractId: 'contract-id', version: 2 });
    expect(result.dataContractId).toBeUndefined();
  });
});

describe('asset-lock identity transitions', () => {
  it('uses typed v4 options and removes obsolete calls', () => {
    expect(assetLockTransitionOperations.identityCreate.renderCode({})).toContain('IdentityPublicKeyInCreation');
    expect(assetLockTransitionOperations.identityCreate.renderCode({})).toContain('assetLockPrivateKey, signer');
    expect(assetLockTransitionOperations.identityTopUp.renderCode({})).toContain('identity, assetLockProof, assetLockPrivateKey');
    const source = fs.readFileSync(new URL('../../public/src/operations.js', import.meta.url), 'utf8');
    expect(source).not.toContain('assetLockPrivateKeyWif:');
    expect(source).not.toContain("case 'identityCreate'");
    expect(source).not.toContain("case 'identityTopUp'");
  });
});
