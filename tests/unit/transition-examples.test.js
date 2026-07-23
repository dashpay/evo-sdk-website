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
const sdkOperationCatalog = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public/sdk-operation-catalog.json'), 'utf8'),
);
const wasmSdkDts = fs.readFileSync(path.join(ROOT, 'node_modules/@dashevo/wasm-sdk/dist/sdk.d.ts'), 'utf8');

const TRANSITION_ENTRIES = Object.values(apiDefinitions.transitions).flatMap((category) =>
  Object.entries(category.transitions || {}),
);
const TRANSITION_KEYS = TRANSITION_ENTRIES.map(([key]) => key);
const TRANSITION_BY_KEY = Object.fromEntries(TRANSITION_ENTRIES);
const OPERATION_BY_KEY = Object.fromEntries(
  sdkOperationCatalog.operations.map((operation) => [operation.key, operation]),
);
const TOKEN_TRANSITION_KEYS = [
  'tokenMint',
  'tokenBurn',
  'tokenTransfer',
  'tokenFreeze',
  'tokenUnfreeze',
  'tokenDestroyFrozen',
  'tokenSetPriceForDirectPurchase',
  'tokenDirectPurchase',
  'tokenClaim',
  'tokenEmergencyAction',
];
const DPNS_CONTRACT_ID = 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec';
const TOKEN_CONTRACT_ID = 'ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A';

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

const interfaceAllPropsCache = new Map();
const interfaceRequiredPropsCache = new Map();
const wasmSdkSource = ts.createSourceFile('sdk.d.ts', wasmSdkDts, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

function collectInterfaceProps(interfaceName) {
  if (interfaceAllPropsCache.has(interfaceName)) {
    return {
      all: interfaceAllPropsCache.get(interfaceName),
      required: interfaceRequiredPropsCache.get(interfaceName),
    };
  }

  const all = new Set();
  let required = null;
  function visit(node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName && node.members) {
      const requiredHere = new Set();
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          all.add(member.name.text);
          if (!member.questionToken) requiredHere.add(member.name.text);
        }
      }
      // Prefer the first declaration for requiredness (write-options shapes).
      if (required === null) required = requiredHere;
    }
    ts.forEachChild(node, visit);
  }
  visit(wasmSdkSource);
  if (required === null) required = new Set();
  interfaceAllPropsCache.set(interfaceName, all);
  interfaceRequiredPropsCache.set(interfaceName, required);
  return { all, required };
}

function interfaceProperties(_sourceText, interfaceName) {
  return collectInterfaceProps(interfaceName).all;
}

/** Required property names from the first matching interface declaration. */
function interfaceRequiredProperties(_sourceText, interfaceName) {
  return collectInterfaceProps(interfaceName).required;
}

