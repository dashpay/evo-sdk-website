# Evo SDK Testing Suite

Testing suite for the Evo SDK web interface using Playwright.

## Features

- **Project-based test organization** (site, smoke, queries, transitions)
- **Cross-browser testing** with Chromium support
- **Automated parameter injection** from centralized test data
- **Page Object Model** for maintainable test code
- **Network switching** (testnet/mainnet) testing
- **Comprehensive reporting** with screenshots and videos on failure

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Python 3 for serving the web interface
- Evo SDK built at `public/dist/sdk.js`

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
yarn test:transitions   # State transition tests

# Interactive modes
yarn test:ui            # Visual test runner

# View results
yarn test:report        # Open HTML report
```

**Using the comprehensive test runner** (recommended for validation):

```bash
# From tests/e2e/ directory - includes setup validation
./run-ui-tests.sh smoke       # Basic functionality tests
./run-ui-tests.sh queries     # Query execution tests
./run-ui-tests.sh transitions # State transition tests
./run-ui-tests.sh all         # Run all tests (default)

# Interactive modes via script
./run-ui-tests.sh headed      # Run with visible browser
./run-ui-tests.sh ui          # Visual test runner
./run-ui-tests.sh debug       # Debug mode

# Debug with detailed output
DEBUG=true ./run-ui-tests.sh smoke
```

## Test Organization

### Test Projects

The test suite is organized into four distinct projects:

1. **site-tests** (3 tests) - `tests/site.spec.ts`
   - Basic website functionality
   - Documentation page loading
   - Simple query execution

2. **smoke-tests** (27 tests) - `tests/e2e/smoke/basic-smoke.spec.js`
   - SDK initialization and UI validation
   - Network switching functionality
   - Basic interaction flows
   - State transition UI validation

3. **query-tests** (109 tests) - `tests/e2e/queries/query-execution.spec.js`
   - Identity queries (getIdentity, getIdentityBalance, etc.)
   - Data contract queries (getDataContract, getDataContracts, etc.)
   - Document queries (getDocuments, getDocument)
   - System queries (getStatus, getCurrentEpoch, etc.)
   - Token, DPNS, voting, and protocol queries
   - Error handling and proof support testing

4. **transition-tests** (26 tests) - `tests/e2e/transitions/state-transitions.spec.js`
   - Data contract create/update transitions
   - Document create/replace/delete/transfer transitions
   - Identity credit transfer/withdrawal transitions
   - Token mint/transfer/burn/freeze transitions
   - Authentication input validation

### Directory Structure

```text
tests/
├── site.spec.ts              # Basic site functionality tests
└── e2e/                      # E2E test suite
    ├── smoke/                # Quick validation tests
    │   └── basic-smoke.spec.js
    ├── queries/              # Query execution tests
    │   └── query-execution.spec.js
    ├── transitions/          # State transition tests
    │   └── state-transitions.spec.js
    ├── utils/                # Test utilities and page objects
    │   ├── base-test.js      # Base test functionality
    │   ├── sdk-page.js       # Page Object Model for SDK interface
    │   └── parameter-injector.js # Parameter injection system
    ├── fixtures/             # Test data and fixtures
    │   └── test-data.js      # Centralized test parameters
    ├── run-ui-tests.sh       # Comprehensive test runner script
    └── README.md             # This file
```

## Configuration

### Playwright Setup

The testing suite uses a unified configuration approach:

- **Dependencies**: In `package.json`
- **Configuration**: `playwright.config.ts` in root directory
- **Base URL**: `http://localhost:8081` (auto-managed web server, configurable via `PLAYWRIGHT_BASE_URL`)
- **Browsers**: Chromium (headless by default)
- **Timeouts**: 30s for actions, 120s for tests
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
yarn test:smoke            # Run smoke tests only
yarn test:queries          # Run query tests only
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

### run-ui-tests.sh Script

```bash
# Basic execution with validation
./run-ui-tests.sh [smoke|queries|transitions|all]

# Interactive modes
./run-ui-tests.sh [headed|debug|ui]

# Environment options
DEBUG=true ./run-ui-tests.sh smoke                              # Detailed output
PLAYWRIGHT_BASE_URL=https://example.com/ ./run-ui-tests.sh smoke # Test remote site
```

### Direct Playwright Commands

```bash
# From root directory
yarn playwright test --project=site-tests
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

- **Site tests**: Basic website functionality → `tests/site.spec.ts`
- **Smoke tests**: SDK UI validation → `tests/e2e/smoke/basic-smoke.spec.js`
- **Query tests**: Query execution → `tests/e2e/queries/query-execution.spec.js`
- **Transition tests**: State transitions → `tests/e2e/transitions/state-transitions.spec.js`

## CI/CD Integration

### Automatic Execution

Tests are configured for CI environments with:

- **Conditional execution**: Slow tests (transitions) skip in CI
- **Proper retry logic**: 2 retries on CI
- **Multiple reporters**: GitHub Actions, JSON, HTML
- **Artifact collection**: Screenshots, videos, traces

### CI Commands

```bash
# In CI environment
yarn test:ci              # CI-friendly output
./run-ui-tests.sh all     # Full validation with setup checks

# Results available in:
# - playwright-report/ (HTML)
# - test-results.json (JSON)
# - test-results/ (screenshots, videos)
```

## When to Use What

**Use `yarn test:*`** when:

- Everything is already set up
- Quick development iteration
- Running specific test categories

**Use `run-ui-tests.sh`** when:

- First time setup
- Validating environment prerequisites
- Need automatic dependency installation
- Running in CI/CD environments
- Want detailed progress output

## Troubleshooting

### Common Issues

1. **Missing dependencies**: Run `yarn install && yarn install-browsers`
2. **Port conflicts**: Playwright auto-manages port 8081
3. **SDK not built**: Ensure `public/dist/sdk.js` exists
4. **Test timeouts**: Use `DEBUG=true ./run-ui-tests.sh` for details

### Debug Mode

```bash
# Detailed execution logs
DEBUG=true ./run-ui-tests.sh smoke

# Visual debugging
yarn test:ui
```

## Support

For issues or questions:

1. **Environment validation**: `./run-ui-tests.sh` with DEBUG mode
2. **Visual debugging**: Check HTML reports in `playwright-report/`
3. **Test artifacts**: Review screenshots/videos in `test-results/`
4. **Configuration**: Verify `playwright.config.ts` in root directory
5. **Dependencies**: Ensure unified setup with root `package.json`

## Known Issues & Limitations

- State transition tests are slow and skip in CI environments
- Some queries don't support proof information (tests automatically adapt)
- Currently configured for Chromium only
