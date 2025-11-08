import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * Supports testing both Team Frontend (port 5173) and GM Dashboard (port 3002)
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Maximum time one test can run for
  timeout: 60 * 1000, // Increased to 60s for integration tests

  // Run tests in files sequentially for integration tests
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Shared settings for all the projects below
  use: {
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on first retry
    video: 'retain-on-failure',

    // Headless mode settings
    headless: true,

    // Increase timeout for slow network requests
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Configure test projects
  projects: [
    // =============================================
    // TEAM FRONTEND TESTS (Port 5173)
    // =============================================
    {
      name: 'team-frontend',
      testMatch: /level1-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        },
      },
    },

    // =============================================
    // GM DASHBOARD TESTS (Port 3002)
    // =============================================
    {
      name: 'gm-dashboard',
      testMatch: /gm-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3002',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        },
      },
    },

    // =============================================
    // FULL INTEGRATION TESTS (Multi-service)
    // =============================================
    {
      name: 'integration',
      testMatch: /integration-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Integration tests will handle multiple URLs
        baseURL: 'http://localhost:3002', // Start with GM Dashboard
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        },
      },
    },

    // =============================================
    // CROSS-BROWSER TESTS (Optional - only critical tests)
    // =============================================
    {
      name: 'firefox-team-frontend',
      testMatch: /level1-complete-journey\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], baseURL: 'http://localhost:5173' },
    },
    {
      name: 'firefox-gm-dashboard',
      testMatch: /gm-dashboard-flow\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], baseURL: 'http://localhost:3002' },
    },

    // =============================================
    // MOBILE TESTS (Optional)
    // =============================================
    {
      name: 'mobile',
      testMatch: /level1-accessibility\.spec\.ts/,
      use: { ...devices['iPhone 12'], baseURL: 'http://localhost:5173' },
    },
  ],

  // Do NOT auto-start servers - they will be started by run-e2e-tests.sh
  // This allows better control and proper cleanup
  webServer: undefined,
});
