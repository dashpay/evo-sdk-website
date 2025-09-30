import { EvoSDK } from './dist/evo-sdk.module.js';

const identityIdInputEl = document.getElementById('identityId');
const assetLockProofInputEl = document.getElementById('assetLockProof');
const privateKeyInputEl = document.getElementById('privateKey');

const elements = {
  apiErrorBanner: document.getElementById('apiErrorBanner'),
  apiErrorMessage: document.getElementById('apiErrorMessage'),
  apiRetryButton: document.getElementById('apiRetryButton'),
  preloader: document.getElementById('preloader'),
  preloaderText: document.getElementById('preloaderText'),
  progressFill: document.getElementById('progressFill'),
  progressPercent: document.getElementById('progressPercent'),
  statusBanner: document.getElementById('statusBanner'),
  networkRadios: Array.from(document.querySelectorAll('input[name="network"]')),
  networkIndicator: document.getElementById('networkIndicator'),
  trustedMode: document.getElementById('trustedMode'),
  operationType: document.getElementById('operationType'),
  queryCategory: document.getElementById('queryCategory'),
  queryType: document.getElementById('queryType'),
  queryDescription: document.getElementById('queryDescription'),
  authenticationInputs: document.getElementById('authenticationInputs'),
  identityIdGroup: document.getElementById('identityIdGroup'),
  assetLockProofGroup: document.getElementById('assetLockProofGroup'),
  identityIdInput: identityIdInputEl,
  assetLockProofInput: assetLockProofInputEl,
  privateKeyInput: privateKeyInputEl,
  privateKeyGroup: privateKeyInputEl?.closest('.input-group') || null,
  queryInputs: document.getElementById('queryInputs'),
  queryTitle: document.getElementById('queryTitle'),
  dynamicInputs: document.getElementById('dynamicInputs'),
  proofToggleContainer: document.getElementById('proofToggleContainer'),
  proofToggle: document.getElementById('proofToggle'),
  noProofInfoContainer: document.getElementById('noProofInfoContainer'),
  executeButton: document.getElementById('executeQuery'),
  clearButton: document.getElementById('clearButton'),
  copyButton: document.getElementById('copyButton'),
  clearCacheButton: document.getElementById('clearCacheButton'),
  resultContainer: document.getElementById('resultSplitContainer'),
  resultContent: document.getElementById('identityInfo'),
  platformVersion: document.getElementById('platformVersion'),
  latestVersionInfo: document.getElementById('latestVersionInfo'),
  connectTimeout: document.getElementById('connectTimeout'),
  requestTimeout: document.getElementById('requestTimeout'),
  retries: document.getElementById('retries'),
  banFailedAddress: document.getElementById('banFailedAddress'),
  applyConfig: document.getElementById('applyConfig'),
};

const SUPPORTED_QUERIES = new Set([
  // Identity
  'getIdentity', 'getIdentityUnproved', 'getIdentityKeys', 'getIdentitiesContractKeys',
  'getIdentityNonce', 'getIdentityContractNonce', 'getIdentityBalance', 'getIdentitiesBalances',
  'getIdentityBalanceAndRevision', 'getIdentityByPublicKeyHash', 'getIdentityByNonUniquePublicKeyHash',
  'getIdentityTokenBalances', 'getIdentitiesTokenBalances', 'getIdentityTokenInfos', 'getIdentitiesTokenInfos',
  // Data Contracts
  'getDataContract', 'getDataContractHistory', 'getDataContracts',
  // Documents
  'getDocuments', 'getDocument',
  // DPNS
  'getDpnsUsername', 'getDpnsUsernames', 'getDpnsUsernameByName', 'dpnsResolve', 'dpnsCheckAvailability',
  'dpnsConvertToHomographSafe', 'dpnsIsValidUsername', 'dpnsIsContestedUsername',
  // Epoch
  'getEpochsInfo', 'getCurrentEpoch', 'getFinalizedEpochInfos', 'getEvonodesProposedEpochBlocksByIds', 'getEvonodesProposedEpochBlocksByRange',
  // Voting & Contested Resources
  'getContestedResources', 'getContestedResourceVotersForIdentity', 'getContestedResourceVoteState',
  'getContestedResourceIdentityVotes', 'getVotePollsByEndDate',
  // Protocol
  'getProtocolVersionUpgradeState', 'getProtocolVersionUpgradeVoteStatus',
  // Tokens
  'getTokenStatuses', 'getTokenDirectPurchasePrices', 'getTokenContractInfo', 'getTokenPerpetualDistributionLastClaim',
  'getTokenTotalSupply', 'getTokenPriceByContract',
  // Groups
  'getGroupInfo', 'getGroupInfos', 'getGroupMembers', 'getGroupActions', 'getGroupActionSigners',
  'getIdentityGroups', 'getGroupsDataContracts',
  // System
  'getStatus', 'getCurrentQuorumsInfo', 'getPrefundedSpecializedBalance', 'getTotalCreditsInPlatform', 'getPathElements',
  'waitForStateTransitionResult',
]);

const SUPPORTED_TRANSITIONS = new Set([
  'identityCreate', 'identityTopUp', 'identityCreditTransfer', 'identityCreditWithdrawal', 'identityUpdate',
  'dataContractCreate', 'dataContractUpdate',
  'documentCreate', 'documentReplace', 'documentDelete', 'documentTransfer', 'documentPurchase', 'documentSetPrice',
  'tokenMint', 'tokenBurn', 'tokenTransfer', 'tokenFreeze', 'tokenUnfreeze', 'tokenDestroyFrozen', 'tokenSetPriceForDirectPurchase', 'tokenDirectPurchase', 'tokenClaim', 'tokenConfigUpdate',
  'masternodeVote',
]);

const PROOF_CAPABLE = new Set([
  // Identity
  'getIdentity', 'getIdentityKeys', 'getIdentitiesContractKeys', 'getIdentityNonce', 'getIdentityContractNonce',
  'getIdentityBalance', 'getIdentitiesBalances', 'getIdentityBalanceAndRevision', 'getIdentityByPublicKeyHash',
  'getIdentityByNonUniquePublicKeyHash', 'getIdentityTokenBalances', 'getIdentitiesTokenBalances', 'getIdentityTokenInfos',
  'getIdentitiesTokenInfos',
  // Data Contracts & Documents
  'getDataContract', 'getDataContractHistory', 'getDataContracts', 'getDocuments', 'getDocument',
  // DPNS
  'getDpnsUsername', 'getDpnsUsernames', 'getDpnsUsernameByName',
  // Epoch
  'getEpochsInfo', 'getCurrentEpoch', 'getFinalizedEpochInfos', 'getEvonodesProposedEpochBlocksByIds',
  'getEvonodesProposedEpochBlocksByRange',
  // Voting & Contested Resources
  'getContestedResources', 'getContestedResourceVotersForIdentity', 'getContestedResourceVoteState',
  'getContestedResourceIdentityVotes', 'getVotePollsByEndDate',
  // Protocol
  'getProtocolVersionUpgradeState', 'getProtocolVersionUpgradeVoteStatus',
  // Tokens
  'getTokenStatuses', 'getTokenDirectPurchasePrices', 'getTokenContractInfo',
  'getTokenPerpetualDistributionLastClaim', 'getTokenTotalSupply', 'getIdentitiesTokenInfos', 'getIdentityTokenInfos',
  'getIdentitiesTokenBalances', 'getIdentityTokenBalances',
  // Groups
  'getGroupInfo', 'getGroupInfos', 'getGroupMembers', 'getGroupActions', 'getGroupActionSigners',
  'getIdentityGroups', 'getGroupsDataContracts',
  // System
  'getPrefundedSpecializedBalance', 'getTotalCreditsInPlatform', 'getPathElements',
]);

