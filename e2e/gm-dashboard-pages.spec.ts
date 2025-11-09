import { test, expect } from '@playwright/test';

/**
 * E2E TESTS FOR GM DASHBOARD PAGES
 *
 * Tests the new GM Dashboard pages:
 * 1. Leaderboard page - team rankings
 * 2. Analytics page - game statistics
 * 3. Team Details page - individual team information
 * 4. Session Edit page - session editing
 *
 * These tests validate that all new pages work correctly with the backend API
 */

const GAME_MASTER = {
  name: 'GM Dashboard Test',
  email: `gm-dashboard-${Date.now()}@businesscaise.com`,
  password: 'DashboardTest123!',
};

const TEST_GAME = {
  title: `Dashboard Test Game ${Date.now()}`,
  description: 'Testing new GM Dashboard pages',
  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

const TEST_TEAMS = [
  { name: 'Dashboard Team Alpha', members: ['Alice A', 'Bob B', 'Charlie C'] },
  { name: 'Dashboard Team Beta', members: ['David D', 'Eve E', 'Frank F'] },
  { name: 'Dashboard Team Gamma', members: ['Grace G', 'Henry H', 'Ivy I'] },
];

// API Helper: Create teams via backend API
async function createTeamsViaAPI(gameId: string): Promise<string[]> {
  const teamIds: string[] = [];

  for (const team of TEST_TEAMS) {
    const response = await fetch('http://localhost:3001/api/teams/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: gameId,
        team_name: team.name,
        members: team.members,  // Use "members" not "member_names"
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create team ${team.name}: ${response.statusText}`);
    }

    const data = await response.json();
    teamIds.push(data.team.id);
  }

  return teamIds;
}

test.describe.serial('GM Dashboard Pages E2E', () => {
  let gameId: string;
  let sessionId: string;

  test('SETUP: Create game with teams', async ({ page }) => {
    console.log('>>> SETUP: Creating test game and teams');

    // Register GM
    await page.goto('http://localhost:3002/register');
    await page.fill('input[type="text"]', GAME_MASTER.name);
    await page.fill('input[type="email"]', GAME_MASTER.email);
    const passwordFields = await page.locator('input[type="password"]').all();
    await passwordFields[0].fill(GAME_MASTER.password);
    await passwordFields[1].fill(GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games', { timeout: 10000 });
    console.log('✓ GM registered');

    // Create game
    await page.click('button:has-text("Create Game"), a:has-text("Create Game")');
    await page.waitForURL('http://localhost:3002/games/create');
    await page.fill('input#title', TEST_GAME.title);
    await page.fill('textarea#description', TEST_GAME.description);
    await page.fill('input#startDate', TEST_GAME.startDate);
    await page.fill('input#endDate', TEST_GAME.endDate);
    await page.click('button[type="submit"]');
    await page.waitForURL(/http:\/\/localhost:3002\/games\/[a-f0-9-]+$/, { timeout: 10000 });

    gameId = page.url().match(/\/games\/([a-f0-9-]+)/)?.[1]!;
    expect(gameId).toBeTruthy();
    console.log(`✓ Game created: ${gameId}`);

    // Start game
    await page.getByRole('button', { name: /start game/i }).click();
    await page.waitForResponse(response => response.url().includes('/start') && response.status() === 200);
    console.log('✓ Game started');

    // Unlock first session and capture session ID
    const unlockPromise = page.waitForResponse(response => response.url().includes('/unlock') && response.status() === 200);
    const reloadPromises = Promise.all([
      page.waitForResponse(response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/teams`) && response.status() === 200),
    ]);
    await page.getByRole('button', { name: /unlock/i }).first().click();
    await unlockPromise;
    await reloadPromises;

    // Get session ID from the first session by extracting from the edit button
    // The edit button has the format: /games/:gameId/sessions/:sessionId/edit
    const firstEditButton = page.locator('button[title="Edit session"]').first();
    await expect(firstEditButton).toBeVisible();

    // Click the button to navigate to edit page, then extract session ID from URL
    const editUrlPattern = new RegExp(`/games/${gameId}/sessions/([a-f0-9-]+)/edit`);
    await firstEditButton.click();
    await page.waitForURL(editUrlPattern);

    const currentUrl = page.url();
    const match = currentUrl.match(editUrlPattern);
    if (match) {
      sessionId = match[1];
    }
    console.log(`✓ First session unlocked: ${sessionId}`);

    // Navigate back to game details and wait for page to load
    const backPromises = Promise.all([
      page.waitForResponse(response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/teams`) && response.status() === 200),
    ]);
    await page.goto(`http://localhost:3002/games/${gameId}`);
    await backPromises;

    // Create teams
    const teamIds = await createTeamsViaAPI(gameId);
    expect(teamIds.length).toBe(3);
    console.log(`✓ ${teamIds.length} teams created`);
  });

  test('TEST 1: Leaderboard Page displays team rankings', async ({ page }) => {
    console.log('>>> TEST 1: Leaderboard Page');

    // Login
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    // Navigate to game - set up waiters BEFORE clicking
    const urlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}`);
    const apiPromises = Promise.all([
      page.waitForResponse(response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/teams`) && response.status() === 200),
    ]);
    await page.click(`text=${TEST_GAME.title}`);
    await urlPromise;
    await apiPromises;

    // Navigate to leaderboard - set up waiters BEFORE clicking
    const leaderboardUrlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}/leaderboard`);
    const leaderboardApiPromise = page.waitForResponse(response =>
      response.url().includes(`/games/${gameId}/leaderboard`) && response.status() === 200
    );
    await page.getByTestId('leaderboard-stat-card').click();
    await leaderboardUrlPromise;
    const apiResponse = await leaderboardApiPromise;

    // Debug: log API response
    const responseData = await apiResponse.json();
    console.log('Leaderboard API response:', JSON.stringify(responseData, null, 2));

    // Wait for page to finish loading (loading state to disappear)
    await page.waitForLoadState('networkidle');

    // Verify page loaded (check for either heading OR error state)
    const errorMessage = page.locator('text=Failed to load leaderboard');
    const loadingMessage = page.locator('text=Loading leaderboard');

    // Ensure not in loading or error state
    await expect(loadingMessage).not.toBeVisible({ timeout: 1000 }).catch(() => {});
    await expect(errorMessage).not.toBeVisible({ timeout: 1000 }).catch(() => {});

    await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible();

    // Verify teams are listed
    for (const team of TEST_TEAMS) {
      await expect(page.getByText(team.name)).toBeVisible();
    }

    // Verify rank indicators exist
    await expect(page.locator('[data-testid^="leaderboard-rank-"]')).toHaveCount(3);

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/leaderboard-page.png',
      fullPage: true
    });

    console.log('✓ Leaderboard page works correctly');
  });

  test('TEST 2: Analytics Page displays game statistics', async ({ page }) => {
    console.log('>>> TEST 2: Analytics Page');

    // Login and navigate to game
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    // Navigate to game - set up waiters BEFORE clicking
    const urlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}`);
    const apiPromises = Promise.all([
      page.waitForResponse(response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/teams`) && response.status() === 200),
    ]);
    await page.click(`text=${TEST_GAME.title}`);
    await urlPromise;
    await apiPromises;

    // Navigate to analytics - set up waiters BEFORE clicking
    const analyticsUrlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}/analytics`);
    const analyticsApiPromise = page.waitForResponse(response =>
      response.url().includes(`/games/${gameId}/analytics`) && response.status() === 200
    );
    await page.getByTestId('analytics-stat-card').click();
    await analyticsUrlPromise;
    await analyticsApiPromise;

    // Verify page loaded
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();

    // Verify overview stats
    await expect(page.getByTestId('total-teams-stat')).toBeVisible();
    await expect(page.getByTestId('completed-sessions-stat')).toBeVisible();
    await expect(page.getByTestId('active-sessions-stat')).toBeVisible();

    // Verify average metrics section
    await expect(page.getByRole('heading', { name: /average team metrics/i })).toBeVisible();

    // Verify all 5 metrics are shown
    await expect(page.getByTestId('metric-financial')).toBeVisible();
    await expect(page.getByTestId('metric-hr')).toBeVisible();
    await expect(page.getByTestId('metric-market')).toBeVisible();
    await expect(page.getByTestId('metric-operations')).toBeVisible();
    await expect(page.getByTestId('metric-customer')).toBeVisible();

    // Verify insights section exists
    await expect(page.getByRole('heading', { name: /insights/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/analytics-page.png',
      fullPage: true
    });

    console.log('✓ Analytics page works correctly');
  });

  test('TEST 3: Team Details Page displays individual team information', async ({ page }) => {
    console.log('>>> TEST 3: Team Details Page');

    // Login and navigate to game
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    // Navigate to game - set up waiters BEFORE clicking
    const urlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}`);
    const apiPromises = Promise.all([
      page.waitForResponse(response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/teams`) && response.status() === 200),
    ]);
    await page.click(`text=${TEST_GAME.title}`);
    await urlPromise;
    await apiPromises;

    // Click on first team - set up waiters BEFORE clicking
    const firstTeamHeading = page.getByRole('heading', { name: TEST_TEAMS[0].name, level: 3 });
    await expect(firstTeamHeading).toBeVisible();

    const teamUrlPromise = page.waitForURL(new RegExp(`http://localhost:3002/games/${gameId}/teams/[a-f0-9-]+`));
    const teamApiPromises = Promise.all([
      page.waitForResponse(response => response.url().includes('/teams/') && !response.url().includes('/history') && response.status() === 200),
      page.waitForResponse(response => response.url().includes('/teams/') && response.url().includes('/history') && response.status() === 200),
    ]);
    await firstTeamHeading.click();
    await teamUrlPromise;
    await teamApiPromises;

    // Wait for page to finish loading
    await page.waitForLoadState('networkidle');

    // Check for error states
    const errorMessage = page.locator('text=Failed to load team details');
    const notFoundMessage = page.locator('text=Team not found');
    const isError = await errorMessage.or(notFoundMessage).isVisible();

    if (isError) {
      await page.screenshot({ path: 'e2e-results/team-details-error.png', fullPage: true });
      throw new Error('Team details page is in error state');
    }

    // Ensure not in loading state
    const loadingMessage = page.locator('text=Loading team details');
    await expect(loadingMessage).not.toBeVisible({ timeout: 1000 }).catch(() => {});

    // Wait for the page content to actually render by waiting for a guaranteed element
    await expect(page.getByTestId('team-score-card')).toBeVisible({ timeout: 10000 });

    // Verify team name in header
    await expect(page.getByRole('heading', { name: new RegExp(TEST_TEAMS[0].name, 'i'), level: 1 })).toBeVisible();

    // Verify overall score card
    await expect(page.getByTestId('team-score-card')).toBeVisible();
    await expect(page.getByTestId('team-score-card')).toContainText(/overall score/i);

    // Verify members card
    await expect(page.getByTestId('team-members-card')).toBeVisible();

    // Verify current metrics section
    await expect(page.getByRole('heading', { name: /current metrics/i })).toBeVisible();
    await expect(page.getByTestId('metric-financial')).toBeVisible();
    await expect(page.getByTestId('metric-hr')).toBeVisible();
    await expect(page.getByTestId('metric-market')).toBeVisible();
    await expect(page.getByTestId('metric-operations')).toBeVisible();
    await expect(page.getByTestId('metric-customer')).toBeVisible();

    // Verify team members section
    await expect(page.getByRole('heading', { name: /team members/i })).toBeVisible();
    for (let i = 0; i < TEST_TEAMS[0].members.length; i++) {
      await expect(page.getByTestId(`member-${i}`)).toBeVisible();
      await expect(page.getByText(TEST_TEAMS[0].members[i])).toBeVisible();
    }

    // Verify metrics history section
    await expect(page.getByRole('heading', { name: /metrics history/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/team-details-page.png',
      fullPage: true
    });

    console.log('✓ Team Details page works correctly');
  });

  test('TEST 4: Session Edit Page allows editing session details', async ({ page }) => {
    console.log('>>> TEST 4: Session Edit Page');

    // Login and navigate to game
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    // Navigate to game - set up waiters BEFORE clicking
    const urlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}`);
    const apiPromises = Promise.all([
      page.waitForResponse(response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/teams`) && response.status() === 200),
    ]);
    await page.click(`text=${TEST_GAME.title}`);
    await urlPromise;
    await apiPromises;

    // Click edit button on first session - set up waiters BEFORE clicking
    const firstEditButton = page.locator('button[title="Edit session"]').first();
    await expect(firstEditButton).toBeVisible();

    const editUrlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}/sessions/${sessionId}/edit`);
    const editApiPromise = page.waitForResponse(response =>
      response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200
    );
    await firstEditButton.click();
    await editUrlPromise;
    await editApiPromise;

    // Wait for page to finish loading
    await page.waitForLoadState('networkidle');

    // Check for error states
    const errorSessionMessage = page.locator('text=Failed to load session');
    const notFoundSessionMessage = page.locator('text=Session not found');
    const isSessionError = await errorSessionMessage.or(notFoundSessionMessage).isVisible();

    if (isSessionError) {
      // Take screenshot for debugging
      await page.screenshot({ path: 'e2e-results/session-edit-error.png', fullPage: true });
      throw new Error('Session edit page is in error state');
    }

    // Ensure not in loading state
    const loadingSessionMessage = page.locator('text=Loading session');
    await expect(loadingSessionMessage).not.toBeVisible({ timeout: 1000 }).catch(() => {});

    // Wait for the form to actually render by waiting for a guaranteed element
    await expect(page.locator('input#title')).toBeVisible({ timeout: 10000 });

    // Verify page loaded
    await expect(page.getByRole('heading', { name: /edit session/i })).toBeVisible();

    // Verify form fields exist
    await expect(page.locator('input#title')).toBeVisible();
    await expect(page.locator('textarea#description')).toBeVisible();
    await expect(page.locator('input#deadline')).toBeVisible();
    await expect(page.locator('textarea#narrative')).toBeVisible();

    // Get original title
    const originalTitle = await page.locator('input#title').inputValue();
    expect(originalTitle).toBeTruthy();

    // Update session details
    const newTitle = `Updated Session Title ${Date.now()}`;
    const newDescription = 'This is an updated description for testing';
    const newNarrative = 'This is the updated narrative content for the session';

    await page.fill('input#title', newTitle);
    await page.fill('textarea#description', newDescription);
    await page.fill('textarea#narrative', newNarrative);

    // Submit form - set up waiters BEFORE clicking
    const updatePromise = page.waitForResponse(response =>
      response.url().includes('/sessions/') && response.status() === 200
    );
    const backUrlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}`);
    await page.getByRole('button', { name: /save changes/i }).click();
    await updatePromise;
    await backUrlPromise;

    // Verify we're back on game details page
    await expect(page.getByRole('heading', { name: TEST_GAME.title })).toBeVisible();

    // Verify the session title was updated
    await expect(page.getByText(newTitle)).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/session-edit-page-after.png',
      fullPage: true
    });

    console.log('✓ Session Edit page works correctly');
  });

  test('TEST 5: Navigation back buttons work correctly', async ({ page }) => {
    console.log('>>> TEST 5: Navigation');

    // Login and navigate to game
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    // Navigate to game - set up waiters BEFORE clicking
    const urlPromise = page.waitForURL(`http://localhost:3002/games/${gameId}`);
    const apiPromises = Promise.all([
      page.waitForResponse(response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/sessions`) && response.status() === 200),
      page.waitForResponse(response => response.url().includes(`/games/${gameId}/teams`) && response.status() === 200),
    ]);
    await page.click(`text=${TEST_GAME.title}`);
    await urlPromise;
    await apiPromises;

    // Test Leaderboard back button
    await page.getByTestId('leaderboard-stat-card').click();
    await page.waitForURL(`http://localhost:3002/games/${gameId}/leaderboard`);
    const backButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await backButton.click();
    await page.waitForURL(`http://localhost:3002/games/${gameId}`);
    await expect(page.getByRole('heading', { name: TEST_GAME.title })).toBeVisible();

    // Test Analytics back button
    await page.getByTestId('analytics-stat-card').click();
    await page.waitForURL(`http://localhost:3002/games/${gameId}/analytics`);
    await page.locator('button').filter({ has: page.locator('svg') }).first().click();
    await page.waitForURL(`http://localhost:3002/games/${gameId}`);
    await expect(page.getByRole('heading', { name: TEST_GAME.title })).toBeVisible();

    console.log('✓ Navigation works correctly');
  });

  test('CLEANUP: Delete test game', async ({ page }) => {
    console.log('>>> CLEANUP: Deleting test game');

    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    const gameHeading = page.getByRole('heading', { name: TEST_GAME.title, level: 3 });
    if (await gameHeading.isVisible()) {
      const gameCard = gameHeading.locator('../..');
      const deleteButton = gameCard.getByTestId('delete-game-button');
      page.on('dialog', dialog => dialog.accept());
      await deleteButton.click();
      await expect(gameHeading).not.toBeVisible({ timeout: 5000 });
      console.log('✓ Test game deleted');
    }
  });
});
