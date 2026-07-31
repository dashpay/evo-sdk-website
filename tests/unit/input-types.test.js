import { describe, it, expect } from 'vitest';
import { normalizeType, SUPPORTED_INPUT_TYPES } from '../../public/src/input-types.js';

// Characterization tests: pin the CURRENT behavior of the input-type helpers so
// refactors that change behavior fail loudly.

describe('normalizeType', () => {
  it('defaults falsy input to "text"', () => {
    expect(normalizeType(undefined)).toBe('text');
    expect(normalizeType(null)).toBe('text');
    expect(normalizeType('')).toBe('text');
  });

  it('maps "string" to "text"', () => {
    expect(normalizeType('string')).toBe('text');
  });

  it('keeps "textarea" as "textarea"', () => {
    expect(normalizeType('textarea')).toBe('textarea');
  });

  it('passes any other type through unchanged', () => {
    expect(normalizeType('number')).toBe('number');
    expect(normalizeType('checkbox')).toBe('checkbox');
    expect(normalizeType('json')).toBe('json');
    expect(normalizeType('somethingUnknown')).toBe('somethingUnknown');
  });
});

describe('SUPPORTED_INPUT_TYPES', () => {
  it('is a Set', () => {
    expect(SUPPORTED_INPUT_TYPES).toBeInstanceOf(Set);
  });

  it('contains exactly the expected input types', () => {
    expect([...SUPPORTED_INPUT_TYPES].sort()).toEqual([
      'array',
      'button',
      'checkbox',
      'dynamic',
      'json',
      'keyPreview',
      'multiselect',
      'number',
      'password',
      'select',
      'string',
      'text',
      'textarea',
    ]);
  });

  it('does not contain unsupported types', () => {
    expect(SUPPORTED_INPUT_TYPES.has('wormhole')).toBe(false);
    expect(SUPPORTED_INPUT_TYPES.has('')).toBe(false);
  });

  it('agrees with normalizeType for the aliased types', () => {
    // normalizeType maps 'string' -> 'text'; both forms are members of the set.
    expect(SUPPORTED_INPUT_TYPES.has(normalizeType('string'))).toBe(true);
    expect(SUPPORTED_INPUT_TYPES.has(normalizeType('textarea'))).toBe(true);
  });
});
