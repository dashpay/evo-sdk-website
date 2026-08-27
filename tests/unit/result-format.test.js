import { describe, it, expect } from 'vitest';
import { formatResult } from '../../public/src/result-format.js';

// Characterization tests: these pin the CURRENT behavior of formatResult.
// They document what the function does today, quirks included — not what it
// "should" do — so refactors that change behavior fail loudly.

describe('formatResult — sentinels and primitives', () => {
  it('returns the no-result sentinel for undefined', () => {
    expect(formatResult(undefined)).toBe('Completed (no result returned)');
  });

  it('returns the string "null" for null', () => {
    expect(formatResult(null)).toBe('null');
  });

  it('passes a top-level string through verbatim (not JSON-quoted)', () => {
    expect(formatResult('hello world')).toBe('hello world');
  });

  it('renders a top-level number as its string form', () => {
    // A number is not a string, so it does not take the top-level passthrough;
    // it falls through to JSON.stringify. (For a scalar like 42 the output is
    // identical either way, so this only pins the value, not the code path.)
    expect(formatResult(42)).toBe('42');
  });

  it('JSON-stringifies a top-level boolean', () => {
    expect(formatResult(true)).toBe('true');
  });
});

describe('formatResult — objects and arrays', () => {
  it('pretty-prints a plain object with 2-space indentation', () => {
    expect(formatResult({ a: 1, b: 'x' })).toBe('{\n  "a": 1,\n  "b": "x"\n}');
  });

  it('pretty-prints an array', () => {
    expect(formatResult([1, 2, 3])).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('omits undefined-valued properties (standard JSON.stringify behavior)', () => {
    expect(formatResult({ keep: 1, drop: undefined })).toBe('{\n  "keep": 1\n}');
  });
});

describe('formatResult — BigInt', () => {
  it('stringifies a top-level bigint', () => {
    expect(formatResult(10n)).toBe('10');
  });

  it('stringifies bigint nested in an object', () => {
    expect(formatResult({ amount: 123456789012345678901234567890n }))
      .toBe('{\n  "amount": "123456789012345678901234567890"\n}');
  });
});

describe('formatResult — Map handling', () => {
  it('converts a Map to a plain object', () => {
    const m = new Map([['x', 1], ['y', 2]]);
    expect(formatResult(m)).toBe('{\n  "x": 1,\n  "y": 2\n}');
  });

  it('coerces non-string Map keys via String()', () => {
    const m = new Map([[1, 'a']]);
    expect(formatResult(m)).toBe('{\n  "1": "a"\n}');
  });

  it('recursively serializes Map values (bigint inside a Map)', () => {
    const m = new Map([['bal', 5n]]);
    expect(formatResult(m)).toBe('{\n  "bal": "5"\n}');
  });

  it('stringifies bigint Map keys (documents.history shape)', () => {
    const m = new Map([[18446744073709551615n, { revision: 1 }]]);
    expect(formatResult(m)).toBe('{\n  "18446744073709551615": {\n    "revision": 1\n  }\n}');
  });
});

describe('formatResult — circular references', () => {
  it('replaces a circular reference with [Circular]', () => {
    const a = { name: 'a' };
    a.self = a;
    const out = JSON.parse(formatResult(a));
    expect(out).toEqual({ name: 'a', self: '[Circular]' });
  });
});

describe('formatResult — typed arrays', () => {
  it('converts a Uint8Array to a plain number array', () => {
    expect(formatResult(new Uint8Array([1, 2, 3]))).toBe('[\n  1,\n  2,\n  3\n]');
  });
});

describe('formatResult — WASM-like objects', () => {
  it('skips the __wbg_ptr property on a plain object that exposes it', () => {
    // An object with __wbg_ptr but no toJSON/toObject/getters falls through to
    // the generic object branch, where __wbg_ptr is explicitly skipped.
    const obj = { __wbg_ptr: 12345, value: 'kept' };
    expect(formatResult(obj)).toBe('{\n  "value": "kept"\n}');
  });

  it('uses toJSON() when a WASM-like object provides it', () => {
    const wasm = { __wbg_ptr: 1, toJSON() { return { id: 'abc' }; } };
    expect(formatResult(wasm)).toBe('{\n  "id": "abc"\n}');
  });

  it('falls back to toObject() when toJSON is absent', () => {
    const wasm = { __wbg_ptr: 1, toObject() { return { id: 'def' }; } };
    expect(formatResult(wasm)).toBe('{\n  "id": "def"\n}');
  });

  it('extracts known getters (TokenContractInfo shape) when toJSON/toObject are missing', () => {
    // Non-enumerable getters: invisible to Object.entries(), readable only via
    // val[prop]. This forces the knownGetters extraction path — the generic
    // object branch would serialize to {} here, so the test actually fails if
    // that extraction is removed.
    const wasm = {};
    Object.defineProperty(wasm, '__wbg_ptr', { value: 1, enumerable: false });
    Object.defineProperty(wasm, 'contractId', { get: () => 'C', enumerable: false });
    Object.defineProperty(wasm, 'tokenContractPosition', { get: () => 7, enumerable: false });
    expect(formatResult(wasm)).toBe('{\n  "contractId": "C",\n  "tokenContractPosition": 7\n}');
  });

  it('extracts the isFrozen getter (IdentityTokenInfo shape)', () => {
    const wasm = {};
    Object.defineProperty(wasm, '__wbg_ptr', { value: 1, enumerable: false });
    Object.defineProperty(wasm, 'isFrozen', { get: () => false, enumerable: false });
    expect(formatResult(wasm)).toBe('{\n  "isFrozen": false\n}');
  });

  it('falls back to a meaningful toString() when nothing else is available', () => {
    const wasm = { __wbg_ptr: 1, toString() { return 'PlatformAddress(xyz)'; } };
    expect(formatResult(wasm)).toBe('PlatformAddress(xyz)');
  });
});

describe('formatResult — ProofMetadataResponse shape', () => {
  it('preserves data/metadata/proof structure', () => {
    // Non-enumerable getters force the dedicated ProofMetadataResponse branch:
    // the generic object path can't see these props, so it would serialize to
    // {} and the test fails if that branch is removed.
    const resp = {};
    Object.defineProperty(resp, '__wbg_ptr', { value: 1, enumerable: false });
    Object.defineProperty(resp, 'data', { get: () => ({ balance: 100n }), enumerable: false });
    Object.defineProperty(resp, 'metadata', { get: () => ({ height: 5 }), enumerable: false });
    Object.defineProperty(resp, 'proof', { get: () => ({ grovedbProof: 'deadbeef' }), enumerable: false });
    const out = JSON.parse(formatResult(resp));
    expect(out).toEqual({
      data: { balance: '100' },
      metadata: { height: 5 },
      proof: { grovedbProof: 'deadbeef' },
    });
  });
});
