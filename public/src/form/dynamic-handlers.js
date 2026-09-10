import { normalizeContract, normalizeDocument } from '../contracts.js';
import { getInputElement, getInputValue } from './collect.js';
import { ensureClient, wallet } from '../sdk-client.js';
import { getDynamicHandler, state } from '../state.js';
import { setStatus } from '../ui.js';

export function createDocumentFieldsHandler(container, wrapper) {
  const state = {
    schema: null,
    revision: null,
  };

  return {
    setSchema(schema, existingData = null, options = {}) {
      state.schema = schema || null;
      if (Object.prototype.hasOwnProperty.call(options, 'revision')) {
        state.revision = options.revision;
      } else if (options.resetRevision) {
        state.revision = null;
      }
      renderDocumentFields(container, state.schema, existingData || {});
      if (wrapper) wrapper.style.display = '';
    },
    setRevision(revision) {
      state.revision = revision ?? null;
    },
    collect(operationKey) {
      if (!state.schema) {
        throw new Error('Please fetch the document schema first.');
      }
      const data = collectDocumentFieldValues(container, state.schema);
      const payload = { data };
      if (operationKey === 'documentCreate') {
        payload.entropyHex = generateEntropyHex();
      }
      if (state.revision != null) {
        payload.revision = state.revision;
      } else if (operationKey === 'documentReplace') {
        throw new Error('Document revision is missing. Click "Load Document" before replacing.');
      }
      return payload;
    },
    clear() {
      container.innerHTML = '';
      state.schema = null;
      state.revision = null;
      if (wrapper) wrapper.style.display = 'none';
    },
  };
}

export function createContestedResourceHandler(container, wrapper) {
  const state = {
    resources: [],
    select: null,
    valuesInput: null,
  };

  const resetContainer = () => {
    container.innerHTML = '';
    state.select = null;
    state.valuesInput = null;
  };

  const renderIndexValuesInput = (selectedIndex) => {
    const existing = container.querySelector('.index-values-group');
    if (existing) existing.remove();
    const index = Number(selectedIndex);
    if (!Number.isInteger(index) || index < 0 || !state.resources[index]) {
      state.valuesInput = null;
      return;
    }
    const resource = state.resources[index];
    const group = document.createElement('div');
    group.className = 'input-group index-values-group';

    const label = document.createElement('label');
    label.textContent = 'Index Values (JSON array)';
    group.appendChild(label);

    const textarea = document.createElement('textarea');
    textarea.rows = 2;
    const placeholderHint = Array.isArray(resource.indexProperties) && resource.indexProperties.length
      ? `Match order: ${resource.indexProperties.map(prop => prop.property || prop.name || prop).join(', ')}`
      : 'e.g., ["value1", "value2"]';
    textarea.placeholder = placeholderHint;
    group.appendChild(textarea);

    container.appendChild(group);
    state.valuesInput = textarea;
  };

  const renderResources = (resources) => {
    resetContainer();
    state.resources = Array.isArray(resources) ? resources : [];
    if (wrapper) wrapper.style.display = '';

    if (!state.resources.length) {
      const info = document.createElement('p');
      info.className = 'empty-message';
      info.textContent = 'No contested resources found for this contract.';
      container.appendChild(info);
      return;
    }

    const selectGroup = document.createElement('div');
    selectGroup.className = 'input-group contested-resource-group';

    const select = document.createElement('select');
    select.className = 'contested-resource-select';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Select a contested resource --';
    select.appendChild(placeholder);

    state.resources.forEach((resource, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = resource.displayName || `${resource.documentType} - ${resource.indexName}`;
      select.appendChild(option);
    });

    select.addEventListener('change', () => renderIndexValuesInput(select.value));

    selectGroup.appendChild(select);
    container.appendChild(selectGroup);
    state.select = select;
  };

  return {
    setResources(resources) {
      renderResources(resources);
    },
    collect() {
      if (!state.resources.length) {
        throw new Error('Click "Get Contested Resources" to load available options.');
      }
      if (!state.select || !state.select.value) {
        throw new Error('Please select a contested resource.');
      }
      const index = Number(state.select.value);
      const resource = state.resources[index];
      if (!resource) {
        throw new Error('Invalid contested resource selection.');
      }
      if (!state.valuesInput) {
        throw new Error('Provide index values for the contested resource.');
      }
      const raw = state.valuesInput.value.trim();
      if (!raw) {
        throw new Error('Index Values are required for the contested resource.');
      }
      let indexValues;
      try {
        indexValues = JSON.parse(raw);
      } catch (error) {
        throw new Error(`Index Values must be valid JSON: ${error.message}`);
      }
      if (!Array.isArray(indexValues)) {
        throw new Error('Index Values must be a JSON array.');
      }
      return {
        contractId: resource.contractId,
        documentTypeName: resource.documentType,
        indexName: resource.indexName,
        indexValues,
      };
    },
    clear() {
      resetContainer();
      state.resources = [];
      if (wrapper) wrapper.style.display = 'none';
    },
  };
}

