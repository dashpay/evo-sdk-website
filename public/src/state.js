export const identityIdInputEl = document.getElementById('identityId');

export const assetLockProofInputEl = document.getElementById('assetLockProof');

export const privateKeyInputEl = document.getElementById('privateKey');

export const elements = {
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
  generatedCodePanel: document.getElementById('generatedCodePanel'),
  generatedCode: document.getElementById('generatedCode'),
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

export const state = {
  rawDefinitions: { queries: {}, transitions: {}, dpns: {} },
  definitions: { queries: {}, transitions: {}, dpns: {} },
  selected: null,
  client: null,
  clientKey: null,
  currentResult: null,
  advancedOptions: {},
};

export const dynamicInputHandlers = new Map();

export function clearDynamicHandlers() {
  dynamicInputHandlers.forEach(handler => {
    if (handler && typeof handler.clear === 'function') {
      try { handler.clear(); } catch (_) { /* ignore */ }
    }
  });
  dynamicInputHandlers.clear();
}

export function registerDynamicHandler(name, handler) {
  if (!name || !handler) return;
  const previous = dynamicInputHandlers.get(name);
  if (previous && previous !== handler && typeof previous.clear === 'function') {
    try { previous.clear(); } catch (_) { /* ignore */ }
  }
  dynamicInputHandlers.set(name, handler);
}

export function getDynamicHandler(name) {
  return name ? dynamicInputHandlers.get(name) : undefined;
}
