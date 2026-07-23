import { prepareTransition } from '../transition-auth.js';
import { Identifier } from '../sdk-types.js';

const FIELDS = [
  { name: 'contractId', group: 'Token', produces: 'dataContractId' },
  { name: 'tokenPosition', group: 'Token', produces: 'tokenPosition' },
  { name: 'amount', group: 'SDK Options', produces: 'amount' },
  { name: 'recipientId', group: 'SDK Options', produces: 'recipientId' },
  { name: 'publicNote', group: 'SDK Options', produces: 'publicNote' },
];

const CONFIG = {
  tokenMint: { method: 'mint', ids: { identityId: 'identityId' }, optionalIds: { recipientId: 'issuedToIdentityId' }, bigints: { amount: 'amount' } },
  tokenBurn: { method: 'burn', ids: { identityId: 'identityId' }, bigints: { amount: 'amount' } },
  tokenTransfer: { method: 'transfer', ids: { senderId: 'identityId', recipientId: 'recipientId' }, bigints: { amount: 'amount' } },
  tokenFreeze: { method: 'freeze', ids: { authorityId: 'identityId', frozenIdentityId: 'identityToFreeze' } },
  tokenUnfreeze: { method: 'unfreeze', ids: { authorityId: 'identityId', frozenIdentityId: 'identityToUnfreeze' } },
  tokenDestroyFrozen: { method: 'destroyFrozen', ids: { authorityId: 'identityId', frozenIdentityId: 'frozenIdentityId' } },
  tokenSetPriceForDirectPurchase: { method: 'setPrice', ids: { authorityId: 'identityId' }, nullableBigints: { price: 'priceData' } },
  tokenDirectPurchase: { method: 'directPurchase', ids: { buyerId: 'identityId' }, bigints: { amount: 'amount', maxTotalCost: 'totalAgreedPrice' } },
  tokenClaim: { method: 'claim', ids: { identityId: 'identityId' }, values: { distributionType: 'distributionType' } },
  tokenEmergencyAction: { method: 'emergencyAction', ids: { authorityId: 'identityId' }, values: { action: 'actionType' } },
};

function required(value, label) {
  if (value === undefined || value === null || value === '') throw new Error(`${label} is required`);
  return value;
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function renderCode(config) {
  const optionLines = [
    '  dataContractId: Identifier.fromBase58(contractId),',
    '  tokenPosition: Number(tokenPosition),',
    ...Object.entries(config.ids || {}).map(([target, source]) => `  ${target}: Identifier.fromBase58(${source}),`),
    ...Object.entries(config.optionalIds || {}).map(([target, source]) => `  ${target}: ${source} ? Identifier.fromBase58(${source}) : undefined,`),
    ...Object.entries(config.bigints || {}).map(([target, source]) => `  ${target}: BigInt(${source}),`),
    ...Object.entries(config.nullableBigints || {}).map(([target, source]) => `  ${target}: ${source} == null || ${source} === '' ? null : BigInt(${source}),`),
    ...Object.entries(config.values || {}).map(([target, source]) => `  ${target}: ${source},`),
    '  publicNote: publicNote || undefined,',
    '  identityKey,',
    '  signer,',
  ];
  return [
    "import { Identifier, IdentitySigner } from '@dashevo/evo-sdk';",
    '',
    'const identity = await sdk.identities.fetch(identityId);',
    "if (!identity) throw new Error('Identity not found');",
    'const identityKey = identity.getPublicKeyById(keyId);',
    'const signer = new IdentitySigner();',
    'signer.addKeyFromWif(privateKeyWif);',
    '',
    `await sdk.tokens.${config.method}({`,
    ...optionLines,
    '});',
  ].join('\n');
}

export const tokenTransitionOperations = Object.fromEntries(Object.entries(CONFIG).map(([key, config]) => [key, {
  sdkMethod: `tokens.${config.method}`,
  fields: FIELDS,
  async prepare(values, sdk) {
    const identityId = required(values.identityId, 'Identity ID');
    const { identityKey, signer } = await prepareTransition(sdk, identityId, values.privateKeyWif, values.keyId);
    const options = {
      dataContractId: Identifier.fromBase58(required(values.contractId, 'Data Contract ID')),
      tokenPosition: Number(required(values.tokenPosition, 'Token position')),
      identityKey,
      signer,
    };
    for (const [target, source] of Object.entries(config.ids || {})) options[target] = Identifier.fromBase58(required(values[source], target));
    for (const [target, source] of Object.entries(config.optionalIds || {})) {
      if (values[source]) options[target] = Identifier.fromBase58(values[source]);
    }
    for (const [target, source] of Object.entries(config.bigints || {})) options[target] = BigInt(required(values[source], target));
    for (const [target, source] of Object.entries(config.nullableBigints || {})) options[target] = hasValue(values[source]) ? BigInt(values[source]) : null;
    for (const [target, source] of Object.entries(config.values || {})) options[target] = required(values[source], target);
    if (values.publicNote) options.publicNote = values.publicNote;
    return { options, context: { values } };
  },
  async execute(prepared, sdk) {
    const result = await sdk.tokens[config.method](prepared.options);
    switch (key) {
      case 'tokenMint':
        return {
          status: 'success',
          balance: result?.balance?.toString(),
          message: `Minted ${prepared.options.amount} tokens`,
        };
      case 'tokenBurn':
        return {
          status: 'success',
          balance: result?.balance?.toString(),
          message: `Burned ${prepared.options.amount} tokens`,
        };
      case 'tokenTransfer':
        return {
          status: 'success',
          senderBalance: result?.senderBalance?.toString(),
          recipientBalance: result?.recipientBalance?.toString(),
          message: `Transferred ${prepared.options.amount} tokens to ${prepared.context.values.recipientId}`,
        };
      case 'tokenFreeze':
        return {
          status: 'success',
          message: `Frozen tokens for identity ${prepared.context.values.identityToFreeze}`,
        };
      case 'tokenUnfreeze':
        return {
          status: 'success',
          message: `Unfrozen tokens for identity ${prepared.context.values.identityToUnfreeze}`,
        };
      case 'tokenDestroyFrozen':
        return {
          status: 'success',
          message: `Destroyed frozen tokens for identity ${prepared.context.values.frozenIdentityId}`,
        };
      case 'tokenSetPriceForDirectPurchase':
        return {
          status: 'success',
          message: 'Token price set successfully',
        };
      case 'tokenDirectPurchase':
        return {
          status: 'success',
          balance: result?.balance?.toString(),
          creditsPaid: result?.creditsPaid?.toString(),
          message: `Purchased ${prepared.options.amount} tokens`,
        };
      case 'tokenClaim':
        return {
          status: 'success',
          claimedAmount: result?.claimedAmount?.toString(),
          message: 'Claimed tokens from distribution',
        };
      case 'tokenEmergencyAction':
        return {
          status: 'success',
          message: `Emergency action ${prepared.options.action} performed`,
        };
      default:
        return {
        status: 'success',
          message: `${key} completed successfully`,
        };
    }
  },
  renderCode() { return renderCode(config); },
}]));
