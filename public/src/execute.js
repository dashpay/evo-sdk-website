import { collectAuthArgs } from './auth.js';
import { getTypeConfig } from './definitions.js';
import { collectArgs } from './form/collect.js';
import { callEvo } from './operations.js';
import { formatResult } from './result-format.js';
import { ensureClient } from './sdk-client.js';
import { elements, state } from './state.js';
import { setStatus } from './ui.js';

export async function executeSelected() {
  if (!state.selected) return;
  try {
    if (elements.executeButton) {
      elements.executeButton.disabled = true;
    }
    const { definition, auth } = state.selected;
    const args = collectArgs(definition);
    const authArgs = collectAuthArgs(auth);
    // Wallet helpers run locally in the wasm runtime — never create or
    // connect a platform client for them.
    const client = state.selected.type === 'wallet' ? null : await ensureClient();
    const typeConfig = getTypeConfig(state.selected.type);
    const useProof = Boolean(typeConfig?.allowProof
      && elements.proofToggleContainer.style.display !== 'none'
      && elements.proofToggle.checked);
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

export function clearResults() {
  if (!elements.resultContent) return;
  elements.resultContent.textContent = '';
  elements.resultContent.classList.add('empty');
  elements.resultContent.classList.remove('error');
  state.currentResult = null;
}

export function copyResults() {
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

export async function clearCache() {
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
