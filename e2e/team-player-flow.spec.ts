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

// Helper: Register and login player (returns credentials for reuse)
async function registerAndLoginPlayer(page: Page) {
  // Generate unique credentials for each registration (avoid conflicts)
  const playerData = {
    name: 'E2E Test Player',
    email: `player-${Date.now()}-${Math.random().toString(36).substring(7)}@businesscaise.com`,
    password: 'PlayerTest123!',
  };

  await page.goto('http://localhost:5173/?demo=false', { waitUntil: 'networkidle' });

  // Set up diagnostic logging
  const apiCalls: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[DIAGNOSTIC] Request: ${request.method()} ${request.url()}`);
      apiCalls.push(`${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`[DIAGNOSTIC] Response: ${response.status()} ${response.url()}`);
    }
  });

  page.on('console', msg => {
    // Capture ALL console messages to see diagnostic logs from PlayerGame
    const type = msg.type();
    const text = msg.text();

    // Always show PlayerGame diagnostic logs
    if (text.includes('[PlayerGame]')) {
      console.log(`[DIAGNOSTIC] Browser log: ${text}`);
    }
    // Show errors and warnings
    else if (type === 'error' || type === 'warning') {
      console.log(`[DIAGNOSTIC] Browser ${type}: ${text}`);
    }
  });

  // Navigate to register using semantic selector
  // The login page has a "Sign up" link, not "Register"
  await page.getByRole('link', { name: /sign up/i }).click();
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

  // Wait for EITHER success (redirect) OR error message (failure)
  await Promise.race([
    page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 }),
    page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
      .then(async () => {
        const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent();
        throw new Error(
          `Player registration failed: ${errorText}. ` +
          `API calls: ${apiCalls.join(', ') || 'none'}`
        );
      })
  ]);

  console.log(`[DIAGNOSTIC] ✓ Player registered: ${playerData.email}`);
  return playerData; // Return for reuse in tests
}

