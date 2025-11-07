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

// Helper: Register a new GM account
async function registerGM(page: Page) {
  await page.goto('/register');

  // Wait for page to load by checking visible heading
  await expect(page.locator('h1')).toContainText('Create GM Account');

  await page.fill('input[type="text"]', TEST_GM.name);
  await page.fill('input[type="email"]', TEST_GM.email);
  const passwordFields = await page.locator('input[type="password"]').all();
  await passwordFields[0].fill(TEST_GM.password);
  await passwordFields[1].fill(TEST_GM.password);

  // Listen for network response to catch errors
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/auth/register'),
    { timeout: 10000 }
  );

  await page.click('button[type="submit"]');

  // Wait for the API response
  const response = await responsePromise;

  // If registration failed, throw detailed error
  if (!response.ok()) {
    const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
    const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent().catch(() => '');
    throw new Error(
      `Registration failed with status ${response.status()}: ${JSON.stringify(errorBody)}. ` +
      `Page error: "${errorText}"`
    );
  }

  // Wait for redirect to games page
  await page.waitForURL('/games', { timeout: 10000 });
}

// Helper: Login as existing GM
async function loginGM(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_GM.email);
  await page.fill('input[type="password"]', TEST_GM.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/games', { timeout: 10000 });
}

// Helper: Create a new game
async function createGame(page: Page): Promise<string> {
  await page.click('button:has-text("Create Game"), a:has-text("Create Game")');
  await page.waitForURL('/games/create');

  await page.fill('input#title', TEST_GAME.title);
  await page.fill('textarea#description', TEST_GAME.description);
  await page.fill('input#startDate', TEST_GAME.startDate);
  await page.fill('input#endDate', TEST_GAME.endDate);

  await page.click('button[type="submit"]');

  // Wait for redirect to game details page
  await page.waitForURL(/\/games\/[a-f0-9-]+$/, { timeout: 10000 });

  // Extract game ID from URL
  const url = page.url();
  const gameId = url.match(/\/games\/([a-f0-9-]+)/)?.[1];
  expect(gameId).toBeTruthy();

  return gameId!;
}

test.describe('GM Dashboard - Authentication Flow', () => {
  test('should register new GM account successfully', async ({ page }) => {
    await registerGM(page);

    // Should be on games page
    await expect(page).toHaveURL('/games');

    // Should see empty state or games list
    const heading = page.locator('h1');
    await expect(heading).toContainText('My Games');

    // Should see GM name in navigation
    await expect(page.locator('text=' + TEST_GM.name)).toBeVisible();

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
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');

    // Now login with same credentials
    await loginGM(page);

    // Should be on games page
    await expect(page).toHaveURL('/games');
    await expect(page.locator('h1')).toContainText('My Games');
  });

  test('should logout successfully', async ({ page }) => {
    // First register the user (ensure it exists)
    await registerGM(page);

    // Now logout
    await page.click('button:has-text("Logout")');

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
    await expect(page.locator('h1')).toContainText(TEST_GAME.title);

    // Should see game description
    await expect(page.locator(`text=${TEST_GAME.description}`)).toBeVisible();

    // Should see stats cards
    await expect(page.locator('text=Teams')).toBeVisible();
    await expect(page.locator('text=Sessions')).toBeVisible();

    // Should see 10 sessions (0 unlocked initially)
    await expect(page.locator('text=0/10')).toBeVisible();

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
    await expect(page.locator('text=draft')).toBeVisible();

    // Click start game button
    await page.click('button:has-text("Start Game")');

    // Wait for status to change
    await page.waitForTimeout(1000);

    // Status should now be active
    await expect(page.locator('text=active')).toBeVisible();

    // Start button should be replaced with pause button
    await expect(page.locator('button:has-text("Pause Game")')).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/gm-dashboard-game-started.png',
      fullPage: true
    });
  });

  test('should pause and resume a game', async ({ page }) => {
    const gameId = await createGame(page);

    // Start the game first
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(1000);

    // Pause the game
    await page.click('button:has-text("Pause Game")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=paused')).toBeVisible();

    // Resume the game
    await page.click('button:has-text("Resume Game")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=active')).toBeVisible();
  });

  test('should unlock sessions', async ({ page }) => {
    const gameId = await createGame(page);

    // Start the game first
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(1000);

    // Find first unlock button
    const firstUnlockButton = page.locator('button:has-text("Unlock")').first();
    await expect(firstUnlockButton).toBeVisible();

    // Click to unlock
    await firstUnlockButton.click();
    await page.waitForTimeout(1500);

    // Should see "Unlocked" text or green indicator
    await expect(page.locator('text=Unlocked').first()).toBeVisible();

    // Sessions count should update to 1/10
    await expect(page.locator('text=1/10')).toBeVisible({ timeout: 5000 });

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
    await page.waitForTimeout(1000);

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
    await expect(page.locator('text=No games yet')).toBeVisible();
    await expect(page.locator('text=Create Your First Game')).toBeVisible();

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
    await page.click('button:has-text("Create Game"), a:has-text("Create Game")');
    await expect(page).toHaveURL('/games/create');

    // Navigate back to games list
    await page.click('button:has([class*="arrow"]), a:has-text("Games")');
    await expect(page).toHaveURL('/games');
  });

  test('should display correct game status badges', async ({ page }) => {
    const gameId = await createGame(page);

    // Draft status
    const draftBadge = page.locator('text=draft');
    await expect(draftBadge).toBeVisible();

    // Start game
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(1000);

    // Active status
    const activeBadge = page.locator('text=active');
    await expect(activeBadge).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/games');

    // Main content should still be visible
    await expect(page.locator('h1')).toBeVisible();

    // Create button should be visible
    await expect(page.locator('button:has-text("Create Game"), a:has-text("Create Game")')).toBeVisible();

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
    await page.click('button[type="submit"]');

    // Should see validation error (HTML5 validation)
    const titleInput = page.locator('input#title');
    await expect(titleInput).toBeFocused();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This test would require mocking network failures
    // For now, we'll skip it
    test.skip();
  });
});
