import { getTypeConfig, loadDefinitions } from './definitions.js';
import { clearCache, clearResults, copyResults, executeSelected } from './execute.js';
import { hideOperationDetails, onOperationChange, populateCategories, populateOperations, updateGeneratedCodePreview } from './form/render.js';
import { applyAdvancedConfig, loadVersionInfo, updateNetworkIndicator } from './sdk-client.js';
import { elements, state } from './state.js';
import { defaultResultMessage, hidePreloader, setNoProofInfoVisibility, setProgress, setStatus, showApiError, showPreloader } from './ui.js';

export function attachEventListeners() {
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
    const type = elements.operationType.value;
    const config = getTypeConfig(type);
    if (!config?.allowProof) {
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
  [elements.identityIdInput, elements.privateKeyInput, elements.assetLockProofInput].filter(Boolean).forEach(input => {
    input.addEventListener('input', updateGeneratedCodePreview);
  });
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
        populateCategories();
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

export async function init() {
  if (elements.preloaderText) {
    elements.preloaderText.textContent = 'Loading Evo SDK...';
  }
  showPreloader('Initializing Evo SDK...');
  setProgress(5, 'Starting...');

  // Load version info early
  loadVersionInfo();
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
    populateCategories();
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
