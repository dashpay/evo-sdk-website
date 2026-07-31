import { EvoSDK, wallet, DataContract, Document, IdentitySigner, Identifier } from './sdk-types.js';
import { assembleClientOptions } from './client-options.js';
import { elements, state } from './state.js';
import { setStatus } from './ui.js';
import { buildVersionDisplayModel } from './version-display.js';

export function updateNetworkIndicator() {
  const selected = elements.networkRadios.find(r => r.checked)?.value || 'testnet';
  if (!elements.networkIndicator) return;
  elements.networkIndicator.textContent = selected.toUpperCase();
  elements.networkIndicator.classList.toggle('mainnet', selected === 'mainnet');
  elements.networkIndicator.classList.toggle('testnet', selected !== 'mainnet');
}

export function buildClientOptions() {
  const selectedNetwork = elements.networkRadios.find(r => r.checked)?.value || 'mainnet';
  const trusted = !!(elements.trustedMode && elements.trustedMode.checked);
  return assembleClientOptions(selectedNetwork, trusted, state.advancedOptions);
}

export async function ensureClient(force = false) {
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

export function applyAdvancedConfig() {
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

function createVersionLink(href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.style.cssText = 'color: inherit; text-decoration: underline;';
  a.textContent = text;
  return a;
}

export async function loadVersionInfo() {
  try {
    const response = await fetch('version-info.json');
    if (!response.ok) {
      console.warn('Version info not available');
      return;
    }
    const versionInfo = await response.json();
    const versionElement = document.getElementById('versionInfo');
    if (versionElement && versionInfo) {
      const model = buildVersionDisplayModel(versionInfo);
      // Preserve the original " • "-separated layout — including the trailing
      // separator when buildDisplay is empty — using text nodes so nothing is
      // ever parsed as HTML (CWE-79).
      versionElement.replaceChildren(
        createVersionLink(model.sdkLink.href, model.sdkLink.text),
        document.createTextNode(' • '),
        createVersionLink(model.commitLink.href, model.commitLink.text),
        document.createTextNode(` • ${model.buildDisplay}`),
      );
      versionElement.title = model.title;
    }
  } catch (error) {
    console.warn('Could not load version info:', error);
  }
}

export { EvoSDK, wallet, DataContract, Document, IdentitySigner, Identifier };
