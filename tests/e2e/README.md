# Evo SDK Testing Suite

Testing suite for the Evo SDK web interface using Playwright.

## Features

- **Project-based test organization** (smoke, queries, transitions)
- **Chromium testing** through Playwright
- **Automated parameter injection** from centralized test data
- **Page Object Model** for maintainable test code
- **Network switching** (testnet/mainnet) testing
- **Comprehensive reporting** with screenshots and videos on failure

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Python 3 for serving the web interface
- Dependencies installed with `yarn install` (the postinstall step generates `public/dist/evo-sdk.module.js`)

### Running Tests

**From the root directory** (recommended for quick execution):

```bash
# Install dependencies and browsers (one-time setup)
yarn install
yarn install-browsers

# Run all tests
yarn test

# Run specific test projects
yarn test:smoke         # Smoke tests (SDK UI functionality)
yarn test:queries       # Query execution tests
yarn test:playground    # Playground example execution
yarn test:transitions   # State transition tests

# Interactive modes
yarn test:ui            # Visual test runner

# View results
yarn test:report        # Open HTML report
```

## Test Organization

### Test Projects

The Playwright configuration defines four projects. `site-tests` is reserved for `tests/site.spec.ts`, which is not currently present. The active projects are:

1. **smoke-tests** - `tests/e2e/smoke/*.spec.js`
   - SDK initialization and UI validation
   - Playground UI behavior
   - Network switching functionality
   - Basic interaction flows
   - State transition UI validation

2. **parallel-e2e-tests** - `tests/e2e/queries/*.spec.js`
   - Identity queries (getIdentity, getIdentityBalance, etc.)
   - Data contract queries (getDataContract, getDataContracts, etc.)
   - Document queries (getDocuments, getDocument)
   - System queries (getStatus, getCurrentEpoch, etc.)
   - Token, DPNS, voting, and protocol queries
   - Playground example execution
   - Error handling and proof support testing

3. **sequential-e2e-tests** - `tests/e2e/transitions/*.spec.js`
   - Data contract create/update transitions
   - Document create/replace/delete/transfer transitions
   - Identity credit transfer/withdrawal transitions
   - Token and Platform Address transitions
   - Authentication input validation
   - Runs serially with one worker and is omitted when `CI` is set

### Directory Structure

```text
tests/
├── unit/                     # Vitest unit tests
├── type-extraction.test.mjs  # Node type-extraction tests
└── e2e/                      # Playwright E2E suite
    ├── smoke/                # Quick validation tests
    │   ├── basic-smoke.spec.js
    │   └── playground.spec.js
    ├── queries/              # Query execution tests
    │   ├── playground-examples.spec.js
    │   └── query-execution.spec.js
    ├── transitions/          # State transition tests
    │   └── state-transitions.spec.js
    ├── utils/                # Test utilities and page objects
    │   ├── base-test.js      # Base test functionality
    │   ├── sdk-page.js       # Page Object Model for SDK interface
    │   └── parameter-injector.js # Parameter injection system
    ├── fixtures/             # Test data and fixtures
    │   └── test-data.js      # Centralized test parameters
    └── README.md             # This file
```

## Configuration

### Playwright Setup

The testing suite uses a unified configuration approach:

- **Dependencies**: In `package.json`
- **Configuration**: `playwright.config.ts` in root directory
- **Base URL**: `http://localhost:8081` (auto-managed web server, configurable via `PLAYWRIGHT_BASE_URL`)
- **Browsers**: Chromium (headless by default)
- **Timeouts**: 30s for actions and navigation, 120s per test, 10s for assertions
- **Reporters**: HTML, JSON, and console output
- **CI Handling**: Conditional test execution (skips slow tests in CI)

### Test Data

Test parameters are centralized in `fixtures/test-data.js` and include:

- Known testnet identity IDs
- Data contract IDs (DPNS, DashPay, etc.)
- Document IDs and examples
- Token IDs for testing
- Parameter sets for each query type
- State transition authentication data

## Command Reference

### Yarn Commands (from root)

