import { describe, it, expect } from 'vitest';
import {
  getTypeConfig,
  filterDefinitions,
  SUPPORTED_QUERIES,
} from '../../public/src/definitions-data.js';

// Characterization tests: pin the CURRENT behavior of the pure definition
// helpers so refactors that change behavior fail loudly.

describe('getTypeConfig', () => {
  it('returns the queries config (proof allowed)', () => {
    expect(getTypeConfig('queries')).toEqual({ definitionKey: 'queries', itemsKey: 'queries', allowProof: true });
  });

  it('returns the transitions config (proof not allowed)', () => {
    expect(getTypeConfig('transitions')).toEqual({ definitionKey: 'transitions', itemsKey: 'transitions', allowProof: false });
  });

  it('returns the dpns config (operations itemsKey)', () => {
    expect(getTypeConfig('dpns')).toEqual({ definitionKey: 'dpns', itemsKey: 'operations', allowProof: true });
  });

  it('returns the wallet config (operations itemsKey, proof not allowed)', () => {
    expect(getTypeConfig('wallet')).toEqual({ definitionKey: 'wallet', itemsKey: 'operations', allowProof: false });
  });

  it('returns null for an unknown type', () => {
    expect(getTypeConfig('teleporter')).toBeNull();
    expect(getTypeConfig(undefined)).toBeNull();
  });
});

describe('filterDefinitions', () => {
  // A known-allowed query name to use in fixtures.
  const allowed = 'getIdentity';

  it('returns {} for null/undefined/empty source', () => {
    expect(filterDefinitions(null, 'queries', SUPPORTED_QUERIES)).toEqual({});
    expect(filterDefinitions(undefined, 'queries', SUPPORTED_QUERIES)).toEqual({});
    expect(filterDefinitions({}, 'queries', SUPPORTED_QUERIES)).toEqual({});
  });

  it('drops operations whose key is not in the allow-set', () => {
    const src = { identity: { queries: { notARealQuery: { inputs: [] } } } };
    expect(filterDefinitions(src, 'queries', SUPPORTED_QUERIES)).toEqual({});
  });

  it('keeps an allowed operation that has no inputs array (treated as supported)', () => {
    const src = { identity: { queries: { [allowed]: { label: 'X' } } } };
    const out = filterDefinitions(src, 'queries', SUPPORTED_QUERIES);
    expect(out.identity.queries[allowed]).toEqual({ label: 'X' });
  });

  it('keeps an allowed operation whose inputs all use supported types', () => {
    const src = { identity: { queries: { [allowed]: { inputs: [{ type: 'text' }, { type: 'number' }] } } } };
    const out = filterDefinitions(src, 'queries', SUPPORTED_QUERIES);
    expect(out.identity.queries[allowed]).toBeDefined();
  });

  it('accepts a "string" input type (a currently supported type)', () => {
    // Note: 'string' is in SUPPORTED_INPUT_TYPES directly, so this only checks
    // that 'string' is accepted — it does NOT prove the normalization path.
    // The empty/omitted-type cases below prove normalization.
    const src = { identity: { queries: { [allowed]: { inputs: [{ type: 'string' }] } } } };
    const out = filterDefinitions(src, 'queries', SUPPORTED_QUERIES);
    expect(out.identity.queries[allowed]).toBeDefined();
  });

  it('accepts an empty input type via normalization (normalizeType("") -> "text")', () => {
    // '' is NOT in SUPPORTED_INPUT_TYPES; it only survives because the filter
    // normalizes the type first. A filter that checked the raw type would drop
    // this, so the test fails if normalization is removed.
    const src = { identity: { queries: { [allowed]: { inputs: [{ type: '' }] } } } };
    const out = filterDefinitions(src, 'queries', SUPPORTED_QUERIES);
    expect(out.identity.queries[allowed]).toBeDefined();
  });

  it('accepts an omitted input type via normalization (undefined -> "text")', () => {
    const src = { identity: { queries: { [allowed]: { inputs: [{ name: 'x' }] } } } };
    const out = filterDefinitions(src, 'queries', SUPPORTED_QUERIES);
    expect(out.identity.queries[allowed]).toBeDefined();
  });

  it('drops an allowed operation if ANY input uses an unsupported type', () => {
    const src = { identity: { queries: { [allowed]: { inputs: [{ type: 'text' }, { type: 'wormhole' }] } } } };
    expect(filterDefinitions(src, 'queries', SUPPORTED_QUERIES)).toEqual({});
  });

  it('omits a group entirely when none of its operations survive', () => {
    const src = { identity: { queries: { notAllowed: { inputs: [] } } } };
    expect(filterDefinitions(src, 'queries', SUPPORTED_QUERIES)).toEqual({});
  });

  it('skips a group that has no entriesKey member', () => {
    const src = { identity: { somethingElse: {} } };
    expect(filterDefinitions(src, 'queries', SUPPORTED_QUERIES)).toEqual({});
  });

  it('preserves other group properties alongside the filtered entries', () => {
    const src = { identity: { label: 'Identity', queries: { [allowed]: { inputs: [] }, bad: { inputs: [] } } } };
    const out = filterDefinitions(src, 'queries', SUPPORTED_QUERIES);
    expect(out.identity.label).toBe('Identity');
    expect(Object.keys(out.identity.queries)).toEqual([allowed]);
  });
});
