import { test, expect, Page } from '@playwright/test';

/**
 * TEAM PLAYER E2E TESTS
 *
 * Tests the team player journey following Playwright best practices:
 * - Uses semantic selectors (getByRole, getByLabel, getByPlaceholder)
 * - Avoids .first() where possible
 * - Scopes selectors to parent sections for common terms
 * - Uses data-testid where appropriate
 *
 * Test flow:
 * 1. Player registration and authentication
 * 2. Player joins game with game code
 * 3. Player dashboard and metrics
 * 4. Player submits decisions
 * 5. Player sees leaderboard
 */

const TEST_PLAYER = {
  name: 'E2E Test Player',
  email: `player-${Date.now()}-${Math.random().toString(36).substring(7)}@businesscaise.com`,
  password: 'PlayerTest123!',
  role: 'player',
};

const TEST_TEAM = {
  name: `E2E Team ${Date.now()}`,
  color: '#3B82F6',
  members: ['Alice Smith', 'Bob Johnson', 'Charlie Brown'],
};

// Helper: Register and login player
async function registerAndLoginPlayer(page: Page, playerData = TEST_PLAYER) {
  await page.goto('http://localhost:5173/?demo=false');

  // Navigate to register using semantic selector
  await page.getByRole('link', { name: /register/i }).click();
  await page.waitForURL(/.*register/);

  // Fill form with semantic selectors (following best practices)
  await page.getByLabel(/name/i).fill(playerData.name);
  await page.getByLabel(/email/i).fill(playerData.email);
  await page.getByLabel(/^password$/i).fill(playerData.password);

  // Handle confirm password if exists
  const confirmPasswordInput = page.getByLabel(/confirm.*password/i);
  if (await confirmPasswordInput.count() > 0) {
    await confirmPasswordInput.fill(playerData.password);
  }

  // Submit using semantic selector
  await page.getByRole('button', { name: /register|sign up|create account/i }).click();
  await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });
}

