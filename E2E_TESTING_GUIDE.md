# BusinessCaise - Comprehensive E2E Testing Guide

This guide explains how to run the complete end-to-end testing suite for BusinessCaise, covering the Backend API, GM Dashboard, and Team Frontend.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Architecture](#test-architecture)
3. [Prerequisites](#prerequisites)
4. [Test Suites](#test-suites)
5. [Running Tests](#running-tests)
6. [Test Scenarios](#test-scenarios)
7. [Troubleshooting](#troubleshooting)
8. [CI/CD Integration](#cicd-integration)
9. [Writing New Tests](#writing-new-tests)

---

## Quick Start

### One-Command Test Execution

```bash
# Run ALL tests (GM Dashboard + Team Frontend + Integration)
./run-e2e-tests.sh

# Run only GM Dashboard tests
./run-e2e-tests.sh --gm-only

# Run only Team Frontend tests
./run-e2e-tests.sh --team-only

# Run only Integration tests
./run-e2e-tests.sh --integration

# Run tests in headed mode (see the browser)
./run-e2e-tests.sh --headed

# Run tests in UI mode (interactive debugging)
./run-e2e-tests.sh --ui
```

### Manual Testing (Advanced)

```bash
# Start services manually
cd backend && npm run dev        # Terminal 1 (port 3001)
cd gm-dashboard && npm run dev   # Terminal 2 (port 3002)
npm run dev                      # Terminal 3 (port 5173)

# Run Playwright tests
npx playwright test                        # All tests
npx playwright test --project=gm-dashboard # GM tests only
npx playwright test --headed               # See browser
npx playwright test --ui                   # Interactive mode
```

---

## Test Architecture

### Services Required

| Service | Port | Purpose |
|---------|------|---------|
| Backend API | 3001 | REST API + WebSocket |
| GM Dashboard | 3002 | Game Master control panel |
| Team Frontend | 5173 | Team/player interface |
| PostgreSQL | 5432 | Database |

### Test Projects

The test suite is organized into **3 main projects**:

#### 1. **Team Frontend Tests** (`level1-*.spec.ts`)
- Tests the team/player interface
- Validates game participation workflow
- Tests accessibility and responsiveness
- **~27 tests** covering authentication, decisions, state persistence

#### 2. **GM Dashboard Tests** (`gm-*.spec.ts`)
- Tests the Game Master control panel
- Validates game creation and management
- Tests session unlocking and team monitoring
- **~20 tests** covering registration, CRUD, game controls

#### 3. **Integration Tests** (`integration-*.spec.ts`)
- Tests the complete workflow across services
- Validates GM → Teams → Backend → Frontend flow
- Tests real game lifecycle
- **~6 tests** covering end-to-end scenarios

---

## Prerequisites

### System Requirements

- **Node.js**: 18+ and npm
- **PostgreSQL**: 14+ (running and accessible)
- **Playwright**: Installed (auto-installed by script)
- **Operating System**: macOS, Linux, or Windows WSL2

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install chromium
   npx playwright install-deps  # Linux only
   ```

3. **Set up database**:
   ```bash
   cd backend
   ./setup-db.sh
   cd ..
   ```

4. **Verify PostgreSQL**:
   ```bash
   pg_isready
   # Should output: /tmp:5432 - accepting connections
   ```

---

## Test Suites

### 1. GM Dashboard Tests (`e2e/gm-dashboard-flow.spec.ts`)

**Test Coverage:**

| Category | Tests | Description |
|----------|-------|-------------|
| Authentication | 4 tests | Register, login, logout, role validation |
| Game Management | 6 tests | Create, start, pause, resume, delete games |
| Session Management | 2 tests | Unlock sessions, verify counts |
| Navigation & UI | 4 tests | Page navigation, status badges, responsive |
| Error Handling | 2 tests | Form validation, network errors |
| **Total** | **~20 tests** | Full GM workflow |

**Example Tests:**
- ✅ Should register new GM account successfully
- ✅ Should create a new game with 10 auto-generated sessions
- ✅ Should start a game and change status to active
- ✅ Should unlock sessions one by one
- ✅ Should delete a game with confirmation

**Run Command:**
```bash
./run-e2e-tests.sh --gm-only
```

---

### 2. Team Frontend Tests (`e2e/level1-*.spec.ts`)

**Test Coverage:**

| Test File | Tests | Description |
|-----------|-------|-------------|
| `level1-complete-journey.spec.ts` | 8 tests | Full session workflow, decisions, results |
| `level1-multi-session.spec.ts` | 13 tests | State persistence, debt tracking, bankruptcy |
| `level1-accessibility.spec.ts` | 6 tests | Keyboard nav, ARIA, responsive, contrast |
| **Total** | **~27 tests** | Complete team experience |

**Example Tests:**
- ✅ Should complete full session with conservative strategy
- ✅ Should maintain state across 3 consecutive sessions
- ✅ Should track debt paydown over 6 sessions
- ✅ Should support keyboard navigation
- ✅ Should display correctly on mobile viewport

**Run Command:**
```bash
./run-e2e-tests.sh --team-only
```

---

### 3. Integration Tests (`e2e/integration-full-game-flow.spec.ts`)

**Test Coverage:**

| Step | Test | Description |
|------|------|-------------|
| STEP 1 | GM registers and creates game | Validates account creation + game setup |
| STEP 2 | GM starts game and unlocks session | Validates game activation |
| STEP 3 | Teams join via API | Validates team registration |
| STEP 4 | GM monitors and unlocks more sessions | Validates multi-session flow |
| STEP 5 | Verify game progress | Validates complete state |
| **Total** | **6 tests** | Full lifecycle |

**Example Flow:**
```
GM Register → Create Game → Start Game → Unlock Session 1
                ↓
Teams Join (Team Alpha, Bravo, Charlie)
                ↓
GM Monitors Teams → Unlocks Sessions 2, 3
                ↓
Verify: 3 teams, 3 sessions unlocked, all scores tracked
```

**Run Command:**
```bash
./run-e2e-tests.sh --integration
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests with orchestration script
./run-e2e-tests.sh

# Run specific test project
./run-e2e-tests.sh --gm-only       # GM Dashboard only
./run-e2e-tests.sh --team-only     # Team Frontend only
./run-e2e-tests.sh --integration   # Integration only

# Run with visible browser (headed mode)
./run-e2e-tests.sh --headed

# Run with interactive UI
./run-e2e-tests.sh --ui
```

### Advanced Playwright Commands

```bash
# Run specific test file
npx playwright test e2e/gm-dashboard-flow.spec.ts

# Run specific test by name
npx playwright test -g "should register new GM account"

# Run with debugging
npx playwright test --debug

# Run with trace
npx playwright test --trace on

# Run specific browser
npx playwright test --project=firefox

# Generate code (record interactions)
npx playwright codegen http://localhost:3002
```

### Test Modes

| Mode | Command | Use Case |
|------|---------|----------|
| **Headless** | `./run-e2e-tests.sh` | CI/CD, fast execution |
| **Headed** | `./run-e2e-tests.sh --headed` | Watch tests run |
| **UI Mode** | `./run-e2e-tests.sh --ui` | Interactive debugging |
| **Debug** | `npx playwright test --debug` | Step-by-step debugging |

---

## Test Scenarios

### Scenario 1: Full Game Lifecycle

**Goal:** Test complete workflow from GM account creation to game completion

**Steps:**
```bash
./run-e2e-tests.sh --integration
```

**What Happens:**
1. ✅ GM registers account
2. ✅ GM creates game (10 sessions auto-generated)
3. ✅ GM starts game
4. ✅ GM unlocks first session
5. ✅ 3 teams join via API
6. ✅ GM monitors teams in dashboard
7. ✅ GM unlocks additional sessions
8. ✅ Verify all data correct

**Duration:** ~2-3 minutes

---

### Scenario 2: GM Dashboard Only

**Goal:** Test GM interface without team interaction

**Steps:**
```bash
./run-e2e-tests.sh --gm-only --headed
```

**What Happens:**
- ✅ Registration flow
- ✅ Game CRUD operations
- ✅ Game status controls
- ✅ Session management
- ✅ UI/UX validation

**Duration:** ~1-2 minutes

---

### Scenario 3: Team Frontend Only

**Goal:** Test team/player interface in isolation

**Steps:**
```bash
./run-e2e-tests.sh --team-only
```

**What Happens:**
- ✅ Login as demo player
- ✅ Make decisions (loan, budget)
- ✅ Submit and view results
- ✅ Multi-session persistence
- ✅ Accessibility checks

**Duration:** ~1-2 minutes

---

## Test Results

### Output Structure

```
BusinessCase/
├── playwright-report/          # HTML test report
│   └── index.html
├── test-results/               # Raw test results
│   ├── results.json
│   └── [test-name]/
│       ├── test-failed-1.png   # Screenshots on failure
│       └── trace.zip           # Execution trace
├── e2e-results/                # Custom screenshots
│   ├── gm-dashboard-game-created.png
│   ├── integration-01-game-created.png
│   └── ...
└── logs/                       # Service logs
    ├── backend-e2e.log
    ├── gm-dashboard-e2e.log
    └── team-frontend-e2e.log
```

### Viewing Results

```bash
# Open HTML report
npx playwright show-report

# View trace (debugging)
npx playwright show-trace test-results/[test-name]/trace.zip

# Check service logs
tail -f logs/backend-e2e.log
tail -f logs/gm-dashboard-e2e.log
```

---

## Troubleshooting

### Common Issues

#### 1. **Port Already in Use**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Or use the script (handles cleanup automatically)
./run-e2e-tests.sh
```

---

#### 2. **PostgreSQL Not Running**

**Error:**
```
✗ PostgreSQL is not running
```

**Solution:**
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Verify
pg_isready
```

---

#### 3. **Database Missing**

**Error:**
```
Database 'businesscase' not found
```

**Solution:**
```bash
cd backend
./setup-db.sh
cd ..
```

---

#### 4. **Playwright Browsers Missing**

**Error:**
```
Error: browserType.launch: Executable doesn't exist
```

**Solution:**
```bash
npx playwright install chromium
npx playwright install-deps  # Linux only
```

---

#### 5. **Tests Timing Out**

**Error:**
```
Error: page.goto: Timeout 30000ms exceeded
```

**Solutions:**
- Increase timeout in `playwright.config.ts`:
  ```typescript
  timeout: 60 * 1000, // 60 seconds
  ```
- Check if services are running:
  ```bash
  curl http://localhost:3001/api/auth/me
  curl http://localhost:3002
  curl http://localhost:5173
  ```
- Check logs for errors:
  ```bash
  tail -f logs/*.log
  ```

---

#### 6. **Tests Fail in Headless but Pass in Headed Mode**

**Cause:** Timing issues, visual elements not loading

**Solutions:**
- Add explicit waits:
  ```typescript
  await page.waitForSelector('text=Expected Content');
  await page.waitForTimeout(1000); // Only as last resort
  ```
- Use `waitForLoadState`:
  ```typescript
  await page.goto('/games');
  await page.waitForLoadState('networkidle');
  ```

---

### Debugging Tips

#### 1. **Run in UI Mode**
```bash
./run-e2e-tests.sh --ui
```
- Interactive test execution
- Step through tests
- Inspect elements
- Time-travel debugging

#### 2. **Run in Headed Mode**
```bash
./run-e2e-tests.sh --headed
```
- Watch tests execute in real browser
- See actual user interactions
- Identify visual issues

#### 3. **Use Debug Mode**
```bash
npx playwright test --debug e2e/gm-dashboard-flow.spec.ts
```
- Pause at each step
- Inspect page state
- Execute commands in console

#### 4. **Check Screenshots**
```bash
# Failures automatically capture screenshots
open test-results/[test-name]/test-failed-1.png

# Custom screenshots in e2e-results/
open e2e-results/
```

#### 5. **View Traces**
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```
- Full execution timeline
- Network requests
- Console logs
- Screenshots at each step

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: businesscase
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci && cd ..
          cd gm-dashboard && npm ci && cd ..

      - name: Install Playwright
        run: |
          npm install @playwright/test
          npx playwright install --with-deps chromium

      - name: Setup database
        run: cd backend && ./setup-db.sh && cd ..
        env:
          PGHOST: localhost
          PGPORT: 5432
          PGUSER: postgres
          PGPASSWORD: postgres

      - name: Run E2E tests
        run: ./run-e2e-tests.sh
        env:
          CI: true

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-screenshots
          path: test-results/
```

---

## Writing New Tests

### Test Template

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code (login, navigate, etc.)
  });

  test('should do something specific', async ({ page }) => {
    // 1. Arrange: Set up test data
    // 2. Act: Perform actions
    // 3. Assert: Verify results

    // Example:
    await page.goto('/games');
    await page.click('button:has-text("Create Game")');
    await page.fill('input#title', 'Test Game');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/games\/[a-f0-9-]+$/);
    await expect(page.locator('h1')).toContainText('Test Game');

    // Screenshot for documentation
    await page.screenshot({
      path: 'e2e-results/my-test.png',
      fullPage: true
    });
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable selectors:
   ```tsx
   <button data-testid="create-game-btn">Create Game</button>
   ```
   ```typescript
   await page.click('[data-testid="create-game-btn"]');
   ```

2. **Use explicit waits** instead of arbitrary timeouts:
   ```typescript
   // Good
   await page.waitForSelector('text=Game Created');

   // Bad
   await page.waitForTimeout(5000);
   ```

3. **Clean up test data** after tests:
   ```typescript
   test.afterEach(async ({ page }) => {
     // Delete created games, etc.
   });
   ```

4. **Take screenshots** at key points:
   ```typescript
   await page.screenshot({
     path: `e2e-results/${testName}.png`,
     fullPage: true
   });
   ```

5. **Use descriptive test names**:
   ```typescript
   // Good
   test('should unlock first session after starting game');

   // Bad
   test('test1');
   ```

---

## Performance

### Typical Execution Times

| Test Suite | Duration | Tests |
|------------|----------|-------|
| GM Dashboard | 1-2 min | ~20 tests |
| Team Frontend | 1-2 min | ~27 tests |
| Integration | 2-3 min | ~6 tests |
| **Full Suite** | **4-6 min** | **~53 tests** |

### Optimization Tips

1. **Run tests in parallel** (default):
   - Playwright runs tests concurrently when possible
   - Adjust workers in `playwright.config.ts`

2. **Use test.describe.configure**:
   ```typescript
   test.describe.configure({ mode: 'parallel' });
   ```

3. **Reuse authentication state**:
   ```typescript
   // Save auth state once
   await context.storageState({ path: 'auth.json' });

   // Reuse in tests
   use: { storageState: 'auth.json' }
   ```

---

## Questions?

If you encounter issues:

1. **Check logs**: `logs/*.log`
2. **View HTML report**: `npx playwright show-report`
3. **Run in headed mode**: `./run-e2e-tests.sh --headed`
4. **Run in UI mode**: `./run-e2e-tests.sh --ui`
5. **Check service health**:
   ```bash
   curl http://localhost:3001/api/auth/me
   curl http://localhost:3002
   curl http://localhost:5173
   ```

---

**Happy Testing! 🎉**
