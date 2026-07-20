import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const docs = fs.readFileSync(path.join(ROOT, 'public/docs.html'), 'utf8');
const aiReference = fs.readFileSync(path.join(ROOT, 'public/AI_REFERENCE.md'), 'utf8');
const apiDefinitions = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/api-definitions.json'), 'utf8'));
const wasmSdkDts = fs.readFileSync(path.join(ROOT, 'node_modules/@dashevo/wasm-sdk/dist/sdk.d.ts'), 'utf8');

const TRANSITION_ENTRIES = Object.values(apiDefinitions.transitions).flatMap((category) =>
  Object.entries(category.transitions || {}),
);
const TRANSITION_KEYS = TRANSITION_ENTRIES.map(([key]) => key);
const TRANSITION_BY_KEY = Object.fromEntries(TRANSITION_ENTRIES);

const METHOD_TO_OPTIONS = {
  'identities.create': 'IdentityCreateOptions',
  'identities.topUp': 'IdentityTopUpOptions',
  'identities.creditTransfer': 'IdentityCreditTransferOptions',
  'identities.creditWithdrawal': 'IdentityCreditWithdrawalOptions',
  'identities.update': 'IdentityUpdateOptions',
  'contracts.publish': 'ContractPublishOptions',
  'contracts.update': 'ContractUpdateOptions',
  'documents.create': 'DocumentCreateOptions',
  'documents.replace': 'DocumentReplaceOptions',
  'documents.delete': 'DocumentDeleteOptions',
  'documents.transfer': 'DocumentTransferOptions',
  'documents.purchase': 'DocumentPurchaseOptions',
  'documents.setPrice': 'DocumentSetPriceOptions',
  'tokens.mint': 'TokenMintOptions',
  'tokens.burn': 'TokenBurnOptions',
  'tokens.transfer': 'TokenTransferOptions',
  'tokens.freeze': 'TokenFreezeOptions',
  'tokens.unfreeze': 'TokenUnfreezeOptions',
  'tokens.destroyFrozen': 'TokenDestroyFrozenOptions',
  'tokens.emergencyAction': 'TokenEmergencyActionOptions',
  'tokens.setPrice': 'TokenSetPriceOptions',
  'tokens.directPurchase': 'TokenDirectPurchaseOptions',
  'tokens.claim': 'TokenClaimOptions',
  'dpns.registerName': 'DpnsRegisterNameOptions',
  'voting.masternodeVote': 'MasternodeVoteOptions',
  'addresses.transfer': 'AddressFundsTransferOptions',
  'addresses.topUpIdentity': 'IdentityTopUpFromAddressesOptions',
  'addresses.withdraw': 'AddressFundsWithdrawOptions',
  'addresses.transferFromIdentity': 'IdentityTransferToAddressesOptions',
  'addresses.fundFromAssetLock': 'AddressFundingFromAssetLockOptions',
  'addresses.createIdentity': 'IdentityCreateFromAddressesOptions',
};

/** Pre-v4 call-shape markers that must not appear as options on SDK write calls. */
const FORBIDDEN_CALL_OPTION_NAMES = new Set([
  'privateKeyWif',
  'assetLockPrivateKeyWif',
  'votingKeyWif',
  'publicKeyId',
  'onPreorder',
  'entropyHex',
  'priceType',
  'priceData',
  'totalAgreedPrice',
  'actionType',
  'identityToFreeze',
  'identityToUnfreeze',
  'freezerId',
  'unfreezerId',
  'destroyerId',
  'definition',
  'updates',
]);

/** Classic one-liners from issue #63 that must not reappear in generated docs. */
const CLASSIC_PRE_V4_PATTERNS = [
  /documents\.create\(\{\s*contractId,\s*type:\s*documentType,\s*ownerId,\s*data,\s*entropyHex,\s*privateKeyWif\s*\}\)/,
  /identities\.topUp\(\{\s*identityId,\s*assetLockProof,\s*assetLockPrivateKeyWif\s*\}\)/,
  /identities\.create\(\{\s*assetLockProof,\s*assetLockPrivateKeyWif,\s*publicKeys\s*\}\)/,
  /sdk\.<namespace>\.<transition>\(\{\s*\.\.\.params,\s*privateKeyWif\s*\}\)/,
];