// Helper: Join game with game code
async function joinGameAsTeam(page: Page, gameId: string, teamData = TEST_TEAM) {
  // Enter game code using placeholder selector
  await page.getByPlaceholder(/game code|enter game/i).fill(gameId);
  await page.getByRole('button', { name: /join game/i }).click();

  // Wait for team join modal
  await expect(page.getByRole('heading', { name: /join.*game/i })).toBeVisible({ timeout: 5000 });

  // Fill team name using placeholder
  await page.getByPlaceholder(/team name/i).fill(teamData.name);

  // Select color if picker exists
  const colorButton = page.locator(`button[style*="${teamData.color}"]`);
  if (await colorButton.count() > 0) {
    await colorButton.first().click();
  }

  // Add team members
  const memberInput = page.getByPlaceholder(/member/i);
  if (await memberInput.count() > 0) {
    for (const member of teamData.members) {
      await memberInput.fill(member);
      await page.getByRole('button', { name: /^add$/i }).click();
    }
  }

  // Submit join form
  await page.getByRole('button', { name: /join/i, exact: false }).click();
  await page.waitForURL(/.*\/game\//, { timeout: 10000 });
}

// Helper: Create game via API and return game ID
async function createGameAsGM() {
  const GM_EMAIL = `gm-${Date.now()}@businesscaise.com`;
  const GM_PASSWORD = 'GMTest123!';

  const response = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Test GM',
      email: GM_EMAIL,
      password: GM_PASSWORD,
      role: 'game_master',
    }),
  });

  if (!response.ok) throw new Error('Failed to register GM');

  const { token } = await response.json();

  // Create game
  const gameResponse = await fetch('http://localhost:3001/api/gm/games', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: `E2E Test Game ${Date.now()}`,
      description: 'E2E test game',
    }),
  });

  if (!gameResponse.ok) throw new Error('Failed to create game');

  const gameData = await gameResponse.json();
  const gameId = gameData.game.id;

  // Start game
  await fetch(`http://localhost:3001/api/gm/games/${gameId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  // Get and unlock first session
  const sessionsResponse = await fetch(`http://localhost:3001/api/gm/games/${gameId}/sessions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const { sessions } = await sessionsResponse.json();
  const firstSessionId = sessions[0].id;

  await fetch(`http://localhost:3001/api/gm/games/${gameId}/sessions/${firstSessionId}/unlock`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  return { gameId, gmToken: token };
}

test.describe('Team Player - Authentication', () => {
  test('should register new player account successfully', async ({ page }) => {
    await registerAndLoginPlayer(page);

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*\/(dashboard|games)/);

    // Verify player name visible using semantic selector
    await expect(page.getByText(TEST_PLAYER.name)).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: 'e2e-results/team-player-01-registered.png',
      fullPage: true,
    });
  });

  test('should login with player credentials', async ({ page }) => {
    // Register first
    await registerAndLoginPlayer(page);

    // Logout using semantic selector
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await page.waitForURL(/.*login/, { timeout: 5000 });

    // Login with semantic selectors (following best practices)
    await page.getByLabel(/email/i).fill(TEST_PLAYER.email);
    await page.getByLabel(/password/i).fill(TEST_PLAYER.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Verify redirect
    await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });
    await expect(page.getByText(TEST_PLAYER.name)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Team Player - Join Game', () => {
  let gameId: string;

  test.beforeAll(async () => {
    const gameData = await createGameAsGM();
    gameId = gameData.gameId;
    console.log(`Created test game: ${gameId}`);
  });

  test('should join game with game code', async ({ page }) => {
    await registerAndLoginPlayer(page);
    await joinGameAsTeam(page, gameId);

    // Verify redirect to game page
    await expect(page).toHaveURL(/.*\/game\//);

    // Verify team name visible
    await expect(page.getByText(TEST_TEAM.name)).toBeVisible({ timeout: 5000 });

    // Verify dashboard tab exists using semantic selector
    await expect(page.getByRole('button', { name: /dashboard/i })).toBeVisible();

    await page.screenshot({
      path: 'e2e-results/team-player-02-joined-game.png',
      fullPage: true,
    });
  });
});

test.describe('Team Player - Dashboard', () => {
  let gameId: string;

  test.beforeAll(async () => {
    const gameData = await createGameAsGM();
    gameId = gameData.gameId;
  });

  test('should display dashboard with metrics', async ({ page }) => {
    await registerAndLoginPlayer(page);
    await joinGameAsTeam(page, gameId);

    // Ensure we're on dashboard tab
    const dashboardTab = page.getByRole('button', { name: /dashboard/i });
    if (await dashboardTab.isVisible()) {
      await dashboardTab.click();
    }

    // Wait for metrics to load
    await page.waitForTimeout(2000);

    // Use scoped selectors for metrics section (following best practices)
    // Metrics can appear in multiple places, so scope to main content
    const metricsSection = page.locator('main, [role="main"]');

    // Check for any metrics display within the main content
    await expect(metricsSection.getByText(/financial|marketing|sales|operations|hr/i)).toBeVisible({ timeout: 5000 });

    // Check for score display
    await expect(page.getByText(/score|points/i)).toBeVisible();

    await page.screenshot({
      path: 'e2e-results/team-player-03-dashboard.png',
      fullPage: true,
    });
  });

  test('should show current session information', async ({ page }) => {
    await registerAndLoginPlayer(page);
    await joinGameAsTeam(page, gameId);

    // Check for current session info using scoped selector
    const dashboardArea = page.locator('main, [role="main"]');
    await expect(dashboardArea.getByText(/current.*session|session.*1|monday/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Team Player - Submit Decision', () => {
  let gameId: string;

  test.beforeAll(async () => {
    const gameData = await createGameAsGM();
    gameId = gameData.gameId;
  });

  test('should submit a decision for current session', async ({ page }) => {
    await registerAndLoginPlayer(page);
    await joinGameAsTeam(page, gameId);

    // Navigate to Challenge tab using semantic selector
    await page.getByRole('button', { name: /challenge|current challenge/i }).click();

    // Wait for form to load
    await page.waitForTimeout(1000);

    // Fill submission using semantic selectors
    const decisionText = 'Our strategic decision is to increase marketing budget by 20%.';

    // Try textarea first, then input
    const textArea = page.getByRole('textbox', { name: /decision|submission|response/i });
    if (await textArea.count() > 0) {
      await textArea.fill(decisionText);
    } else {
      // Fallback to any visible textarea
      await page.locator('textarea').fill(decisionText);
    }

    // Submit using semantic selector
    await page.getByRole('button', { name: /submit/i }).click();

    // Wait for success confirmation
    await expect(page.getByText(/success|submitted|thank you|pending/i)).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: 'e2e-results/team-player-04-submitted-decision.png',
      fullPage: true,
    });
  });
});

test.describe('Team Player - Leaderboard', () => {
  let gameId: string;

  test.beforeAll(async () => {
    const gameData = await createGameAsGM();
    gameId = gameData.gameId;
  });

  test('should display leaderboard with team rankings', async ({ page }) => {
    await registerAndLoginPlayer(page);
    await joinGameAsTeam(page, gameId);

    // Navigate to Leaderboard tab using semantic selector
    await page.getByRole('button', { name: /leaderboard/i }).click();

    // Wait for leaderboard to load
    await page.waitForTimeout(1000);

    // Verify leaderboard heading using semantic selector
    await expect(page.getByRole('heading', { name: /leaderboard|ranking|standings/i })).toBeVisible({ timeout: 5000 });

    // Should see team name in leaderboard
    await expect(page.getByText(TEST_TEAM.name)).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: 'e2e-results/team-player-05-leaderboard.png',
      fullPage: true,
    });
  });
});
