import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],

  /* Shared settings for all projects. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8081',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global timeout for each action (e.g. click, fill, etc.) */
    actionTimeout: 30000,

    /* Global timeout for each navigation action */
    navigationTimeout: 30000,
  },

  /* Configure projects for different test execution modes */
  projects: [
    {
      name: 'site-tests',
      testMatch: ['tests/site.spec.ts'],
      fullyParallel: true,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'smoke-tests',
      testMatch: ['tests/e2e/smoke/*.spec.js'],
      fullyParallel: true,
      // workers: process.env.CI ? 1 : undefined,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'parallel-e2e-tests',
      testMatch: ['tests/e2e/queries/*.spec.js'],
      fullyParallel: true,
      // workers: process.env.CI ? 1 : undefined,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1920, height: 1080 }
      },
    },
    // Skip state transitions tests in CI environments
    // These are very slow-running due to https://github.com/dashpay/platform/issues/2736
    ...(process.env.CI ? [] : [{
      name: 'sequential-e2e-tests',
      testMatch: ['tests/e2e/transitions/*.spec.js'],
      fullyParallel: false,
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1920, height: 1080 }
      },
    }]),
  ],

  /* Run local dev server only if testing locally */
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: process.env.DEBUG ? 'python3 -m http.server 8081' : 'python3 -m http.server 8081 2>/dev/null',
    url: 'http://localhost:8081',
    cwd: 'public',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },

  /* Global test timeout */
  timeout: 120000,

  /* Expect timeout for assertions */
  expect: {
    timeout: 10000,
  },
});

