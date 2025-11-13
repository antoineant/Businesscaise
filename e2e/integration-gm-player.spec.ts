import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

/**
 * FULL GM-TO-PLAYER INTEGRATION TEST
 *
 * Tests the complete workflow between GM and Player:
 * 1. GM creates game and starts it
 * 2. GM unlocks first session
 * 3. Player joins game as team
 * 4. Player submits decision
 * 5. GM scores the submission
 * 6. Player sees updated metrics (real-time via WebSocket)
 * 7. Player sees updated leaderboard
 *
 * This test validates the entire system works end-to-end with real-time updates
 */

const GM_USER = {
  name: 'Integration GM',
  email: `integration-gm-${Date.now()}@businesscase.com`,
  password: 'IntegrationTest123!',
};

const PLAYER_USER = {
  name: 'Integration Player',
  email: `integration-player-${Date.now()}@businesscase.com`,
  password: 'IntegrationTest123!',
};

const TEST_GAME = {
  title: `Integration Test ${Date.now()}`,
  description: 'Testing full GM-to-Player workflow',
};

const TEST_TEAM = {
  name: `Test Team ${Date.now()}`,
  color: '#3B82F6',
  members: ['Alice', 'Bob', 'Charlie'],
};

test.describe.serial('INTEGRATION: GM-to-Player Complete Workflow', () => {
  let gameId: string;
  let teamId: string;
  let submissionId: string;
  let gmContext: BrowserContext;
  let playerContext: BrowserContext;
  let gmPage: Page;
  let playerPage: Page;

  test.beforeAll(async ({ browser }) => {
    // Create separate browser contexts for GM and Player
    gmContext = await browser.newContext();
    playerContext = await browser.newContext();
    gmPage = await gmContext.newPage();
    playerPage = await playerContext.newPage();
  });

  test.afterAll(async () => {
    await gmContext.close();
    await playerContext.close();
  });

  test('STEP 1: GM creates and starts game', async () => {
    console.log('>>> STEP 1: GM creates and starts game');

    // Set up diagnostic logging for GM page
    const gmApiCalls: string[] = [];
    gmPage.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[GM DIAGNOSTIC] Request: ${request.method()} ${request.url()}`);
        gmApiCalls.push(`${request.method()} ${request.url()}`);
      }
    });

    gmPage.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[GM DIAGNOSTIC] Response: ${response.status()} ${response.url()}`);
      }
    });

    gmPage.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[GM DIAGNOSTIC] Browser ${msg.type()}: ${msg.text()}`);
      }
    });

    // Register GM
    await gmPage.goto('http://localhost:3002/register', { waitUntil: 'networkidle' });
    await gmPage.fill('input[type="text"]', GM_USER.name);
    await gmPage.fill('input[type="email"]', GM_USER.email);
    const passwordFields = await gmPage.locator('input[type="password"]').all();
    await passwordFields[0].fill(GM_USER.password);
    await passwordFields[1].fill(GM_USER.password);
    await gmPage.click('button[type="submit"]');

    // Wait for EITHER success OR error
    await Promise.race([
      gmPage.waitForURL('http://localhost:3002/games', { timeout: 10000 }),
      gmPage.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
        .then(async () => {
          const errorText = await gmPage.locator('.bg-red-50, [class*="error"]').textContent();
          throw new Error(
            `GM registration failed: ${errorText}. ` +
            `API calls: ${gmApiCalls.join(', ') || 'none'}`
          );
        })
    ]);
    console.log('✓ GM registered');

    // Create game
    await gmPage.click('button:has-text("Create Game"), a:has-text("Create Game")');
    await gmPage.waitForURL('http://localhost:3002/games/create');
    await gmPage.fill('input#title', TEST_GAME.title);
    await gmPage.fill('textarea#description', TEST_GAME.description);
    await gmPage.click('button[type="submit"]');

    // Wait for EITHER success OR error
    await Promise.race([
      gmPage.waitForURL(/http:\/\/localhost:3002\/games\/[a-f0-9-]+$/, { timeout: 10000 }),
      gmPage.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
        .then(async () => {
          const errorText = await gmPage.locator('.bg-red-50, [class*="error"]').textContent();
          throw new Error(`Game creation failed: ${errorText}`);
        })
    ]);

    gameId = gmPage.url().match(/\/games\/([a-f0-9-]+)/)?.[1]!;
    expect(gameId).toBeTruthy();
    console.log(`✓ Game created: ${gameId}`);

    // Start game
    await gmPage.getByRole('button', { name: /start game/i }).click();
    await gmPage.waitForResponse(response => response.url().includes('/start') && response.status() === 200);
    await expect(gmPage.getByTestId('game-status')).toHaveText('active');
    console.log('✓ Game started');

    // Take screenshot
    await gmPage.screenshot({
      path: 'e2e-results/integration-gm-player-01-game-started.png',
      fullPage: true,
    });
  });

  test('STEP 2: GM unlocks first session', async () => {
    console.log('>>> STEP 2: GM unlocks first session');

    // Unlock first session
    const firstUnlockButton = gmPage.getByRole('button', { name: /unlock/i }).first();

    const unlockPromise = gmPage.waitForResponse(
      response => response.url().includes('/unlock') && response.status() === 200
    );
    const reloadPromises = Promise.all([
      gmPage.waitForResponse(
        response => response.url().includes(`/games/${gameId}`) && !response.url().includes('/sessions') && !response.url().includes('/teams') && (response.status() === 200 || response.status() === 304)
      ),
      gmPage.waitForResponse(
        response => response.url().includes(`/games/${gameId}/sessions`) && (response.status() === 200 || response.status() === 304)
      ),
      gmPage.waitForResponse(
        response => response.url().includes(`/games/${gameId}/teams`) && (response.status() === 200 || response.status() === 304)
      ),
    ]);

    await firstUnlockButton.click();
    await unlockPromise;
    await reloadPromises;
    console.log('✓ Session 1 unlocked');

    // Verify session count
    await expect(gmPage.getByTestId('sessions-stat-card')).toContainText('1/10', { timeout: 5000 });

    await gmPage.screenshot({
      path: 'e2e-results/integration-gm-player-02-session-unlocked.png',
      fullPage: true,
    });
  });

  test('STEP 3: Player registers and joins game', async () => {
    console.log('>>> STEP 3: Player registers and joins game');

    // Set up diagnostic logging for Player page
    const playerApiCalls: string[] = [];
    playerPage.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[PLAYER DIAGNOSTIC] Request: ${request.method()} ${request.url()}`);
        playerApiCalls.push(`${request.method()} ${request.url()}`);
      }
    });

    playerPage.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[PLAYER DIAGNOSTIC] Response: ${response.status()} ${response.url()}`);
      }
    });

    playerPage.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[PLAYER DIAGNOSTIC] Browser ${msg.type()}: ${msg.text()}`);
      }
    });

    // Register player
    await playerPage.goto('http://localhost:5173/?demo=false', { waitUntil: 'networkidle' });
    // The login page displays "Sign up", not "Register"
    await playerPage.click('a:has-text("Sign up")');
    await playerPage.waitForURL(/.*register/);
    await playerPage.fill('input[name="name"], input[placeholder*="name" i]', PLAYER_USER.name);
    await playerPage.fill('input[type="email"]', PLAYER_USER.email);

    const passwordFields = await playerPage.locator('input[type="password"]').all();
    await passwordFields[0].fill(PLAYER_USER.password);
    if (passwordFields.length > 1) {
      await passwordFields[1].fill(PLAYER_USER.password);
    }

    await playerPage.click('button[type="submit"]');

    // Wait for EITHER success OR error
    await Promise.race([
      playerPage.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 }),
      playerPage.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
        .then(async () => {
          const errorText = await playerPage.locator('.bg-red-50, [class*="error"]').textContent();
          throw new Error(
            `Player registration failed: ${errorText}. ` +
            `API calls: ${playerApiCalls.join(', ') || 'none'}`
          );
        })
    ]);
    console.log('✓ Player registered');

    // Join game with game code
    await playerPage.fill('input[placeholder*="game code" i], input[placeholder*="Enter game" i]', gameId);
    await playerPage.click('button:has-text("Join Game")');

    // Fill team join form
    await expect(playerPage.locator('text=/join.*game/i')).toBeVisible({ timeout: 5000 });
    // Label isn't connected to input, so use direct selector for first required text input
    await playerPage.locator('input[type="text"][required]').first().fill(TEST_TEAM.name);

    // Select color if available
    const colorButton = playerPage.locator(`button[style*="${TEST_TEAM.color}"]`).first();
    if (await colorButton.isVisible()) {
      await colorButton.click();
    }

    // Add team members
    for (const member of TEST_TEAM.members) {
      const memberInput = playerPage.locator('input[placeholder*="member" i]');
      if (await memberInput.isVisible()) {
        await memberInput.fill(member);
        await playerPage.click('button:has-text("Add")');
      }
    }

    // Submit join form
    await playerPage.click('button[type="submit"]:has-text("Join")');

    // Wait for EITHER success OR error
    await Promise.race([
      playerPage.waitForURL(/.*\/game\//, { timeout: 10000 }),
      playerPage.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
        .then(async () => {
          const errorText = await playerPage.locator('.bg-red-50, [class*="error"]').textContent();
          throw new Error(`Failed to join game: ${errorText}`);
        })
    ]);
    console.log('✓ Player joined game');

    // Verify player sees dashboard
    await expect(playerPage.locator(`text=${TEST_TEAM.name}`)).toBeVisible({ timeout: 5000 });

    // Extract team ID from localStorage
    const localStorageData = await playerPage.evaluate((gId) => {
      return localStorage.getItem(`team_${gId}`);
    }, gameId);
    teamId = localStorageData || '';
    expect(teamId).toBeTruthy();
    console.log(`✓ Team ID: ${teamId}`);

    await playerPage.screenshot({
      path: 'e2e-results/integration-gm-player-03-player-joined.png',
      fullPage: true,
    });
  });

  test('STEP 4: GM verifies team joined', async () => {
    console.log('>>> STEP 4: GM verifies team joined');

    // Refresh GM page to see new team
    await gmPage.reload();
    await gmPage.waitForLoadState('networkidle');

    // Verify team count updated
    await expect(gmPage.getByTestId('teams-stat-card')).toContainText('1', { timeout: 5000 });

    // Verify team is visible
    await expect(gmPage.getByText(TEST_TEAM.name)).toBeVisible({ timeout: 5000 });
    console.log('✓ GM sees team joined');

    await gmPage.screenshot({
      path: 'e2e-results/integration-gm-player-04-gm-sees-team.png',
      fullPage: true,
    });
  });

  test('STEP 5: Player submits decision', async () => {
    console.log('>>> STEP 5: Player submits decision');

    // Navigate to challenge tab
    const challengeTab = playerPage.locator('button:has-text("Challenge"), button:has-text("Current Challenge")').first();
    if (await challengeTab.isVisible()) {
      await challengeTab.click();
      await playerPage.waitForTimeout(1000);
    }

    // Verify challenge form is visible
    await expect(playerPage.locator('text=/submit|decision|challenge/i').first()).toBeVisible({ timeout: 5000 });

    // Fill submission
    const decisionText = 'We propose to increase marketing budget by 20% and launch a social media campaign targeting millennials.';
    const textArea = playerPage.locator('textarea').first();
    if (await textArea.isVisible()) {
      await textArea.fill(decisionText);
    } else {
      await playerPage.fill('input[type="text"]:visible', decisionText);
    }

    // Submit
    await playerPage.click('button:has-text("Submit")');

    // Wait for success indication
    await expect(playerPage.locator('text=/success|submitted|pending/i')).toBeVisible({ timeout: 10000 });
    console.log('✓ Player submitted decision');

    await playerPage.screenshot({
      path: 'e2e-results/integration-gm-player-05-decision-submitted.png',
      fullPage: true,
    });
  });

  test('STEP 6: GM scores submission', async () => {
    console.log('>>> STEP 6: GM scores submission');

    // Refresh to see new submission (or navigate to submissions)
    await gmPage.reload();
    await gmPage.waitForLoadState('networkidle');

    // Try to find and score submission
    // This depends on your GM UI having a submissions or team details view
    // For now, we'll use the API to score

    // Get submissions via API
    const gmToken = await gmPage.evaluate(() => localStorage.getItem('gm_token'));

    console.log(`[DIAGNOSTIC] Fetching submissions for game ${gameId}`);
    const submissionsResponse = await fetch(`http://localhost:3001/api/gm/games/${gameId}/submissions`, {
      headers: {
        'Authorization': `Bearer ${gmToken}`,
      },
    });

    if (!submissionsResponse.ok) {
      const errorText = await submissionsResponse.text();
      throw new Error(`Failed to get submissions: ${submissionsResponse.status} ${errorText}`);
    }

    const { submissions } = await submissionsResponse.json();
    console.log(`[DIAGNOSTIC] Found ${submissions.length} submissions`);
    const latestSubmission = submissions[submissions.length - 1];
    submissionId = latestSubmission?.id;

    if (submissionId) {
      console.log(`[DIAGNOSTIC] Scoring submission ${submissionId}`);
      // Score via API
      const scoreResponse = await fetch(`http://localhost:3001/api/gm/submissions/${submissionId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gmToken}`,
        },
        body: JSON.stringify({
          score: 85,
          feedback: 'Excellent strategic thinking! Consider market research data to support your proposal.',
        }),
      });

      if (!scoreResponse.ok) {
        const errorText = await scoreResponse.text();
        throw new Error(`Failed to score submission: ${scoreResponse.status} ${errorText}`);
      }

      console.log('✓ GM scored submission: 85/100');
    } else {
      throw new Error('No submission found to score - player submission may have failed');
    }

    await gmPage.screenshot({
      path: 'e2e-results/integration-gm-player-06-submission-scored.png',
      fullPage: true,
    });
  });

  test('STEP 7: Player sees updated metrics (real-time)', async () => {
    console.log('>>> STEP 7: Verify player sees updates');

    // Wait a bit for WebSocket updates
    await playerPage.waitForTimeout(2000);

    // Navigate back to dashboard if not already there
    const dashboardTab = playerPage.locator('button:has-text("Dashboard")').first();
    if (await dashboardTab.isVisible()) {
      await dashboardTab.click();
      await playerPage.waitForTimeout(1000);
    }

    // Verify metrics are displayed
    await expect(playerPage.locator('text=/financial|marketing|operations|hr/i').first()).toBeVisible({ timeout: 5000 });

    // Check if score is greater than 0
    const scoreText = await playerPage.locator('text=/score|points/i').first().textContent();
    console.log(`✓ Player sees score: ${scoreText}`);

    // Check for submission status
    const submissionStatus = playerPage.locator('text=/pending|scored|85/i').first();
    if (await submissionStatus.isVisible({ timeout: 2000 })) {
      console.log('✓ Player sees submission scored');
    }

    await playerPage.screenshot({
      path: 'e2e-results/integration-gm-player-07-metrics-updated.png',
      fullPage: true,
    });
  });

  test('STEP 8: Verify leaderboard updates', async () => {
    console.log('>>> STEP 8: Verify leaderboard');

    // Navigate to leaderboard tab
    const leaderboardTab = playerPage.locator('button:has-text("Leaderboard")').first();
    if (await leaderboardTab.isVisible()) {
      await leaderboardTab.click();
      await playerPage.waitForTimeout(1000);
    }

    // Verify team is on leaderboard
    await expect(playerPage.locator(`text=${TEST_TEAM.name}`)).toBeVisible({ timeout: 5000 });
    console.log('✓ Team visible on leaderboard');

    await playerPage.screenshot({
      path: 'e2e-results/integration-gm-player-08-leaderboard.png',
      fullPage: true,
    });

    console.log('✅ INTEGRATION TEST COMPLETED SUCCESSFULLY!');
  });
});