function sdkParamByName(transitionKey, paramName) {
  const parameters = OPERATION_BY_KEY[transitionKey]?.parameters || [];
  const properties = parameters.flatMap((parameter) => parameter.properties || []);
  const property = properties.find((candidate) => candidate.name === paramName);
  return property ? { ...property, required: !property.optional } : undefined;
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
    expect(generatedExamples.identityCreate).toMatch(/new Identity\(assetLockProof\.createIdentityId\(\)\)/);
    expect(generatedExamples.identityCreate).toMatch(
      /data:\s*identityPrivateKey\.getPublicKey\(\)\.toBytes\(\)/,
    );
    expect(generatedExamples.identityCreate).toMatch(/signer\.addKey\(identityPrivateKey\)/);
    expect(generatedExamples.identityCreate).not.toMatch(/random-or-derived-identity-id|atob\(/);
    expect(generatedExamples.identityTopUp).toMatch(/assetLockPrivateKey/);
    // Top-up is asset-lock only — no IdentitySigner construction/import.
    expect(generatedExamples.identityTopUp).not.toMatch(/new IdentitySigner|import \{[^}]*IdentitySigner/);
    expect(generatedExamples.addressFundFromAssetLock).toMatch(/assetLockPrivateKey/);
    expect(generatedExamples.addressFundFromAssetLock).toMatch(/PlatformAddressSigner/);
    expect(generatedExamples.addressTransferFromIdentity).toMatch(/IdentitySigner/);
    expect(generatedExamples.dpnsRegister).toMatch(/identityKey/);
    expect(generatedExamples.dpnsRegister).toMatch(/IdentitySigner/);
  });

  it('selects credit transfer/withdrawal keys by purpose, never AUTHENTICATION fallback', () => {
    const transfer = generatedExamples.identityCreditTransfer;
    const withdrawal = generatedExamples.identityCreditWithdrawal;

    // Credit transfer requires TRANSFER; withdrawal allows TRANSFER or OWNER.
    // Prefer omitting signingKey so the SDK auto-selects a matching purpose key.
    for (const [key, example] of [
      ['identityCreditTransfer', transfer],
      ['identityCreditWithdrawal', withdrawal],
    ]) {
      expect(example, key).not.toMatch(/getPublicKeyById\s*\(\s*3\s*\)/);
      expect(example, key).not.toMatch(/purpose\s*===\s*['"]AUTHENTICATION['"]/);
      expect(example, key).not.toMatch(/transfer\/auth/i);

      const writeMethod = key === 'identityCreditTransfer'
        ? 'identities.creditTransfer'
        : 'identities.creditWithdrawal';
      const writeCall = extractSdkCallSites(example).find((call) => call.method === writeMethod);
      expect(writeCall, key).toBeTruthy();
      const optionKeys = topLevelObjectKeys(writeCall.argsText);
      expect(optionKeys, `${key} must not pass signingKey`).not.toContain('signingKey');
      expect(optionKeys, key).toContain('signer');
    }

    expect(transfer).toMatch(/TRANSFER/);
    expect(transfer).not.toMatch(/OWNER/);
    expect(transfer).toMatch(/auto-selects an available TRANSFER key/i);

    expect(withdrawal).toMatch(/TRANSFER/);
    expect(withdrawal).toMatch(/OWNER/);
    expect(withdrawal).toMatch(/auto-selects a matching TRANSFER or OWNER key/i);

    // Generated docs must not reintroduce the invalid authentication fallback.
    expect(docs).not.toMatch(
      /identity\.getPublicKeyById\(3\)[\s\S]{0,120}purpose === ['"]AUTHENTICATION['"]/,
    );
    expect(aiReference).not.toMatch(
      /identity\.getPublicKeyById\(3\)[\s\S]{0,120}purpose === ['"]AUTHENTICATION['"]/,
    );
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

  it('uses the token contract only for token transition examples', () => {
    for (const key of TOKEN_TRANSITION_KEYS) {
      expect(generatedExamples[key], key).toContain(`dataContractId: '${TOKEN_CONTRACT_ID}'`);
      expect(generatedExamples[key], key).not.toContain(`dataContractId: '${DPNS_CONTRACT_ID}'`);
    }
    expect(generatedExamples.documentCreate).toContain(`dataContractId: '${DPNS_CONTRACT_ID}'`);
  });

  it('embeds v4 document create / identity top-up examples in generated docs', () => {
    expect(docs).toContain('new Document({');
    expect(docs).toContain('identityKey');
    expect(docs).toContain('assetLockPrivateKey');
    expect(aiReference).toContain('new Document({');
    expect(aiReference).toContain('new Identity(assetLockProof.createIdentityId())');
    expect(aiReference).not.toContain('{ ...params, privateKeyWif }');
  });

  it('uses concrete CoreScript / PoolingWasm values for address withdraw', () => {
    const example = generatedExamples.addressWithdraw;
    expect(example).toMatch(/CoreScript\.fromP2PKH/);
    expect(example).toMatch(/PoolingWasm\.Standard/);
    expect(example).not.toMatch(/CoreScript\.newP2PKH/);
    expect(example).not.toMatch(/new Uint8Array\(20\)/);
    expect(example).toMatch(/const corePubkeyHashHex = 'replace-with-40-hex-character-core-pubkey-hash'/);
    expect(example).toMatch(/\^\[0-9a-fA-F\]\{40\}\$/);
    expect(example).toMatch(/Uint8Array\.from\(/);
    expect(example).toMatch(/CoreScript\.fromP2PKH\(corePubkeyHash\)/);
    expect(example).not.toMatch(/pooling:\s*undefined/);
    expect(example).not.toMatch(/outputScript:\s*(?:\/\*[^*]*\*\/\s*)?undefined/);

    const writeCall = extractSdkCallSites(example).find((call) => call.method === 'addresses.withdraw');
    expect(writeCall).toBeTruthy();
    const keys = topLevelObjectKeys(writeCall.argsText);
    const required = interfaceRequiredProperties(wasmSdkDts, 'AddressFundsWithdrawOptions');
    for (const name of required) {
      expect(keys, `missing required option ${name}`).toContain(name);
    }
  });

  it('documents Platform Address option metadata with v4 types and requiredness', () => {
    // Transfer: typed input/output arrays, not plain objects.
    expect(sdkParamByName('addressTransfer', 'inputs')).toMatchObject({
      type: 'PlatformAddressInput[]',
      required: true,
    });
    expect(sdkParamByName('addressTransfer', 'outputs')).toMatchObject({
      type: 'PlatformAddressOutput[]',
      required: true,
    });
    expect(sdkParamByName('addressTransfer', 'signer')).toMatchObject({
      type: 'PlatformAddressSigner',
      required: true,
    });
    expect(sdkParamByName('addressTransfer', 'inputs').description).toMatch(/PlatformAddressInput/);
    expect(sdkParamByName('addressTransfer', 'outputs').description).toMatch(/PlatformAddressOutput/);
    expect(sdkParamByName('addressTransfer', 'inputs').description).not.toMatch(/\{address, nonce, amount/);
    expect(sdkParamByName('addressTransfer', 'outputs').description).not.toMatch(/\{address, amount/);

    expect(sdkParamByName('addressTopUpIdentity', 'identity')).toMatchObject({
      type: 'Identity',
      required: true,
    });
    expect(sdkParamByName('addressTopUpIdentity', 'identityId')).toBeUndefined();
    expect(sdkParamByName('addressTopUpIdentity', 'inputs')).toMatchObject({
      type: 'PlatformAddressInput[]',
      required: true,
    });
    expect(sdkParamByName('addressTopUpIdentity', 'inputs').description).not.toMatch(/or \{address/);

    expect(sdkParamByName('addressTransferFromIdentity', 'identity')).toMatchObject({
      type: 'Identity',
      required: true,
    });
    expect(sdkParamByName('addressTransferFromIdentity', 'identityId')).toBeUndefined();
    expect(sdkParamByName('addressTransferFromIdentity', 'outputs')).toMatchObject({
      type: 'PlatformAddressOutput[]',
      required: true,
    });
    expect(sdkParamByName('addressTransferFromIdentity', 'outputs').description).not.toMatch(/or \{address/);

    expect(sdkParamByName('addressWithdraw', 'inputs')).toMatchObject({
      type: 'PlatformAddressInput[]',
      required: true,
    });
    expect(sdkParamByName('addressWithdraw', 'coreFeePerByte')).toMatchObject({
      type: 'number',
      required: true,
    });
    expect(sdkParamByName('addressWithdraw', 'pooling')).toMatchObject({
      type: 'Pooling',
      required: true,
    });
    expect(sdkParamByName('addressWithdraw', 'outputScript')).toMatchObject({
      type: 'CoreScript',
      required: true,
    });
    expect(sdkParamByName('addressWithdraw', 'signer')).toMatchObject({
      type: 'PlatformAddressSigner',
      required: true,
    });
    expect(sdkParamByName('addressWithdraw', 'inputs').description).not.toMatch(/or \{address/);

    expect(sdkParamByName('addressFundFromAssetLock', 'assetLockProof')).toMatchObject({
      type: 'AssetLockProof',
      required: true,
    });
    expect(sdkParamByName('addressFundFromAssetLock', 'assetLockPrivateKey')).toMatchObject({
      type: 'PrivateKey',
      required: true,
    });
    expect(sdkParamByName('addressFundFromAssetLock', 'outputs')).toMatchObject({
      type: 'PlatformAddressOutput[]',
      required: true,
    });
    expect(sdkParamByName('addressFundFromAssetLock', 'signer')).toMatchObject({
      type: 'PlatformAddressSigner',
      required: true,
    });
    expect(sdkParamByName('addressFundFromAssetLock', 'outputs').description).not.toMatch(/or \{address/);

    expect(sdkParamByName('addressCreateIdentity', 'identity')).toMatchObject({
      type: 'Identity',
      required: true,
    });
    expect(sdkParamByName('addressCreateIdentity', 'inputs')).toMatchObject({
      type: 'PlatformAddressInput[]',
      required: true,
    });
    expect(sdkParamByName('addressCreateIdentity', 'identitySigner')).toMatchObject({
      type: 'IdentitySigner',
      required: true,
    });
    expect(sdkParamByName('addressCreateIdentity', 'addressSigner')).toMatchObject({
      type: 'PlatformAddressSigner',
      required: true,
    });
    expect(sdkParamByName('addressCreateIdentity', 'inputs').description).not.toMatch(/\{address, nonce, amount/);

    // Example option objects must include every required declaration member.
    const requiredChecks = [
      ['addressTransfer', 'addresses.transfer', 'AddressFundsTransferOptions'],
      ['addressTopUpIdentity', 'addresses.topUpIdentity', 'IdentityTopUpFromAddressesOptions'],
      ['addressTransferFromIdentity', 'addresses.transferFromIdentity', 'IdentityTransferToAddressesOptions'],
      ['addressFundFromAssetLock', 'addresses.fundFromAssetLock', 'AddressFundingFromAssetLockOptions'],
      ['addressCreateIdentity', 'addresses.createIdentity', 'IdentityCreateFromAddressesOptions'],
    ];
    for (const [key, method, optionsName] of requiredChecks) {
      const example = generatedExamples[key];
      const writeCall = extractSdkCallSites(example).find((call) => call.method === method);
      expect(writeCall, key).toBeTruthy();
      const keys = topLevelObjectKeys(writeCall.argsText);
      const required = interfaceRequiredProperties(wasmSdkDts, optionsName);
      for (const name of required) {
        expect(keys, `${key} missing required option ${name}`).toContain(name);
      }
    }
  });

  it('formats multiline query examples as valid top-level const result assignments', () => {
    expect(docs).not.toMatch(/\breturn\s+(?:const|let|var|\/\/)/);

    const querySection = aiReference.split('## State Transition Operations')[0] || '';
    const queryBlocks = [...querySection.matchAll(/```javascript\n([\s\S]*?)```/g)].map((m) => m[1]);

    // Pattern intro block uses a placeholder, not a real call — skip blocks without sdk.
    const queryCallBlocks = queryBlocks.filter((b) => /\bsdk\./.test(b));
    expect(queryCallBlocks.length).toBeGreaterThan(10);

    const invalidTopLevelReturn = queryCallBlocks.filter((b) => /^\s*return\s+await\b/m.test(b));
    expect(invalidTopLevelReturn, invalidTopLevelReturn.map((b) => b.slice(0, 80)).join('\n---\n')).toEqual([]);

    const multilineExpressionBlocks = queryCallBlocks.filter((b) => {
      const codeLines = b.split('\n').filter((l) => l.trim() && !l.trim().startsWith('//'));
      return codeLines.length > 1 && !codeLines.some((l) => /^\s*(import|const|let|var|function|class)\b/.test(l));
    });
    // After the formatter fix there should be no bare multiline expressions left;
    // every former return-await multiline query is wrapped as const result = ...
    expect(multilineExpressionBlocks).toEqual([]);

    // Representative multiline queries must be const result = await ...
    for (const needle of [
      "sdk.identities.getKeys({",
      "sdk.documents.query({",
      "sdk.contracts.getMany([",
      "sdk.tokens.statuses([",
    ]) {
      const block = queryCallBlocks.find((b) => b.includes(needle));
      expect(block, needle).toBeTruthy();
      expect(block).toMatch(/^\s*const result = await /m);
      expect(block.trimEnd().endsWith(';')).toBe(true);
    }

    // Transition examples stay multi-statement and must not be force-wrapped into one assignment.
    const transitionSection = aiReference.split('## State Transition Operations')[1] || '';
    expect(transitionSection).toMatch(/import \{[\s\S]*IdentitySigner[\s\S]*\} from '@dashevo\/evo-sdk';/);
    expect(transitionSection).toMatch(/const result = await sdk\.tokens\.mint\(\{/);
    // Multi-statement identity create still has setup before the call.
    expect(transitionSection).toMatch(/new Identity\(assetLockProof\.createIdentityId\(\)\)/);
  });
});
