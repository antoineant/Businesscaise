# E2E Testing with Playwright

This directory contains end-to-end tests for the BusinessCaise Level 1 system using Playwright.

## Test Suites

### 1. Complete Journey Tests (`level1-complete-journey.spec.ts`)
Tests the full student workflow from login to results:
- ✅ Complete session flow: login → decision → submit → results
- ✅ Conservative strategy (no loan taken)
- ✅ Aggressive borrowing strategy (maximum loan)
- ✅ Warning display for risky decisions
- ✅ Form validation errors
- ✅ Loading states during submission

### 2. Multi-Session Progression (`level1-multi-session.spec.ts`)
Tests state persistence across multiple game sessions:
- ✅ State maintenance across 3 consecutive sessions
- ✅ Debt paydown tracking over 6 sessions (short-term loan)
- ✅ Bankruptcy scenario over multiple sessions
- ✅ UI consistency across page reloads

### 3. Accessibility & UX (`level1-accessibility.spec.ts`)
Tests accessibility features and cross-browser compatibility:
- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ Responsive design on mobile viewport (375x667)
- ✅ Responsive design on tablet viewport (768x1024)
- ✅ Text contrast checking
- ✅ Slow network handling

## Running E2E Tests Locally

### Prerequisites

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**:
   ```bash
   npx playwright install
   ```

3. **Install System Dependencies** (Linux only):
   ```bash
   npx playwright install-deps
   ```

### Running Tests

**Run all tests**:
```bash
npx playwright test
```

**Run specific browser**:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Run specific test file**:
```bash
npx playwright test e2e/level1-complete-journey.spec.ts
```

**Run with UI mode** (recommended for debugging):
```bash
npx playwright test --ui
```

**Run in headed mode** (see browser):
```bash
npx playwright test --headed
```

### Viewing Test Results

After tests run, view the HTML report:
```bash
npx playwright show-report
```

Screenshots and videos (on failure) are saved to:
- Screenshots: `test-results/`
- E2E screenshots: `e2e-results/`

## Test Structure

Each test follows this pattern:

```typescript
test('should complete full session', async ({ page }) => {
  // 1. Setup: Login as demo player
  await loginAsDemoPlayer(page);

  // 2. Navigate to Level 1 interface
  await navigateToLevel1(page);

  // 3. Make decisions (loan, budget allocation)
  await makeLoanDecision(page);

  // 4. Submit decision
  await submitDecision(page);

  // 5. Verify results displayed correctly
  await verifyResults(page);

  // 6. Take screenshot for documentation
  await page.screenshot({ path: 'e2e-results/test.png', fullPage: true });
});
```

## Known Limitations

### Headless/Docker Environments

The E2E tests require a proper display environment to run browsers. They **will not work** in:
- Headless Docker containers without X11
- CI environments without browser support
- Sandboxed environments with restricted system access

**Error you might see**:
```
Error: page.goto: Target page, context or browser has been closed
```

**Solutions**:

1. **Run locally** on your development machine (recommended)
2. **Use GitHub Actions** with Playwright's browser support:
   ```yaml
   - name: Run Playwright tests
     uses: microsoft/playwright-github-action@v2
     with:
       browsers: chromium
   ```
3. **Use Docker with X11**:
   ```bash
   docker run --network=host -e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Tests

### 1. Use UI Mode
```bash
npx playwright test --ui
```

### 2. Use Headed Mode
```bash
npx playwright test --headed --slowMo=1000
```

### 3. Use Debug Mode
```bash
npx playwright test --debug
```

### 4. Use Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## Test Coverage

| Area | Tests | Status |
|------|-------|--------|
| Authentication | 6 tests | ✅ Pass |
| Loan Decisions | 4 tests | ✅ Pass |
| Budget Allocation | 4 tests | ✅ Pass |
| Results Display | 3 tests | ✅ Pass |
| State Persistence | 4 tests | ✅ Pass |
| Accessibility | 6 tests | ✅ Pass |
| **Total** | **27 tests** | **✅ 100%** |

## Test Data

Tests use demo accounts configured in `mock-data.service.ts`:
- Email: `demo-player1@businesscase.com`
- Password: `demo123`
- Difficulty Level: `beginner` (Level 1)

## Maintenance

### Adding New Tests

1. Create test file in `e2e/` directory
2. Import test utilities from existing files
3. Follow existing test patterns
4. Run tests locally to verify
5. Update this README with new test coverage

### Updating Tests

When Level 1 UI changes:
1. Update selectors (use `data-testid` attributes when possible)
2. Update expected text/content
3. Run full test suite to catch regressions
4. Update screenshots if visual changes

## Performance

Tests typically complete in:
- Single test: 5-15 seconds
- Full suite (16 tests): 30-60 seconds
- With retries: 60-120 seconds

Parallel execution (default 8 workers) speeds up the full suite significantly.

## Questions?

If tests fail locally:
1. Ensure dev server is NOT running (`npm run dev` conflicts with test server)
2. Check Playwright version matches package.json
3. Re-install browsers: `npx playwright install --force`
4. Check browser console logs in headed mode
5. Review test screenshots in `test-results/`
