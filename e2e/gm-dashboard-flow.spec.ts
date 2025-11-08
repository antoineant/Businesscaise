import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for GM Dashboard
 * Tests the complete Game Master workflow from registration to game management
 */

// Generate unique test data for each test run
const generateTestGM = () => ({
  name: 'Test Game Master',
  email: `gm-test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@businesscaise.com`,
  password: 'TestGM123!',
});

const TEST_GM = generateTestGM();

const TEST_GAME = {
  title: `E2E Test Game ${Date.now()}`,
  description: 'Automated test game for E2E testing',
  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

// Helper: Register a new GM account (adaptive - handles both GM Dashboard and Team Frontend pages)
async function registerGM(page: Page) {
  await page.goto('/register', { waitUntil: 'networkidle' });

  // Capture browser console errors
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
      console.log(`[DIAGNOSTIC] Browser console: ${msg.type()} - ${msg.text()}`);
    }
  });

  // Wait for page to fully load and detect which registration page we're on
  await page.waitForLoadState('domcontentloaded');
  const h1Text = await page.locator('h1').textContent({ timeout: 10000 });
  const currentUrl = page.url();

  console.log(`[DIAGNOSTIC] Registration page loaded: h1="${h1Text}", url="${currentUrl}"`);

  // Adaptive logic: detect and handle the correct registration page
  let needsRadioButton = false;
  if (h1Text?.includes('Create GM Account')) {
    console.log('[DIAGNOSTIC] ✓ On GM Dashboard dedicated registration page');
    needsRadioButton = false;
  } else if (h1Text?.includes('BusinessCaise')) {
    console.warn('[DIAGNOSTIC] ⚠️  On Team Frontend shared registration page - GM Dashboard may not be ready');
    needsRadioButton = true;
  } else {
    throw new Error(
      `[DIAGNOSTIC] Unknown registration page! h1="${h1Text}", url="${currentUrl}". ` +
      `Expected "Create GM Account" (GM Dashboard) or "BusinessCaise" (Team Frontend). ` +
      `This suggests the service isn't fully started.`
    );
  }

  // Select "Game Master" role if on shared registration page
  if (needsRadioButton) {
    await page.click('label:has-text("Game Master")');
    console.log('[DIAGNOSTIC] Selected "Game Master" account type');
  }

  await page.fill('input[type="text"], input#name', TEST_GM.name);
  await page.fill('input[type="email"], input#email', TEST_GM.email);
  const passwordFields = await page.locator('input[type="password"]').all();
  await passwordFields[0].fill(TEST_GM.password);
  await passwordFields[1].fill(TEST_GM.password);

  // Log all network requests to debug API call issues
  const apiCalls: string[] = [];
  const apiResponses: string[] = [];
  const networkErrors: string[] = [];

  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('/auth/')) {
      apiCalls.push(`${request.method()} ${request.url()}`);
      console.log(`[DIAGNOSTIC] Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('requestfailed', request => {
    if (request.url().includes('/api/') || request.url().includes('/auth/')) {
      const failure = request.failure();
      networkErrors.push(`${request.method()} ${request.url()} - ${failure?.errorText || 'unknown error'}`);
      console.log(`[DIAGNOSTIC] Request FAILED: ${request.method()} ${request.url()} - ${failure?.errorText}`);
    }
  });

  // Set up response listener BEFORE clicking submit (non-blocking)
  let capturedResponse: any = null;
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();

    // Log ALL responses to see what we're getting
    if (url.includes('/api/') || url.includes('/auth/')) {
      apiResponses.push(`${status} ${url}`);
      console.log(`[DIAGNOSTIC] Response: ${status} ${url}`);
    }

    if (url.includes('/auth/register')) {
      try {
        const body = await response.json().catch(() => response.text().catch(() => 'Could not parse'));
        capturedResponse = { status, body };
        console.log(`[DIAGNOSTIC] Captured /auth/register response: ${status} ${JSON.stringify(body)}`);
      } catch (err) {
        console.log(`[DIAGNOSTIC] Error parsing response: ${err}`);
      }
    }
  });

  await page.click('button[type="submit"]');

  // Wait for EITHER success (redirect) OR error message (failure)
  // Note: GM Dashboard redirects to /dashboard, Team Frontend might redirect to /dashboard or /games
  const outcome = await Promise.race([
    page.waitForURL('/dashboard', { timeout: 10000 }).then(() => ({ success: true })),
    page.waitForURL('/games', { timeout: 10000 }).then(() => ({ success: true })),
    page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
      .then(() => ({ success: false }))
  ]);

  if (!outcome.success) {
    // Registration failed - get detailed error info
    const uiError = await page.locator('.bg-red-50, [class*="error"]').textContent();

    // Give a moment for response listener to finish
    await page.waitForTimeout(500);

    let apiError = 'No API response captured';
    if (capturedResponse) {
      apiError = `API ${capturedResponse.status}: ${typeof capturedResponse.body === 'string' ? capturedResponse.body : JSON.stringify(capturedResponse.body)}`;
    }

    // Log all API calls and responses
    console.log(`[DIAGNOSTIC] API calls made:`, apiCalls);
    console.log(`[DIAGNOSTIC] API responses received:`, apiResponses);
    console.log(`[DIAGNOSTIC] Network errors:`, networkErrors);
    console.log(`[DIAGNOSTIC] Browser console messages:`, consoleMessages);
    console.log(`[DIAGNOSTIC] Current URL: ${page.url()}`);

    throw new Error(
      `Registration failed. UI: "${uiError}". ${apiError}. ` +
      `Calls: ${apiCalls.join(', ') || 'none'}. ` +
      `Responses: ${apiResponses.join(', ') || 'none'}. ` +
      `Network errors: ${networkErrors.join(', ') || 'none'}. ` +
      `Browser console: ${consoleMessages.join('; ') || 'none'}`
    );
  }

  console.log(`[DIAGNOSTIC] ✓ Registration successful, redirected to ${page.url()}`);
}

// Helper: Login as existing GM
async function loginGM(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_GM.email);
  await page.fill('input[type="password"]', TEST_GM.password);
  await page.click('button[type="submit"]');

  // Wait for EITHER success (redirect to /games) OR error message (failure)
  await Promise.race([
    page.waitForURL('/games', { timeout: 10000 }),
    page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
      .then(async () => {
        const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent();
        throw new Error(`Login failed: ${errorText}`);
      })
  ]);
}

// Helper: Create a new game
async function createGame(page: Page): Promise<string> {
  await page.getByRole('button', { name: /create game/i }).click();
  await page.waitForURL('/games/create');

  await page.getByLabel(/title/i).fill(TEST_GAME.title);
  await page.getByLabel(/description/i).fill(TEST_GAME.description);
  await page.getByLabel(/start.*date/i).fill(TEST_GAME.startDate);
  await page.getByLabel(/end.*date/i).fill(TEST_GAME.endDate);

  await page.getByRole('button', { name: /create|submit/i }).click();

  // Wait for EITHER success (redirect to game page) OR error message (failure)
  await Promise.race([
    page.waitForURL(/\/games\/[a-f0-9-]+$/, { timeout: 10000 }),
    page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
      .then(async () => {
        const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent();
        throw new Error(`Game creation failed: ${errorText}`);
      })
  ]);

  // Extract game ID from URL
  const url = page.url();
  const gameId = url.match(/\/games\/([a-f0-9-]+)/)?.[1];
  expect(gameId).toBeTruthy();

  return gameId!;
}

test.describe('GM Dashboard - Authentication Flow', () => {
  test('should register new GM account successfully', async ({ page }) => {
    await registerGM(page);

    // Should be on games list page (the main dashboard)
    await expect(page).toHaveURL('/games');

    // Should see games list page heading
    await expect(page.getByRole('heading', { name: /my games/i })).toBeVisible();

    // Should see GM name in navigation
    await expect(page.getByText(TEST_GM.name)).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/gm-dashboard-after-register.png',
      fullPage: true
    });
  });

  test('should login with existing GM account', async ({ page }) => {
    // First register the user (ensure it exists)
    await registerGM(page);

    // Logout to test login
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL('/login');

    // Now login with same credentials
    await loginGM(page);

    // Should be on games list page (the main dashboard)
    await expect(page).toHaveURL('/games');
    await expect(page.getByRole('heading', { name: /my games/i })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First register the user (ensure it exists)
    await registerGM(page);

    // Now logout
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should reject non-GM accounts', async ({ page }) => {
    // This assumes player accounts are rejected at login
    // If your system allows players to attempt login, implement this test
    // For now, we'll skip if not applicable
    test.skip();
  });
});

test.describe('GM Dashboard - Game Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test (ensure test isolation)
    await registerGM(page);
  });

  test('should create a new game successfully', async ({ page }) => {
    const gameId = await createGame(page);

    // Should be on game details page
    await expect(page).toHaveURL(`/games/${gameId}`);

    // Should see game title
    await expect(page.getByRole('heading', { name: new RegExp(TEST_GAME.title, 'i') })).toBeVisible();

    // Should see game description
    await expect(page.getByText(TEST_GAME.description)).toBeVisible();

    // Should see stats cards
    await expect(page.getByText('Teams')).toBeVisible();
    await expect(page.getByText('Sessions')).toBeVisible();

    // Should see 10 sessions (0 unlocked initially)
    await expect(page.getByText('0/10')).toBeVisible();

    // Should see all 10 sessions listed
    const sessions = page.locator('[class*="session"], [class*="rounded-lg border"]');
    await expect(sessions).toHaveCount(10, { timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/gm-dashboard-game-created.png',
      fullPage: true
    });
  });

  test('should start a game', async ({ page }) => {
    const gameId = await createGame(page);

    // Game should start in draft status
    await expect(page.getByText('Draft')).toBeVisible();

    // Click start game button
    await page.getByRole('button', { name: /start game/i }).click();

    // Status should now be active
    await expect(page.getByText('Active')).toBeVisible();

    // Start button should be replaced with pause button
    await expect(page.getByRole('button', { name: /pause game/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/gm-dashboard-game-started.png',
      fullPage: true
    });
  });

  test('should pause and resume a game', async ({ page }) => {
    const gameId = await createGame(page);

    // Start the game first
    await page.getByRole('button', { name: /start game/i }).click();

    // Pause the game
    await page.getByRole('button', { name: /pause game/i }).click();
    await expect(page.getByText('Paused')).toBeVisible();

    // Resume the game
    await page.getByRole('button', { name: /resume game/i }).click();
    await expect(page.getByText('Active')).toBeVisible();
  });

  test('should unlock sessions', async ({ page }) => {
    const gameId = await createGame(page);

    // Start the game first
    await page.getByRole('button', { name: /start game/i }).click();

    // Find first unlock button
    const firstUnlockButton = page.getByRole('button', { name: /unlock/i }).first();
    await expect(firstUnlockButton).toBeVisible();

    // Click to unlock
    await firstUnlockButton.click();

    // Should see "Unlocked" text or green indicator
    await expect(page.getByText('Unlocked').first()).toBeVisible();

    // Sessions count should update to 1/10
    await expect(page.getByText('1/10')).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/gm-dashboard-session-unlocked.png',
      fullPage: true
    });
  });

  test('should delete a game', async ({ page }) => {
    const gameId = await createGame(page);

    // Go back to games list
    await page.click('a:has-text("Games"), button[aria-label="Back"]');
    await page.waitForURL('/games');

    // Find the delete button for our game
    const gameCard = page.locator(`text=${TEST_GAME.title}`).locator('..');
    const deleteButton = gameCard.locator('button[title="Delete game"]');

    // Listen for confirm dialog
    page.on('dialog', dialog => dialog.accept());

    await deleteButton.click();

    // Game should no longer be visible
    await expect(page.locator(`text=${TEST_GAME.title}`)).not.toBeVisible();
  });

  test('should display empty state when no games exist', async ({ page }) => {
    await page.goto('/games');

    // Delete all test games first (if any)
    const deleteButtons = await page.locator('button[title="Delete game"]').all();
    for (const button of deleteButtons) {
      page.on('dialog', dialog => dialog.accept());
      await button.click();
      await page.waitForTimeout(500);
    }

    // Should see empty state
    await expect(page.getByText('No games yet')).toBeVisible();
    await expect(page.getByText('Create Your First Game')).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/gm-dashboard-empty-state.png',
      fullPage: true
    });
  });
});

test.describe('GM Dashboard - Navigation and UI', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test (ensure test isolation)
    await registerGM(page);
  });

  test('should navigate between pages', async ({ page }) => {
    // Start at games list
    await expect(page).toHaveURL('/games');

    // Navigate to create game
    await page.getByRole('button', { name: /create game/i }).click();
    await expect(page).toHaveURL('/games/create');

    // Navigate back to games list
    await page.click('button:has([class*="arrow"]), a:has-text("Games")');
    await expect(page).toHaveURL('/games');
  });

  test('should display correct game status badges', async ({ page }) => {
    const gameId = await createGame(page);

    // Draft status
    await expect(page.getByText('Draft')).toBeVisible();

    // Start game
    await page.getByRole('button', { name: /start game/i }).click();

    // Active status
    await expect(page.getByText('Active')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/games');

    // Main content should still be visible
    await expect(page.getByRole('heading', { name: /my games/i })).toBeVisible();

    // Create button should be visible
    await expect(page.getByRole('button', { name: /create game/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/gm-dashboard-mobile.png',
      fullPage: true
    });
  });
});

test.describe('GM Dashboard - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login before each test (ensure test isolation)
    await registerGM(page);
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/games/create');

    // Try to submit without title
    await page.getByRole('button', { name: /create|submit/i }).click();

    // Should see validation error (HTML5 validation)
    const titleInput = page.getByLabel(/title/i);
    await expect(titleInput).toBeFocused();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This test would require mocking network failures
    // For now, we'll skip it
    test.skip();
  });
});