// Helper: Join game with game code
async function joinGameAsTeam(page: Page, gameId: string, teamData = TEST_TEAM) {
  console.log(`[DIAGNOSTIC] Joining game ${gameId} as team ${teamData.name}`);

  // Enter game code using placeholder selector
  await page.getByPlaceholder(/game code|enter game/i).fill(gameId);
  await page.getByRole('button', { name: /join game/i }).click();

  // Wait for team join modal
  await expect(page.getByRole('heading', { name: /join.*game/i })).toBeVisible({ timeout: 5000 });

  // Fill team name - label isn't connected to input, so use direct selector
  // The first required text input in the modal is the team name field
  await page.locator('input[type="text"][required]').first().fill(teamData.name);

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

  // Wait for EITHER success (redirect to game) OR error message
  await Promise.race([
    page.waitForURL(/.*\/game\//, { timeout: 10000 }),
    page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
      .then(async () => {
        const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent();
        throw new Error(`Failed to join game: ${errorText}`);
      })
  ]);

  // IMPORTANT: Wait for page to fully load after redirect
  // The PlayerGame component needs time to load all data before tabs render
  await page.waitForTimeout(2000);

  console.log(`[DIAGNOSTIC] ✓ Successfully joined game as ${teamData.name}`);
}

// Helper: Create game via API and return game ID
async function createGameAsGM() {
  const GM_EMAIL = `gm-${Date.now()}@businesscaise.com`;
  const GM_PASSWORD = 'GMTest123!';

  console.log(`[DIAGNOSTIC] Creating game as GM: ${GM_EMAIL}`);

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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to register GM: ${response.status} ${errorText}`);
  }

  const { token } = await response.json();
  console.log(`[DIAGNOSTIC] ✓ GM registered successfully`);

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

  if (!gameResponse.ok) {
    const errorText = await gameResponse.text();
    throw new Error(`Failed to create game: ${gameResponse.status} ${errorText}`);
  }

  const gameData = await gameResponse.json();
  const gameId = gameData.game.id;
  console.log(`[DIAGNOSTIC] ✓ Game created: ${gameId}`);

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

  // Get and unlock first session
  const sessionsResponse = await fetch(`http://localhost:3001/api/gm/games/${gameId}/sessions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!sessionsResponse.ok) {
    const errorText = await sessionsResponse.text();
    throw new Error(`Failed to get sessions: ${sessionsResponse.status} ${errorText}`);
  }

  const { sessions } = await sessionsResponse.json();
  const firstSessionId = sessions[0].id;
  console.log(`[DIAGNOSTIC] ✓ Found first session: ${firstSessionId}`);

  const unlockResponse = await fetch(`http://localhost:3001/api/gm/games/${gameId}/sessions/${firstSessionId}/unlock`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!unlockResponse.ok) {
    const errorText = await unlockResponse.text();
    throw new Error(`Failed to unlock session: ${unlockResponse.status} ${errorText}`);
  }
  console.log(`[DIAGNOSTIC] ✓ First session unlocked`);

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
    // Register first and save credentials
    const credentials = await registerAndLoginPlayer(page);

    // Logout using semantic selector
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await page.waitForURL(/.*login/, { timeout: 5000 });

    // Login with semantic selectors using the same credentials that were registered
    await page.getByLabel(/email/i).fill(credentials.email);
    await page.getByLabel(/password/i).fill(credentials.password);
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Verify redirect
    await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });
    await expect(page.getByText(credentials.name)).toBeVisible({ timeout: 5000 });
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
    // Use .first() since metrics terms can appear multiple times (Best Practices: last resort for common terms)
    await expect(metricsSection.getByText(/financial|marketing|sales|operations|hr/i).first()).toBeVisible({ timeout: 5000 });

    // Check for score display
    // Use .first() since "score" appears multiple times ("Your Score", "Innovation Score", etc.)
    await expect(page.getByText(/score|points/i).first()).toBeVisible();

    await page.screenshot({
      path: 'e2e-results/team-player-03-dashboard.png',
      fullPage: true,
    });
  });

  test('should show current session information', async ({ page }) => {
    await registerAndLoginPlayer(page);
    await joinGameAsTeam(page, gameId);

    // After join, page should be on dashboard tab by default
    // Wait for dashboard to render fully (session info card)
    const dashboardArea = page.locator('main, [role="main"]');

    // Check for current session heading (should be visible on dashboard)
    await expect(dashboardArea.getByRole('heading', { name: /current session/i })).toBeVisible({ timeout: 10000 });
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
    // Use more specific pattern to match only the tab, not "View Challenge" button
    await page.getByRole('button', { name: /^current challenge$/i }).click();

    // Wait for form to load - check for textarea to be visible and enabled
    const textarea = page.locator('textarea#submission-data');
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await expect(textarea).toBeEnabled({ timeout: 5000 });

    // Fill submission
    const decisionText = 'Our strategic decision is to increase marketing budget by 20%.';
    await textarea.fill(decisionText);

    // Submit using semantic selector - find the submit button
    const submitButton = page.getByRole('button', { name: /submit decision/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Wait for EITHER success OR error message
    await Promise.race([
      // Success case - look for any of these success indicators
      expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 10000 }),
      // Error case - throw if error appears
      page.waitForSelector('.bg-red-50', { timeout: 10000 })
        .then(async () => {
          const errorText = await page.locator('.bg-red-50').textContent();
          throw new Error(`Submission failed: ${errorText}`);
        })
    ]);

    // Verify success message is actually visible
    await expect(page.locator('.bg-green-50')).toBeVisible();

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

    // Should see team name in leaderboard (scope to main content to avoid page header)
    const leaderboardArea = page.locator('main, [role="main"]');
    await expect(leaderboardArea.getByText(TEST_TEAM.name).first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: 'e2e-results/team-player-05-leaderboard.png',
      fullPage: true,
    });
  });
});
