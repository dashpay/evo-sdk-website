import { prepareTransition } from '../transition-auth.js';
import { Document, Identifier } from '../sdk-types.js';

const DOCUMENT_FIELDS = [
  { name: 'contractId', group: 'Document', produces: 'document.dataContractId' },
  { name: 'documentType', group: 'Document', produces: 'document.documentTypeName' },
  { name: 'documentId', group: 'Existing Document', produces: 'document.id' },
  { name: 'documentFields', group: 'Document', produces: 'document.properties' },
  { name: 'recipientId', group: 'SDK Options', produces: 'recipientId' },
  { name: 'price', group: 'SDK Options', produces: 'price' },
];

function required(value, label) {
  if (value === undefined || value === null || value === '') throw new Error(`${label} is required`);
  return value;
}

function documentData(values, replace = false) {
  const dynamic = values.documentFields && typeof values.documentFields === 'object'
    ? values.documentFields
    : {};
  const data = values.data ?? dynamic.data;
  if (!data) {
    throw new Error(replace
      ? 'Document data is required. Load the document and modify the fields before replacing.'
      : 'Document data is required. Click "Fetch Schema" and fill the document fields.');
  }
  return { data, dynamic };
}

async function signingContext(values, sdk, identityField = 'ownerId') {
  const identityId = required(values[identityField], identityField === 'buyerId' ? 'Buyer identity ID' : 'Owner identity ID');
  return prepareTransition(sdk, identityId, values.privateKeyWif, values.keyId);
}

async function fetchMutableDocument(values, sdk) {
  const document = await sdk.documents.get(
    required(values.contractId, 'Data Contract ID'),
    required(values.documentType, 'Document Type'),
    required(values.documentId, 'Document ID'),
  );
  if (!document) throw new Error(`Document not found: ${values.documentId}`);
  document.revision = BigInt(document.revision) + 1n;
  return document;
}

function renderCommon(values, identityField = 'ownerId', includeIdentifier = false) {
  const identityName = identityField === 'buyerId' ? 'buyer' : 'identity';
  const identityValue = values[identityField] || `<${identityField}>`;
  return [
    `import { ${includeIdentifier ? 'Identifier, ' : ''}IdentitySigner } from '@dashevo/evo-sdk';`,
    '',
    `const ${identityName} = await sdk.identities.fetch(${JSON.stringify(identityValue)});`,
    `if (!${identityName}) throw new Error('Identity not found');`,
    `const identityKey = ${identityName}.getPublicKeyById(${values.keyId ?? '<keyId>'});`,
    "if (!identityKey) throw new Error('Identity key not found');",
    'const signer = new IdentitySigner();',
    'signer.addKeyFromWif(privateKeyWif);',
  ];
}

function renderFetchedDocument(values) {
  return [
    `const document = await sdk.documents.get(${JSON.stringify(values.contractId || '<contractId>')}, ${JSON.stringify(values.documentType || '<documentType>')}, ${JSON.stringify(values.documentId || '<documentId>')});`,
    "if (!document) throw new Error('Document not found');",
    'document.revision = BigInt(document.revision) + 1n;',
  ];
}

