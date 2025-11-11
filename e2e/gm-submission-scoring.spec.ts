import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for GM Submission Scoring
 * Tests the complete submission workflow from team submission to GM scoring
 */

// Generate unique test data
const generateTestGM = () => ({
  name: 'Test Game Master',
  email: `gm-test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@businesscaise.com`,
  password: 'TestGM123!',
});

const generateTestPlayer = () => ({
  name: 'Test Player',
  email: `player-test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@businesscaise.com`,
  password: 'TestPlayer123!',
});

const generateTestGame = () => ({
  title: `E2E Submission Test ${Date.now()}`,
  description: 'Test game for submission scoring',
  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
});

const generateTestTeam = () => ({
  name: `Test Team ${Date.now()}`,
  school: 'Test University',
  difficulty: 'beginner',
});

// Helper: Register and login as GM
async function setupGM(page: Page) {
  const testGM = generateTestGM();

  // Register
  await page.goto('http://localhost:3002/register');
  await page.fill('input[type="text"], input#name', testGM.name);
  await page.fill('input[type="email"], input#email', testGM.email);
  const passwordFields = await page.locator('input[type="password"]').all();
  await passwordFields[0].fill(testGM.password);
  await passwordFields[1].fill(testGM.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/games', { timeout: 10000 });

  return testGM;
}

// Helper: Create a game
async function createGame(page: Page) {
  const testGame = generateTestGame();

  await page.goto('http://localhost:3002/games/create');
  await page.fill('input#title', testGame.title);
  await page.fill('textarea#description', testGame.description);
  await page.fill('input#start_date', testGame.startDate);
  await page.fill('input#end_date', testGame.endDate);
  await page.click('button[type="submit"]');

  // Wait for redirect to game details
  await page.waitForURL(/\/games\/[a-f0-9-]+$/, { timeout: 10000 });

  // Extract game ID from URL
  const url = page.url();
  const gameId = url.split('/games/')[1];

  return { ...testGame, id: gameId };
}

// Helper: Start game and unlock first session
async function startGameAndUnlockSession(page: Page, gameId: string) {
  await page.goto(`http://localhost:3002/games/${gameId}`);

  // Start game
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(1000);

  // Unlock first session
  const unlockButtons = await page.locator('button:has-text("Unlock")').all();
  if (unlockButtons.length > 0) {
    await unlockButtons[0].click();
    await page.waitForTimeout(1000);
  }
}

// Helper: Register player and join game as team
async function submitAsTeam(gameId: string) {
  const testPlayer = generateTestPlayer();
  const testTeam = generateTestTeam();

  // Create new page context for team player
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const playerPage = await context.newPage();

  try {
    // Register player
    await playerPage.goto('http://localhost:5173/register');
    await playerPage.fill('input[type="text"], input#name', testPlayer.name);
    await playerPage.fill('input[type="email"], input#email', testPlayer.email);
    const passwordFields = await playerPage.locator('input[type="password"]').all();
    await passwordFields[0].fill(testPlayer.password);
    await passwordFields[1].fill(testPlayer.password);

    // Select Player role (if radio button exists)
    const playerRadio = playerPage.locator('label:has-text("Player")');
    if (await playerRadio.count() > 0) {
      await playerRadio.click();
    }

    await playerPage.click('button[type="submit"]');
    await playerPage.waitForURL(/.*/, { timeout: 10000 });

    // Join game
    await playerPage.goto('http://localhost:5173/join');
    await playerPage.fill('input[placeholder*="game code"], input[placeholder*="Game Code"]', gameId);
    await playerPage.click('button:has-text("Next")');
    await playerPage.waitForTimeout(1000);

    // Fill team details
    await playerPage.fill('input[placeholder*="team name"], input[placeholder*="Team Name"]', testTeam.name);
    await playerPage.fill('input[placeholder*="school"], input[placeholder*="School"]', testTeam.school);

    // Select difficulty if available
    const difficultySelect = playerPage.locator('select, [role="combobox"]');
    if (await difficultySelect.count() > 0) {
      await difficultySelect.first().selectOption(testTeam.difficulty);
    }

    // Submit join form and wait for success
    const responsePromise = playerPage.waitForResponse(
      resp => resp.url().includes('/api/teams/join') && resp.status() === 201,
      { timeout: 10000 }
    );
    await playerPage.click('button[type="submit"]:has-text("Join")');
    await responsePromise;

    // Wait for game page to load
    await playerPage.waitForURL(/.*\/game\//, { timeout: 10000 });
    await playerPage.waitForTimeout(2000);

    // For beginner difficulty, submit Level 1 decision
    if (testTeam.difficulty === 'beginner') {
      // Wait for input form to load
      await playerPage.waitForSelector('input[type="number"]', { timeout: 5000 });

      // Fill in decision inputs (loan amount and budget allocations)
      const numberInputs = await playerPage.locator('input[type="number"]').all();
      if (numberInputs.length >= 5) {
        await numberInputs[0].fill('50000'); // Loan amount
        await numberInputs[1].fill('10000'); // Marketing
        await numberInputs[2].fill('15000'); // Product
        await numberInputs[3].fill('12000'); // Operations
        await numberInputs[4].fill('13000'); // HR
      }

      // Submit decision
      await playerPage.click('button:has-text("Submit")');
      await playerPage.waitForTimeout(2000);
    }

    return { testPlayer, testTeam };
  } finally {
    await browser.close();
  }
}

test.describe('GM Submission Scoring', () => {
  test('should view submissions list and score a submission', async ({ page }) => {
    console.log('[TEST] Starting submission scoring E2E test');

    // 1. Setup GM and create game
    console.log('[TEST] Setting up GM account...');
    await setupGM(page);

    console.log('[TEST] Creating game...');
    const game = await createGame(page);
    console.log(`[TEST] Game created: ${game.id}`);

    // 2. Start game and unlock first session
    console.log('[TEST] Starting game and unlocking first session...');
    await startGameAndUnlockSession(page, game.id);

    // 3. Have a team submit a decision
    console.log('[TEST] Creating team and submitting decision...');
    const { testTeam } = await submitAsTeam(game.id);
    console.log(`[TEST] Team ${testTeam.name} submitted decision`);

    // 4. Navigate to submissions page
    console.log('[TEST] Navigating to submissions page...');
    await page.goto(`http://localhost:3002/games/${game.id}`);
    await page.waitForLoadState('networkidle');

    // Click on Submissions card
    await page.click('[data-testid="submissions-stat-card"]');
    await page.waitForURL(`/games/${game.id}/submissions`, { timeout: 10000 });

    // 5. Verify submissions list loads
    console.log('[TEST] Verifying submissions list...');
    await expect(page.getByRole('heading', { name: /submissions/i })).toBeVisible({ timeout: 5000 });

    // Verify filter tabs are present
    await expect(page.getByRole('button', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pending/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /scored/i })).toBeVisible();

    // Verify team submission appears in list
    await expect(page.getByText(testTeam.name).first()).toBeVisible({ timeout: 5000 });

    // 6. Click on submission to view details
    console.log('[TEST] Viewing submission details...');
    await page.getByText(testTeam.name).first().click();
    await page.waitForURL(/\/submissions\/[a-f0-9-]+$/, { timeout: 10000 });

    // Verify submission details page loads
    await expect(page.getByRole('heading', { name: /submission details/i })).toBeVisible();
    await expect(page.getByText(testTeam.name)).toBeVisible();

    // 7. Score the submission
    console.log('[TEST] Scoring submission...');
    const scoreValue = '85.5';
    const feedbackText = 'Great work! Your loan decision was well-reasoned.';

    await page.fill('input#score', scoreValue);
    await page.fill('textarea#feedback', feedbackText);

    // Submit score
    await page.click('button[type="submit"]:has-text("Submit Score")');

    // Wait for success message
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/scored successfully/i)).toBeVisible();

    // 8. Verify score is displayed
    console.log('[TEST] Verifying score is displayed...');
    await expect(page.getByText(scoreValue)).toBeVisible();

    // 9. Go back to submissions list and verify status changed
    console.log('[TEST] Verifying submission status changed...');
    await page.goto(`http://localhost:3002/games/${game.id}/submissions`);
    await page.waitForLoadState('networkidle');

    // Filter by scored
    await page.click('button:has-text("Scored")');
    await page.waitForTimeout(500);

    // Verify submission appears with scored badge
    await expect(page.getByText(testTeam.name).first()).toBeVisible();
    await expect(page.locator('.bg-green-100').getByText(/scored/i)).toBeVisible();
    await expect(page.getByText(scoreValue)).toBeVisible();

    console.log('[TEST] ✓ Submission scoring test completed successfully!');
  });

  test('should filter submissions by status', async ({ page }) => {
    console.log('[TEST] Starting submission filter test');

    // Setup GM and create game
    await setupGM(page);
    const game = await createGame(page);
    await startGameAndUnlockSession(page, game.id);

    // Have team submit
    await submitAsTeam(game.id);

    // Navigate to submissions page
    await page.goto(`http://localhost:3002/games/${game.id}/submissions`);
    await page.waitForLoadState('networkidle');

    // Test "All" filter
    await page.click('button:has-text("All")');
    await page.waitForTimeout(500);
    const allSubmissions = await page.locator('.bg-white.border').count();
    expect(allSubmissions).toBeGreaterThan(0);

    // Test "Pending" filter
    await page.click('button:has-text("Pending")');
    await page.waitForTimeout(500);
    const pendingSubmissions = await page.locator('.bg-white.border').count();
    expect(pendingSubmissions).toBeGreaterThan(0);

    // Test "Scored" filter (should be empty initially)
    await page.click('button:has-text("Scored")');
    await page.waitForTimeout(500);
    await expect(page.getByText(/no scored submissions/i)).toBeVisible();

    console.log('[TEST] ✓ Submission filter test completed successfully!');
  });

  test('should update an existing score', async ({ page }) => {
    console.log('[TEST] Starting score update test');

    // Setup GM and create game
    await setupGM(page);
    const game = await createGame(page);
    await startGameAndUnlockSession(page, game.id);

    // Have team submit
    const { testTeam } = await submitAsTeam(game.id);

    // Navigate to submissions and score the submission
    await page.goto(`http://localhost:3002/games/${game.id}/submissions`);
    await page.waitForLoadState('networkidle');
    await page.getByText(testTeam.name).first().click();
    await page.waitForURL(/\/submissions\/[a-f0-9-]+$/, { timeout: 10000 });

    // Score it first time
    await page.fill('input#score', '75');
    await page.fill('textarea#feedback', 'Initial feedback');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 5000 });

    // Now update the score
    console.log('[TEST] Updating score...');
    await page.fill('input#score', '90');
    await page.fill('textarea#feedback', 'Updated feedback - excellent improvement!');
    await page.click('button[type="submit"]:has-text("Update Score")');

    // Verify success
    await expect(page.locator('.bg-green-50')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('90')).toBeVisible();

    console.log('[TEST] ✓ Score update test completed successfully!');
  });
});
