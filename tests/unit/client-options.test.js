import { describe, it, expect } from 'vitest';
import { assembleClientOptions } from '../../public/src/client-options.js';

// Characterization tests: pin the CURRENT behavior of the pure SDK
// option-assembly so refactors that change behavior fail loudly. This is the
// logic extracted out of buildClientOptions (which now just reads network /
// trusted / advancedOptions from the DOM and delegates here).

describe('assembleClientOptions — base options', () => {
  it('always sets proofs:true and passes network through', () => {
    const opts = assembleClientOptions('testnet', false, {});
    expect(opts.network).toBe('testnet');
    expect(opts.proofs).toBe(true);
  });

  it('coerces trusted to a boolean', () => {
    expect(assembleClientOptions('testnet', 1, {}).trusted).toBe(true);
    expect(assembleClientOptions('testnet', 0, {}).trusted).toBe(false);
    expect(assembleClientOptions('testnet', undefined, {}).trusted).toBe(false);
  });

  it('defaults advancedOptions to {} when omitted', () => {
    expect(assembleClientOptions('mainnet', false)).toEqual({
      network: 'mainnet',
      trusted: false,
      proofs: true,
    });
  });

  it('omits the settings key when no advanced settings are provided', () => {
    expect(assembleClientOptions('testnet', false, {})).not.toHaveProperty('settings');
  });
});

describe('assembleClientOptions — protocol version override', () => {
  it('lets the SDK choose its default when no platformVersion is given', () => {
    expect(assembleClientOptions('testnet', false, {})).not.toHaveProperty('version');
  });

  it('uses the supplied platformVersion when provided', () => {
    expect(assembleClientOptions('testnet', false, { platformVersion: 12 }).version).toBe(12);
  });

  it('keeps an explicitly supplied platformVersion 0', () => {
    expect(assembleClientOptions('testnet', false, { platformVersion: 0 }).version).toBe(0);
  });
});

describe('assembleClientOptions — settings sub-object', () => {
  it('maps connectTimeout -> connectTimeoutMs', () => {
    expect(assembleClientOptions('testnet', false, { connectTimeout: 5000 }).settings)
      .toEqual({ connectTimeoutMs: 5000 });
  });

  it('maps requestTimeout -> timeoutMs', () => {
    expect(assembleClientOptions('testnet', false, { requestTimeout: 8000 }).settings)
      .toEqual({ timeoutMs: 8000 });
  });

  it('includes retries', () => {
    expect(assembleClientOptions('testnet', false, { retries: 3 }).settings)
      .toEqual({ retries: 3 });
  });

  it('includes banFailedAddress when it is a boolean (true)', () => {
    expect(assembleClientOptions('testnet', false, { banFailedAddress: true }).settings)
      .toEqual({ banFailedAddress: true });
  });

  it('includes banFailedAddress when it is a boolean (false)', () => {
    // false is a valid, meaningful value here — the typeof check keeps it,
    // unlike the falsy-guarded timeout/retry fields.
    expect(assembleClientOptions('testnet', false, { banFailedAddress: false }).settings)
      .toEqual({ banFailedAddress: false });
  });

  it('omits falsy timeouts and retries (0 is dropped)', () => {
    const opts = assembleClientOptions('testnet', false, {
      connectTimeout: 0,
      requestTimeout: 0,
      retries: 0,
    });
    expect(opts).not.toHaveProperty('settings');
  });

  it('omits banFailedAddress when it is not a boolean', () => {
    const opts = assembleClientOptions('testnet', false, { banFailedAddress: 'yes' });
    expect(opts).not.toHaveProperty('settings');
  });

  it('assembles all settings fields together', () => {
    const opts = assembleClientOptions('mainnet', true, {
      platformVersion: 12,
      connectTimeout: 5000,
      requestTimeout: 8000,
      retries: 3,
      banFailedAddress: false,
    });
    expect(opts).toEqual({
      network: 'mainnet',
      trusted: true,
      proofs: true,
      version: 12,
      settings: {
        connectTimeoutMs: 5000,
        timeoutMs: 8000,
        retries: 3,
        banFailedAddress: false,
      },
    });
  });
});
