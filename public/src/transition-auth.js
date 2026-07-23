import { IdentitySigner } from './sdk-types.js';

export const DEFAULT_SECURITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM'];
export const CONTRACT_SECURITY_LEVELS = ['CRITICAL', 'HIGH'];

export function getIdentityKey(identity, keyId, securityLevels = DEFAULT_SECURITY_LEVELS) {
  if (keyId !== undefined) {
    const key = identity.getPublicKeyById(keyId);
    if (!key) throw new Error(`Identity key not found: ${keyId}`);
    return key;
  }
  const key = identity.publicKeys.find(candidate => securityLevels.includes(candidate.securityLevel));
  if (!key) throw new Error('No suitable identity key found for signing');
  return key;
}

export function createSigner(privateKeyWif) {
  if (!privateKeyWif) throw new Error('Private key is required');
  const signer = new IdentitySigner();
  signer.addKeyFromWif(privateKeyWif);
  return signer;
}

export async function prepareTransition(client, identityId, privateKeyWif, keyId, securityLevels = DEFAULT_SECURITY_LEVELS) {
  const identity = await client.identities.fetch(identityId);
  if (!identity) throw new Error(`Identity not found: ${identityId}`);
  const identityKey = getIdentityKey(identity, keyId, securityLevels);
  const signer = createSigner(privateKeyWif);
  return { identity, identityKey, signer };
}
