# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web-based testing and documentation platform for the Dash Platform Evo JS SDK. Users can execute queries and state transitions against testnet/mainnet without writing code. Pure vanilla JavaScript frontend — no frameworks.

**Live site:** <https://dashpay.github.io/evo-sdk-website/>

## Commands

### Development

```bash
yarn serve              # Serve on http://localhost:8081 (Python HTTP server)
yarn generate           # Regenerate docs from api-definitions.json
yarn check              # Validate documentation is current
```

### Testing

```bash
yarn test               # Full suite: unit tests then Playwright E2E
yarn test:unit          # Vitest unit tests + type-extraction tests
yarn test:types         # Type-extraction tests (node --test)
yarn test:unit:watch    # Vitest in watch mode
yarn test:unit:coverage # Vitest with coverage
```

Playwright E2E:

```bash
yarn test:smoke         # Quick UI validation tests
yarn test:queries       # Query execution tests (parallel)
yarn test:playground    # Playground example tests
yarn test:transitions   # State transition tests (sequential, slow)
yarn test:ui            # Interactive Playwright UI
yarn test:report        # View HTML report
```

Run a single test by pattern:

```bash
yarn playwright test --grep "getIdentity"
```

Test against remote site:

```bash
PLAYWRIGHT_BASE_URL=https://dashpay.github.io/evo-sdk-website/ yarn test:smoke
```

## Architecture

### Core Files

- `public/app.js` — One-line entrypoint shim (`import './src/main.js'`); the service worker caches this path
- `public/playground.html` — Code playground for writing and running SDK snippets directly; linked from the main nav and driven by `public/src/playground.js`
- `public/src/` — Application logic, split into focused ES modules: `operations.js` (the `callEvo()` dispatcher), `sdk-client.js` (SDK client lifecycle), `main.js` (entrypoint/wiring), `playground.js` (playground page), plus form, auth, and rendering modules
- `public/api-definitions.json` — Single source of truth for all API operations (~2700 lines)
- `public/sdk-operation-catalog.json` — Versioned operation catalog generated from the installed declarations: per-operation signatures, parameters, return types, and a recursive map of referenced SDK input/output types. Consumed by the docs generator and checked for drift by `yarn check`
- `public/dist/evo-sdk.module.js` — Bundled SDK, copied from `node_modules/@dashevo/evo-sdk/dist` by `yarn generate` (not generated here)
- `scripts/generate_docs.py` — Generates `docs.html` and `AI_REFERENCE.md` from api-definitions.json; also refreshes `public/dist` from the installed SDK package
- `scripts/extract_sdk_types.mjs` — Extracts typed operation metadata (signatures, parameters, return types) and recursively resolves referenced SDK input/output types from the installed TypeScript declarations, emitting `sdk-operation-catalog.json`
- `scripts/check_documentation.py` — Validates that generated documentation is current (`yarn check`)

### SDK Integration Pattern

```javascript
import { EvoSDK, wallet, IdentitySigner, Document } from './dist/evo-sdk.module.js';
const client = new EvoSDK({ network: 'testnet' });
await client.connect();
```

State transitions require identity + signer:

```javascript
const identity = await client.identities.fetch(identityId);
const signer = new IdentitySigner();
signer.addKeyFromWif(privateKeyWif);
await client.identities.creditTransfer({ identity, recipientId, amount: BigInt(amount), signer });

// Document/contract operations also need the identity key
const identityKey = identity.getPublicKeyById(0);
await client.documents.create({ document, identityKey, signer });
```

### SDK Namespaces

- `client.identities.*` — Identity queries and state transitions
- `client.contracts.*` — Data contract operations
- `client.documents.*` — Document CRUD
- `client.tokens.*` — Token operations (mint, burn, transfer, freeze)
- `client.dpns.*` — DPNS name resolution
- `client.voting.*` — Contested resource voting
- `client.epoch.*` — Blockchain epoch queries
- `client.system.*` — Platform status and utilities

### Test Infrastructure

- `tests/e2e/utils/sdk-page.js` — Page Object Model for the SDK UI
- `tests/e2e/utils/parameter-injector.js` — Automated test data injection from api-definitions.json
- `tests/e2e/utils/base-test.js` — Base test utilities (navigation, UI interaction, assertions)
- `tests/e2e/fixtures/test-data.js` — Centralized test parameters (identity IDs, contract IDs, etc.)

Playwright config defines 4 test projects: `site-tests`, `smoke-tests`, `parallel-e2e-tests`, and `sequential-e2e-tests` (transitions). Timeouts: 120s global, 30s action, 60s navigation.

## Key Patterns

### Adding New Operations

1. Add definition to `public/api-definitions.json`
2. Implement handler in `callEvo()` switch statement in `public/src/operations.js`
3. Run `yarn generate` to update documentation
4. Add test parameters to `tests/e2e/fixtures/test-data.js`

### Documentation Generation

Documentation is auto-generated from `api-definitions.json`:

- `public/docs.html` — Human-readable interactive docs
- `public/AI_REFERENCE.md` — AI assistant reference

Always run `yarn generate` after modifying api-definitions.json.

## CI/CD

- Tests run on PR/push to master via GitHub Actions
- Transition tests are skipped in CI (too slow)
- Site deploys to GitHub Pages after tests pass
- SDK version auto-updates daily via workflow
  