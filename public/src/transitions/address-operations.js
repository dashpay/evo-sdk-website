const ADDRESS_FIELDS = [
  { name: 'senderAddress', group: 'PlatformAddressInput', produces: 'inputs' },
  { name: 'senderNonce', group: 'PlatformAddressInput', produces: 'inputs[].nonce' },
  { name: 'recipientAddress', group: 'PlatformAddressOutput', produces: 'outputs' },
  { name: 'amount', group: 'PlatformAddressOutput', produces: 'outputs[].amount' },
  { name: 'identityId', group: 'Identity', produces: 'identity' },
  { name: 'publicKeys', group: 'Identity', produces: 'identity.publicKeys' },
  { name: 'toAddress', group: 'CoreScript', produces: 'outputScript' },
];

const EXAMPLES = {
  addressTransfer: ["import { PlatformAddressInput, PlatformAddressOutput, PlatformAddressSigner } from '@dashevo/evo-sdk';", 'const inputs = [new PlatformAddressInput({ address: senderAddress, amount })];', 'const outputs = [new PlatformAddressOutput({ address: recipientAddress, amount })];', 'const signer = new PlatformAddressSigner();', 'signer.addKey(privateKey);', 'await sdk.addresses.transfer({ inputs, outputs, signer });'],
  addressTopUpIdentity: ["import { PlatformAddressInput, PlatformAddressSigner } from '@dashevo/evo-sdk';", 'const identity = await sdk.identities.fetch(identityId);', 'const inputs = [new PlatformAddressInput({ address: senderAddress, amount })];', 'const signer = new PlatformAddressSigner();', 'signer.addKey(privateKey);', 'await sdk.addresses.topUpIdentity({ identity, inputs, signer });'],
  addressWithdraw: ["import { CoreScript, PlatformAddressInput, PlatformAddressSigner } from '@dashevo/evo-sdk';", 'const inputs = [new PlatformAddressInput({ address: senderAddress, amount })];', 'const outputScript = CoreScript.newP2PKH(coreAddress);', 'const signer = new PlatformAddressSigner();', 'signer.addKey(privateKey);', 'await sdk.addresses.withdraw({ inputs, coreFeePerByte, pooling, outputScript, signer });'],
  addressTransferFromIdentity: ["import { IdentitySigner, PlatformAddressOutput } from '@dashevo/evo-sdk';", 'const identity = await sdk.identities.fetch(identityId);', 'const outputs = [new PlatformAddressOutput({ address: recipientAddress, amount })];', 'const signer = new IdentitySigner();', 'signer.addKeyFromWif(privateKeyWif);', 'await sdk.addresses.transferFromIdentity({ identity, outputs, signer });'],
  addressFundFromAssetLock: ["import { AssetLockProof, PlatformAddressOutput, PlatformAddressSigner, PrivateKey } from '@dashevo/evo-sdk';", 'const assetLockProof = AssetLockProof.fromHex(assetLockProofHex);', 'const assetLockPrivateKey = PrivateKey.fromWIF(assetLockPrivateKeyWif);', 'const outputs = [new PlatformAddressOutput({ address: recipientAddress, amount })];', 'const signer = new PlatformAddressSigner();', 'await sdk.addresses.fundFromAssetLock({ assetLockProof, assetLockPrivateKey, outputs, signer });'],
  addressCreateIdentity: ["import { Identifier, Identity, IdentityPublicKeyInCreation, IdentitySigner, KeyType, PlatformAddressInput, PlatformAddressSigner, PrivateKey, Purpose, SecurityLevel } from '@dashevo/evo-sdk';", 'const identityPrivateKey = PrivateKey.fromWIF(identityPrivateKeyWif);', 'const identity = new Identity(Identifier.random());', 'const identityPublicKey = new IdentityPublicKeyInCreation({ keyId: 0, purpose: Purpose.AUTHENTICATION, securityLevel: SecurityLevel.MASTER, keyType: KeyType.ECDSA_SECP256K1, data: identityPrivateKey.getPublicKey().toBytes() }).toIdentityPublicKey();', 'identity.addPublicKey(identityPublicKey);', 'const inputs = [new PlatformAddressInput({ address: senderAddress, amount })];', 'const identitySigner = new IdentitySigner();', 'identitySigner.addKey(identityPrivateKey);', 'const addressSigner = new PlatformAddressSigner();', 'addressSigner.addKey(addressPrivateKey);', 'await sdk.addresses.createIdentity({ identity, inputs, identitySigner, addressSigner });'],
};

const METHODS = {
  addressTransfer: 'addresses.transfer', addressTopUpIdentity: 'addresses.topUpIdentity', addressWithdraw: 'addresses.withdraw', addressTransferFromIdentity: 'addresses.transferFromIdentity', addressFundFromAssetLock: 'addresses.fundFromAssetLock', addressCreateIdentity: 'addresses.createIdentity',
};

export const addressTransitionOperations = Object.fromEntries(Object.keys(METHODS).map(key => [key, {
  sdkMethod: METHODS[key],
  fields: ADDRESS_FIELDS,
  disabled: true,
  async prepare() { throw new Error('This Platform Address transition remains disabled until installed-SDK broadcast behavior is verified.'); },
  async execute() { throw new Error('This Platform Address transition is disabled.'); },
  renderCode() { return EXAMPLES[key].join('\n'); },
}]));
