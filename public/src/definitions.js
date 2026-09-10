import {
  DPNS_CATEGORY_DEFINITIONS,
  SUPPORTED_QUERIES,
  SUPPORTED_TRANSITIONS,
  WALLET_CATEGORY_DEFINITIONS,
  filterDefinitions,
} from './definitions-data.js';
import { EvoSDK } from './sdk-client.js';
import { elements, state } from './state.js';
import { hideApiError, setProgress, setStatus } from './ui.js';

// Re-export the pure definition data so existing importers of './definitions.js'
// keep working. New code can import these directly from './definitions-data.js'
// (and input-type helpers from './input-types.js') to avoid pulling in the
// state/SDK dependencies that loadDefinitions needs.
export {
  SUPPORTED_QUERIES,
  SUPPORTED_TRANSITIONS,
  DPNS_CATEGORY_DEFINITIONS,
  WALLET_CATEGORY_DEFINITIONS,
  PROOF_CAPABLE,
  TRANSITION_AUTH_REQUIREMENTS,
  DPNS_AUTH_REQUIREMENTS,
  TYPE_CONFIG,
  getTypeConfig,
  filterDefinitions,
} from './definitions-data.js';
export { SUPPORTED_INPUT_TYPES } from './input-types.js';

export async function loadDefinitions() {
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
    dpns: DPNS_CATEGORY_DEFINITIONS,
    wallet: WALLET_CATEGORY_DEFINITIONS,
  };
  state.definitions = {
    queries: filterDefinitions(state.rawDefinitions.queries, 'queries', SUPPORTED_QUERIES),
    transitions: filterDefinitions(state.rawDefinitions.transitions, 'transitions', SUPPORTED_TRANSITIONS),
    dpns: JSON.parse(JSON.stringify(DPNS_CATEGORY_DEFINITIONS)),
    wallet: JSON.parse(JSON.stringify(WALLET_CATEGORY_DEFINITIONS)),
  };
  if (state.definitions.queries?.dpns) {
    delete state.definitions.queries.dpns;
  }
  if (state.definitions.queries?.wallet) {
    delete state.definitions.queries.wallet;
  }
  if (elements.latestVersionInfo) {
    let latestVersion = await EvoSDK.getLatestVersionNumber();
    elements.latestVersionInfo.textContent = `Latest version: ${latestVersion}`;
  }
  setProgress(65, 'Building interface...');
  hideApiError();
}