const operations = {
  documentCreate: {
    sdkMethod: 'documents.create',
    fields: DOCUMENT_FIELDS,
    async prepare(values, sdk) {
      const { data } = documentData(values);
      const { identityKey, signer } = await signingContext(values, sdk);
      const document = new Document({
        dataContractId: required(values.contractId, 'Data Contract ID'),
        ownerId: values.ownerId,
        documentTypeName: required(values.documentType, 'Document Type'),
        properties: data,
      });
      return { options: { document, identityKey, signer }, context: { document } };
    },
    async execute(prepared, sdk) {
      await sdk.documents.create(prepared.options);
      const { document } = prepared.context;
      return { status: 'success', documentId: document.id?.toString(), ownerId: document.ownerId?.toString(), documentType: document.documentTypeName, message: `Document created successfully with ID: ${document.id?.toString()}` };
    },
    renderCode(values) {
      return [...renderCommon(values), '', "import { Document } from '@dashevo/evo-sdk';", `const document = new Document({ dataContractId: ${JSON.stringify(values.contractId || '<contractId>')}, documentTypeName: ${JSON.stringify(values.documentType || '<documentType>')}, ownerId: ${JSON.stringify(values.ownerId || '<ownerId>')}, properties });`, '', 'await sdk.documents.create({ document, identityKey, signer });'].join('\n');
    },
  },
  documentReplace: {
    sdkMethod: 'documents.replace', fields: DOCUMENT_FIELDS,
    async prepare(values, sdk) {
      const { data, dynamic } = documentData(values, true);
      const revision = values.revision ?? dynamic.revision;
      if (revision == null) throw new Error('Document revision is missing. Click "Load Document" before replacing.');
      const { identityKey, signer } = await signingContext(values, sdk);
      const nextRevision = BigInt(revision) + 1n;
      const document = new Document({ dataContractId: required(values.contractId, 'Data Contract ID'), ownerId: values.ownerId, documentTypeName: required(values.documentType, 'Document Type'), properties: data, revision: Number(nextRevision), id: required(values.documentId, 'Document ID') });
      return { options: { document, identityKey, signer }, context: { document, nextRevision } };
    },
    async execute(prepared, sdk) { await sdk.documents.replace(prepared.options); return { status: 'success', documentId: prepared.context.document.id?.toString(), newRevision: prepared.context.nextRevision.toString(), message: `Document replaced successfully. New revision: ${prepared.context.nextRevision}` }; },
    renderCode(values) { return [...renderCommon(values), '', "import { Document } from '@dashevo/evo-sdk';", 'const document = new Document({ dataContractId, documentTypeName, ownerId, properties, id: documentId, revision: Number(BigInt(revision) + 1n) });', '', 'await sdk.documents.replace({ document, identityKey, signer });'].join('\n'); },
  },
  documentDelete: {
    sdkMethod: 'documents.delete', fields: DOCUMENT_FIELDS,
    async prepare(values, sdk) { const { identityKey, signer } = await signingContext(values, sdk); return { options: { document: { id: required(values.documentId, 'Document ID'), ownerId: values.ownerId, dataContractId: required(values.contractId, 'Data Contract ID'), documentTypeName: required(values.documentType, 'Document Type') }, identityKey, signer }, context: { documentId: values.documentId } }; },
    async execute(prepared, sdk) { await sdk.documents.delete(prepared.options); return { status: 'success', documentId: prepared.context.documentId, message: 'Document deleted successfully' }; },
    renderCode(values) { return [...renderCommon(values), '', 'const document = { id: documentId, ownerId, dataContractId, documentTypeName };', 'await sdk.documents.delete({ document, identityKey, signer });'].join('\n'); },
  },
};

for (const [key, method, identityField] of [
  ['documentTransfer', 'transfer', 'ownerId'],
  ['documentPurchase', 'purchase', 'buyerId'],
  ['documentSetPrice', 'setPrice', 'ownerId'],
]) {
  operations[key] = {
    sdkMethod: `documents.${method}`,
    fields: DOCUMENT_FIELDS,
    async prepare(values, sdk) {
      const { identityKey, signer } = await signingContext(values, sdk, identityField);
      const document = await fetchMutableDocument(values, sdk);
      const options = { document, identityKey, signer };
      if (key === 'documentTransfer') options.recipientId = Identifier.fromBase58(required(values.recipientId, 'Recipient identity ID'));
      if (key === 'documentPurchase') { options.buyerId = Identifier.fromBase58(required(values.buyerId, 'Buyer identity ID')); options.price = BigInt(required(values.price, 'Price')); }
      if (key === 'documentSetPrice') options.price = BigInt(required(values.price, 'Price'));
      return { options, context: { document, price: values.price, recipientId: values.recipientId, buyerId: values.buyerId } };
    },
    async execute(prepared, sdk) {
      await sdk.documents[method](prepared.options);
      const id = prepared.context.document.id?.toString();
      if (key === 'documentTransfer') return { status: 'success', documentId: id, recipientId: prepared.context.recipientId, message: `Document transferred to ${prepared.context.recipientId}` };
      if (key === 'documentPurchase') return { status: 'success', documentId: id, buyerId: prepared.context.buyerId, price: prepared.context.price, message: `Document purchased for ${prepared.context.price} credits` };
      return { status: 'success', documentId: id, price: prepared.context.price, message: `Document price set to ${prepared.context.price} credits` };
    },
    renderCode(values) {
      const lines = [...renderCommon(values, identityField, key !== 'documentSetPrice'), '', ...renderFetchedDocument(values), ''];
      if (key === 'documentTransfer') lines.push('const recipientIdentifier = Identifier.fromBase58(recipientId);', 'await sdk.documents.transfer({ document, recipientId: recipientIdentifier, identityKey, signer });');
      if (key === 'documentPurchase') lines.push('const buyerIdentifier = Identifier.fromBase58(buyerId);', 'await sdk.documents.purchase({ document, buyerId: buyerIdentifier, price: BigInt(price), identityKey, signer });');
      if (key === 'documentSetPrice') lines.push('await sdk.documents.setPrice({ document, price: BigInt(price), identityKey, signer });');
      return lines.join('\n');
    },
  };
}

export const documentTransitionOperations = operations;
