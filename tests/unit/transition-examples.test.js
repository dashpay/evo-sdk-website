import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const docs = fs.readFileSync(new URL('../../public/docs.html', import.meta.url), 'utf8');
const aiReference = fs.readFileSync(new URL('../../public/AI_REFERENCE.md', import.meta.url), 'utf8');

describe('generated state transition examples', () => {
  it('uses the Evo SDK v4 payload and signer call shape', () => {
    expect(aiReference).toContain('sdk.documents.create({ document, identityKey, signer })');
    expect(aiReference).toContain('sdk.contracts.publish({ dataContract, identityKey, signer })');
    expect(aiReference).toContain('sdk.identities.topUp({ identity, assetLockProof, assetLockPrivateKey })');
    expect(aiReference).toContain('sdk.tokens.burn({ dataContractId, tokenPosition');
  });

  it('does not pass WIF strings directly to transition methods', () => {
    const legacyTransitionCall = /await sdk\.(?:identities|contracts|documents|tokens|dpns|voting|addresses)\.[^(]+\(\{[^{}]*\b(?:privateKeyWif|assetLockPrivateKeyWif|votingKeyWif)\b/;

    expect(aiReference).not.toMatch(legacyTransitionCall);
    expect(docs).not.toMatch(legacyTransitionCall);
    expect(aiReference).not.toContain('{ ...params, privateKeyWif }');
  });

  it('renders multiline transition examples as valid snippets', () => {
    expect(docs).not.toMatch(/\breturn\s+(?:const|let|var|\/\/)/);
  });
});