function loadTransitionExamplesFromGenerator() {
  const script = `
import importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location('generate_docs', Path(${JSON.stringify(path.join(ROOT, 'scripts/generate_docs.py'))}))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
import json
keys = ${JSON.stringify(TRANSITION_KEYS)}
out = {key: mod.evo_example_for_transition(key) for key in keys}
print(json.dumps(out))
`;
  const result = spawnSync('python3', ['-c', script], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Failed to load transition examples: ${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout);
}

function interfaceProperties(sourceText, interfaceName) {
  const source = ts.createSourceFile('sdk.d.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const props = new Set();
  function visit(node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName && node.members) {
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          props.add(member.name.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return props;
}

function extractSdkCallSites(example) {
  const calls = [];
  const callRe = /await\s+sdk\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*\(/g;
  let match;
  while ((match = callRe.exec(example)) !== null) {
    const namespace = match[1];
    const method = match[2];
    const openIdx = match.index + match[0].length - 1;
    let depth = 0;
    let end = -1;
    for (let i = openIdx; i < example.length; i += 1) {
      const ch = example[i];
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) continue;
    calls.push({
      method: `${namespace}.${method}`,
      argsText: example.slice(openIdx + 1, end).trim(),
    });
  }
  return calls;
}

function topLevelObjectKeys(argsText) {
  const trimmed = argsText.trim();
  if (!trimmed.startsWith('{')) return [];
  const source = ts.createSourceFile(
    'example.ts',
    `const __opts = ${trimmed};`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const keys = [];
  function visit(node) {
    if (ts.isObjectLiteralExpression(node) && node.parent && ts.isVariableDeclaration(node.parent)) {
      for (const prop of node.properties) {
        if ((ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) && ts.isIdentifier(prop.name)) {
          keys.push(prop.name.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return keys;
}

function exampleMentionsForbiddenCallOption(example) {
  const hits = [];
  for (const call of extractSdkCallSites(example)) {
    for (const key of topLevelObjectKeys(call.argsText)) {
      if (FORBIDDEN_CALL_OPTION_NAMES.has(key)) {
        hits.push(`${call.method}({ ${key} })`);
      }
    }
  }
  // Current examples must not document privateKeyWif as an object property at all.
  if (/\bprivateKeyWif\s*:/.test(example)) {
    hits.push('object property privateKeyWif');
  }
  return hits;
}

function collectClassicPreV4Hits(text, label) {
  return CLASSIC_PRE_V4_PATTERNS
    .filter((re) => re.test(text))
    .map((re) => `${label} still contains ${re}`);
}

const generatedExamples = loadTransitionExamplesFromGenerator();

describe('v4 state transition documentation examples', () => {
  it('covers every transition operation with a generator example', () => {
    for (const key of TRANSITION_KEYS) {
      expect(generatedExamples[key], key).toBeTruthy();
    }
  });

  it('does not use pre-v4 privateKeyWif-in-call option shapes', () => {
    const failures = [];
    for (const [key, example] of Object.entries(generatedExamples)) {
      const hits = exampleMentionsForbiddenCallOption(example);
      if (hits.length) failures.push(`${key}: ${hits.join(', ')}`);
    }
    failures.push(...collectClassicPreV4Hits(docs, 'docs.html'));
    failures.push(...collectClassicPreV4Hits(aiReference, 'AI_REFERENCE.md'));
    expect(failures).toEqual([]);
  });

  it('uses IdentitySigner / asset-lock PrivateKey / payload constructors where appropriate', () => {
    expect(generatedExamples.documentCreate).toMatch(/new Document\s*\(/);
    expect(generatedExamples.documentCreate).toMatch(/IdentitySigner/);
    expect(generatedExamples.documentCreate).toMatch(/identityKey/);
    expect(generatedExamples.dataContractCreate).toMatch(/new DataContract\s*\(/);
    expect(generatedExamples.identityCreate).toMatch(/AssetLockProof/);
    expect(generatedExamples.identityCreate).toMatch(/assetLockPrivateKey/);
    expect(generatedExamples.identityCreate).toMatch(/IdentitySigner/);
    expect(generatedExamples.identityTopUp).toMatch(/assetLockPrivateKey/);
    // Top-up is asset-lock only — no IdentitySigner construction/import.
    expect(generatedExamples.identityTopUp).not.toMatch(/new IdentitySigner|import \{[^}]*IdentitySigner/);
    expect(generatedExamples.addressFundFromAssetLock).toMatch(/assetLockPrivateKey/);
    expect(generatedExamples.addressFundFromAssetLock).toMatch(/PlatformAddressSigner/);
    expect(generatedExamples.addressTransferFromIdentity).toMatch(/IdentitySigner/);
    expect(generatedExamples.dpnsRegister).toMatch(/identityKey/);
    expect(generatedExamples.dpnsRegister).toMatch(/IdentitySigner/);
  });

  it('passes only declared option properties on the final sdk write call', () => {
    const failures = [];
    for (const [key, item] of Object.entries(TRANSITION_BY_KEY)) {
      const example = generatedExamples[key];
      const sdkMethod = item.sdk_method;
      const optionsName = METHOD_TO_OPTIONS[sdkMethod];
      if (!optionsName) {
        failures.push(`${key}: no Options mapping for ${sdkMethod}`);
        continue;
      }

      const allowed = interfaceProperties(wasmSdkDts, optionsName);
      // TypeScript may declare the same interface name more than once in the giant d.ts
      // (transition object variants). Prefer the richest write-options set when ambiguous.
      if (!allowed.size) {
        failures.push(`${key}: Options interface ${optionsName} not found`);
        continue;
      }

      const writeCalls = extractSdkCallSites(example).filter((call) => call.method === sdkMethod);
      if (!writeCalls.length) {
        failures.push(`${key}: no await sdk.${sdkMethod}(...) call in example`);
        continue;
      }

      const keys = topLevelObjectKeys(writeCalls[writeCalls.length - 1].argsText);
      if (!keys.length) {
        failures.push(`${key}: could not parse options object for ${sdkMethod}`);
        continue;
      }

      const unknown = keys.filter((k) => !allowed.has(k));
      if (unknown.length) {
        failures.push(
          `${key}: unknown option(s) on ${sdkMethod}: ${unknown.join(', ')} `
          + `(allowed: ${[...allowed].sort().join(', ')})`,
        );
      }
    }
    expect(failures).toEqual([]);
  });

  it('embeds v4 document create / identity top-up examples in generated docs', () => {
    expect(docs).toContain('new Document({');
    expect(docs).toContain('identityKey');
    expect(docs).toContain('assetLockPrivateKey');
    expect(aiReference).toContain('new Document({');
    expect(aiReference).toContain('typed options object');
    expect(aiReference).not.toContain('{ ...params, privateKeyWif }');
  });
});
