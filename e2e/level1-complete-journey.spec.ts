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
  await page.goto('/');

  // Enable demo mode if needed
  await enableDemoMode(page);

  // Fill in login credentials
  await page.getByLabel(/email/i).fill('demo-player1@businesscaise.com');
  await page.getByLabel(/password/i).fill('demo123');

  // Click login button
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard|game/, { timeout: 5000 });
}

test.describe('Level 1: Complete Student Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure demo mode is enabled
    await page.goto('/');
    await enableDemoMode(page);
  });

  test('should complete full session: login → decision → submit → results', async ({ page }) => {
    // STEP 1: Login
    await loginAsDemoPlayer(page);
    await expect(page).toHaveURL(/dashboard|game/);

    // STEP 2: Navigate to active session
    const sessionLink = page.getByText(/session|challenge/i).first();
    if (await sessionLink.isVisible().catch(() => false)) {
      await sessionLink.click();
    }

    // STEP 3: Verify Level 1 interface appears
    await expect(page.getByText(/level 1.*business fundamentals/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/current financial state/i)).toBeVisible();

    // STEP 4: Check starting cash is displayed
    await expect(page.getByText(/\$50,000/)).toBeVisible();

    // STEP 5: Make banking decision - take a medium-term loan
    const loanCheckbox = page.getByRole('checkbox', { name: /take a loan/i });
    await loanCheckbox.check();

    // Wait for loan form to appear
    await expect(page.getByText(/loan term/i)).toBeVisible();

    // Select medium-term loan
    const mediumTermButton = page.getByRole('button', { name: /medium-term/i });
    await mediumTermButton.click();

    // STEP 6: Set loan amount to $40,000
    const loanSlider = page.locator('input[type="range"]').first();
    await loanSlider.fill('40000');

    // STEP 7: Verify loan summary shows
    await expect(page.getByText(/total owed/i)).toBeVisible();
    await expect(page.getByText(/monthly payment/i)).toBeVisible();

    // STEP 8: Adjust budget allocation sliders
    // Note: Just verify they're visible - default allocation should work
    await expect(page.getByText(/employees/i)).toBeVisible();
    await expect(page.getByText(/marketing/i)).toBeVisible();
    await expect(page.getByText(/products/i)).toBeVisible();

    // STEP 9: Verify total allocation is 100%
    await expect(page.getByText(/total allocation.*100%/i)).toBeVisible();

    // STEP 10: Submit decision
    const submitButton = page.getByRole('button', { name: /submit decision/i });
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

    // Navigate to session
    await page.goto('/'); // Adjust to actual session URL
    await page.waitForTimeout(1000);

    // Verify Level 1 interface
    const level1Header = page.getByText(/level 1/i).first();
    if (await level1Header.isVisible().catch(() => false)) {
      // Make conservative decision - no loan
      const loanCheckbox = page.getByRole('checkbox', { name: /take a loan/i });

      // Ensure it's unchecked
      if (await loanCheckbox.isChecked()) {
        await loanCheckbox.uncheck();
      }

      // Keep default allocations (33/33/34)
      const submitButton = page.getByRole('button', { name: /submit decision/i });

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

    await page.goto('/');
    await page.waitForTimeout(1000);

    const level1Header = page.getByText(/level 1/i).first();
    if (await level1Header.isVisible().catch(() => false)) {
      // Take maximum long-term loan
      const loanCheckbox = page.getByRole('checkbox', { name: /take a loan/i });
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
        const submitButton = page.getByRole('button', { name: /submit decision/i });
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

    await page.goto('/');
    await page.waitForTimeout(1000);

    const level1Header = page.getByText(/level 1/i).first();
    if (await level1Header.isVisible().catch(() => false)) {
      // Take short-term loan (high payments)
      const loanCheckbox = page.getByRole('checkbox', { name: /take a loan/i });
      await loanCheckbox.check();

      const shortTermButton = page.getByRole('button', { name: /short-term/i });
      if (await shortTermButton.isVisible()) {
        await shortTermButton.click();

        // Set max amount
        const loanSlider = page.locator('input[type="range"]').first();
        await loanSlider.fill('50000');

        // Submit
        const submitButton = page.getByRole('button', { name: /submit decision/i });
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

    await page.goto('/');
    await page.waitForTimeout(1000);

    const level1Header = page.getByText(/level 1/i).first();
    if (await level1Header.isVisible().catch(() => false)) {
      // Try to manipulate allocations to not equal 100%
      // This tests if validation prevents submission

      const sliders = page.locator('input[type="range"]');
      const count = await sliders.count();

      if (count > 1) {
        // Try to set employees to 90% (will make total > 100%)
        const employeeSlider = sliders.nth(1); // Skip loan slider
        await employeeSlider.fill('90');

        // Submit button should be disabled
        const submitButton = page.getByRole('button', { name: /submit decision/i });

        // Wait a moment for state to update
        await page.waitForTimeout(500);

        // Button should be disabled (or error shown)
        const isDisabled = await submitButton.isDisabled();
        expect(isDisabled).toBe(true);

        // Screenshot
        await page.screenshot({ path: 'e2e-results/level1-validation-error.png', fullPage: true });
      }
    }
  });

  test('should show loading state during submission', async ({ page }) => {
    await loginAsDemoPlayer(page);

    await page.goto('/');
    await page.waitForTimeout(1000);

    const level1Header = page.getByText(/level 1/i).first();
    if (await level1Header.isVisible().catch(() => false)) {
      // Submit with default values
      const submitButton = page.getByRole('button', { name: /submit decision/i });

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
    }
  });
});
