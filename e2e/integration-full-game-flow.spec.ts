import { test, expect, Page, Browser } from '@playwright/test';

/**
 * FULL INTEGRATION E2E TEST
 *
 * Tests the complete BusinessCaise workflow:
 * 1. GM creates account and game
 * 2. GM starts game and unlocks first session
 * 3. Teams join the game (simulated)
 * 4. GM monitors teams
 * 5. GM unlocks more sessions
 * 6. Verify complete game lifecycle
 *
 * This test validates that the entire system works end-to-end
 */

const GAME_MASTER = {
  name: 'Integration Test GM',
  email: `integration-gm-${Date.now()}@businesscaise.com`,
  password: 'IntegrationTest123!',
};

const TEST_GAME = {
  title: `Integration Test Game ${Date.now()}`,
  description: 'Full integration test - GM creates, teams join, complete workflow',
  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

const TEST_TEAMS = [
  { name: 'Team Alpha', members: ['Alice', 'Bob', 'Charlie'] },
  { name: 'Team Bravo', members: ['David', 'Eve', 'Frank'] },
  { name: 'Team Charlie', members: ['Grace', 'Henry', 'Ivy'] },
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
        member_names: team.members,
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

test.describe('INTEGRATION: Full Game Lifecycle', () => {
  let gameId: string;

  test('STEP 1: GM registers and creates game', async ({ page }) => {
    console.log('>>> STEP 1: GM Registration and Game Creation');

    // Navigate to GM Dashboard
    await page.goto('http://localhost:3002/register');

    // Register GM
    await page.fill('input[type="text"]', GAME_MASTER.name);
    await page.fill('input[type="email"]', GAME_MASTER.email);
    const passwordFields = await page.locator('input[type="password"]').all();
    await passwordFields[0].fill(GAME_MASTER.password);
    await passwordFields[1].fill(GAME_MASTER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('http://localhost:3002/games', { timeout: 10000 });
    console.log('✓ GM registered successfully');

    // Create game
    await page.click('button:has-text("Create Game"), a:has-text("Create Game")');
    await page.waitForURL('http://localhost:3002/games/create');

    await page.fill('input#title', TEST_GAME.title);
    await page.fill('textarea#description', TEST_GAME.description);
    await page.fill('input#startDate', TEST_GAME.startDate);
    await page.fill('input#endDate', TEST_GAME.endDate);
    await page.click('button[type="submit"]');

    await page.waitForURL(/http:\/\/localhost:3002\/games\/[a-f0-9-]+$/, { timeout: 10000 });

    // Extract game ID
    gameId = page.url().match(/\/games\/([a-f0-9-]+)/)?.[1]!;
    expect(gameId).toBeTruthy();
    console.log(`✓ Game created with ID: ${gameId}`);

    // Verify game details page
    await expect(page.locator('h1')).toContainText(TEST_GAME.title);
    await expect(page.locator('text=0/10')).toBeVisible(); // 0 sessions unlocked

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/integration-01-game-created.png',
      fullPage: true
    });
  });

  test('STEP 2: GM starts game and unlocks first session', async ({ page }) => {
    console.log('>>> STEP 2: Start Game and Unlock Session');

    // Login
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    // Navigate to game
    await page.click(`text=${TEST_GAME.title}`);
    await page.waitForURL(`http://localhost:3002/games/${gameId}`);

    // Start game
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(1500);
    await expect(page.locator('text=active')).toBeVisible();
    console.log('✓ Game started');

    // Unlock first session
    const firstUnlockButton = page.locator('button:has-text("Unlock")').first();
    await firstUnlockButton.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Unlocked').first()).toBeVisible();
    console.log('✓ First session unlocked');

    // Verify session count updated
    await expect(page.locator('text=1/10')).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/integration-02-game-started-session-unlocked.png',
      fullPage: true
    });
  });

  test('STEP 3: Teams join the game via API', async ({ page }) => {
    console.log('>>> STEP 3: Teams Join Game');

    // Create teams via backend API
    const teamIds = await createTeamsViaAPI(gameId);
    expect(teamIds.length).toBe(3);
    console.log(`✓ ${teamIds.length} teams created:`, teamIds);

    // Verify teams appear in GM Dashboard
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    await page.click(`text=${TEST_GAME.title}`);
    await page.waitForURL(`http://localhost:3002/games/${gameId}`);

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Verify team count in stats card
    const teamsCard = page.locator('text=Teams').locator('..');
    await expect(teamsCard).toContainText('3');
    console.log('✓ Teams visible in GM dashboard');

    // Verify teams listed
    for (const team of TEST_TEAMS) {
      await expect(page.locator(`text=${team.name}`)).toBeVisible();
    }

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/integration-03-teams-joined.png',
      fullPage: true
    });
  });

  test('STEP 4: GM monitors teams and unlocks more sessions', async ({ page }) => {
    console.log('>>> STEP 4: Monitor Teams and Unlock More Sessions');

    // Login and navigate to game
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    await page.click(`text=${TEST_GAME.title}`);
    await page.waitForURL(`http://localhost:3002/games/${gameId}`);

    // Unlock sessions 2 and 3
    const unlockButtons = await page.locator('button:has-text("Unlock")').all();

    if (unlockButtons.length >= 2) {
      await unlockButtons[0].click();
      await page.waitForTimeout(1500);
      console.log('✓ Session 2 unlocked');

      await unlockButtons[1].click();
      await page.waitForTimeout(1500);
      console.log('✓ Session 3 unlocked');

      // Verify session count updated
      await expect(page.locator('text=3/10')).toBeVisible({ timeout: 5000 });
    }

    // Take screenshot
    await page.screenshot({
      path: 'e2e-results/integration-04-multiple-sessions-unlocked.png',
      fullPage: true
    });
  });

  test('STEP 5: Verify game progress and statistics', async ({ page }) => {
    console.log('>>> STEP 5: Verify Game Progress');

    // Login and navigate to game
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    await page.click(`text=${TEST_GAME.title}`);
    await page.waitForURL(`http://localhost:3002/games/${gameId}`);

    // Verify stats cards
    await expect(page.locator('text=Teams')).toBeVisible();
    await expect(page.locator('text=Sessions')).toBeVisible();

    // Verify team count
    const teamsCard = page.locator('text=Teams').locator('..');
    await expect(teamsCard).toContainText('3');

    // Verify all teams listed with scores
    for (const team of TEST_TEAMS) {
      const teamCard = page.locator(`text=${team.name}`).locator('..');
      await expect(teamCard).toBeVisible();

      // Teams should have initial score (50.0 for each metric)
      await expect(teamCard).toContainText('50'); // Initial score
    }

    // Take final screenshot
    await page.screenshot({
      path: 'e2e-results/integration-05-final-state.png',
      fullPage: true
    });

    console.log('✓ Integration test completed successfully');
  });
});

test.describe('INTEGRATION: Multi-Browser Team Access', () => {
  test.skip('Teams can access game from team frontend', async ({ page }) => {
    // This would test that teams can navigate to localhost:5173
    // and access their dashboard with the team ID
    // For now, skipping as it requires team frontend to be fully integrated
    console.log('>>> SKIPPED: Team frontend integration pending');
  });
});

test.describe('INTEGRATION: Cleanup', () => {
  test('should cleanup test data', async ({ page }) => {
    console.log('>>> Cleanup: Deleting test game');

    // Login
    await page.goto('http://localhost:3002/login');
    await page.fill('input[type="email"]', GAME_MASTER.email);
    await page.fill('input[type="password"]', GAME_MASTER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3002/games');

    // Find and delete the test game
    const gameCard = page.locator(`text=${TEST_GAME.title}`).locator('..');
    const deleteButton = gameCard.locator('button[title="Delete game"]');

    if (await deleteButton.isVisible()) {
      page.on('dialog', dialog => dialog.accept());
      await deleteButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Test game deleted');
    }
  });
});
