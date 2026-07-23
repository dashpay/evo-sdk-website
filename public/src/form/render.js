import { computeAuthRequirements, updateAuthInputsVisibility } from '../auth.js';
import { getPreviewKeyId } from '../auth-preview.js';
import { DPNS_AUTH_REQUIREMENTS, PROOF_CAPABLE, TYPE_CONFIG, getTypeConfig } from '../definitions-data.js';
import { SUPPORTED_INPUT_TYPES, normalizeType } from '../input-types.js';
import { createContestedResourceHandler, createDocumentFieldsHandler, createGenericDynamicHandler, fetchContestedResources, fetchDocumentSchema, generateTestSeed, loadExistingDocument } from './dynamic-handlers.js';
import { clearDynamicHandlers, elements, registerDynamicHandler, state } from '../state.js';
import { setNoProofInfoVisibility, setStatus } from '../ui.js';
import { getTransitionOperation, renderTransitionCode } from '../transitions/registry.js';

export function populateCategories() {
  const type = elements.operationType.value;
  if (type === 'wallet') {
    elements.queryCategory.innerHTML = '<option value="">Wallet helpers are not available in this demo</option>';
    elements.queryType.innerHTML = '<option value="">Select Operation</option>';
    elements.queryType.style.display = 'none';
    if (elements.queryTypeLabel) {
      elements.queryTypeLabel.style.display = 'none';
    }
    hideOperationDetails();
    setNoProofInfoVisibility(false);
    setStatus('Wallet helpers are not available with the Evo SDK demo.', 'loading');
    updateAuthInputsVisibility(null);
    return;
  }

  const config = getTypeConfig(type) || TYPE_CONFIG.queries;
  if (!config.allowProof) {
    setNoProofInfoVisibility(false);
  }

  const target = state.definitions[config.definitionKey] || {};
  elements.queryCategory.innerHTML = '<option value="">Select Category</option>';
  const entries = Object.entries(target);
  entries.sort((a, b) => (a[1]?.label || a[0]).localeCompare(b[1]?.label || b[0]));
  for (const [key, group] of entries) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = group?.label || key;
    elements.queryCategory.appendChild(option);
  }
  elements.queryType.innerHTML = '<option value="">Select Operation</option>';
  elements.queryType.style.display = 'none';
  if (elements.queryTypeLabel) {
    elements.queryTypeLabel.style.display = 'none';
  }
  hideOperationDetails();
}

export function populateOperations(categoryKey) {
  const type = elements.operationType.value;
  const config = getTypeConfig(type) || TYPE_CONFIG.queries;
  const source = state.definitions[config.definitionKey] || {};
  const sourceGroup = source[categoryKey];
  const itemsKey = config.itemsKey;
  const items = sourceGroup?.[itemsKey];
  elements.queryType.innerHTML = '<option value="">Select Operation</option>';
  if (!items) {
    elements.queryType.style.display = 'none';
    if (elements.queryTypeLabel) {
      elements.queryTypeLabel.style.display = 'none';
    }
    hideOperationDetails();
    return;
  }
  const entries = Object.entries(items);
  entries.sort((a, b) => (a[1]?.label || a[0]).localeCompare(b[1]?.label || b[0]));
  for (const [key, def] of entries) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = def?.label || key;
    if (def?.disabled) {
      // option.disabled = true; // Allow clicking to see operation details
      option.textContent += ' (Disabled)';
    }
    elements.queryType.appendChild(option);
  }
  elements.queryType.style.display = 'block';
  if (elements.queryTypeLabel) {
    elements.queryTypeLabel.style.display = 'block';
  }
  hideOperationDetails();
}

export function hideOperationDetails() {
  elements.queryDescription.style.display = 'none';
  elements.queryInputs.style.display = 'none';
  elements.dynamicInputs.innerHTML = '';
  if (elements.generatedCodePanel) elements.generatedCodePanel.style.display = 'none';
  if (elements.generatedCode) elements.generatedCode.textContent = '';
  elements.proofToggleContainer.style.display = 'none';
  setNoProofInfoVisibility(false);
  if (elements.executeButton) {
    elements.executeButton.style.display = 'none';
    elements.executeButton.disabled = true;
  }
  state.selected = null;
  updateAuthInputsVisibility(null);
}

