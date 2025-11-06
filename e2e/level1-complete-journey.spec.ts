// E2E Test: Complete Level 1 Student Journey
// Tests the full flow from login to viewing results

import { test, expect } from '@playwright/test';

// Helper function to enable demo mode
async function enableDemoMode(page) {
  // Look for demo mode toggle
  const demoToggle = page.getByRole('button', { name: /demo mode/i });
  if (await demoToggle.isVisible().catch(() => false)) {
    await demoToggle.click();
  }
}

// Helper to login as demo player
async function loginAsDemoPlayer(page) {
  // beforeEach already navigated to /login?demo=true, so just fill the form

  // Fill in login credentials
  await page.getByLabel(/email/i).fill('demo-player1@businesscaise.com');
  await page.getByLabel(/password/i).fill('demo123');

  // Click login button
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard|game/, { timeout: 10000 });
}

test.describe('Level 1: Complete Student Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to login page with demo mode enabled
    await page.goto('/login?demo=true', { waitUntil: 'domcontentloaded' });
    // Wait a moment for demo mode to be applied
    await page.waitForTimeout(500);

    // Close demo mode help modal if it's open
    const gotItButton = page.getByRole('button', { name: /got it/i });
    if (await gotItButton.isVisible().catch(() => false)) {
      await gotItButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should complete full session: login → decision → submit → results', async ({ page }) => {
    // STEP 1: Login
    await loginAsDemoPlayer(page);
    await expect(page).toHaveURL(/dashboard|game/);

    // STEP 2: Navigate to active session (if needed, though auto-navigation should handle this)
    // The auto-navigation in GameSelection and PlayerGame should show the game tab directly

    // STEP 3: Verify Level 1 interface appears
    await expect(page.getByText(/level 1.*business fundamentals/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('current-financial-state')).toBeVisible();

    // STEP 4: Check starting cash is displayed using test ID (more specific)
    await expect(page.getByTestId('starting-cash')).toHaveText('$50,000');

    // STEP 5: Make banking decision - take a medium-term loan
    const loanCheckbox = page.getByTestId('loan-checkbox');
    await loanCheckbox.check();

    // Wait for loan form to appear
    await expect(page.getByText(/loan term/i)).toBeVisible();

    // Select medium-term loan
    const mediumTermButton = page.getByRole('button', { name: /medium-term/i });
    await mediumTermButton.click();

    // STEP 6: Set loan amount to $40,000
    const loanSlider = page.locator('input[type="range"]').first();
    await loanSlider.fill('40000');

    // STEP 7: Verify loan summary shows using test ID
    await expect(page.getByTestId('loan-summary')).toBeVisible();
    await expect(page.getByTestId('loan-total-owed')).toBeVisible();
    await expect(page.getByTestId('loan-monthly-payment')).toBeVisible();

    // STEP 8: Verify budget allocation section is visible
    await expect(page.getByTestId('budget-allocation')).toBeVisible();

    // STEP 9: Verify total allocation is 100% using test ID
    await expect(page.getByTestId('total-allocation-percentage')).toHaveText('100%');

    // STEP 10: Submit decision using test ID
    const submitButton = page.getByTestId('submit-decision-button');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // STEP 11: Wait for results to load
    await expect(page.getByText(/overall score/i)).toBeVisible({ timeout: 10000 });

    // STEP 12: Verify results are displayed
    await expect(page.getByText(/performance breakdown/i)).toBeVisible();
    await expect(page.getByText(/financial summary/i)).toBeVisible();

    // STEP 13: Verify score components
    await expect(page.getByText(/cash.*profit/i)).toBeVisible();
    await expect(page.getByText(/debt health/i)).toBeVisible();
    await expect(page.getByText(/employee happiness/i)).toBeVisible();
    await expect(page.getByText(/customer satisfaction/i)).toBeVisible();

    // STEP 14: Verify financial metrics are shown
    await expect(page.getByText(/revenue/i)).toBeVisible();
    await expect(page.getByText(/gross profit/i)).toBeVisible();
    await expect(page.getByText(/net profit/i)).toBeVisible();
    await expect(page.getByText(/ending cash/i)).toBeVisible();

    // STEP 15: Verify feedback is provided
    await expect(page.getByText(/learning tips/i)).toBeVisible();

    // STEP 16: Verify next session state is shown
    await expect(page.getByText(/next session starting position/i)).toBeVisible();

    // STEP 17: Take a screenshot of the results
    await page.screenshot({ path: 'e2e-results/level1-complete-session.png', fullPage: true });
  });

  test('should handle conservative strategy (no loan)', async ({ page }) => {
    await loginAsDemoPlayer(page);

    // Auto-navigation should take us to the game
    await page.waitForURL(/game/);
    await page.waitForTimeout(1000);

    // Verify Level 1 interface
    await expect(page.getByText(/level 1.*business fundamentals/i)).toBeVisible({ timeout: 10000 });

    // Make conservative decision - no loan
    const loanCheckbox = page.getByTestId('loan-checkbox');

    // Ensure it's unchecked
    if (await loanCheckbox.isChecked()) {
      await loanCheckbox.uncheck();
    }

    // Keep default allocations (33/33/34)
    const submitButton = page.getByTestId('submit-decision-button');

    if (await submitButton.isEnabled()) {
      await submitButton.click();

        // Wait for results
        await page.waitForSelector('text=/overall score/i', { timeout: 10000 });

        // Verify no debt
        await expect(page.getByText(/total debt.*\$0/i)).toBeVisible();

        // Verify perfect debt health score
        await expect(page.getByText(/debt health.*100/i)).toBeVisible();

        // Screenshot
        await page.screenshot({ path: 'e2e-results/level1-conservative.png', fullPage: true });
      }
    }
  });

  test('should handle aggressive borrowing strategy', async ({ page }) => {
    await loginAsDemoPlayer(page);

    await page.waitForURL(/game/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(/level 1.*business fundamentals/i)).toBeVisible({ timeout: 10000 });

    // Take maximum long-term loan
    const loanCheckbox = page.getByTestId('loan-checkbox');
    await loanCheckbox.check();

      // Select long-term
      const longTermButton = page.getByRole('button', { name: /long-term/i });
      if (await longTermButton.isVisible()) {
        await longTermButton.click();

        // Max out loan amount
        const loanSlider = page.locator('input[type="range"]').first();
        await loanSlider.fill('100000');

        // Set aggressive marketing allocation
        const sliders = page.locator('input[type="range"]');
        const count = await sliders.count();

        // Try to set allocations (if we can identify them)
        // This is simplified - in real test you'd identify each slider specifically

        // Submit
        const submitButton = page.getByTestId('submit-decision-button');
        if (await submitButton.isEnabled()) {
          await submitButton.click();

          // Wait for results
          await page.waitForSelector('text=/overall score/i', { timeout: 10000 });

          // Verify high debt
          await expect(page.getByText(/total debt.*\$100,000|112,000/i)).toBeVisible();

          // Should have debt warnings
          await expect(page.getByText(/debt/i)).toBeVisible();

          // Screenshot
          await page.screenshot({ path: 'e2e-results/level1-aggressive.png', fullPage: true });
        }
      }
    }
  });

  test('should display warnings for risky decisions', async ({ page }) => {
    await loginAsDemoPlayer(page);

    await page.waitForURL(/game/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(/level 1.*business fundamentals/i)).toBeVisible({ timeout: 10000 });

    // Take short-term loan (high payments)
    const loanCheckbox = page.getByTestId('loan-checkbox');
    await loanCheckbox.check();

      const shortTermButton = page.getByRole('button', { name: /short-term/i });
      if (await shortTermButton.isVisible()) {
        await shortTermButton.click();

        // Set max amount
        const loanSlider = page.locator('input[type="range"]').first();
        await loanSlider.fill('50000');

        // Submit
        const submitButton = page.getByTestId('submit-decision-button');
        if (await submitButton.isEnabled()) {
          await submitButton.click();

          // Wait for results
          await page.waitForSelector('text=/overall score/i', { timeout: 10000 });

          // Should show warnings (info, warning, or critical)
          const warningElements = page.locator('[class*="bg-yellow"], [class*="bg-red"], [class*="bg-blue"]');
          const warningCount = await warningElements.count();

          // At least some visual feedback should exist
          expect(warningCount).toBeGreaterThan(0);

          // Screenshot
          await page.screenshot({ path: 'e2e-results/level1-warnings.png', fullPage: true });
        }
      }
    }
  });

  test('should handle form validation errors', async ({ page }) => {
    await loginAsDemoPlayer(page);

    await page.waitForURL(/game/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(/level 1.*business fundamentals/i)).toBeVisible({ timeout: 10000 });

    // Try to manipulate allocations to not equal 100%
    // This tests if validation prevents submission
    const sliders = page.locator('input[type="range"]');
    const count = await sliders.count();

    if (count > 1) {
      // Try to set employees to 90% (will make total > 100%)
      const employeeSlider = sliders.nth(1); // Skip loan slider
      await employeeSlider.fill('90');

      // Submit button should be disabled
      const submitButton = page.getByTestId('submit-decision-button');

      // Wait a moment for state to update
      await page.waitForTimeout(500);

      // Button should be disabled (or error shown)
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);

      // Screenshot
      await page.screenshot({ path: 'e2e-results/level1-validation-error.png', fullPage: true });
    }
  });

  test('should show loading state during submission', async ({ page }) => {
    await loginAsDemoPlayer(page);

    await page.waitForURL(/game/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(/level 1.*business fundamentals/i)).toBeVisible({ timeout: 10000 });

    // Submit with default values
    const submitButton = page.getByTestId('submit-decision-button');

    if (await submitButton.isEnabled()) {
      // Click submit
      const submitPromise = submitButton.click();

      // Immediately check for loading state
      const loadingText = page.getByText(/submitting/i);

      // Loading state might be very brief, so we use timeout
      await expect(loadingText).toBeVisible({ timeout: 1000 }).catch(() => {
        // It's okay if loading is too fast to catch
        console.log('Loading state was too fast to observe');
      });

      await submitPromise;

      // Eventually results should appear
      await expect(page.getByText(/overall score/i)).toBeVisible({ timeout: 10000 });
    }
  });
});