export function createGenericDynamicHandler(container, wrapper) {
  return {
    collect() {
      return undefined;
    },
    clear() {
      container.innerHTML = '';
      if (wrapper) wrapper.style.display = 'none';
    },
  };
}

export function renderDocumentFields(container, schema, existingData = {}) {
  container.innerHTML = '';
  if (!schema) {
    const info = document.createElement('p');
    info.className = 'empty-message';
    info.textContent = 'Document schema not available for this operation.';
    container.appendChild(info);
    return;
  }

  const properties = schema.properties || {};
  const entries = Object.entries(properties);

  if (!entries.length) {
    const info = document.createElement('p');
    info.className = 'empty-message';
    info.textContent = 'This document type does not define any fields.';
    container.appendChild(info);
    return;
  }

  const header = document.createElement('h4');
  header.className = 'document-fields-header';
  header.textContent = 'Document Fields';
  container.appendChild(header);

  const requiredSet = new Set(Array.isArray(schema.required) ? schema.required : []);

  entries.forEach(([fieldName, fieldSchema]) => {
    const group = document.createElement('div');
    group.className = 'input-group document-field';

    const label = document.createElement('label');
    const isRequired = requiredSet.has(fieldName);
    label.textContent = `${fieldName}${isRequired ? ' *' : ''}`;
    group.appendChild(label);

    const input = createDocumentFieldInput(fieldName, fieldSchema || {}, existingData[fieldName], isRequired);
    group.appendChild(input);

    if (fieldSchema && fieldSchema.description) {
      const description = document.createElement('small');
      description.className = 'input-help';
      description.textContent = fieldSchema.description;
      group.appendChild(description);
    }

    container.appendChild(group);
  });
}

