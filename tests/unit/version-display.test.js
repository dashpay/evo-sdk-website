import { describe, it, expect } from 'vitest';
import { buildVersionDisplayModel } from '../../public/src/version-display.js';

// The DOM render in sdk-client.js (loadVersionInfo) is intentionally thin —
// the textContent / href values it sets come straight from this model. Pinning
// the model here is what guarantees the XSS-hardened render keeps producing
// the same user-visible output as the previous innerHTML version.

describe('buildVersionDisplayModel — link targets', () => {
  it('points the SDK link at the npm package and the commit link at the github commit', () => {
    const model = buildVersionDisplayModel({
      sdkVersion: '4.0.0-rc.2',
      commitHash: 'abc1234',
      buildTime: '2026-01-15T12:34:56Z',
    });
    expect(model.sdkLink.href).toBe('https://www.npmjs.com/package/@dashevo/evo-sdk');
    expect(model.commitLink.href).toBe('https://github.com/dashpay/evo-sdk-website/commit/abc1234');
  });

  it('formats the link text with the v-prefix and trailing ↗ glyph', () => {
    const model = buildVersionDisplayModel({
      sdkVersion: '4.0.0-rc.2',
      commitHash: 'abc1234',
      buildTime: '',
    });
    expect(model.sdkLink.text).toBe('v4.0.0-rc.2↗');
    expect(model.commitLink.text).toBe('abc1234↗');
  });
});

describe('buildVersionDisplayModel — buildDisplay', () => {
  it('formats valid ISO build times as YYYY-MM-DD', () => {
    expect(buildVersionDisplayModel({ buildTime: '2026-01-15T12:34:56Z' }).buildDisplay)
      .toBe('2026-01-15');
  });

  it('drops invalid build times to an empty string', () => {
    expect(buildVersionDisplayModel({ buildTime: 'not-a-date' }).buildDisplay).toBe('');
  });

  it('treats missing build time as empty', () => {
    expect(buildVersionDisplayModel({}).buildDisplay).toBe('');
  });
});

describe('buildVersionDisplayModel — defaults and title', () => {
  it('falls back to "unknown" for missing version and commit', () => {
    const model = buildVersionDisplayModel({});
    expect(model.sdkLink.text).toBe('vunknown↗');
    expect(model.commitLink.text).toBe('unknown↗');
    expect(model.commitLink.href).toBe('https://github.com/dashpay/evo-sdk-website/commit/unknown');
  });

  it('handles a null payload without throwing', () => {
    const model = buildVersionDisplayModel(null);
    expect(model.sdkLink.text).toBe('vunknown↗');
    expect(model.buildDisplay).toBe('');
  });

  it('exposes the multi-line title tooltip with the raw buildTime', () => {
    const model = buildVersionDisplayModel({
      sdkVersion: '4.0.0-rc.2',
      commitHash: 'abc1234',
      buildTime: '2026-01-15T12:34:56Z',
    });
    expect(model.title).toBe(
      'SDK Version: 4.0.0-rc.2\nWebsite Commit: abc1234\nBuild Time: 2026-01-15T12:34:56Z',
    );
  });
});