export function onOperationChange(categoryKey, operationKey) {
  const type = elements.operationType.value;
  const config = getTypeConfig(type) || TYPE_CONFIG.queries;
  const groupRoot = state.definitions[config.definitionKey] || {};
  const group = groupRoot[categoryKey];
  const itemsKey = config.itemsKey;
  const def = group?.[itemsKey]?.[operationKey];
  if (!def) {
    hideOperationDetails();
    return;
  }
  const label = def.label || operationKey;
  elements.queryTitle.textContent = label;

  // Check if operation is disabled
  const isDisabled = !!def.disabled;
  if (isDisabled) {
    const reason = typeof def.disabled === 'string' ? def.disabled
      : def.disabled?.reason || 'This operation is temporarily disabled';
    elements.queryDescription.textContent = `DISABLED: ${reason}`;
    elements.queryDescription.style.display = 'block';
    elements.queryDescription.classList.add('disabled-warning');
  } else if (def.description) {
    elements.queryDescription.textContent = def.description;
    elements.queryDescription.style.display = 'block';
    elements.queryDescription.classList.remove('disabled-warning');
  } else {
    elements.queryDescription.style.display = 'none';
    elements.queryDescription.classList.remove('disabled-warning');
  }
  renderInputs(def);
  const supportsProof = config.allowProof && PROOF_CAPABLE.has(operationKey);
  const shouldShowNoProof = config.allowProof && !supportsProof;
  elements.proofToggle.checked = supportsProof;
  elements.proofToggleContainer.style.display = supportsProof ? 'flex' : 'none';
  setNoProofInfoVisibility(shouldShowNoProof);
  let authRequirements = null;
  if (type === 'transitions') {
    authRequirements = computeAuthRequirements(operationKey, def);
  } else if (type === 'dpns') {
    authRequirements = DPNS_AUTH_REQUIREMENTS[operationKey] || null;
  }
  updateAuthInputsVisibility(authRequirements);
  if (elements.executeButton) {
    elements.executeButton.style.display = 'block';
    elements.executeButton.disabled = isDisabled;
  }
  state.selected = { type, categoryKey, operationKey, definition: def, auth: authRequirements };
  updateGeneratedCodePreview();
}

export function renderInputs(def) {
  elements.dynamicInputs.innerHTML = '';
  clearDynamicHandlers();
  const inputs = Array.isArray(def.inputs) ? def.inputs : [];
  if (!inputs.length) {
    elements.queryInputs.style.display = 'none';
    return;
  }
  const dependencyListeners = [];
  const operation = getTransitionOperation(state.selected?.operationKey || elements.queryType?.value);
  let previousGroup = null;
  inputs.forEach((inputDef, index) => {
    const normalizedType = normalizeType(inputDef.type);
    if (!SUPPORTED_INPUT_TYPES.has(normalizedType)) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'input-group';

    const fieldModel = operation?.fields?.find(field => field.name === inputDef.name);
    const group = fieldModel?.group || null;
    if (group && group !== previousGroup) {
      const heading = document.createElement('h5');
      heading.className = 'input-group-heading';
      heading.textContent = group;
      elements.dynamicInputs.appendChild(heading);
      previousGroup = group;
    }

    const label = document.createElement('label');
    label.textContent = inputDef.label || inputDef.name || `Parameter ${index + 1}`;
    wrapper.appendChild(label);

    const control = createControl(normalizedType, inputDef, wrapper);
    if (!control) {
      elements.dynamicInputs.appendChild(wrapper);
      return;
    }
    control.dataset.inputName = inputDef.name || `param_${index}`;
    wrapper.appendChild(control);

    if (inputDef.help) {
      const help = document.createElement('div');
      help.style.fontSize = '0.85em';
      help.style.color = '#666';
      help.textContent = inputDef.help;
      wrapper.appendChild(help);
    }

    if (inputDef.dependsOn && inputDef.dependsOn.field) {
      const values = inputDef.dependsOn.values || inputDef.dependsOn.value;
      const valueList = Array.isArray(values) ? values : [values];
      wrapper.dataset.dependsOn = inputDef.dependsOn.field;
      wrapper.dataset.dependsValues = valueList.map(String).join(',');
      wrapper.style.display = 'none';
      dependencyListeners.push((inputsRoot) => {
        const target = inputsRoot.querySelector(`[data-input-name="${inputDef.dependsOn.field}"]`);
        if (!target) return;
        const raw = target.type === 'checkbox' ? (target.checked ? 'true' : 'false') : target.value;
        const shouldShow = valueList.map(String).includes(raw);
        wrapper.style.display = shouldShow ? '' : 'none';
      });
    }

    elements.dynamicInputs.appendChild(wrapper);
  });

  if (dependencyListeners.length) {
    const updateDependencies = () => dependencyListeners.forEach(fn => fn(elements.dynamicInputs));
    elements.dynamicInputs.querySelectorAll('select, input, textarea').forEach(el => {
      el.addEventListener('change', updateDependencies);
      el.addEventListener('input', updateDependencies);
    });
    updateDependencies();
  }

  elements.queryInputs.style.display = 'block';

  if (operation) {
    elements.dynamicInputs.querySelectorAll('select, input, textarea').forEach(el => {
      el.addEventListener('change', updateGeneratedCodePreview);
      el.addEventListener('input', updateGeneratedCodePreview);
    });
  }
}