export function createDocumentFieldInput(fieldName, fieldSchema, existingValue, required) {
  const fieldType = fieldSchema?.type || 'string';
  const format = fieldSchema?.format;
  let input;

  if (fieldType === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    const defaultValue = existingValue !== undefined ? existingValue : fieldSchema.default;
    input.checked = !!defaultValue;
  } else if (fieldType === 'integer' || fieldType === 'number') {
    input = document.createElement('input');
    input.type = 'number';
    if (fieldSchema.minimum !== undefined) input.min = fieldSchema.minimum;
    if (fieldSchema.maximum !== undefined) input.max = fieldSchema.maximum;
    if (fieldSchema.multipleOf !== undefined) input.step = fieldSchema.multipleOf;
    if (fieldType === 'integer' && !input.step) input.step = '1';
    const value = existingValue !== undefined ? existingValue : fieldSchema.default;
    if (value !== undefined && value !== null) input.value = String(value);
  } else if (fieldType === 'array') {
    if (fieldSchema.byteArray) {
      input = document.createElement('input');
      input.type = 'text';
      const value = existingValue !== undefined ? existingValue : fieldSchema.default;
      if (value !== undefined && value !== null) input.value = String(value);
    } else {
      input = document.createElement('textarea');
      input.rows = 3;
      const value = existingValue !== undefined ? existingValue : fieldSchema.default;
      if (value !== undefined && value !== null) {
        input.value = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      }
    }
  } else if (fieldType === 'object') {
    input = document.createElement('textarea');
    input.rows = 4;
    const value = existingValue !== undefined ? existingValue : fieldSchema.default;
    if (value !== undefined && value !== null) {
      input.value = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    }
  } else if (fieldType === 'string' && Array.isArray(fieldSchema.enum)) {
    input = document.createElement('select');
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '-- Select --';
    input.appendChild(placeholder);
    fieldSchema.enum.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      input.appendChild(option);
    });
    const selected = existingValue !== undefined ? existingValue : fieldSchema.default;
    if (selected !== undefined && selected !== null) input.value = String(selected);
  } else if (fieldType === 'string' && format === 'date-time') {
    input = document.createElement('input');
    input.type = 'datetime-local';
    const value = existingValue !== undefined ? existingValue : fieldSchema.default;
    if (value !== undefined && value !== null) {
      const formatted = toLocalDateTimeString(value);
      if (formatted) input.value = formatted;
    }
  } else if (fieldSchema.maxLength && fieldSchema.maxLength > 250) {
    input = document.createElement('textarea');
    input.rows = 3;
    input.maxLength = fieldSchema.maxLength;
    const value = existingValue !== undefined ? existingValue : fieldSchema.default;
    if (value !== undefined && value !== null) input.value = String(value);
  } else {
    input = document.createElement('input');
    input.type = 'text';
    if (fieldSchema.maxLength) input.maxLength = fieldSchema.maxLength;
    if (fieldSchema.pattern) input.pattern = fieldSchema.pattern;
    const value = existingValue !== undefined ? existingValue : fieldSchema.default;
    if (value !== undefined && value !== null) input.value = String(value);
  }

  input.name = `doc_field_${fieldName}`;
  input.dataset.fieldName = fieldName;
  input.dataset.fieldType = fieldType;
  if (fieldSchema.byteArray === true) input.dataset.byteArray = 'true';
  if (format) input.dataset.format = format;
  input.classList.add('doc-field-input');
  input.placeholder = fieldSchema.placeholder || '';
  if (required) input.required = true;

  return input;
}

export function collectDocumentFieldValues(container, schema) {
  const values = {};
  const requiredSet = new Set(Array.isArray(schema?.required) ? schema.required : []);
  const inputs = container.querySelectorAll('.doc-field-input');

  inputs.forEach(input => {
    const fieldName = input.dataset.fieldName;
    if (!fieldName) return;
    const fieldType = input.dataset.fieldType || 'string';

    if (fieldType === 'boolean') {
      values[fieldName] = input.checked;
      requiredSet.delete(fieldName);
      return;
    }

    if (fieldType === 'integer' || fieldType === 'number') {
      const raw = input.value.trim();
      if (!raw) {
        if (requiredSet.has(fieldName)) {
          throw new Error(`${fieldName} is required.`);
        }
        return;
      }
      const parsed = Number(raw);
      if (Number.isNaN(parsed)) {
        throw new Error(`${fieldName} must be a valid ${fieldType}.`);
      }
      values[fieldName] = fieldType === 'integer' ? Math.trunc(parsed) : parsed;
      requiredSet.delete(fieldName);
      return;
    }

    if (fieldType === 'array') {
      const raw = input.value.trim();
      if (!raw) {
        if (requiredSet.has(fieldName)) {
          throw new Error(`${fieldName} is required.`);
        }
        return;
      }
      if (input.dataset.byteArray === 'true') {
        values[fieldName] = raw;
      } else {
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch (error) {
          throw new Error(`${fieldName} must be a JSON array.`);
        }
        if (!Array.isArray(parsed)) {
          throw new Error(`${fieldName} must be a JSON array.`);
        }
        values[fieldName] = parsed;
      }
      requiredSet.delete(fieldName);
      return;
    }

    if (fieldType === 'object') {
      const raw = input.value.trim();
      if (!raw) {
        if (requiredSet.has(fieldName)) {
          throw new Error(`${fieldName} is required.`);
        }
        return;
      }
      try {
        values[fieldName] = JSON.parse(raw);
      } catch (error) {
        throw new Error(`${fieldName} must be valid JSON.`);
      }
      requiredSet.delete(fieldName);
      return;
    }

    if (fieldType === 'string' && input.tagName === 'SELECT') {
      const raw = input.value;
      if (!raw) {
        if (requiredSet.has(fieldName)) {
          throw new Error(`${fieldName} is required.`);
        }
        return;
      }
      values[fieldName] = raw;
      requiredSet.delete(fieldName);
      return;
    }

    if (input.dataset.format === 'date-time') {
      const raw = input.value.trim();
      if (!raw) {
        if (requiredSet.has(fieldName)) {
          throw new Error(`${fieldName} is required.`);
        }
        return;
      }
      const timestamp = new Date(raw);
      if (Number.isNaN(timestamp.getTime())) {
        throw new Error(`${fieldName} must be a valid date/time.`);
      }
      values[fieldName] = timestamp.getTime();
      requiredSet.delete(fieldName);
      return;
    }

    const raw = (input.value ?? '').toString().trim();
    if (!raw) {
      if (requiredSet.has(fieldName)) {
        throw new Error(`${fieldName} is required.`);
      }
      return;
    }
    values[fieldName] = raw;
    requiredSet.delete(fieldName);
  });

  if (requiredSet.size) {
    const missing = Array.from(requiredSet).join(', ');
    throw new Error(`Missing required document fields: ${missing}`);
  }

  return values;
}

