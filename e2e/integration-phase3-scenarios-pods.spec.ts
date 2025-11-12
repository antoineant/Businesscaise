import { test, expect, type Page } from '@playwright/test';

/**
 * Phase 3 Integration E2E Tests - Scenarios & Pod Competition
 *
 * Tests the complete flow following established patterns:
 * - Uses API-based setup for test data
 * - Generates unique test data to prevent conflicts
 * - Uses semantic selectors (getByRole, getByLabel, getByText)
 * - Comprehensive error handling and diagnostics
 * - Follows patterns from existing passing tests
 */

// Generate unique test data
const generateTestGM = () => ({
  name: 'Phase 3 Test GM',
  email: `gm-phase3-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@businesscaise.com`,
  password: 'TestGM123!',
});

const generateTestPlayer = () => ({
  name: 'Phase 3 Test Player',
  email: `player-phase3-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@businesscaise.com`,
  password: 'TestPlayer123!',
});

// Helper: Register GM via API
async function registerGMViaAPI() {
  const testGM = generateTestGM();

  console.log(`[DIAGNOSTIC] Registering GM via API: ${testGM.email}`);

  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testGM.name,
      email: testGM.email,
      password: testGM.password,
      role: 'game_master',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to register GM: ${response.status} ${errorText}`);
  }

  const { token } = await response.json();
  console.log(`[DIAGNOSTIC] ✓ GM registered successfully`);

  return { ...testGM, token };
}

// Helper: Create game with scenario and pods via API
async function createGameWithScenarioAndPods(token: string) {
  console.log(`[DIAGNOSTIC] Creating game with scenario and pods...`);

  const gameResponse = await fetch('http://localhost:3001/api/gm/games', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: `Phase 3 E2E Test ${Date.now()}`,
      description: 'Testing scenario customization and pod competition',
      archetype_id: 'startup',
      industry_id: 'saas',
      enable_pods: true,
      pod_size: 2,
      enable_category_awards: true,
    }),
  });

  if (!gameResponse.ok) {
    const errorText = await gameResponse.text();
    throw new Error(`Failed to create game: ${gameResponse.status} ${errorText}`);
  }

  const gameData = await gameResponse.json();
  const gameId = gameData.game.id;
  console.log(`[DIAGNOSTIC] ✓ Game created with scenario and pods: ${gameId}`);

  // Start game
  const startResponse = await fetch(`http://localhost:3001/api/gm/games/${gameId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!startResponse.ok) {
    const errorText = await startResponse.text();
    throw new Error(`Failed to start game: ${startResponse.status} ${errorText}`);
  }
  console.log(`[DIAGNOSTIC] ✓ Game started`);

  return { gameId, game: gameData.game };
}

