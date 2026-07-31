import { defineConfig } from 'vitest/config';

// Unit tests live under tests/unit/ and are separate from the Playwright E2E
// suite (tests/e2e/**, tests/site.spec.ts), which Playwright matches via its
// own testMatch globs. The two runners never see each other's files.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    // Plain 'node' environment (not jsdom). Only modules that import cleanly in
    // Node — no DOM access and no WASM SDK load at import time — are unit-tested
    // here.
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage/unit',
      // Scope coverage to the modules that actually have unit tests, so the
      // headline number reflects what's exercised rather than being diluted by
      // the many modules that are only reachable through E2E. Add each module
      // here as it gains unit tests. (The text reporter truncates the table to
      // terminal width; the html/json reporters list every file.)
      include: [
        'public/src/result-format.js',
        'public/src/contracts.js',
        'public/src/input-types.js',
        'public/src/definitions-data.js',
        'public/src/client-options.js',
        'public/src/form/parse-input.js',
        'public/src/auth-preview.js',
        'public/src/version-display.js',
        'public/src/state.js',
        'public/src/transitions/address-operations.js',
        'public/src/transitions/asset-lock-operations.js',
        'public/src/transitions/contract-operations.js',
        'public/src/transitions/document-operations.js',
        'public/src/transitions/identity-operations.js',
        'public/src/transitions/registry.js',
        'public/src/transitions/token-operations.js',
      ],
    },
  },
});
