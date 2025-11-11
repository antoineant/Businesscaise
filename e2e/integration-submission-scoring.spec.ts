import { test, expect, Page, chromium } from '@playwright/test';

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

  // Register using semantic selectors (best practice)
  await page.goto('http://localhost:3002/register');
  await page.waitForLoadState('networkidle');

  await page.getByLabel(/name/i).fill(testGM.name);
  await page.getByLabel(/email/i).fill(testGM.email);

  const passwordFields = await page.locator('input[type="password"]').all();
  await passwordFields[0].fill(testGM.password);
  await passwordFields[1].fill(testGM.password);

  await page.getByRole('button', { name: /register|create account/i }).click();

  // Wait for redirect to dashboard OR error
  await Promise.race([
    page.waitForURL('/games', { timeout: 10000 }),
    page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
      .then(async () => {
        const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent();
        throw new Error(`Registration failed: ${errorText}`);
      })
  ]);

  return testGM;
}

// Helper: Create a game
async function createGame(page: Page) {
  const testGame = generateTestGame();

  // Navigate to create game page
  await page.goto('http://localhost:3002/games');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /create game/i }).click();
  await page.waitForURL('/games/create', { timeout: 10000 });

  // Fill form using semantic selectors (best practice - accessible & robust)
  await page.getByLabel(/game title/i).fill(testGame.title);
  await page.getByLabel(/description/i).fill(testGame.description);
  await page.getByLabel(/start.*date/i).fill(testGame.startDate);
  await page.getByLabel(/end.*date/i).fill(testGame.endDate);

  // Submit form
  await page.getByRole('button', { name: /create game/i }).click();

  // Wait for redirect to game details OR error
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

  if (!gameId) {
    throw new Error('Failed to extract game ID from URL: ' + url);
  }

  return { ...testGame, id: gameId };
}

// Helper: Start game and unlock first session
async function startGameAndUnlockSession(page: Page, gameId: string) {
  await page.goto(`http://localhost:3002/games/${gameId}`);
  await page.waitForLoadState('networkidle');

  // Start game using semantic selector
  await page.getByRole('button', { name: /start game/i }).click();

  // Wait for game status to change (button should change from "Start" to "Pause")
  await page.waitForSelector('button:has-text("Pause Game")', { timeout: 5000 });

  // Unlock first session
  const unlockButtons = await page.getByRole('button', { name: /unlock/i }).all();
  if (unlockButtons.length > 0) {
    await unlockButtons[0].click();
    // Wait for unlock to complete (button should disappear or change)
    await page.waitForTimeout(500); // Small delay for API call
  }
}

// Helper: Register player and join game as team, then submit decision
async function submitAsTeam(gameId: string) {
  const testPlayer = generateTestPlayer();
  const testTeam = generateTestTeam();

  // Create new page context for team player (ES module syntax - chromium imported at top)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const playerPage = await context.newPage();

  try {
    // Register player using semantic selectors (best practice)
    await playerPage.goto('http://localhost:5173/register');
    await playerPage.waitForLoadState('networkidle');

    await playerPage.getByLabel(/name/i).fill(testPlayer.name);
    await playerPage.getByLabel(/email/i).fill(testPlayer.email);
    await playerPage.getByLabel(/^password$/i).fill(testPlayer.password);

    // Handle confirm password if exists
    const confirmPasswordInput = playerPage.getByLabel(/confirm.*password/i);
    if (await confirmPasswordInput.count() > 0) {
      await confirmPasswordInput.fill(testPlayer.password);
    }

    await playerPage.getByRole('button', { name: /register|sign up|create account/i }).click();

    // Wait for redirect OR error
    await Promise.race([
      playerPage.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 }),
      playerPage.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
        .then(async () => {
          const errorText = await playerPage.locator('.bg-red-50, [class*="error"]').textContent();
          throw new Error(`Player registration failed: ${errorText}`);
        })
    ]);

    // Navigate to join page
    await playerPage.goto('http://localhost:5173/join');
    await playerPage.waitForLoadState('networkidle');

    // Enter game code using semantic selector
    await playerPage.getByPlaceholder(/game code|enter game/i).fill(gameId);
    await playerPage.getByRole('button', { name: /join game/i }).click();

    // Wait for team join modal
    await playerPage.getByRole('heading', { name: /join.*game/i }).waitFor({ timeout: 5000 });

    // Fill team name - first required text input in modal
    await playerPage.locator('input[type="text"][required]').first().fill(testTeam.name);

    // Submit join form and wait for success
    const responsePromise = playerPage.waitForResponse(
      resp => resp.url().includes('/api/teams/join') && resp.status() === 201,
      { timeout: 10000 }
    );
    await playerPage.getByRole('button', { name: /join/i, exact: false }).click();
    await responsePromise;

    // Wait for game page to load
    await playerPage.waitForURL(/.*\/game\//, { timeout: 10000 });
    await playerPage.getByRole('button', { name: /dashboard/i }).waitFor({ timeout: 10000 });

    // Navigate to Challenge tab (required to see submission form)
    await playerPage.getByRole('button', { name: /current challenge/i }).click();

    // Wait for form to load - check for textarea (generic submission) OR number inputs (level-specific)
    await Promise.race([
      playerPage.waitForSelector('textarea#submission-data', { timeout: 10000 }),
      playerPage.waitForSelector('input[type="number"]', { timeout: 10000 })
    ]);

    // Fill in decision inputs (loan amount and budget allocations)
    const numberInputs = await playerPage.locator('input[type="number"]').all();
    if (numberInputs.length >= 5) {
      await numberInputs[0].fill('50000'); // Loan amount
      await numberInputs[1].fill('10000'); // Marketing
      await numberInputs[2].fill('15000'); // Product
      await numberInputs[3].fill('12000'); // Operations
      await numberInputs[4].fill('13000'); // HR
    } else {
      // Fallback: use generic textarea if level-specific inputs don't exist
      const textarea = playerPage.locator('textarea#submission-data');
      if (await textarea.count() > 0) {
        await textarea.fill('Strategic decision for Level 1: balanced budget allocation');
      }
    }

    // Submit decision using semantic selector
    const submitButton = playerPage.getByRole('button', { name: /submit decision/i });
    await submitButton.click();

    // Wait for EITHER success OR error message (better error handling)
    await Promise.race([
      // Success case
      playerPage.waitForSelector('.bg-green-50', { timeout: 20000 }),
      // Error case - throw with details
      playerPage.waitForSelector('.bg-red-50', { timeout: 20000 })
        .then(async () => {
          const errorText = await playerPage.locator('.bg-red-50').textContent();
          throw new Error(`Submission failed: ${errorText}`);
        })
    ]);

    // Verify success
    const hasSuccess = await playerPage.locator('.bg-green-50').count();
    if (hasSuccess === 0) {
      const errorText = await playerPage.locator('.bg-red-50').textContent();
      throw new Error(`Submission error: ${errorText}`);
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
    await expect(page.getByText(testTeam.name).first()).toBeVisible();

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