const SUPPORTED_INPUT_TYPES = new Set(['text', 'string', 'textarea', 'number', 'checkbox', 'json', 'select', 'multiselect', 'array']);

const state = {
  rawDefinitions: { queries: {}, transitions: {} },
  definitions: { queries: {}, transitions: {} },
  selected: null,
  client: null,
  clientKey: null,
  currentResult: null,
  advancedOptions: {},
};

function setNoProofInfoVisibility(shouldShow) {
  if (!elements.noProofInfoContainer) return;
  elements.noProofInfoContainer.style.display = shouldShow ? 'block' : 'none';
}

const TRANSITION_AUTH_REQUIREMENTS = {
  identityCreate: {
    assetLockProof: { required: true, target: 'assetLockProof' },
    privateKey: { required: true, targets: ['assetLockPrivateKeyWif'] },
  },
  identityTopUp: {
    identity: { required: true, targets: ['identityId'] },
    assetLockProof: { required: true, target: 'assetLockProof' },
    privateKey: { required: true, targets: ['assetLockPrivateKeyWif'] },
  },
  identityCreditTransfer: {
    identity: { required: true, targets: ['senderId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  identityCreditWithdrawal: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  identityUpdate: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  dataContractCreate: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  dataContractUpdate: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true, keyIdTarget: 'keyId' },
  },
  documentCreate: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentReplace: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentDelete: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentTransfer: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentPurchase: {
    identity: { required: true, targets: ['buyerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  documentSetPrice: {
    identity: { required: true, targets: ['ownerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenMint: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenBurn: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenTransfer: {
    identity: { required: true, targets: ['senderId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenFreeze: {
    identity: { required: true, targets: ['freezerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenUnfreeze: {
    identity: { required: true, targets: ['unfreezerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenDestroyFrozen: {
    identity: { required: true, targets: ['destroyerId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenSetPriceForDirectPurchase: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenDirectPurchase: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenClaim: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  tokenConfigUpdate: {
    identity: { required: true, targets: ['identityId'] },
    privateKey: { required: true, targets: ['privateKeyWif'], allowKeyId: true },
  },
  masternodeVote: {
    privateKey: { required: true, targets: ['votingKeyWif'] },
  },
};

function computeAuthRequirements(operationKey, definition) {
  const config = TRANSITION_AUTH_REQUIREMENTS[operationKey] || {};
  const auth = {
    identity: config.identity
      ? {
        required: !!config.identity.required,
        targets: Array.isArray(config.identity.targets) ? [...config.identity.targets] : [],
      }
      : null,
    assetLockProof: config.assetLockProof
      ? {
        required: !!config.assetLockProof.required,
        target: config.assetLockProof.target || 'assetLockProof',
      }
      : null,
    privateKey: config.privateKey
      ? {
        required: config.privateKey.required !== false,
        targets: Array.isArray(config.privateKey.targets)
          ? [...config.privateKey.targets]
          : (config.privateKey.target ? [config.privateKey.target] : []),
        allowKeyId: !!config.privateKey.allowKeyId,
        keyIdTarget: config.privateKey.keyIdTarget || null,
      }
      : null,
  };

  const sdkParams = Array.isArray(definition?.sdk_params) ? definition.sdk_params : [];
  if (sdkParams.length) {
    const names = new Set(sdkParams.map(param => param.name));
    if (names.has('assetLockProof')) {
      if (!auth.assetLockProof) {
        auth.assetLockProof = { required: true, target: 'assetLockProof' };
      } else {
        auth.assetLockProof.required = true;
        if (!auth.assetLockProof.target) auth.assetLockProof.target = 'assetLockProof';
      }
    }
    if (names.has('assetLockProofPrivateKey')) {
      if (!auth.privateKey) {
        auth.privateKey = {
          required: true,
          targets: ['assetLockPrivateKeyWif'],
          allowKeyId: false,
          keyIdTarget: null,
        };
      } else {
        auth.privateKey.required = true;
        if (!auth.privateKey.targets.length) {
          auth.privateKey.targets = ['assetLockPrivateKeyWif'];
        }
        auth.privateKey.allowKeyId = !!auth.privateKey.allowKeyId;
      }
    }
    if (names.has('identityId')) {
      if (!auth.identity) {
        auth.identity = { required: true, targets: ['identityId'] };
      } else {
        auth.identity.required = true;
        if (!auth.identity.targets.length) {
          auth.identity.targets = ['identityId'];
        }
      }
    }
  }

  if (auth.identity && !auth.identity.targets.length) {
    auth.identity = null;
  }
  if (auth.privateKey && !auth.privateKey.targets.length) {
    auth.privateKey = null;
  }

  if (!auth.identity && !auth.assetLockProof && !auth.privateKey) {
    return null;
  }

  return auth;
}

function updateAuthInputsVisibility(auth) {
  const showIdentity = !!(auth?.identity?.targets?.length);
  const showAssetLock = !!(auth?.assetLockProof?.required);
  const showPrivateKey = !!(auth?.privateKey?.targets?.length);

  if (elements.identityIdGroup) {
    elements.identityIdGroup.style.display = showIdentity ? '' : 'none';
  }
  if (elements.identityIdInput) {
    elements.identityIdInput.required = !!(auth?.identity?.required);
  }

  if (elements.assetLockProofGroup) {
    elements.assetLockProofGroup.style.display = showAssetLock ? '' : 'none';
  }
  if (elements.assetLockProofInput) {
    elements.assetLockProofInput.required = showAssetLock;
  }

  if (elements.privateKeyGroup) {
    elements.privateKeyGroup.style.display = showPrivateKey ? '' : 'none';
  }
  if (elements.privateKeyInput) {
    elements.privateKeyInput.required = !!(auth?.privateKey?.required);
  }

  if (elements.authenticationInputs) {
    elements.authenticationInputs.style.display = (showIdentity || showAssetLock || showPrivateKey) ? 'block' : 'none';
  }
}

function normalizeType(type) {
  if (!type) return 'text';
  switch (type) {
    case 'string': return 'text';
    case 'textarea': return 'textarea';
    default: return type;
  }
}

function setStatus(message, variant = 'loading') {
  if (!elements.statusBanner) return;
  elements.statusBanner.textContent = message;
  elements.statusBanner.className = `status-banner ${variant}`;
}

function showPreloader(message = 'Loading...') {
  if (!elements.preloader) return;
  elements.preloader.style.display = 'flex';
  if (elements.preloaderText) elements.preloaderText.textContent = message;
}

function hidePreloader() {
  if (!elements.preloader) return;
  elements.preloader.style.display = 'none';
}

function setProgress(percent, message) {
  if (elements.progressFill) elements.progressFill.style.width = `${percent}%`;
  if (elements.progressPercent) elements.progressPercent.textContent = `${percent}%`;
  if (message && elements.preloaderText) elements.preloaderText.textContent = message;
}

function showApiError(message) {
  if (elements.apiErrorBanner) {
    elements.apiErrorBanner.style.display = 'block';
  }
  if (elements.apiErrorMessage) {
    elements.apiErrorMessage.textContent = message;
  }
}

function hideApiError() {
  if (elements.apiErrorBanner) {
    elements.apiErrorBanner.style.display = 'none';
  }
}

function defaultResultMessage() {
  if (!elements.resultContent) return;
  elements.resultContent.classList.add('empty');
  elements.resultContent.classList.remove('error');
  elements.resultContent.textContent = 'No data fetched yet. Select a query category and type to begin.';
  state.currentResult = null;
}

function updateNetworkIndicator() {
  const selected = elements.networkRadios.find(r => r.checked)?.value || 'testnet';
  if (!elements.networkIndicator) return;
  elements.networkIndicator.textContent = selected.toUpperCase();
  elements.networkIndicator.classList.toggle('mainnet', selected === 'mainnet');
  elements.networkIndicator.classList.toggle('testnet', selected !== 'mainnet');
}

function buildClientOptions() {
  const selectedNetwork = elements.networkRadios.find(r => r.checked)?.value || 'mainnet';
  const opts = {
    network: selectedNetwork,
    trusted: !!(elements.trustedMode && elements.trustedMode.checked),
    proofs: true,
  };
  const { advancedOptions } = state;
  if (advancedOptions.platformVersion) {
    opts.version = advancedOptions.platformVersion;
  }
  const settings = {};
  if (advancedOptions.connectTimeout) settings.connectTimeoutMs = advancedOptions.connectTimeout;
  if (advancedOptions.requestTimeout) settings.timeoutMs = advancedOptions.requestTimeout;
  if (advancedOptions.retries) settings.retries = advancedOptions.retries;
  if (typeof advancedOptions.banFailedAddress === 'boolean') {
    settings.banFailedAddress = advancedOptions.banFailedAddress;
  }
  if (Object.keys(settings).length) {
    opts.settings = settings;
  }
  return opts;
}

async function ensureClient(force = false) {
  const options = buildClientOptions();
  const newKey = JSON.stringify(options);
  if (!force && state.client && state.clientKey === newKey && state.client.isConnected) {
    return state.client;
  }
  if (state.client && typeof state.client.disconnect === 'function') {
    try { await state.client.disconnect(); } catch (_) { /* ignore */ }
  }
  const client = new EvoSDK(options);
  await client.connect();
  state.client = client;
  state.clientKey = newKey;
  return client;
}

function filterDefinitions(source, entriesKey, allowSet) {
  const filtered = {};
  for (const [groupKey, group] of Object.entries(source || {})) {
    const items = group?.[entriesKey];
    if (!items) continue;
    const allowed = Object.entries(items).filter(([key, def]) => {
      if (!allowSet.has(key)) return false;
      const inputs = def?.inputs;
      if (!Array.isArray(inputs)) return true;
      return inputs.every(input => SUPPORTED_INPUT_TYPES.has(normalizeType(input.type)));
    });
    if (!allowed.length) continue;
    filtered[groupKey] = {
      ...group,
      [entriesKey]: Object.fromEntries(allowed),
    };
  }
  return filtered;
}

function populateCategories() {
  const type = elements.operationType.value;
  const isQuery = type === 'queries';
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

  const target = isQuery ? state.definitions.queries : state.definitions.transitions;
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
  if (!isQuery) {
    setNoProofInfoVisibility(false);
  }
}

function populateOperations(categoryKey) {
  const type = elements.operationType.value;
  const isQuery = type === 'queries';
  const sourceGroup = (isQuery ? state.definitions.queries : state.definitions.transitions)[categoryKey];
  const itemsKey = isQuery ? 'queries' : 'transitions';
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
    elements.queryType.appendChild(option);
  }
  elements.queryType.style.display = 'block';
  if (elements.queryTypeLabel) {
    elements.queryTypeLabel.style.display = 'block';
  }
  hideOperationDetails();
}

function hideOperationDetails() {
  elements.queryDescription.style.display = 'none';
  elements.queryInputs.style.display = 'none';
  elements.dynamicInputs.innerHTML = '';
  elements.proofToggleContainer.style.display = 'none';
  setNoProofInfoVisibility(false);
  if (elements.executeButton) {
    elements.executeButton.style.display = 'none';
    elements.executeButton.disabled = true;
  }
  state.selected = null;
  updateAuthInputsVisibility(null);
}

function onOperationChange(categoryKey, operationKey) {
  const type = elements.operationType.value;
  const isQuery = type === 'queries';
  const group = (isQuery ? state.definitions.queries : state.definitions.transitions)[categoryKey];
  const itemsKey = isQuery ? 'queries' : 'transitions';
  const def = group?.[itemsKey]?.[operationKey];
  if (!def) {
    hideOperationDetails();
    return;
  }
  const label = def.label || operationKey;
  elements.queryTitle.textContent = label;
  if (def.description) {
    elements.queryDescription.textContent = def.description;
    elements.queryDescription.style.display = 'block';
  } else {
    elements.queryDescription.style.display = 'none';
  }
  renderInputs(def);
  const supportsProof = isQuery && PROOF_CAPABLE.has(operationKey);
  const shouldShowNoProof = isQuery && !supportsProof;
  elements.proofToggle.checked = supportsProof;
  elements.proofToggleContainer.style.display = supportsProof ? 'flex' : 'none';
  setNoProofInfoVisibility(shouldShowNoProof);
  const authRequirements = isQuery ? null : computeAuthRequirements(operationKey, def);
  updateAuthInputsVisibility(authRequirements);
  if (elements.executeButton) {
    elements.executeButton.style.display = 'block';
    elements.executeButton.disabled = false;
  }
  state.selected = { type, categoryKey, operationKey, definition: def, auth: authRequirements };
}

function renderInputs(def) {
  elements.dynamicInputs.innerHTML = '';
  const inputs = Array.isArray(def.inputs) ? def.inputs : [];
  if (!inputs.length) {
    elements.queryInputs.style.display = 'none';
    return;
  }
  const dependencyListeners = [];
  inputs.forEach((inputDef, index) => {
    const normalizedType = normalizeType(inputDef.type);
    if (!SUPPORTED_INPUT_TYPES.has(normalizedType)) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'input-group';

    const label = document.createElement('label');
    label.textContent = inputDef.label || inputDef.name || `Parameter ${index + 1}`;
    wrapper.appendChild(label);

    const control = createControl(normalizedType, inputDef);
    if (!control) return;
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
}

function createControl(type, def) {
  let control;
  switch (type) {
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

function collectArgs(definition) {
  const defs = Array.isArray(definition.inputs) ? definition.inputs : [];
  return defs.map((inputDef, index) => {
    const type = normalizeType(inputDef.type);
    if (!SUPPORTED_INPUT_TYPES.has(type)) return undefined;
    const selector = `[data-input-name="${inputDef.name || `param_${index}`}"]`;
    const control = elements.dynamicInputs.querySelector(selector);
    if (!control) {
      if (inputDef.required) {
        throw new Error(`Missing required input: ${inputDef.label || inputDef.name || `Parameter ${index + 1}`}`);
      }
      return undefined;
    }
    if (control.closest('.input-group')?.style.display === 'none') {
      return undefined;
    }
    return parseInputValue(type, inputDef, control);
  });
}

function parseInputValue(type, def, control) {
  switch (type) {
    case 'number': {
      const raw = control.value.trim();
      if (!raw) {
        if (def.required) throw new Error(`${def.label || def.name} is required`);
        return null;
      }
      const val = Number(raw);
      if (Number.isNaN(val)) {
        throw new Error(`${def.label || def.name} must be a number`);
      }
      return val;
    }
    case 'checkbox':
      return control.checked;
    case 'json': {
      const raw = control.value.trim();
      if (!raw) {
        if (def.required) throw new Error(`${def.label || def.name} is required`);
        return null;
      }
      try {
        return JSON.parse(raw);
      } catch (error) {
        throw new Error(`${def.label || def.name} must be valid JSON`);
      }
    }
    case 'array': {
      const raw = control.value.trim();
      if (!raw) {
        if (def.required) throw new Error(`${def.label || def.name} is required`);
        return [];
      }
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {
        return raw.split(',').map(item => item.trim()).filter(Boolean);
      }
    }
    case 'multiselect':
      return Array.from(control.selectedOptions).map(opt => opt.value);
    case 'select':
      return control.value;
    case 'textarea':
    case 'text':
    default: {
      const raw = control.value.trim();
      if (!raw && def.required) {
        throw new Error(`${def.label || def.name} is required`);
      }
      return raw || null;
    }
  }
}

function namedArgs(defs, args) {
  const out = {};
  defs.forEach((def, index) => {
    if (!def || !def.name) return;
    out[def.name] = args[index];
  });
  return out;
}

function collectAuthArgs(requirements) {
  if (!requirements) return {};

  const extras = {};

  if (requirements.identity?.targets?.length) {
    const identityValue = elements.identityIdInput?.value.trim() || '';
    if (!identityValue) {
      if (requirements.identity.required) {
        throw new Error('Identity ID is required for this operation.');
      }
    } else {
      requirements.identity.targets.forEach(target => {
        extras[target] = identityValue;
      });
    }
  }

  if (requirements.assetLockProof?.required) {
    const proofValue = elements.assetLockProofInput?.value.trim() || '';
    if (!proofValue) {
      throw new Error('Asset Lock Proof is required for this operation.');
    }
    const targetName = requirements.assetLockProof.target || 'assetLockProof';
    extras[targetName] = proofValue;
  }

  if (requirements.privateKey?.targets?.length) {
    const rawValue = elements.privateKeyInput?.value.trim() || '';
    if (!rawValue) {
      if (requirements.privateKey.required) {
        throw new Error('Private key is required for this operation.');
      }
    } else {
      if (!requirements.privateKey.allowKeyId && rawValue.includes(':')) {
        throw new Error('Key ID suffix is not supported for this operation.');
      }
      let keyValue = rawValue;
      let keyIdValue;
      if (requirements.privateKey.allowKeyId) {
        const colonIndex = rawValue.lastIndexOf(':');
        if (colonIndex > -1) {
          if (colonIndex === 0) {
            throw new Error('Private key is required before specifying a key ID.');
          }
          const suffix = rawValue.slice(colonIndex + 1).trim();
          if (!suffix) {
            throw new Error('Key ID suffix must be provided after ":".');
          }
          keyValue = rawValue.slice(0, colonIndex).trim();
          if (!keyValue) {
            throw new Error('Private key is required before specifying a key ID.');
          }
          const parsed = Number(suffix);
          if (!Number.isInteger(parsed) || parsed < 0) {
            throw new Error('Key ID suffix must be a non-negative integer.');
          }
          keyIdValue = parsed;
        }
      }

      requirements.privateKey.targets.forEach(target => {
        extras[target] = keyValue;
      });

      if (keyIdValue !== undefined) {
        const keyIdTarget = requirements.privateKey.keyIdTarget || 'keyId';
        extras[keyIdTarget] = keyIdValue;
      }
    }
  }

  return extras;
}

function buildContractDefinition(params) {
  // Get document schemas JSON
  if (!params.documentSchemas) {
    throw new Error('Document Schemas JSON is required');
  }

  let documentSchemas;
  try {
    documentSchemas = typeof params.documentSchemas === 'string'
      ? JSON.parse(params.documentSchemas)
      : params.documentSchemas;
  } catch (e) {
    throw new Error(`Invalid JSON in Document Schemas field: ${e.message}`);
  }

  // Get optional JSON fields
  let groups = {};
  let tokens = {};

  if (params.groups) {
    try {
      groups = typeof params.groups === 'string'
        ? JSON.parse(params.groups)
        : params.groups;
    } catch (e) {
      throw new Error(`Invalid JSON in Groups field: ${e.message}`);
    }
  }

  if (params.tokens) {
    try {
      tokens = typeof params.tokens === 'string'
        ? JSON.parse(params.tokens)
        : params.tokens;
    } catch (e) {
      throw new Error(`Invalid JSON in Tokens field: ${e.message}`);
    }
  }

  // Get keywords
  const keywords = params.keywords ? params.keywords.split(',').map(k => k.trim()).filter(k => k) : [];

  // Build the contract object
  const contractData = {
    "$format_version": "1",
    "id": "11111111111111111111111111111111", // Will be replaced by SDK
    "config": {
      "$format_version": "1",
      "canBeDeleted": params.canBeDeleted || false,
      "readonly": params.readonly || false,
      "keepsHistory": params.keepsHistory || false,
      "documentsKeepHistoryContractDefault": params.documentsKeepHistoryContractDefault || false,
      "documentsMutableContractDefault": params.documentsMutableContractDefault !== false, // Default true
      "documentsCanBeDeletedContractDefault": params.documentsCanBeDeletedContractDefault !== false, // Default true
      "requiresIdentityEncryptionBoundedKey": params.requiresIdentityEncryptionBoundedKey || null,
      "requiresIdentityDecryptionBoundedKey": params.requiresIdentityDecryptionBoundedKey || null,
      "sizedIntegerTypes": true
    },
    "version": 1,
    "ownerId": params.ownerId,
    "schemaDefs": null,
    "documentSchemas": documentSchemas,
    "createdAt": null,
    "updatedAt": null,
    "createdAtBlockHeight": null,
    "updatedAtBlockHeight": null,
    "createdAtEpoch": null,
    "updatedAtEpoch": null,
    "groups": groups,
    "tokens": tokens,
    "keywords": keywords,
    "description": params.description || null
  };

  return JSON.stringify(contractData);
}

async function callEvo(client, groupKey, itemKey, defs, args, useProof, extraArgs = {}) {
  const n = { ...namedArgs(defs, args), ...(extraArgs || {}) };
  const c = client;

  const toStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value.filter(item => item !== undefined && item !== null && item !== '');
  };

  const toNumberArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
      .map(item => {
        const num = Number(item);
        return Number.isFinite(num) ? num : null;
      })
      .filter(item => item !== null);
  };

  const toNumber = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  };

  switch (itemKey) {
    // Identity queries
    case 'getIdentity':
      return useProof ? c.identities.fetchWithProof(n.id) : c.identities.fetch(n.id);
    case 'getIdentityUnproved':
      return c.identities.fetchUnproved(n.id);
    case 'getIdentityKeys': {
      const specificKeyIds = toNumberArray(n.specificKeyIds);
      if (useProof) {
        if (n.keyRequestType === 'search') {
          throw new Error('Identity key search does not support proof responses. Disable proof to search by purpose.');
        }
        return c.identities.getKeysWithProof({
          identityId: n.identityId,
          keyRequestType: n.keyRequestType,
          specificKeyIds,
          limit: n.limit ?? null,
          offset: n.offset ?? null,
        });
      }
      return c.identities.getKeys({
        identityId: n.identityId,
        keyRequestType: n.keyRequestType,
        specificKeyIds,
        searchPurposeMap: n.searchPurposeMap,
        limit: n.limit ?? null,
        offset: n.offset ?? null,
      });
    }
    case 'getIdentitiesContractKeys': {
      const identityIds = toStringArray(n.identityIds);
      const purposes = toNumberArray(n.purposes);
      const payload = {
        identityIds,
        contractId: n.contractId,
        purposes,
      };
      return useProof ? c.identities.contractKeysWithProof(payload) : c.identities.contractKeys(payload);
    }
    case 'getIdentityNonce':
      return useProof ? c.identities.nonceWithProof(n.identityId) : c.identities.nonce(n.identityId);
    case 'getIdentityContractNonce':
      return useProof ? c.identities.contractNonceWithProof(n.identityId, n.contractId) : c.identities.contractNonce(n.identityId, n.contractId);
    case 'getIdentityBalance':
      return useProof ? c.identities.balanceWithProof(n.identityId) : c.identities.balance(n.identityId);
    case 'getIdentitiesBalances': {
      const identityIds = toStringArray(n.identityIds);
      return useProof ? c.identities.balancesWithProof(identityIds) : c.identities.balances(identityIds);
    }
    case 'getIdentityBalanceAndRevision':
      return useProof ? c.identities.balanceAndRevisionWithProof(n.identityId) : c.identities.balanceAndRevision(n.identityId);
    case 'getIdentityByPublicKeyHash':
      return useProof ? c.identities.byPublicKeyHashWithProof(n.publicKeyHash) : c.identities.byPublicKeyHash(n.publicKeyHash);
    case 'getIdentityByNonUniquePublicKeyHash': {
      const opts = { startAfter: n.startAfter || null };
      return useProof ? c.identities.byNonUniquePublicKeyHashWithProof(n.publicKeyHash, opts) : c.identities.byNonUniquePublicKeyHash(n.publicKeyHash, opts);
    }
    case 'getIdentityTokenBalances': {
      const tokenIds = toStringArray(n.tokenIds);
      return useProof ? c.identities.tokenBalancesWithProof(n.identityId, tokenIds) : c.identities.tokenBalances(n.identityId, tokenIds);
    }
    case 'getIdentitiesTokenBalances': {
      const identityIds = toStringArray(n.identityIds);
      return useProof ? c.tokens.balancesWithProof(identityIds, n.tokenId) : c.tokens.balances(identityIds, n.tokenId);
    }
    case 'getIdentityTokenInfos': {
      const tokenIds = toStringArray(n.tokenIds);
      if (useProof) {
        return c.tokens.identityTokenInfosWithProof(n.identityId, tokenIds);
      }
      return c.tokens.identityTokenInfos(n.identityId, tokenIds, {
        limit: n.limit ?? null,
        offset: n.offset ?? null,
      });
    }
    case 'getIdentitiesTokenInfos': {
      const identityIds = toStringArray(n.identityIds);
      return useProof ? c.tokens.identitiesTokenInfosWithProof(identityIds, n.tokenId) : c.tokens.identitiesTokenInfos(identityIds, n.tokenId);
    }

    // Identity transitions
    case 'identityCreate':
      return c.identities.create({ assetLockProof: n.assetLockProof, assetLockPrivateKeyWif: n.assetLockPrivateKeyWif, publicKeys: n.publicKeys });
    case 'identityTopUp':
      return c.identities.topUp({ identityId: n.identityId, assetLockProof: n.assetLockProof, assetLockPrivateKeyWif: n.assetLockPrivateKeyWif });
    case 'identityCreditTransfer':
      return c.identities.creditTransfer({ senderId: n.senderId, recipientId: n.recipientId, amount: n.amount, privateKeyWif: n.privateKeyWif, keyId: n.keyId });
    case 'identityCreditWithdrawal':
      return c.identities.creditWithdrawal({ identityId: n.identityId, toAddress: n.toAddress, amount: n.amount, coreFeePerByte: n.coreFeePerByte, privateKeyWif: n.privateKeyWif, keyId: n.keyId });
    case 'identityUpdate':
      return c.identities.update({ identityId: n.identityId, addPublicKeys: n.addPublicKeys, disablePublicKeyIds: n.disablePublicKeyIds, privateKeyWif: n.privateKeyWif });

    // Data contracts
    case 'getDataContract':
      return useProof ? c.contracts.fetchWithProof(n.id) : c.contracts.fetch(n.id);
    case 'getDataContractHistory':
      return useProof
        ? c.contracts.getHistoryWithProof({ contractId: n.dataContractId || n.id, limit: n.limit ?? null, startAtMs: n.startAtMs ?? null })
        : c.contracts.getHistory({ contractId: n.dataContractId || n.id, limit: n.limit ?? null, startAtMs: n.startAtMs ?? null });
    case 'getDataContracts':
      return useProof ? c.contracts.getManyWithProof(n.ids) : c.contracts.getMany(n.ids);
    case 'dataContractCreate': {
      const definition = buildContractDefinition(n);
      return c.contracts.create({ ownerId: n.ownerId, definition: definition, privateKeyWif: n.privateKeyWif, keyId: n.keyId });
    }
    case 'dataContractUpdate':
      return c.contracts.update({ contractId: n.dataContractId || n.contractId, ownerId: n.ownerId, updates: n.updates, privateKeyWif: n.privateKeyWif, keyId: n.keyId });

    // Documents
    case 'getDocuments': {
      const payload = {
        contractId: n.dataContractId || n.contractId,
        type: n.documentType,
        where: n.where,
        orderBy: n.orderBy,
        limit: n.limit ?? null,
        startAfter: n.startAfter ?? null,
        startAt: n.startAt ?? null,
      };
      return useProof ? c.documents.queryWithProof(payload) : c.documents.query(payload);
    }
    case 'getDocument':
      return useProof
        ? c.documents.getWithProof(n.dataContractId || n.contractId, n.documentType, n.documentId)
        : c.documents.get(n.dataContractId || n.contractId, n.documentType, n.documentId);
    case 'documentCreate':
      return c.documents.create({ contractId: n.contractId, type: n.documentType, ownerId: n.ownerId, data: n.data, entropyHex: n.entropyHex, privateKeyWif: n.privateKeyWif });
    case 'documentReplace':
      return c.documents.replace({ contractId: n.contractId, type: n.documentType, documentId: n.documentId, ownerId: n.ownerId, data: n.data, revision: n.revision, privateKeyWif: n.privateKeyWif });
    case 'documentDelete':
      return c.documents.delete({ contractId: n.contractId, type: n.documentType, documentId: n.documentId, ownerId: n.ownerId, privateKeyWif: n.privateKeyWif });
    case 'documentTransfer':
      return c.documents.transfer({ contractId: n.contractId, type: n.documentType, documentId: n.documentId, ownerId: n.ownerId, recipientId: n.recipientId, privateKeyWif: n.privateKeyWif });
    case 'documentPurchase':
      return c.documents.purchase({ contractId: n.contractId, type: n.documentType, documentId: n.documentId, buyerId: n.buyerId, price: n.price, privateKeyWif: n.privateKeyWif });
    case 'documentSetPrice':
      return c.documents.setPrice({ contractId: n.contractId, type: n.documentType, documentId: n.documentId, ownerId: n.ownerId, price: n.price, privateKeyWif: n.privateKeyWif });

    // DPNS
    case 'getDpnsUsername':
      return useProof ? c.dpns.usernameWithProof(n.identityId) : c.dpns.username(n.identityId);
    case 'getDpnsUsernames':
      return useProof ? c.dpns.usernamesWithProof(n.identityId, { limit: n.limit ?? null }) : c.dpns.usernames(n.identityId, { limit: n.limit ?? null });
    case 'getDpnsUsernameByName':
      return useProof ? c.dpns.getUsernameByNameWithProof(n.username) : c.dpns.getUsernameByName(n.username);
    case 'dpnsResolve':
      return c.dpns.resolveName(n.name);
    case 'dpnsCheckAvailability':
      return c.dpns.isNameAvailable(n.label);
    case 'dpnsConvertToHomographSafe':
      return c.dpns.convertToHomographSafe(n.name);
    case 'dpnsIsValidUsername':
      return c.dpns.isValidUsername(n.label);
    case 'dpnsIsContestedUsername':
      return c.dpns.isContestedUsername(n.label);

    // Epoch
    case 'getEpochsInfo':
      return useProof
        ? c.epoch.epochsInfoWithProof({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null })
        : c.epoch.epochsInfo({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null });
    case 'getCurrentEpoch':
      return useProof ? c.epoch.currentWithProof() : c.epoch.current();
    case 'getFinalizedEpochInfos':
      return useProof
        ? c.epoch.finalizedInfosWithProof({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null })
        : c.epoch.finalizedInfos({ startEpoch: n.startEpoch ?? null, count: n.count ?? null, ascending: n.ascending ?? null });
    case 'getEvonodesProposedEpochBlocksByIds':
      return useProof ? c.epoch.evonodesProposedBlocksByIdsWithProof(n.epoch, toStringArray(n.ids)) : c.epoch.evonodesProposedBlocksByIds(n.epoch, toStringArray(n.ids));
    case 'getEvonodesProposedEpochBlocksByRange':
      return useProof
        ? c.epoch.evonodesProposedBlocksByRangeWithProof(n.epoch, { limit: n.limit ?? null, startAfter: n.startAfter ?? null, orderAscending: n.orderAscending ?? null })
        : c.epoch.evonodesProposedBlocksByRange(n.epoch, { limit: n.limit ?? null, startAfter: n.startAfter ?? null, orderAscending: n.orderAscending ?? null });

    // Protocol
    case 'getProtocolVersionUpgradeState':
      return useProof ? c.protocol.versionUpgradeStateWithProof() : c.protocol.versionUpgradeState();
    case 'getProtocolVersionUpgradeVoteStatus':
      return useProof
        ? c.protocol.versionUpgradeVoteStatusWithProof({ startProTxHash: n.startProTxHash ?? null, count: n.count ?? null })
        : c.protocol.versionUpgradeVoteStatus({ startProTxHash: n.startProTxHash ?? null, count: n.count ?? null });

    // Tokens
    case 'getTokenStatuses':
      return useProof ? c.tokens.statusesWithProof(toStringArray(n.tokenIds)) : c.tokens.statuses(toStringArray(n.tokenIds));
    case 'getTokenDirectPurchasePrices':
      return useProof ? c.tokens.directPurchasePricesWithProof(toStringArray(n.tokenIds)) : c.tokens.directPurchasePrices(toStringArray(n.tokenIds));
    case 'getTokenContractInfo': {
      const contractId = n.dataContractId || n.contractId;
      return useProof ? c.tokens.contractInfoWithProof(contractId) : c.tokens.contractInfo(contractId);
    }
    case 'getTokenPerpetualDistributionLastClaim':
      return useProof ? c.tokens.perpetualDistributionLastClaimWithProof(n.identityId, n.tokenId) : c.tokens.perpetualDistributionLastClaim(n.identityId, n.tokenId);
    case 'getTokenTotalSupply':
      return useProof ? c.tokens.totalSupplyWithProof(n.tokenId) : c.tokens.totalSupply(n.tokenId);
    case 'getTokenPriceByContract': {
      const contractId = n.dataContractId || n.contractId;
      const tokenPosition = toNumber(n.tokenPosition, 0);
      return c.tokens.priceByContract(contractId, tokenPosition);
    }
    case 'tokenMint':
      return c.tokens.mint({ contractId: n.contractId, tokenPosition: n.tokenPosition, amount: n.amount, identityId: n.identityId, privateKeyWif: n.privateKeyWif, recipientId: n.recipientId, publicNote: n.publicNote });
    case 'tokenBurn':
      return c.tokens.burn({ contractId: n.contractId, tokenPosition: n.tokenPosition, amount: n.amount, identityId: n.identityId, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });
    case 'tokenTransfer':
      return c.tokens.transfer({ contractId: n.contractId, tokenPosition: n.tokenPosition, amount: n.amount, senderId: n.senderId, recipientId: n.recipientId, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });
    case 'tokenFreeze':
      return c.tokens.freeze({ contractId: n.contractId, tokenPosition: n.tokenPosition, identityToFreeze: n.identityToFreeze, freezerId: n.freezerId, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });
    case 'tokenUnfreeze':
      return c.tokens.unfreeze({ contractId: n.contractId, tokenPosition: n.tokenPosition, identityToUnfreeze: n.identityToUnfreeze, unfreezerId: n.unfreezerId, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });
    case 'tokenDestroyFrozen':
      return c.tokens.destroyFrozen({ contractId: n.contractId, tokenPosition: n.tokenPosition, identityId: n.identityId, destroyerId: n.destroyerId, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });
    case 'tokenSetPriceForDirectPurchase':
      return c.tokens.setPriceForDirectPurchase({ contractId: n.contractId, tokenPosition: n.tokenPosition, identityId: n.identityId, priceType: n.priceType, priceData: n.priceData, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });
    case 'tokenDirectPurchase':
      return c.tokens.directPurchase({ contractId: n.contractId, tokenPosition: n.tokenPosition, amount: n.amount, identityId: n.identityId, totalAgreedPrice: n.totalAgreedPrice, privateKeyWif: n.privateKeyWif });
    case 'tokenClaim':
      return c.tokens.claim({ contractId: n.contractId, tokenPosition: n.tokenPosition, distributionType: n.distributionType, identityId: n.identityId, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });
    case 'tokenConfigUpdate':
      return c.tokens.configUpdate({ contractId: n.contractId, tokenPosition: n.tokenPosition, configItemType: n.configItemType, configValue: n.configValue, identityId: n.identityId, privateKeyWif: n.privateKeyWif, publicNote: n.publicNote });

    // Group queries
    case 'getGroupInfo': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      return useProof ? c.group.infoWithProof(contractId, position) : c.group.info(contractId, position);
    }
    case 'getGroupInfos': {
      const contractId = n.dataContractId || n.contractId;
      return useProof ? c.group.infosWithProof(contractId, n.startAtInfo ?? null, n.count ?? null) : c.group.infos(contractId, n.startAtInfo ?? null, n.count ?? null);
    }
    case 'getGroupMembers': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      const memberIds = toStringArray(n.memberIds);
      const opts = { memberIds: memberIds.length ? memberIds : null, startAt: n.startAt ?? null, limit: n.limit ?? null };
      return useProof ? c.group.membersWithProof(contractId, position, opts) : c.group.members(contractId, position, opts);
    }
    case 'getGroupActions': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      const opts = { startAtInfo: n.startAtInfo ?? null, count: n.count ?? null };
      return useProof ? c.group.actionsWithProof(contractId, position, n.status, opts) : c.group.actions(contractId, position, n.status, opts);
    }
    case 'getGroupActionSigners': {
      const contractId = n.dataContractId || n.contractId;
      const position = toNumber(n.groupContractPosition, 0);
      return useProof
        ? c.group.actionSignersWithProof(contractId, position, n.status, n.actionId)
        : c.group.actionSigners(contractId, position, n.status, n.actionId);
    }
    case 'getIdentityGroups': {
      const memberDataContracts = toStringArray(n.memberDataContracts);
      const ownerDataContracts = toStringArray(n.ownerDataContracts);
      const moderatorDataContracts = toStringArray(n.moderatorDataContracts);
      const opts = {
        memberDataContracts: memberDataContracts.length ? memberDataContracts : null,
        ownerDataContracts: ownerDataContracts.length ? ownerDataContracts : null,
        moderatorDataContracts: moderatorDataContracts.length ? moderatorDataContracts : null,
      };
      return useProof ? c.group.identityGroupsWithProof(n.identityId, opts) : c.group.identityGroups(n.identityId, opts);
    }
    case 'getGroupsDataContracts': {
      const contractIds = toStringArray(n.dataContractIds || n.contractIds);
      return useProof ? c.group.groupsDataContractsWithProof(contractIds) : c.group.groupsDataContracts(contractIds);
    }

    // Contested resources & voting
    case 'getContestedResources': {
      const contractId = n.dataContractId || n.contractId;
      const payload = {
        documentTypeName: n.documentTypeName,
        contractId,
        indexName: n.indexName,
        startAtValue: n.startAtValue ?? null,
        limit: n.limit ?? null,
        orderAscending: n.orderAscending ?? null,
      };
      return useProof ? c.group.contestedResourcesWithProof(payload) : c.group.contestedResources(payload);
    }
    case 'getContestedResourceVotersForIdentity': {
      const contractId = n.dataContractId || n.contractId;
      const payload = {
        contractId,
        documentTypeName: n.documentTypeName,
        indexName: n.indexName,
        indexValues: toStringArray(n.indexValues),
        contestantId: n.contestantId,
        orderAscending: n.orderAscending ?? null,
      };
      if (useProof) {
        return c.group.contestedResourceVotersForIdentityWithProof({
          ...payload,
          startAtIdentifierInfo: n.startAtIdentifierInfo ?? null,
          count: n.count ?? null,
        });
      }
      return c.group.contestedResourceVotersForIdentity({
        ...payload,
        startAtVoterInfo: n.startAtVoterInfo ?? null,
        limit: n.limit ?? null,
      });
    }
    case 'getContestedResourceVoteState': {
      const contractId = n.dataContractId || n.contractId;
      const payload = {
        contractId,
        documentTypeName: n.documentTypeName,
        indexName: n.indexName,
        indexValues: toStringArray(n.indexValues),
        resultType: n.resultType,
        allowIncludeLockedAndAbstainingVoteTally: n.allowIncludeLockedAndAbstainingVoteTally ?? null,
        startAtIdentifierInfo: n.startAtIdentifierInfo ?? null,
        count: n.count ?? null,
        orderAscending: n.orderAscending ?? null,
      };
      return useProof ? c.voting.contestedResourceVoteStateWithProof(payload) : c.voting.contestedResourceVoteState(payload);
    }
    case 'getContestedResourceIdentityVotes': {
      if (useProof) {
        return c.voting.contestedResourceIdentityVotesWithProof(n.identityId, {
          limit: n.limit ?? null,
          offset: n.offset ?? null,
          orderAscending: n.orderAscending ?? null,
        });
      }
      return c.voting.contestedResourceIdentityVotes(n.identityId, {
        limit: n.limit ?? null,
        startAtVotePollIdInfo: n.startAtVotePollIdInfo ?? null,
        orderAscending: n.orderAscending ?? null,
      });
    }
    case 'getVotePollsByEndDate': {
      if (useProof) {
        return c.voting.votePollsByEndDateWithProof({
          startTimeMs: n.startTimeMs ?? null,
          endTimeMs: n.endTimeMs ?? null,
          limit: n.limit ?? null,
          offset: n.offset ?? null,
          orderAscending: n.orderAscending ?? null,
        });
      }
      return c.voting.votePollsByEndDate({
        startTimeInfo: n.startTimeInfo ?? null,
        endTimeInfo: n.endTimeInfo ?? null,
        limit: n.limit ?? null,
        orderAscending: n.orderAscending ?? null,
      });
    }

    case 'masternodeVote':
      return c.voting.masternodeVote({
        masternodeProTxHash: n.masternodeProTxHash,
        contractId: n.contractId,
        documentTypeName: n.documentTypeName,
        indexName: n.indexName,
        indexValues: toStringArray(n.indexValues),
        voteChoice: n.voteChoice,
        votingKeyWif: n.votingKeyWif,
      });

    // System
    case 'getStatus':
      return c.system.status();
    case 'getCurrentQuorumsInfo':
      return c.system.currentQuorumsInfo();
    case 'getTotalCreditsInPlatform':
      return useProof ? c.system.totalCreditsInPlatformWithProof() : c.system.totalCreditsInPlatform();
    case 'getPrefundedSpecializedBalance':
      return useProof ? c.system.prefundedSpecializedBalanceWithProof(n.identityId) : c.system.prefundedSpecializedBalance(n.identityId);
    case 'getPathElements': {
      const path = toStringArray(n.path);
      const keys = toStringArray(n.keys);
      return useProof ? c.system.pathElementsWithProof(path, keys) : c.system.pathElements(path, keys);
    }
    case 'waitForStateTransitionResult':
      return c.system.waitForStateTransitionResult(n.stateTransitionHash);

    default:
      throw new Error(`Operation ${itemKey} is not supported in the demo UI.`);
  }
}

function formatResult(value) {
  if (value === undefined) return 'Completed (no result returned)';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (_) {
    return String(value);
  }
}

async function executeSelected() {
  if (!state.selected) return;
  try {
    if (elements.executeButton) {
      elements.executeButton.disabled = true;
    }
    const { definition, auth } = state.selected;
    const args = collectArgs(definition);
    const authArgs = collectAuthArgs(auth);
    const client = await ensureClient();
    const useProof = elements.proofToggleContainer.style.display !== 'none'
      && elements.proofToggle.checked
      && state.selected.type === 'queries';
    setStatus(`Running ${state.selected.operationKey}${useProof ? ' (proof)' : ''}...`, 'loading');
    const result = await callEvo(
      client,
      state.selected.categoryKey,
      state.selected.operationKey,
      definition.inputs || [],
      args,
      useProof,
      authArgs,
    );
    const formatted = formatResult(result);
    elements.resultContent.classList.remove('empty', 'error');
    elements.resultContent.textContent = formatted;
    state.currentResult = formatted;
    setStatus('Completed', 'success');
  } catch (error) {
    const message = error?.message || String(error);
    elements.resultContent.classList.remove('empty');
    elements.resultContent.classList.add('error');
    elements.resultContent.textContent = `Error: ${message}`;
    state.currentResult = null;
    setStatus(`Error: ${message}`, 'error');
  } finally {
    if (elements.executeButton) {
      elements.executeButton.disabled = false;
    }
  }
}

function clearResults() {
  if (!elements.resultContent) return;
  elements.resultContent.textContent = '';
  elements.resultContent.classList.add('empty');
  elements.resultContent.classList.remove('error');
  state.currentResult = null;
}

function copyResults() {
  const content = state.currentResult ?? elements.resultContent?.textContent ?? '';
  if (!content) return;
  navigator.clipboard.writeText(content).then(() => {
    if (!elements.copyButton) return;
    const original = elements.copyButton.textContent;
    elements.copyButton.textContent = 'Copied!';
    setTimeout(() => { elements.copyButton.textContent = original; }, 2000);
  }).catch(() => {
    setStatus('Unable to copy result', 'error');
  });
}

async function clearCache() {
  if (!elements.clearCacheButton) return;
  const button = elements.clearCacheButton;
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Clearing...';
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const controller = navigator.serviceWorker.controller;
      const channel = new MessageChannel();
      const responsePromise = new Promise(resolve => {
        channel.port1.onmessage = resolve;
        setTimeout(resolve, 1500);
      });
      controller.postMessage({ action: 'clearCache' }, [channel.port2]);
      await responsePromise;
    }

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    button.textContent = 'Cache Cleared!';
    setTimeout(() => window.location.reload(true), 1000);
  } catch (error) {
    console.error('Failed to clear cache:', error);
    button.textContent = 'Failed';
    setStatus('Failed to clear cache', 'error');
    setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 2000);
  }
}

function applyAdvancedConfig() {
  const options = {};
  const platformVersion = parseInt(elements.platformVersion?.value || '', 10);
  if (!Number.isNaN(platformVersion)) options.platformVersion = platformVersion;
  const connectTimeout = parseInt(elements.connectTimeout?.value || '', 10);
  if (!Number.isNaN(connectTimeout)) options.connectTimeout = connectTimeout;
  const requestTimeout = parseInt(elements.requestTimeout?.value || '', 10);
  if (!Number.isNaN(requestTimeout)) options.requestTimeout = requestTimeout;
  const retries = parseInt(elements.retries?.value || '', 10);
  if (!Number.isNaN(retries)) options.retries = retries;
  if (elements.banFailedAddress) options.banFailedAddress = elements.banFailedAddress.checked;
  state.advancedOptions = options;
  state.clientKey = null;
  setStatus('Configuration applied. Reconnect on next request.', 'success');
}

async function loadDefinitions() {
  setStatus('Loading API definitions...', 'loading');
  setProgress(25, 'Fetching API definitions...');
  const response = await fetch('./api-definitions.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load api-definitions.json (${response.status})`);
  }
  const data = await response.json();
  state.rawDefinitions = {
    queries: data.queries || {},
    transitions: data.transitions || {},
  };
  state.definitions = {
    queries: filterDefinitions(state.rawDefinitions.queries, 'queries', SUPPORTED_QUERIES),
    transitions: filterDefinitions(state.rawDefinitions.transitions, 'transitions', SUPPORTED_TRANSITIONS),
  };
  if (elements.latestVersionInfo) {
    let latestVersion = await EvoSDK.getLatestVersionNumber();
    elements.latestVersionInfo.textContent = `Latest version: ${latestVersion}`;
  }
  setProgress(65, 'Building interface...');
  populateCategories();
  hideApiError();
}

function attachEventListeners() {
  elements.networkRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateNetworkIndicator();
      state.clientKey = null;
      setStatus('Network updated. Reconnect on next request.', 'success');
    });
  });
  if (elements.trustedMode) {
    elements.trustedMode.addEventListener('change', () => {
      state.clientKey = null;
      setStatus('Trusted quorum preference updated.', 'loading');
    });
  }
  elements.operationType.addEventListener('change', () => {
    const isQuery = elements.operationType.value === 'queries';
    if (!isQuery) {
      setNoProofInfoVisibility(false);
    }
    populateCategories();
  });
  elements.queryCategory.addEventListener('change', (event) => {
    const value = event.target.value;
    if (!value) {
      elements.queryType.innerHTML = '<option value="">Select Operation</option>';
      elements.queryType.style.display = 'none';
      if (elements.queryTypeLabel) {
        elements.queryTypeLabel.style.display = 'none';
      }
      hideOperationDetails();
      return;
    }
    populateOperations(value);
  });
  elements.queryType.addEventListener('change', (event) => {
    const category = elements.queryCategory.value;
    const operation = event.target.value;
    if (!operation) {
      hideOperationDetails();
      return;
    }
    onOperationChange(category, operation);
  });
  if (elements.executeButton) {
    elements.executeButton.addEventListener('click', executeSelected);
  }
  if (elements.clearButton && !elements.clearButton.hasAttribute('onclick')) {
    elements.clearButton.addEventListener('click', clearResults);
  }
  if (elements.copyButton && !elements.copyButton.hasAttribute('onclick')) {
    elements.copyButton.addEventListener('click', copyResults);
  }
  if (elements.clearCacheButton && !elements.clearCacheButton.hasAttribute('onclick')) {
    elements.clearCacheButton.addEventListener('click', clearCache);
  }
  if (elements.applyConfig) {
    elements.applyConfig.addEventListener('click', applyAdvancedConfig);
  }
  if (elements.apiRetryButton) {
    elements.apiRetryButton.addEventListener('click', async () => {
      showPreloader('Retrying...');
      try {
        await loadDefinitions();
        setStatus('Definitions refreshed', 'success');
      } catch (error) {
        showApiError(error.message || 'Failed to reload API definitions');
        setStatus('Failed to reload definitions', 'error');
      } finally {
        hidePreloader();
      }
    });
  }
}

async function init() {
  if (elements.preloaderText) {
    elements.preloaderText.textContent = 'Loading Evo SDK...';
  }
  showPreloader('Initializing Evo SDK...');
  setProgress(5, 'Starting...');
  const testnetRadio = document.getElementById('testnet');
  const mainnetRadio = document.getElementById('mainnet');
  if (mainnetRadio) {
    mainnetRadio.checked = true;
  } else if (elements.networkRadios.length && !elements.networkRadios.some(r => r.checked)) {
    elements.networkRadios[0].checked = true;
  }
  if (testnetRadio && testnetRadio !== mainnetRadio) {
    testnetRadio.checked = false;
  }
  if (elements.trustedMode) {
    elements.trustedMode.disabled = false;
    elements.trustedMode.checked = true;
  }
  updateNetworkIndicator();
  attachEventListeners();
  defaultResultMessage();
  setNoProofInfoVisibility(false);
  try {
    await loadDefinitions();
    setProgress(90, 'Finalizing UI...');
    setStatus('Ready', 'success');
  } catch (error) {
    showApiError(error.message || 'Unable to load API definitions.');
    setStatus('Failed to initialize', 'error');
  } finally {
    setProgress(100, 'Ready');
    setTimeout(hidePreloader, 300);
  }
}

init();

Object.assign(window, {
  clearResults,
  copyResults,
  clearCache,
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker-simple.js')
      .then((registration) => {
        console.log('Service worker registered:', registration.scope);
        setInterval(() => registration.update(), 60 * 60 * 1000);
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'cache-updated') {
            if (elements.statusBanner) {
              elements.statusBanner.textContent = 'New version detected! Refresh to update.';
              elements.statusBanner.className = 'status-banner warning';
              if (!elements.statusBanner.querySelector('button')) {
                const refreshBtn = document.createElement('button');
                refreshBtn.textContent = 'Refresh Now';
                refreshBtn.style.marginLeft = '10px';
                refreshBtn.onclick = () => window.location.reload(true);
                elements.statusBanner.appendChild(refreshBtn);
              }
            }
          }
        });
      })
      .catch((error) => {
        console.warn('Service worker registration failed:', error);
      });
  });
}
