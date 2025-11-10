# Team Player E2E Tests

## Overview

Automated end-to-end tests for the team player journey, following Playwright best practices from `TESTING_BEST_PRACTICES.md`.

## Test Files

### 1. `team-player-flow.spec.ts`
Tests individual player features:
- ✅ Player registration and authentication
- ✅ Player login
- ✅ Join game with game code
- ✅ Dashboard metrics display
- ✅ Current session information
- ✅ Submit decisions
- ✅ View leaderboard

**Total: 9 tests**

### 2. `integration-gm-player.spec.ts`
Tests the complete GM-to-Player workflow:
- ✅ GM creates and starts game
- ✅ GM unlocks first session
- ✅ Player joins game as team
- ✅ GM verifies team joined
- ✅ Player submits decision
- ✅ GM scores submission
- ✅ Player sees updated metrics (WebSocket)
- ✅ Player sees updated leaderboard

**Total: 8 tests (serial execution)**

## Best Practices Applied

Following `e2e/TESTING_BEST_PRACTICES.md`:

### ✅ Semantic Selectors
```typescript
// ✅ Good - Uses semantic selectors
await page.getByRole('link', { name: /register/i }).click();
await page.getByLabel(/email/i).fill(email);
await page.getByPlaceholder(/game code/i).fill(gameId);
await page.getByRole('button', { name: /submit/i }).click();
```

### ✅ Scoped Selectors
```typescript
// ✅ Good - Scopes to parent section
const metricsSection = page.locator('main, [role="main"]');
await expect(metricsSection.getByText(/financial/i)).toBeVisible();
```

### ✅ Helper Functions
```typescript
// Reduces code duplication
await registerAndLoginPlayer(page);
await joinGameAsTeam(page, gameId);
```

### ✅ Minimal Use of .first()
Only used when absolutely necessary (e.g., color picker with identical buttons).

## Prerequisites

1. **Backend running**: `http://localhost:3001`
2. **GM Dashboard running**: `http://localhost:3002`
3. **Team Frontend running**: `http://localhost:5173`
4. **Database**: PostgreSQL running and migrated
5. **Demo mode disabled**: Tests use real API

## Running the Tests

### Run All Team Player Tests
```bash
# Run team-player-flow tests
npx playwright test team-player-flow.spec.ts

# Run GM-to-Player integration tests
npx playwright test integration-gm-player.spec.ts

# Run both
npx playwright test team-player-flow.spec.ts integration-gm-player.spec.ts
```

### Run with UI (Debug Mode)
```bash
npx playwright test team-player-flow.spec.ts --ui
```

### Run Specific Test
```bash
npx playwright test team-player-flow.spec.ts -g "should register"
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test team-player-flow.spec.ts --headed
```

## Test Execution Flow

### team-player-flow.spec.ts

Each test suite creates its own game via API:

```
Test Suite 1: Authentication
  → Creates game via API
  → Test 1: Register player
  → Test 2: Login player

Test Suite 2: Join Game
  → Creates game via API
  → Test: Join game

Test Suite 3: Dashboard
  → Creates game via API
  → Test 1: Display metrics
  → Test 2: Show session info

Test Suite 4: Submit Decision
  → Creates game via API
  → Test: Submit decision

Test Suite 5: Leaderboard
  → Creates game via API
  → Test: Display leaderboard
```

### integration-gm-player.spec.ts

Serial execution (tests run in order, sharing state):

```
Setup
  → Create GM context
  → Create Player context

Test 1: GM creates game
Test 2: GM unlocks session
Test 3: Player joins
Test 4: GM verifies
Test 5: Player submits
Test 6: GM scores
Test 7: Player sees updates
Test 8: Verify leaderboard

Cleanup
  → Close contexts
```

## Screenshots

Tests generate screenshots in `e2e-results/`:
- `team-player-01-registered.png`
- `team-player-02-joined-game.png`
- `team-player-03-dashboard.png`
- `team-player-04-submitted-decision.png`
- `team-player-05-leaderboard.png`
- `integration-gm-player-01-game-started.png`
- `integration-gm-player-02-session-unlocked.png`
- ... and more

## Troubleshooting

### Tests Fail with "Element not found"

**Cause**: UI changed or selectors don't match

**Fix**: Check if labels/placeholders match in the actual UI:
```typescript
// If form labels changed, update selectors
await page.getByLabel(/name/i).fill(name); // Label must contain "name"
```

### Tests Fail with "Timeout waiting for URL"

**Cause**: Services not running or slow to respond

**Fix**:
1. Ensure all services are running
2. Check console for errors
3. Increase timeouts if needed:
```typescript
await page.waitForURL(/.*dashboard/, { timeout: 15000 });
```

### Tests Fail with "Strict mode violation"

**Cause**: Selector matches multiple elements

**Fix**: Use scoped selectors:
```typescript
// ❌ Bad
await page.getByText(/revenue/i).click(); // Multiple matches

// ✅ Good
const section = page.locator('main');
await section.getByText(/revenue/i).click();
```

### Demo Mode is Active

**Cause**: Demo mode not disabled

**Fix**: Ensure `?demo=false` in URL:
```typescript
await page.goto('http://localhost:5173/?demo=false');
```

## Test Data

Tests use randomly generated data to avoid conflicts:

```typescript
const TEST_PLAYER = {
  email: `player-${Date.now()}-${Math.random().toString(36).substring(7)}@businesscaise.com`,
  // ...
};
```

This ensures tests can run multiple times without conflicts.

## Next Steps

### 1. Add More Test Coverage
- [ ] Multiple teams in same game
- [ ] Session progression (unlock multiple sessions)
- [ ] File upload in submissions
- [ ] Metrics history over multiple sessions
- [ ] WebSocket reconnection handling

### 2. Add Cross-Browser Tests
```typescript
// In playwright.config.ts
{
  name: 'firefox-team-player',
  testMatch: /team-player-flow\.spec\.ts/,
  use: { ...devices['Desktop Firefox'], baseURL: 'http://localhost:5173' },
}
```

### 3. Add Mobile Tests
```typescript
{
  name: 'mobile-team-player',
  testMatch: /team-player-flow\.spec\.ts/,
  use: { ...devices['iPhone 12'], baseURL: 'http://localhost:5173' },
}
```

### 4. Add Performance Tests
- Measure page load times
- Check API response times
- Monitor WebSocket latency

## Maintenance

### When UI Changes
Update selectors in test files following best practices:
1. Prefer semantic selectors (`getByRole`, `getByLabel`)
2. Use test IDs for critical elements
3. Scope selectors when terms appear multiple times

### When API Changes
Update helper functions:
- `registerAndLoginPlayer()`
- `joinGameAsTeam()`
- `createGameAsGM()`

### When Adding New Features
Follow the pattern:
1. Create helper function if reusable
2. Use semantic selectors
3. Add proper waits and assertions
4. Take screenshots
5. Add to appropriate test suite

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](./TESTING_BEST_PRACTICES.md)
- [E2E Testing Guide](../E2E_TESTING_GUIDE.md)
- [Team Frontend Test Plan](../TEST_TEAM_FRONTEND.md)