export function toLocalDateTimeString(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 16);
}

export function generateEntropyHex() {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex) {
  if (typeof hex !== 'string') {
    throw new Error('hexToBytes: input must be a string');
  }
  if (hex.length % 2 !== 0) {
    throw new Error('hexToBytes: hex string must have even length');
  }
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error('hexToBytes: invalid hex characters');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// === State Transition Helpers ===

export async function fetchDocumentSchema() {
  const contractId = getInputValue('contractId');
  const documentType = getInputValue('documentType');
  if (!contractId || !documentType) {
    setStatus('Please enter both Data Contract ID and Document Type.', 'error');
    return;
  }
  const handler = getDynamicHandler('documentFields');
  if (!handler || typeof handler.setSchema !== 'function') {
    setStatus('Document fields are not available for this operation.', 'error');
    return;
  }
  try {
    setStatus('Fetching data contract...', 'loading');
    const client = await ensureClient();
    const contract = await client.contracts.fetch(contractId);
    const contractJson = normalizeContract(contract);
    const schema = contractJson?.documentSchemas?.[documentType];
    if (!schema) {
      const available = contractJson?.documentSchemas ? Object.keys(contractJson.documentSchemas) : [];
      const message = available.length
        ? `Document type "${documentType}" not found. Available types: ${available.join(', ')}`
        : `Document type "${documentType}" not found in contract.`;
      setStatus(message, 'error');
      return;
    }
    handler.setSchema(schema, null, { revision: null });
    if (typeof handler.setRevision === 'function') handler.setRevision(null);
    setStatus(`Schema loaded for ${documentType}.`, 'success');
  } catch (error) {
    console.error('fetchDocumentSchema failed', error);
    setStatus(`Error fetching schema: ${error?.message || error}`, 'error');
  }
}

export async function loadExistingDocument() {
  const contractId = getInputValue('contractId');
  const documentType = getInputValue('documentType');
  const documentId = getInputValue('documentId');
  if (!contractId || !documentType || !documentId) {
    setStatus('Please fill in Data Contract ID, Document Type, and Document ID.', 'error');
    return;
  }
  const handler = getDynamicHandler('documentFields');
  if (!handler || typeof handler.setSchema !== 'function') {
    setStatus('Document fields are not available for this operation.', 'error');
    return;
  }
  try {
    setStatus('Loading document...', 'loading');
    const client = await ensureClient();
    const document = await client.documents.get(contractId, documentType, documentId);
    const normalizedDocument = normalizeDocument(document);
    if (!normalizedDocument) {
      setStatus('Document not found or could not be parsed.', 'error');
      return;
    }
    const contract = await client.contracts.fetch(contractId);
    const contractJson = normalizeContract(contract);
    const schema = contractJson?.documentSchemas?.[documentType];
    if (!schema) {
      const available = contractJson?.documentSchemas ? Object.keys(contractJson.documentSchemas) : [];
      const message = available.length
        ? `Document type "${documentType}" not found. Available types: ${available.join(', ')}`
        : `Document type "${documentType}" not found in contract.`;
      setStatus(message, 'error');
      return;
    }
    handler.setSchema(schema, normalizedDocument.data || {}, { revision: normalizedDocument.revision ?? null });
    if (typeof handler.setRevision === 'function') handler.setRevision(normalizedDocument.revision ?? null);
    const revisionDisplay = normalizedDocument.revision != null ? normalizedDocument.revision : 'N/A';
    setStatus(`Document loaded successfully (revision ${revisionDisplay}).`, 'success');
  } catch (error) {
    console.error('loadExistingDocument failed', error);
    setStatus(`Error loading document: ${error?.message || error}`, 'error');
  }
}

export async function fetchContestedResources() {
  const contractId = getInputValue('contractId');
  if (!contractId) {
    setStatus('Please enter a Data Contract ID.', 'error');
    return;
  }
  const handler = getDynamicHandler('contestedResourceDropdown');
  if (!handler || typeof handler.setResources !== 'function') {
    setStatus('Contested resource controls are not available for this operation.', 'error');
    return;
  }
  try {
    setStatus('Loading contested resources...', 'loading');
    const client = await ensureClient();
    const contract = await client.contracts.fetch(contractId);
    const contractJson = normalizeContract(contract);
    const documentSchemas = contractJson?.documentSchemas || {};
    const resources = [];

    Object.entries(documentSchemas).forEach(([documentType, schema]) => {
      const indices = Array.isArray(schema.indices) ? schema.indices : [];
      indices.forEach((index) => {
        if (index && index.unique && index.contested) {
          let description = '';
          if (typeof index.contested === 'object' && index.contested.description) {
            description = ` - ${index.contested.description}`;
          }
          resources.push({
            contractId,
            documentType,
            indexName: index.name,
            indexProperties: index.properties || [],
            displayName: `${documentType} - ${index.name}${description}`,
          });
        }
      });
    });

    handler.setResources(resources);

    if (!resources.length) {
      setStatus('No contested resources found for this contract.', 'warning');
    } else {
      setStatus(`Found ${resources.length} contested resource type(s).`, 'success');
    }
  } catch (error) {
    console.error('fetchContestedResources failed', error);
    setStatus(`Error fetching contested resources: ${error?.message || error}`, 'error');
  }
}

export async function generateTestSeed() {
  const seedInput = getInputElement('seedPhrase');
  if (!(seedInput instanceof HTMLTextAreaElement || seedInput instanceof HTMLInputElement)) {
    setStatus('Seed phrase input not available in this context.', 'error');
    return;
  }
  try {
    await ensureClient();
    const mnemonic = await wallet.generateMnemonic({ wordCount: 12 });
    seedInput.value = mnemonic;
    seedInput.dispatchEvent(new Event('input', { bubbles: true }));
    const parent = seedInput.parentElement;
    if (parent && !parent.querySelector('.seed-warning')) {
      const warning = document.createElement('div');
      warning.className = 'seed-warning';
      warning.style.color = '#dc3545';
      warning.style.fontSize = '0.9em';
      warning.style.marginTop = '5px';
      warning.textContent = '⚠️ Generated test seed – never use this for real funds.';
      parent.appendChild(warning);
    }
    setStatus('Generated test seed phrase. Treat it as insecure.', 'success');
  } catch (error) {
    console.error('generateTestSeed failed', error);
    setStatus(`Failed to generate seed: ${error?.message || error}`, 'error');
  }
}
