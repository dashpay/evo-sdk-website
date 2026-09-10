import { describe, it, expect, vi, beforeAll } from 'vitest';

// Direct coverage of the real getSelectedNetwork() implementation in
// sdk-client.js: the checked radio wins, and the unified fallback is
// 'mainnet' (matching the checked default set by main.js at init).
//
// state.js captures elements.networkRadios from the DOM at import time, so
// stub `document` with mutable radio stand-ins before dynamically importing;
// getSelectedNetwork re-reads `checked` on every call, so the same array
// objects can be toggled between assertions.

const radios = [
  { name: 'network', value: 'mainnet', checked: false },
  { name: 'network', value: 'testnet', checked: false },
];

let getSelectedNetwork;

beforeAll(async () => {
  vi.stubGlobal('document', {
    getElementById: () => null,
    querySelectorAll: (selector) => (selector === 'input[name="network"]' ? radios : []),
  });
  ({ getSelectedNetwork } = await import('../../public/src/sdk-client.js'));
});

describe('getSelectedNetwork', () => {
  it('returns testnet when the testnet radio is checked', () => {
    radios[0].checked = false;
    radios[1].checked = true;
    expect(getSelectedNetwork()).toBe('testnet');
  });

  it('returns mainnet when the mainnet radio is checked', () => {
    radios[0].checked = true;
    radios[1].checked = false;
    expect(getSelectedNetwork()).toBe('mainnet');
  });

  it('falls back to mainnet when no radio is checked', () => {
    radios[0].checked = false;
    radios[1].checked = false;
    expect(getSelectedNetwork()).toBe('mainnet');
  });
});