export function updateGeneratedCodePreview() {
  if (!elements.generatedCodePanel || !elements.generatedCode || state.selected?.type !== 'transitions') return;
  const { operationKey, definition, auth } = state.selected;
  if (!getTransitionOperation(operationKey)) {
    elements.generatedCodePanel.style.display = 'none';
    return;
  }
  const defs = definition.inputs || [];
  const args = defs.map((input, index) => {
    const control = elements.dynamicInputs.querySelector(`[data-input-name="${input.name || `param_${index}`}"]`);
    if (!control) return undefined;
    if (control.type === 'checkbox') return control.checked;
    return control.value || undefined;
  });
  const extras = {};
  const identityId = elements.identityIdInput?.value.trim();
  auth?.identity?.targets?.forEach(target => { extras[target] = identityId || `<${target}>`; });
  const rawPrivateKey = elements.privateKeyInput?.value.trim();
  auth?.privateKey?.targets?.forEach(target => { extras[target] = `<${target}>`; });
  const keyId = getPreviewKeyId(rawPrivateKey, auth?.privateKey?.allowKeyId);
  if (keyId !== undefined) {
    extras[auth.privateKey.keyIdTarget || 'keyId'] = keyId;
  }
  const code = renderTransitionCode(operationKey, defs, args, extras);
  elements.generatedCode.textContent = code;
  elements.generatedCodePanel.style.display = code ? 'block' : 'none';
}

export function createControl(type, def, wrapper) {
  let control;
  switch (type) {
    case 'button': {
      control = document.createElement('button');
      control.type = 'button';
      control.className = 'action-button';
      control.textContent = def.label || def.name || 'Action';
      control.addEventListener('click', () => handleButtonAction(def.action, def));
      break;
    }
    case 'number': {
      control = document.createElement('input');
      control.type = 'number';
      if (def.min !== undefined) control.min = def.min;
      if (def.max !== undefined) control.max = def.max;
      if (def.step !== undefined) control.step = def.step;
      break;
    }
    case 'checkbox': {
      control = document.createElement('input');
      control.type = 'checkbox';
      control.checked = def.value === true || def.default === true;
      break;
    }
    case 'json':
    case 'textarea': {
      control = document.createElement('textarea');
      control.rows = def.rows || (type === 'json' ? 6 : 4);
      if (def.value !== undefined) control.value = typeof def.value === 'string' ? def.value : JSON.stringify(def.value, null, 2);
      break;
    }
    case 'select': {
      control = document.createElement('select');
      (def.options || []).forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label || opt.value;
        control.appendChild(option);
      });
      if (def.value !== undefined) control.value = def.value;
      break;
    }
    case 'multiselect': {
      control = document.createElement('select');
      control.multiple = true;
      (def.options || []).forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label || opt.value;
        control.appendChild(option);
      });
      if (Array.isArray(def.value)) {
        Array.from(control.options).forEach(opt => {
          opt.selected = def.value.includes(opt.value);
        });
      }
      break;
    }
    case 'dynamic': {
      control = document.createElement('div');
      control.className = 'dynamic-field-container';
      if (wrapper) wrapper.style.display = 'none';
      const handlerName = def.name || '';
      if (handlerName === 'documentFields') {
        registerDynamicHandler(handlerName, createDocumentFieldsHandler(control, wrapper));
      } else if (handlerName === 'contestedResourceDropdown') {
        registerDynamicHandler(handlerName, createContestedResourceHandler(control, wrapper));
      } else {
        registerDynamicHandler(handlerName, createGenericDynamicHandler(control, wrapper));
      }
      break;
    }
    case 'keyPreview': {
      control = document.createElement('div');
      control.className = 'key-preview-container';
      control.textContent = def.help || 'Enter a seed phrase to preview keys.';
      break;
    }
    case 'password': {
      control = document.createElement('input');
      control.type = 'password';
      break;
    }
    case 'array':
    case 'text':
    default: {
      control = document.createElement('input');
      control.type = 'text';
      if (def.value !== undefined) control.value = String(def.value);
      break;
    }
  }
  if (!control) return null;
  control.name = def.name || '';
  control.placeholder = def.placeholder || '';
  control.dataset.inputType = type;
  if (def.required) control.setAttribute('required', 'true');
  return control;
}

export async function handleButtonAction(action) {
  if (!action) return;
  const handlers = {
    fetchDocumentSchema,
    loadExistingDocument,
    generateTestSeed,
    fetchContestedResources,
  };
  const handler = handlers[action];
  if (!handler) {
    console.warn(`Unhandled action: ${action}`);
    setStatus(`Action "${action}" is not available in this demo.`, 'error');
    return;
  }
  try {
    await handler();
  } catch (error) {
    console.error(`Action ${action} failed`, error);
    setStatus(`Error executing action: ${error?.message || error}`, 'error');
  }
}
