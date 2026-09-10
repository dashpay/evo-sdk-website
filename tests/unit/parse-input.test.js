import { describe, it, expect } from 'vitest';
import { parseInputValue, namedArgs } from '../../public/src/form/parse-input.js';

// Characterization tests: pin the CURRENT behavior of the pure form-parsing
// helpers so refactors that change behavior fail loudly. parseInputValue only
// duck-types its `control` arg (control.value / .checked / .selectedOptions),
// so plain objects stand in for DOM elements — no jsdom needed.

const txt = (value) => ({ value });
const opts = (...values) => ({ selectedOptions: values.map(value => ({ value })) });

describe('parseInputValue — number', () => {
  it('parses a trimmed numeric string', () => {
    expect(parseInputValue('number', {}, txt('  42 '))).toBe(42);
  });

  it('returns null for empty optional input', () => {
    expect(parseInputValue('number', {}, txt('   '))).toBeNull();
  });

  it('throws for empty required input', () => {
    expect(() => parseInputValue('number', { required: true, label: 'Count' }, txt('')))
      .toThrow('Count is required');
  });

  it('throws for a non-numeric value', () => {
    expect(() => parseInputValue('number', { name: 'n' }, txt('abc')))
      .toThrow('n must be a number');
  });

  it('parses 0 (and does not treat it as empty)', () => {
    expect(parseInputValue('number', {}, txt('0'))).toBe(0);
  });
});

describe('parseInputValue — checkbox', () => {
  it('returns the checked boolean', () => {
    expect(parseInputValue('checkbox', {}, { checked: true })).toBe(true);
    expect(parseInputValue('checkbox', {}, { checked: false })).toBe(false);
  });
});

describe('parseInputValue — json', () => {
  it('parses valid JSON', () => {
    expect(parseInputValue('json', {}, txt('{"a":1}'))).toEqual({ a: 1 });
  });

  it('returns null for empty optional input', () => {
    expect(parseInputValue('json', {}, txt(''))).toBeNull();
  });

  it('throws for empty required input', () => {
    expect(() => parseInputValue('json', { required: true, name: 'cfg' }, txt('')))
      .toThrow('cfg is required');
  });

  it('throws for invalid JSON', () => {
    expect(() => parseInputValue('json', { name: 'cfg' }, txt('{bad')))
      .toThrow('cfg must be valid JSON');
  });
});

describe('parseInputValue — array', () => {
  it('parses a JSON array', () => {
    expect(parseInputValue('array', {}, txt('[1,2,3]'))).toEqual([1, 2, 3]);
  });

  it('wraps a non-array JSON value in an array', () => {
    expect(parseInputValue('array', {}, txt('"x"'))).toEqual(['x']);
  });

  it('falls back to comma-splitting when not JSON (trims and drops empties)', () => {
    expect(parseInputValue('array', {}, txt('a, b ,, c'))).toEqual(['a', 'b', 'c']);
  });

  it('returns [] for empty optional input', () => {
    expect(parseInputValue('array', {}, txt('   '))).toEqual([]);
  });

  it('throws for empty required input', () => {
    expect(() => parseInputValue('array', { required: true, name: 'ids' }, txt('')))
      .toThrow('ids is required');
  });
});

describe('parseInputValue — multiselect', () => {
  it('returns the selected option values', () => {
    expect(parseInputValue('multiselect', {}, opts('a', 'b'))).toEqual(['a', 'b']);
  });

  it('returns [] when nothing is selected and not required', () => {
    expect(parseInputValue('multiselect', {}, opts())).toEqual([]);
  });

  it('throws when required and nothing selected', () => {
    expect(() => parseInputValue('multiselect', { required: true, name: 'roles' }, opts()))
      .toThrow('roles is required');
  });
});

describe('parseInputValue — select', () => {
  it('returns the selected value', () => {
    expect(parseInputValue('select', {}, txt('chosen'))).toBe('chosen');
  });

  it('throws when required and value is empty', () => {
    expect(() => parseInputValue('select', { required: true, name: 'kind' }, txt('')))
      .toThrow('kind is required');
  });

  it('returns the empty string for an empty optional select (quirk: unlike text, which returns null)', () => {
    // The select branch returns control.value as-is; it does NOT coerce empty
    // to null the way the text/default branch does. Pinning this asymmetry.
    expect(parseInputValue('select', {}, txt(''))).toBe('');
  });
});

describe('parseInputValue — text / textarea / default', () => {
  it('returns the trimmed text', () => {
    expect(parseInputValue('text', {}, txt('  hello '))).toBe('hello');
  });

  it('returns null for empty optional text', () => {
    expect(parseInputValue('text', {}, txt('   '))).toBeNull();
  });

  it('throws for empty required text', () => {
    expect(() => parseInputValue('text', { required: true, label: 'Name' }, txt('')))
      .toThrow('Name is required');
  });

  it('treats textarea the same as text', () => {
    expect(parseInputValue('textarea', {}, txt(' note '))).toBe('note');
  });

  it('uses the default branch for unknown types (trim + null-if-empty)', () => {
    expect(parseInputValue('somethingElse', {}, txt(' x '))).toBe('x');
    expect(parseInputValue('somethingElse', {}, txt(''))).toBeNull();
  });

  it('preserveWhitespace passes the value through untrimmed (message, BIP39 passphrase)', () => {
    expect(parseInputValue('textarea', { preserveWhitespace: true }, txt('  padded  '))).toBe('  padded  ');
    expect(parseInputValue('password', { preserveWhitespace: true }, txt(' TREZOR '))).toBe(' TREZOR ');
    expect(parseInputValue('password', { preserveWhitespace: true }, txt('   '))).toBe('   ');
  });

  it('preserveWhitespace still treats a fully empty value as missing', () => {
    expect(parseInputValue('password', { preserveWhitespace: true }, txt(''))).toBeNull();
    expect(() => parseInputValue('textarea', { preserveWhitespace: true, required: true, label: 'Message' }, txt('')))
      .toThrow('Message is required');
  });
});

describe('namedArgs', () => {
  it('maps positional args to named keys by definition order', () => {
    const defs = [{ name: 'id' }, { name: 'limit' }];
    expect(namedArgs(defs, ['abc', 10])).toEqual({ id: 'abc', limit: 10 });
  });

  it('skips definitions without a name (and the positional slot is dropped)', () => {
    const defs = [{ name: 'a' }, { label: 'no name' }, { name: 'c' }];
    expect(namedArgs(defs, [1, 2, 3])).toEqual({ a: 1, c: 3 });
  });

  it('skips null/undefined definitions', () => {
    const defs = [{ name: 'a' }, null, undefined, { name: 'd' }];
    expect(namedArgs(defs, [1, 2, 3, 4])).toEqual({ a: 1, d: 4 });
  });

  it('preserves undefined arg values for named defs', () => {
    expect(namedArgs([{ name: 'a' }, { name: 'b' }], [1])).toEqual({ a: 1, b: undefined });
  });

  it('returns {} for empty defs', () => {
    expect(namedArgs([], [1, 2])).toEqual({});
  });
});
