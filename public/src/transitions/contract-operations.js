import { CONTRACT_SECURITY_LEVELS, prepareTransition } from '../transition-auth.js';
import { DataContract } from '../sdk-types.js';

const FIELDS = [
  { name: 'dataContractId', group: 'DataContract', produces: 'dataContract.id' },
  { name: 'documentSchemas', group: 'DataContract', produces: 'dataContract.schemas' },
  { name: 'newDocumentSchemas', group: 'DataContract', produces: 'dataContract.schemas' },
  { name: 'tokens', group: 'DataContract', produces: 'dataContract.tokens' },
];

function parseObject(value, label, required = false) {
  if (value == null || value === '') {
    if (required) throw new Error(`${label} is required`);
    return undefined;
  }
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch (error) { throw new Error(`Invalid JSON in ${label}: ${error.message}`); }
}

function renderSigning(values) {
  return [
    "import { DataContract, IdentitySigner } from '@dashevo/evo-sdk';",
    '',
    `const identity = await sdk.identities.fetch(${JSON.stringify(values.ownerId || '<ownerId>')});`,
    "if (!identity) throw new Error('Identity not found');",
    'const identityKey = identity.getPublicKeyById(keyId);',
    'const signer = new IdentitySigner();',
    'signer.addKeyFromWif(privateKeyWif);',
  ];
}

export const contractTransitionOperations = {
  dataContractCreate: {
    sdkMethod: 'contracts.publish', fields: FIELDS,
    async prepare(values, sdk) {
      const { identityKey, signer } = await prepareTransition(sdk, values.ownerId, values.privateKeyWif, values.keyId, CONTRACT_SECURITY_LEVELS);
      const nonce = await sdk.identities.nonce(values.ownerId);
      const schemas = parseObject(values.documentSchemas, 'Document Schemas JSON', true);
      const tokens = parseObject(values.tokens, 'Tokens');
      const dataContract = new DataContract({ ownerId: values.ownerId, identityNonce: (nonce || 0n) + 1n, schemas, definitions: undefined, tokens: tokens && Object.keys(tokens).length ? tokens : undefined, fullValidation: false });
      const hasConfig = values.canBeDeleted || values.readonly || values.keepsHistory || values.documentsKeepHistoryContractDefault || values.documentsMutableContractDefault === false || values.documentsCanBeDeletedContractDefault === false;
      if (hasConfig) dataContract.setConfig({ canBeDeleted: !!values.canBeDeleted, readonly: !!values.readonly, keepsHistory: !!values.keepsHistory, documentsKeepHistoryContractDefault: !!values.documentsKeepHistoryContractDefault, documentsMutableContractDefault: values.documentsMutableContractDefault !== false, documentsCanBeDeletedContractDefault: values.documentsCanBeDeletedContractDefault !== false });
      return { options: { dataContract, identityKey, signer }, context: { dataContract, schemas, ownerId: values.ownerId } };
    },
    async execute(prepared, sdk) { const published = await sdk.contracts.publish(prepared.options); return { status: 'success', contractId: published.id?.toString() || prepared.context.dataContract.id?.toString(), ownerId: published.ownerId?.toString() || prepared.context.ownerId, version: published.version || 1, documentTypes: Object.keys(prepared.context.schemas), message: `Data contract created successfully with ID: ${published.id?.toString()}` }; },
    renderCode(values) { return [...renderSigning(values), '', 'const identityNonce = (await sdk.identities.nonce(identity.id)) + 1n;', 'const dataContract = new DataContract({ ownerId: identity.id, identityNonce, schemas, tokens, fullValidation: false });', '', 'await sdk.contracts.publish({ dataContract, identityKey, signer });'].join('\n'); },
  },
  dataContractUpdate: {
    sdkMethod: 'contracts.update', fields: FIELDS,
    async prepare(values, sdk) {
      if (!values.dataContractId) throw new Error('Data Contract ID is required');
      const dataContract = await sdk.contracts.fetch(values.dataContractId);
      if (!dataContract) throw new Error(`Data contract not found: ${values.dataContractId}`);
      const { identityKey, signer } = await prepareTransition(sdk, values.ownerId, values.privateKeyWif, values.keyId, CONTRACT_SECURITY_LEVELS);
      dataContract.version = (dataContract.version || 1) + 1;
      const schemas = parseObject(values.newDocumentSchemas, 'New Document Schemas');
      if (schemas) dataContract.setSchemas({ ...(dataContract.schemas || {}), ...schemas }, undefined, false);
      return { options: { dataContract, identityKey, signer }, context: { contractId: values.dataContractId, version: dataContract.version } };
    },
    async execute(prepared, sdk) { await sdk.contracts.update(prepared.options); return { status: 'success', ...prepared.context, message: `Data contract updated successfully. New version: ${prepared.context.version}` }; },
    renderCode(values) { return [...renderSigning(values), '', `const dataContract = await sdk.contracts.fetch(${JSON.stringify(values.dataContractId || '<dataContractId>')});`, "if (!dataContract) throw new Error('Data contract not found');", 'dataContract.version += 1;', 'dataContract.setSchemas({ ...dataContract.schemas, ...newDocumentSchemas }, undefined, false);', '', 'await sdk.contracts.update({ dataContract, identityKey, signer });'].join('\n'); },
  },
};
