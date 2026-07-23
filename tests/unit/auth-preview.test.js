import { describe, expect, it } from 'vitest';
import { getPreviewKeyId } from '../../public/src/auth-preview.js';

describe('generated-code authentication preview', () => {
  it('preserves an allowed numeric key ID suffix', () => {
    expect(getPreviewKeyId('private-wif:7', true)).toBe(7);
    expect(getPreviewKeyId('private-wif: 12 ', true)).toBe(12);
  });

  it('does not expose or interpret unsupported and invalid suffixes', () => {
    expect(getPreviewKeyId('private-wif:7', false)).toBeUndefined();
    expect(getPreviewKeyId('private-wif:not-a-number', true)).toBeUndefined();
    expect(getPreviewKeyId('private-wif:-1', true)).toBeUndefined();
    expect(getPreviewKeyId('private-wif:', true)).toBeUndefined();
  });
});
