import { createSigner } from '../transition-auth.js';

const IDENTITY_FIELDS = [
  { name: 'addPublicKeys', group: 'Identity', produces: 'addPublicKeys' },
  { name: 'disablePublicKeys', group: 'Identity', produces: 'disablePublicKeys' },
  { name: 'recipientId', group: 'SDK Options', produces: 'recipientId' },
  { name: 'amount', group: 'SDK Options', produces: 'amount' },
  { name: 'toAddress', group: 'SDK Options', produces: 'toAddress' },
  { name: 'coreFeePerByte', group: 'SDK Options', produces: 'coreFeePerByte' },
];

function required(value, label) {
  if (value === undefined || value === null || value === '') throw new Error(`${label} is required`);
  return value;
}

export function parseDisablePublicKeyIds(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const entries = Array.isArray(value) ? value : String(value).split(',');
  return entries.map(entry => {
    const text = String(entry).trim();
    if (!/^\d+$/.test(text)) {
      throw new Error('Public key IDs to disable must be comma-separated non-negative integers');
    }
    const keyId = Number(text);
    if (!Number.isSafeInteger(keyId)) {
      throw new Error('Public key IDs to disable must be comma-separated non-negative integers');
    }
    return keyId;
  });
}

async function identityContext(values, sdk) {
  const identityId = required(values.identityId, 'Identity ID');
  const identity = await sdk.identities.fetch(identityId);
  if (!identity) throw new Error(`Identity not found: ${identityId}`);
  return { identity, signer: createSigner(values.privateKeyWif), identityId };
}

function renderContext(values) {
  return [
    "import { IdentitySigner } from '@dashevo/evo-sdk';",
    '',
    `const identity = await sdk.identities.fetch(${JSON.stringify(values.identityId || '<identityId>')});`,
    "if (!identity) throw new Error('Identity not found');",
    'const signer = new IdentitySigner();',
    'signer.addKeyFromWif(privateKeyWif);',
  ];
}

export const identityTransitionOperations = {
  identityCreditTransfer: {
    sdkMethod: 'identities.creditTransfer', fields: IDENTITY_FIELDS,
    async prepare(values, sdk) {
      const { identity, signer } = await identityContext(values, sdk);
      return { options: { identity, recipientId: required(values.recipientId, 'Recipient identity ID'), amount: BigInt(required(values.amount, 'Amount')), signer }, context: { recipientId: values.recipientId } };
    },
    async execute(prepared, sdk) { const result = await sdk.identities.creditTransfer(prepared.options); return { status: 'success', senderBalance: result.senderBalance?.toString(), recipientBalance: result.recipientBalance?.toString(), message: `Transferred ${prepared.options.amount} credits to ${prepared.context.recipientId}` }; },
    renderCode(values) { return [...renderContext(values), '', 'await sdk.identities.creditTransfer({', '  identity,', `  recipientId: ${JSON.stringify(values.recipientId || '<recipientId>')},`, `  amount: BigInt(${JSON.stringify(values.amount || '<amount>')}),`, '  signer,', '});'].join('\n'); },
  },
  identityCreditWithdrawal: {
    sdkMethod: 'identities.creditWithdrawal', fields: IDENTITY_FIELDS,
    async prepare(values, sdk) {
      const { identity, signer } = await identityContext(values, sdk);
      return { options: { identity, amount: BigInt(required(values.amount, 'Amount')), toAddress: values.toAddress || undefined, coreFeePerByte: values.coreFeePerByte == null || values.coreFeePerByte === '' ? undefined : Number(values.coreFeePerByte), signer } };
    },
    async execute(prepared, sdk) { const remainingBalance = await sdk.identities.creditWithdrawal(prepared.options); return { status: 'success', remainingBalance: remainingBalance?.toString(), withdrawnAmount: prepared.options.amount.toString(), toAddress: prepared.options.toAddress, message: `Withdrew ${prepared.options.amount} credits. Remaining balance: ${remainingBalance}` }; },
    renderCode(values) { return [...renderContext(values), '', 'await sdk.identities.creditWithdrawal({', '  identity,', `  amount: BigInt(${JSON.stringify(values.amount || '<amount>')}),`, `  toAddress: ${JSON.stringify(values.toAddress || '<optionalCoreAddress>')},`, `  coreFeePerByte: ${values.coreFeePerByte || 'undefined'},`, '  signer,', '});'].join('\n'); },
  },
  identityUpdate: {
    sdkMethod: 'identities.update', fields: IDENTITY_FIELDS,
    async prepare(values, sdk) {
      const { identity, signer, identityId } = await identityContext(values, sdk);
      const disablePublicKeys = parseDisablePublicKeyIds(values.disablePublicKeys);
      return { options: { identity, addPublicKeys: values.addPublicKeys || undefined, disablePublicKeys, signer }, context: { identityId } };
    },
    async execute(prepared, sdk) { await sdk.identities.update(prepared.options); return { status: 'success', identityId: prepared.context.identityId, message: 'Identity updated successfully' }; },
    renderCode(values) { return [...renderContext(values), '', "const disabledKeyIds = disablePublicKeys?.split(',').map(value => Number(value.trim()));", 'await sdk.identities.update({ identity, addPublicKeys, disablePublicKeys: disabledKeyIds, signer });'].join('\n'); },
  },
};
