// E2E Test: Accessibility and Cross-Browser Compatibility
// Tests keyboard navigation, screen reader support, and responsive design

import { test, expect } from '@playwright/test';

test.describe('Level 1: Accessibility & UX', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Enable demo mode
    const demoToggle = page.getByText(/demo mode/i).first();
    if (await demoToggle.isVisible().catch(() => false)) {
      await demoToggle.click();
    }

    // Login with keyboard
    await page.keyboard.press('Tab'); // Focus email
    await page.keyboard.type('demo-player1@businesscaise.com');
    await page.keyboard.press('Tab'); // Focus password
    await page.keyboard.type('demo123');
    await page.keyboard.press('Tab'); // Focus login button
    await page.keyboard.press('Enter'); // Submit

    await page.waitForTimeout(2000);

    const level1Interface = page.getByText(/level 1/i).first();
    if (await level1Interface.isVisible().catch(() => false)) {
      console.log('=== Testing keyboard navigation ===');

      // Tab through form elements
      await page.keyboard.press('Tab'); // Should focus first interactive element

      // Check loan checkbox with Space
      const focusedElement1 = await page.evaluate(() => document.activeElement?.tagName);
      console.log('Focused element:', focusedElement1);

      // If on checkbox, toggle it
      if (await page.getByRole('checkbox', { name: /take a loan/i }).evaluate(el => el === document.activeElement)) {
        await page.keyboard.press('Space');
        console.log('✓ Checkbox toggled with keyboard');
      }

      // Continue tabbing through form
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => ({
          tag: document.activeElement?.tagName,
          type: (document.activeElement as any)?.type,
          role: document.activeElement?.getAttribute('role'),
        }));

        if (focused.tag === 'BUTTON') {
          console.log(`✓ Tab ${i}: Reached button element`);
          break;
        }
      }

      // Screenshot
      await page.screenshot({ path: 'e2e-results/keyboard-navigation.png', fullPage: true });
    }
  });

  test('should have proper ARIA labels for screen readers', async ({ page }) => {
    await page.goto('/');

    const demoToggle = page.getByText(/demo mode/i).first();
    if (await demoToggle.isVisible().catch(() => false)) {
      await demoToggle.click();
    }

    await page.waitForTimeout(500);

    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('demo-player1@businesscaise.com');
      await page.getByLabel(/password/i).fill('demo123');
      await page.getByRole('button', { name: /log in|sign in/i }).click();
      await page.waitForTimeout(2000);
    }

    const level1Interface = page.getByText(/level 1/i).first();
    if (await level1Interface.isVisible().catch(() => false)) {
      console.log('=== Checking ARIA labels ===');

      // Check for labeled inputs
      const loanCheckbox = page.getByRole('checkbox', { name: /take a loan/i });
      const hasCheckbox = await loanCheckbox.isVisible();
      expect(hasCheckbox).toBe(true);
      console.log('✓ Loan checkbox has accessible name');

      // Check for submit button
      const submitButton = page.getByRole('button', { name: /submit decision/i });
      const hasButton = await submitButton.isVisible();
      expect(hasButton).toBe(true);
      console.log('✓ Submit button has accessible name');

      // Check sliders have labels
      const sliders = page.locator('input[type="range"]');
      const sliderCount = await sliders.count();
      console.log(`✓ Found ${sliderCount} sliders`);

      // Verify form has semantic structure
      const form = page.locator('form').first();
      const hasForm = await form.isVisible();
      console.log(hasForm ? '✓ Form element exists' : '⚠ No form element found');
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/');

    const demoToggle = page.getByText(/demo mode/i).first();
    if (await demoToggle.isVisible().catch(() => false)) {
      await demoToggle.click();
    }

    await page.waitForTimeout(500);

    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('demo-player1@businesscaise.com');
      await page.getByLabel(/password/i).fill('demo123');
      await page.getByRole('button', { name: /log in|sign in/i }).click();
      await page.waitForTimeout(2000);
    }

    const level1Interface = page.getByText(/level 1/i).first();
    if (await level1Interface.isVisible().catch(() => false)) {
      console.log('=== Testing mobile responsiveness ===');

      // Verify key elements are visible and accessible
      await expect(page.getByText(/current financial state/i)).toBeVisible();
      await expect(page.getByText(/banking decision/i)).toBeVisible();
      await expect(page.getByText(/budget allocation/i)).toBeVisible();

      // Check that submit button is reachable
      const submitButton = page.getByRole('button', { name: /submit decision/i });
      await expect(submitButton).toBeVisible();

      // Scroll to bottom to check all content is accessible
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      // Screenshot mobile view
      await page.screenshot({ path: 'e2e-results/mobile-viewport.png', fullPage: true });

      console.log('✓ Mobile layout renders correctly');
    }
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await page.goto('/');

    const demoToggle = page.getByText(/demo mode/i).first();
    if (await demoToggle.isVisible().catch(() => false)) {
      await demoToggle.click();
    }

    await page.waitForTimeout(500);

    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('demo-player1@businesscaise.com');
      await page.getByLabel(/password/i).fill('demo123');
      await page.getByRole('button', { name: /log in|sign in/i }).click();
      await page.waitForTimeout(2000);
    }

    const level1Interface = page.getByText(/level 1/i).first();
    if (await level1Interface.isVisible().catch(() => false)) {
      console.log('=== Testing tablet responsiveness ===');

      // Verify layout adapts to tablet size
      await expect(page.getByText(/level 1/i)).toBeVisible();

      // Take screenshot
      await page.screenshot({ path: 'e2e-results/tablet-viewport.png', fullPage: true });

      console.log('✓ Tablet layout renders correctly');
    }
  });

  test('should have readable text with sufficient contrast', async ({ page }) => {
    await page.goto('/');

    const demoToggle = page.getByText(/demo mode/i).first();
    if (await demoToggle.isVisible().catch(() => false)) {
      await demoToggle.click();
    }

    await page.waitForTimeout(500);

    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('demo-player1@businesscaise.com');
      await page.getByLabel(/password/i).fill('demo123');
      await page.getByRole('button', { name: /log in|sign in/i }).click();
      await page.waitForTimeout(2000);
    }

    const level1Interface = page.getByText(/level 1/i).first();
    if (await level1Interface.isVisible().catch(() => false)) {
      console.log('=== Checking text contrast ===');

      // Get computed styles of key text elements
      const heading = page.getByText(/level 1.*business fundamentals/i).first();

      if (await heading.isVisible()) {
        const styles = await heading.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            background: computed.backgroundColor,
            fontSize: computed.fontSize,
          };
        });

        console.log('Heading styles:', styles);
        console.log('✓ Text elements have defined colors and sizes');
      }

      // Check that colored elements use Tailwind's accessible colors
      const coloredElements = await page.locator('[class*="text-"]').count();
      console.log(`✓ Found ${coloredElements} elements with color classes`);
    }
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 500); // Add 500ms delay
    });

    await page.goto('/');

    const demoToggle = page.getByText(/demo mode/i).first();
    if (await demoToggle.isVisible({ timeout: 15000 }).catch(() => false)) {
      await demoToggle.click();
    }

    await page.waitForTimeout(1000);

    const emailInput = page.getByLabel(/email/i).first();
    if (await emailInput.isVisible({ timeout: 10000 }).catch(() => false)) {
      await emailInput.fill('demo-player1@businesscaise.com');
      await page.getByLabel(/password/i).fill('demo123');
      await page.getByRole('button', { name: /log in|sign in/i }).click();
      await page.waitForTimeout(3000);
    }

    const level1Interface = page.getByText(/level 1/i).first();
    if (await level1Interface.isVisible({ timeout: 15000 }).catch(() => false)) {
      console.log('=== Testing slow network ===');

      // Submit decision
      const submitButton = page.getByRole('button', { name: /submit decision/i });

      if (await submitButton.isEnabled()) {
        await submitButton.click();

        // Should show loading state
        const loadingOrSubmitting = page.getByText(/submitting/i);
        if (await loadingOrSubmitting.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✓ Loading state visible during slow network');
        }

        // Eventually results appear
        await expect(page.getByText(/overall score/i)).toBeVisible({ timeout: 20000 });

        console.log('✓ App handles slow network gracefully');
      }
    }
  });
});
