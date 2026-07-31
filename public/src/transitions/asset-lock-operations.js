import {
  AssetLockProof,
  Identity,
  IdentityPublicKeyInCreation,
  IdentitySigner,
  KeyType,
  PrivateKey,
  Purpose,
  SecurityLevel,
} from '../sdk-types.js';

const FIELDS = [
  { name: 'identityId', group: 'Identity', produces: 'identity' },
  { name: 'identityPrivateKeyWif', group: 'IdentitySigner', produces: 'signer' },
  { name: 'assetLockProof', group: 'AssetLockProof', produces: 'assetLockProof' },
  { name: 'assetLockPrivateKeyWif', group: 'PrivateKey', produces: 'assetLockPrivateKey' },
];

function required(value, label) {
  if (!value) throw new Error(`${label} is required`);
  return value;
}

function assetLockValues(values) {
  return {
    assetLockProof: AssetLockProof.fromHex(required(values.assetLockProof, 'Asset Lock Proof')),
    assetLockPrivateKey: PrivateKey.fromWIF(required(values.assetLockPrivateKeyWif, 'Asset Lock private key')),
  };
}

export const assetLockTransitionOperations = {
  identityCreate: {
    sdkMethod: 'identities.create', fields: FIELDS,
    async prepare(values) {
      const { assetLockProof, assetLockPrivateKey } = assetLockValues(values);
      const identityPrivateKey = PrivateKey.fromWIF(required(values.identityPrivateKeyWif, 'Identity private key'));
      const identity = new Identity(assetLockProof.createIdentityId());
      const masterKey = new IdentityPublicKeyInCreation({ keyId: 0, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.MASTER, keyType: KeyType.ECDSA_SECP256K1, data: identityPrivateKey.getPublicKey().toBytes() }).toIdentityPublicKey();
      identity.addPublicKey(masterKey);
      const signer = new IdentitySigner();
      signer.addKey(identityPrivateKey);
      return { options: { identity, assetLockProof, assetLockPrivateKey, signer } };
    },
    async execute(prepared, sdk) { await sdk.identities.create(prepared.options); return { status: 'success', identityId: prepared.options.identity.id?.toString(), message: 'Identity created successfully' }; },
    renderCode() { return ["import { AssetLockProof, Identity, IdentityPublicKeyInCreation, IdentitySigner, KeyType, PrivateKey, Purpose, SecurityLevel } from '@dashevo/evo-sdk';", 'const assetLockProof = AssetLockProof.fromHex(assetLockProofHex);', 'const assetLockPrivateKey = PrivateKey.fromWIF(assetLockPrivateKeyWif);', 'const identityPrivateKey = PrivateKey.fromWIF(identityPrivateKeyWif);', 'const identity = new Identity(assetLockProof.createIdentityId());', 'const masterKey = new IdentityPublicKeyInCreation({ keyId: 0, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.MASTER, keyType: KeyType.ECDSA_SECP256K1, data: identityPrivateKey.getPublicKey().toBytes() }).toIdentityPublicKey();', 'identity.addPublicKey(masterKey);', 'const signer = new IdentitySigner();', 'signer.addKey(identityPrivateKey);', 'await sdk.identities.create({ identity, assetLockProof, assetLockPrivateKey, signer });'].join('\n'); },
  },
  identityTopUp: {
    sdkMethod: 'identities.topUp', fields: FIELDS,
    async prepare(values, sdk) { const identity = await sdk.identities.fetch(required(values.identityId, 'Identity ID')); if (!identity) throw new Error(`Identity not found: ${values.identityId}`); return { options: { identity, ...assetLockValues(values) } }; },
    async execute(prepared, sdk) { const balance = await sdk.identities.topUp(prepared.options); return { status: 'success', balance: balance?.toString(), message: 'Identity topped up successfully' }; },
    renderCode() { return ["import { AssetLockProof, PrivateKey } from '@dashevo/evo-sdk';", 'const identity = await sdk.identities.fetch(identityId);', "if (!identity) throw new Error('Identity not found');", 'const assetLockProof = AssetLockProof.fromHex(assetLockProofHex);', 'const assetLockPrivateKey = PrivateKey.fromWIF(assetLockPrivateKeyWif);', 'await sdk.identities.topUp({ identity, assetLockProof, assetLockPrivateKey });'].join('\n'); },
  },
};