```bash
# Basic execution
yarn test                   # Run all tests
yarn test:unit              # Run Vitest and type-extraction tests
yarn test:smoke            # Run smoke tests only
yarn test:queries          # Run query tests only
yarn test:playground       # Run playground example execution only
yarn test:transitions      # Run transition tests only

# Interactive modes
yarn test:ui               # Visual test runner
yarn test:report           # View HTML report

# Development
yarn test:all              # Run with comprehensive reporting
yarn test:ci               # CI-friendly output
yarn install-browsers     # Install Playwright browsers

# Testing against hosted sites
PLAYWRIGHT_BASE_URL=https://example.com/ yarn test        # Test remote site
PLAYWRIGHT_BASE_URL=https://example.com/ yarn test:smoke  # Test specific project
```

### Direct Playwright Commands

```bash
# From root directory
yarn playwright test --project=smoke-tests
yarn playwright test --project=parallel-e2e-tests
yarn playwright test --project=sequential-e2e-tests

# Pattern matching
yarn playwright test --grep "Identity Queries"
yarn playwright test --grep "getIdentity"

# Test against hosted site
PLAYWRIGHT_BASE_URL=https://example.com/ yarn playwright test --project=smoke-tests
```

## Adding New Tests

### 1. Add Test Data

Update `fixtures/test-data.js` with new parameters:

```javascript
const newQueryParameters = {
  myCategory: {
    myQueryType: {
      testnet: [
        { id: 'someIdentityId', limit: 10 }
      ]
    }
  }
};
```

### 2. Create Test Cases

Use the page object model and parameter injector:

```javascript
const { test, expect } = require('@playwright/test');
const { EvoSdkPage } = require('../utils/sdk-page');
const { ParameterInjector } = require('../utils/parameter-injector');

test('should execute my new query', async ({ page }) => {
  const evoSdkPage = new EvoSdkPage(page);
  const parameterInjector = new ParameterInjector(evoSdkPage);

  await evoSdkPage.initialize('testnet');
  await evoSdkPage.setupQuery('myCategory', 'myQueryType');

  const success = await parameterInjector.injectParameters('myCategory', 'myQueryType');
  expect(success).toBe(true);

  const result = await evoSdkPage.executeQueryAndGetResult();
  expect(result.success || result.hasError).toBe(true);
});
```

### 3. Choose Test Location

- **Smoke tests**: SDK UI validation → `tests/e2e/smoke/basic-smoke.spec.js`
- **Playground UI tests**: Editor behavior → `tests/e2e/smoke/playground.spec.js`
- **Query tests**: Query execution → `tests/e2e/queries/query-execution.spec.js`
- **Playground execution tests**: Run every example → `tests/e2e/queries/playground-examples.spec.js`
- **Transition tests**: State transitions → `tests/e2e/transitions/state-transitions.spec.js`

## CI/CD Integration

### Automatic Execution

Tests are configured for CI environments with:

- **Conditional execution**: Slow tests (transitions) skip in CI
- **Retry logic**: 1 retry on CI
- **Multiple reporters**: HTML, JSON, and list output by default; `test:ci` selects GitHub and JSON reporters
- **Artifact collection**: Screenshots, videos, traces

### CI Commands

```bash
# In CI environment
yarn test:unit            # Unit and type-extraction tests
yarn test:ci              # CI-friendly Playwright output

# Results available in:
# - playwright-report/ (HTML)
# - test-results.json (JSON)
# - test-results/ (screenshots, videos)
```

## Troubleshooting

### Common Issues

1. **Missing dependencies**: Run `yarn install && yarn install-browsers`
2. **Port conflicts**: Playwright auto-manages port 8081
3. **SDK bundle missing**: Run `yarn install` or `yarn generate`, then verify `public/dist/evo-sdk.module.js` exists
4. **Test timeouts**: Run `DEBUG=pw:api yarn playwright test <test-file>` for Playwright API logs

### Debug Mode

```bash
# Detailed Playwright API logs
DEBUG=pw:api yarn test:smoke

# Visual debugging
yarn test:ui
```

## Support

For issues or questions:

1. **Environment validation**: Run `yarn install`, `yarn install-browsers`, and `yarn playwright test --list`
2. **Visual debugging**: Check HTML reports in `playwright-report/`
3. **Test artifacts**: Review screenshots/videos in `test-results/`
4. **Configuration**: Verify `playwright.config.ts` in root directory
5. **Dependencies**: Ensure unified setup with root `package.json`

## Known Issues & Limitations

- State transition tests are slow and skip in CI environments
- Some queries don't support proof information (tests automatically adapt)
- Currently configured for Chromium only