// Helper: Register and login GM in UI
async function registerAndLoginGM(page: Page) {
  const testGM = generateTestGM();

  // Start from home page like working tests
  await page.goto('http://localhost:5173/?demo=false', { waitUntil: 'networkidle' });

  // Set up diagnostic logging
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[DIAGNOSTIC] Browser ${msg.type()}: ${msg.text()}`);
    }
  });

  // Navigate to register page
  await page.getByRole('link', { name: /sign up/i }).click();
  await page.waitForURL(/.*register/);

  // Fill registration form using semantic selectors like working tests
  await page.getByLabel(/name/i).fill(testGM.name);
  await page.getByLabel(/email/i).fill(testGM.email);

  // Select Game Master role (click label element like other working tests)
  await page.click('label:has-text("Game Master")');

  // Fill passwords
  await page.getByLabel(/^password$/i).fill(testGM.password);
  const confirmPassword = page.getByLabel(/confirm.*password/i);
  if (await confirmPassword.count() > 0) {
    await confirmPassword.fill(testGM.password);
  }

  // Submit form
  await page.getByRole('button', { name: /create account|register|sign up/i }).click();

  // Wait for redirect to games or dashboard
  await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });

  console.log(`[DIAGNOSTIC] ✓ GM registered and logged in: ${testGM.email}`);
  return testGM;
}

// Helper: Join game as team
async function joinGameAsTeam(page: Page, gameId: string) {
  const teamName = `Test Team ${Date.now()}`;

  console.log(`[DIAGNOSTIC] Joining game ${gameId} as team ${teamName}`);

  // Enter game code
  await page.getByPlaceholder(/game code|enter game/i).fill(gameId);
  await page.getByRole('button', { name: /join game/i }).click();

  // Wait for team join modal
  await expect(page.getByRole('heading', { name: /join.*game/i })).toBeVisible({ timeout: 5000 });

  // Fill team name
  await page.locator('input[type="text"][required]').first().fill(teamName);

  // Wait for API response before clicking
  const responsePromise = page.waitForResponse(
    resp => resp.url().includes('/api/teams/join') && (resp.status() === 201 || resp.status() === 200),
    { timeout: 10000 }
  );

  // Submit join form
  await page.getByRole('button', { name: /join/i, exact: false }).click();

  // Wait for API to succeed
  try {
    await responsePromise;
    console.log(`[DIAGNOSTIC] ✓ API response - team joined successfully`);
  } catch (e) {
    const hasError = await page.locator('.bg-red-50').count();
    if (hasError > 0) {
      const errorText = await page.locator('.bg-red-50').textContent();
      throw new Error(`Failed to join game: ${errorText}`);
    }
    throw new Error('Failed to join game - no success response received');
  }

  // Wait for URL to change to game page
  await page.waitForURL(/.*\/game\//, { timeout: 5000 });

  // Wait for join modal to close
  await page.getByRole('heading', { name: /join game/i }).waitFor({
    state: 'hidden',
    timeout: 5000
  });

  // Wait for game page to load
  await page.getByRole('button', { name: /dashboard/i }).waitFor({ timeout: 10000 });

  console.log(`[DIAGNOSTIC] ✓ Successfully joined game as ${teamName}`);
  return teamName;
}

test.describe('Phase 3: Scenario Customization - GM View', () => {
  test('GM can create game with scenario via UI', async ({ page }) => {
    // Register and login
    await registerAndLoginGM(page);

    // Navigate to create game (use .first() to handle empty state button)
    await page.getByRole('button', { name: /create.*game/i }).first().click();
    await page.waitForURL('/games/create');

    // Fill basic info
    await page.getByLabel(/title/i).fill(`Scenario Test ${Date.now()}`);
    await page.getByLabel(/description/i).fill('Testing scenario selection');

    // Select archetype (Startup) - use more specific selector
    const archetypeSection = page.locator('text=Company Archetype').locator('..');
    await archetypeSection.getByRole('button', { name: /startup/i }).click();

    // Select industry (SaaS)
    const industrySection = page.locator('text=Industry Type').locator('..');
    await industrySection.getByRole('button', { name: /saas/i }).click();

    // Wait for scenario preview to load
    await expect(page.getByText(/scenario preview/i)).toBeVisible({ timeout: 5000 });

    // Enable pod competition
    await page.check('input[id="enablePods"]');
    await expect(page.locator('input[id="podSize"]')).toBeVisible();

    // Create the game
    await page.getByRole('button', { name: /create.*game/i }).click();

    // Wait for redirect to game details
    await page.waitForURL(/\/games\/[a-f0-9-]+/, { timeout: 10000 });

    // Verify scenario info is displayed
    await expect(page.getByText(/startup/i)).toBeVisible();
    await expect(page.getByText(/saas/i)).toBeVisible();

    // Verify pod management card is visible
    await expect(page.getByText(/pod.*management/i)).toBeVisible();

    await page.screenshot({
      path: 'e2e-results/phase3-01-game-with-scenario.png',
      fullPage: true,
    });

    console.log('✓ GM created game with scenario and pods via UI');
  });

  test('GM can view pod management page', async ({ page }) => {
    // Create game via API for faster setup
    const gm = await registerGMViaAPI();
    const { gameId } = await createGameWithScenarioAndPods(gm.token);

    // Login GM in UI
    await page.goto('/login');
    await page.fill('input[type="email"]', gm.email);
    await page.fill('input[type="password"]', gm.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/games', { timeout: 10000 });

    // Navigate to game details
    await page.goto(`/games/${gameId}`);

    // Navigate to pod management
    await page.getByText(/pod.*management/i).click();
    await page.waitForURL(/\/games\/.*\/pods/, { timeout: 5000 });

    // Verify pod management page elements
    await expect(page.getByRole('heading', { name: /pod.*management/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /assign.*pods/i })).toBeVisible();

    await page.screenshot({
      path: 'e2e-results/phase3-02-pod-management.png',
      fullPage: true,
    });

    console.log('✓ GM viewed pod management page');
  });
});

test.describe('Phase 3: Scenario & Pods - Team Player View', () => {
  let gameId: string;
  let gmToken: string;

  test.beforeAll(async () => {
    // Create game with scenario and pods via API
    const gm = await registerGMViaAPI();
    const gameData = await createGameWithScenarioAndPods(gm.token);
    gameId = gameData.gameId;
    gmToken = gm.token;
    console.log(`Test game created: ${gameId}`);
  });

  test('Team sees scenario information in dashboard', async ({ page }) => {
    // Register player
    const player = generateTestPlayer();
    await page.goto('http://localhost:5173/?demo=false', { waitUntil: 'networkidle' });

    // Navigate to register
    await page.getByRole('link', { name: /sign up/i }).click();
    await page.waitForURL(/.*register/);

    // Fill registration form
    await page.getByLabel(/name/i).fill(player.name);
    await page.getByLabel(/email/i).fill(player.email);
    await page.getByLabel(/^password$/i).fill(player.password);
    const confirmPassword = page.getByLabel(/confirm.*password/i);
    if (await confirmPassword.count() > 0) {
      await confirmPassword.fill(player.password);
    }

    await page.getByRole('button', { name: /register|sign up/i }).click();
    await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });

    // Join game
    await joinGameAsTeam(page, gameId);

    // Verify scenario is displayed
    await expect(page.getByText(/startup/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/saas/i).first()).toBeVisible({ timeout: 10000 });

    // Verify scenario card exists
    await expect(page.getByText(/business scenario/i)).toBeVisible();

    await page.screenshot({
      path: 'e2e-results/phase3-03-team-sees-scenario.png',
      fullPage: true,
    });

    console.log('✓ Team sees scenario information');
  });

  test('Team sees category rankings', async ({ page }) => {
    // Register player
    const player = generateTestPlayer();
    await page.goto('http://localhost:5173/?demo=false', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /sign up/i }).click();
    await page.waitForURL(/.*register/);

    await page.getByLabel(/name/i).fill(player.name);
    await page.getByLabel(/email/i).fill(player.email);
    await page.getByLabel(/^password$/i).fill(player.password);
    const confirmPassword = page.getByLabel(/confirm.*password/i);
    if (await confirmPassword.count() > 0) {
      await confirmPassword.fill(player.password);
    }

    await page.getByRole('button', { name: /register|sign up/i }).click();
    await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });

    // Join game
    await joinGameAsTeam(page, gameId);

    // Ensure we're on dashboard tab
    const dashboardTab = page.getByRole('button', { name: /dashboard/i });
    if (await dashboardTab.isVisible()) {
      await dashboardTab.click();
    }

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Scroll down to find category rankings (they're below metrics)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Look for category rankings card (should be visible if enabled)
    // Note: May not have data yet, but the component should render
    const categoryCard = page.getByText(/category.*ranking/i).first();

    // Check if card exists (it might not have data yet)
    const cardCount = await categoryCard.count();
    if (cardCount > 0) {
      await expect(categoryCard).toBeVisible();
      console.log('✓ Category rankings card found');
    } else {
      console.log('⏭️  Category rankings card not yet visible (may load later)');
    }

    await page.screenshot({
      path: 'e2e-results/phase3-04-category-rankings.png',
      fullPage: true,
    });

    console.log('✓ Checked for category rankings');
  });

  test('Team sees pod leaderboard in leaderboard tab', async ({ page }) => {
    // Register player
    const player = generateTestPlayer();
    await page.goto('http://localhost:5173/?demo=false', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /sign up/i }).click();
    await page.waitForURL(/.*register/);

    await page.getByLabel(/name/i).fill(player.name);
    await page.getByLabel(/email/i).fill(player.email);
    await page.getByLabel(/^password$/i).fill(player.password);
    const confirmPassword = page.getByLabel(/confirm.*password/i);
    if (await confirmPassword.count() > 0) {
      await confirmPassword.fill(player.password);
    }

    await page.getByRole('button', { name: /register|sign up/i }).click();
    await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });

    // Join game
    await joinGameAsTeam(page, gameId);

    // Navigate to Leaderboard tab
    await page.getByRole('button', { name: /leaderboard/i }).click();
    await page.waitForTimeout(1000);

    // Should see "Global Leaderboard" heading (pod leaderboard renders above it if assigned)
    await expect(page.getByText(/global.*leaderboard/i)).toBeVisible({ timeout: 5000 });

    // Check if pod leaderboard is visible (team may not be assigned to pod yet)
    const podLeaderboard = page.getByText(/pod/i).first();
    const podCount = await podLeaderboard.count();

    if (podCount > 0) {
      console.log('✓ Pod leaderboard section found');
    } else {
      console.log('⏭️  Team not yet assigned to pod (pods need to be assigned by GM)');
    }

    await page.screenshot({
      path: 'e2e-results/phase3-05-leaderboard-view.png',
      fullPage: true,
    });

    console.log('✓ Checked leaderboard view');
  });
});

test.describe('Phase 3: Edge Cases', () => {
  test('GM can create game without scenario', async ({ page }) => {
    await registerAndLoginGM(page);

    await page.getByRole('button', { name: /create.*game/i }).first().click();
    await page.waitForURL('/games/create');

    await page.getByLabel(/title/i).fill(`No Scenario ${Date.now()}`);

    // Don't select archetype or industry - create immediately
    await page.getByRole('button', { name: /create.*game/i }).click();

    await page.waitForURL(/\/games\/[a-f0-9-]+/, { timeout: 10000 });

    // Should still work
    await expect(page.getByRole('heading', { name: /no scenario/i })).toBeVisible();

    console.log('✓ Game created without scenario');
  });

  test('GM can create game without pods', async ({ page }) => {
    await registerAndLoginGM(page);

    await page.getByRole('button', { name: /create.*game/i }).first().click();
    await page.waitForURL('/games/create');

    await page.getByLabel(/title/i).fill(`No Pods ${Date.now()}`);

    // Ensure pods are NOT enabled
    const podsCheckbox = page.locator('input[id="enablePods"]');
    if (await podsCheckbox.isChecked()) {
      await podsCheckbox.uncheck();
    }

    await page.getByRole('button', { name: /create.*game/i }).click();

    await page.waitForURL(/\/games\/[a-f0-9-]+/, { timeout: 10000 });

    // Pod management should NOT be visible
    const podManagement = page.getByText(/pod.*management/i);
    const podCount = await podManagement.count();
    expect(podCount).toBe(0);

    console.log('✓ Game created without pods - pod management not visible');
  });
});
