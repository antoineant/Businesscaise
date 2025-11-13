# E2E Test Comparison Analysis

## Comparing Working Tests vs New Tests

### ✅ Working Tests (gm-dashboard-flow.spec.ts)
**Status**: 72/72 passing across Chrome & Firefox

### ⚠️ New Tests (team-player-flow.spec.ts)
**Status**: Not yet tested, potential issues identified

---

## Key Patterns from Working Tests

### 1. ✅ Error Handling with Promise.race()

**Working Pattern:**
```typescript
// Wait for EITHER success OR error
await Promise.race([
  page.waitForURL('/games', { timeout: 10000 }),
  page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
    .then(async () => {
      const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent();
      throw new Error(`Registration failed: ${errorText}`);
    })
]);
```

**New Tests (Missing):**
```typescript
// Just waits for success, no error handling
await page.waitForURL(/.*\/(dashboard|games)/, { timeout: 10000 });
```

**❌ Problem**: If registration fails, test hangs for 10s then fails with generic timeout error instead of showing the actual error message.

---

### 2. ✅ Network Request/Response Tracking

**Working Pattern:**
```typescript
const apiCalls: string[] = [];
const apiResponses: string[] = [];
const networkErrors: string[] = [];

page.on('request', request => {
  if (request.url().includes('/api/')) {
    apiCalls.push(`${request.method()} ${request.url()}`);
    console.log(`[DIAGNOSTIC] Request: ${request.method()} ${request.url()}`);
  }
});

page.on('response', async response => {
  if (response.url().includes('/api/')) {
    console.log(`[DIAGNOSTIC] Response: ${response.status()} ${response.url()}`);
  }
});

page.on('requestfailed', request => {
  networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
});
```

**New Tests (Missing):**
```typescript
// No network tracking at all
```

**❌ Problem**: When tests fail, we don't know which API calls succeeded/failed, making debugging difficult.

---

### 3. ✅ Browser Console Monitoring

**Working Pattern:**
```typescript
const consoleMessages: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleMessages.push(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    console.log(`[DIAGNOSTIC] Browser console: ${msg.type()} - ${msg.text()}`);
  }
});
```

**New Tests (Missing):**
```typescript
// No console monitoring
```

**❌ Problem**: Frontend errors (React errors, validation errors) are invisible during test runs.

---

### 4. ✅ Response Capture Before Click

**Working Pattern:**
```typescript
// Set up response listener BEFORE clicking submit
let capturedResponse: any = null;
page.on('response', async response => {
  if (response.url().includes('/auth/register')) {
    const body = await response.json();
    capturedResponse = { status, body };
    console.log(`[DIAGNOSTIC] Captured /auth/register response: ${status} ${JSON.stringify(body)}`);
  }
});

await page.click('button[type="submit"]');
```

**New Tests (Missing):**
```typescript
// Clicks button without setting up listeners
await page.getByRole('button', { name: /register/i }).click();
```

**❌ Problem**: Race condition - response might arrive before we set up listeners.

---

### 5. ✅ Adaptive Page Detection

**Working Pattern:**
```typescript
await page.waitForLoadState('domcontentloaded');
const h1Text = await page.locator('h1').textContent({ timeout: 10000 });
const currentUrl = page.url();

console.log(`[DIAGNOSTIC] Registration page loaded: h1="${h1Text}", url="${currentUrl}"`);

if (h1Text?.includes('Create GM Account')) {
  console.log('[DIAGNOSTIC] ✓ On GM Dashboard dedicated registration page');
} else if (h1Text?.includes('BusinessCaise')) {
  console.warn('[DIAGNOSTIC] ⚠️  On Team Frontend shared registration page');
  needsRadioButton = true;
} else {
  throw new Error(`Unknown registration page! h1="${h1Text}"`);
}
```

**New Tests (Missing):**
```typescript
// Assumes page is correct
await page.getByRole('link', { name: /register/i }).click();
```

**❌ Problem**: If wrong page loads, test fails with confusing "element not found" instead of clear page detection error.

---

### 6. ✅ Detailed Diagnostic Errors

**Working Pattern:**
```typescript
throw new Error(
  `Registration failed. UI: "${uiError}". API: ${apiError}. ` +
  `Calls: ${apiCalls.join(', ')}. ` +
  `Responses: ${apiResponses.join(', ')}. ` +
  `Network errors: ${networkErrors.join(', ')}. ` +
  `Browser console: ${consoleMessages.join('; ')}`
);
```

**New Tests (Missing):**
```typescript
// Generic Playwright timeout errors
```

**❌ Problem**: When tests fail, error message is "Timeout 10000ms exceeded" instead of showing root cause.

---

### 7. ✅ networkidle for Initial Loads

**Working Pattern:**
```typescript
await page.goto('/register', { waitUntil: 'networkidle' });
```

**New Tests:**
```typescript
await page.goto('http://localhost:5173/?demo=false');
// No waitUntil specified (defaults to 'load')
```

**⚠️ Potential Issue**: Page might not be fully loaded, causing race conditions with API calls.

---

### 8. ✅ Helper Functions Return Values

**Working Pattern:**
```typescript
async function registerGM(page: Page) {
  const testGM = generateTestGM(); // Unique per call
  // ... registration logic ...
  return testGM; // Return for reuse in logout/login tests
}

// Usage:
const testGM = await registerGM(page);
await logout(page);
await loginGM(page, testGM); // Reuse same credentials
```

**New Tests:**
```typescript
async function registerAndLoginPlayer(page: Page, playerData = TEST_PLAYER) {
  // Uses global TEST_PLAYER constant
  // ... registration logic ...
  // No return value
}
```

**⚠️ Potential Issue**: Using same global constant means tests aren't isolated - could cause conflicts if tests run in parallel.

---

### 9. ✅ Proper Selector Patterns

**Both use semantic selectors correctly:**
```typescript
// ✅ Both tests use this pattern
await page.getByRole('button', { name: /submit/i }).click();
await page.getByLabel(/email/i).fill(email);
```

---

### 10. ✅ Screenshot Naming Convention

**Working Pattern:**
```typescript
await page.screenshot({
  path: 'e2e-results/gm-dashboard-after-register.png',
  fullPage: true
});
```

**New Tests:**
```typescript
await page.screenshot({
  path: 'e2e-results/team-player-01-registered.png',
  fullPage: true,
});
```

**✅ Both follow good naming pattern**

---

## Summary of Issues in New Tests

| Issue | Impact | Severity |
|-------|--------|----------|
| No Promise.race() error handling | Tests hang on errors | 🔴 High |
| No network request tracking | Hard to debug failures | 🟡 Medium |
| No browser console monitoring | Frontend errors invisible | 🟡 Medium |
| No response capture before click | Race conditions | 🟡 Medium |
| No page detection | Confusing error messages | 🟡 Medium |
| Not using networkidle | Potential race conditions | 🟢 Low |
| Using global constants | Tests not isolated | 🟢 Low |

---

## Recommended Fixes

### Priority 1: Add Error Handling (Critical)

Replace all `waitForURL` with Promise.race:

```typescript
// ❌ Before
await page.waitForURL(/.*dashboard/, { timeout: 10000 });

// ✅ After
await Promise.race([
  page.waitForURL(/.*dashboard/, { timeout: 10000 }),
  page.waitForSelector('.bg-red-50, [class*="error"]', { timeout: 10000 })
    .then(async () => {
      const errorText = await page.locator('.bg-red-50, [class*="error"]').textContent();
      throw new Error(`Operation failed: ${errorText}`);
    })
]);
```

### Priority 2: Add Diagnostic Logging

Add to all helper functions:

```typescript
async function registerAndLoginPlayer(page: Page) {
  // Add network tracking
  const apiCalls: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[DIAGNOSTIC] Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`[DIAGNOSTIC] Response: ${response.status()} ${response.url()}`);
    }
  });

  // Add console monitoring
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[DIAGNOSTIC] Browser error: ${msg.text()}`);
    }
  });

  // ... rest of function
}
```

### Priority 3: Use networkidle

```typescript
// ✅ Add to all initial page loads
await page.goto('http://localhost:5173/?demo=false', { waitUntil: 'networkidle' });
```

### Priority 4: Return Values from Helpers

```typescript
async function registerAndLoginPlayer(page: Page) {
  const testPlayer = {
    name: 'E2E Test Player',
    email: `player-${Date.now()}-${Math.random().toString(36).substring(7)}@businesscase.com`,
    password: 'PlayerTest123!',
  };

  // ... registration logic ...

  return testPlayer; // Return for reuse
}
```

---

## Action Items

1. ✅ Review this analysis
2. ✅ Update `team-player-flow.spec.ts` with error handling
3. ✅ Update `integration-gm-player.spec.ts` with diagnostic logging
4. ⬜ Test locally to verify improvements
5. ⬜ Update `TEAM_PLAYER_TESTS_README.md` with new patterns

---

## Learning for Future Tests

**Always include in new E2E tests:**
1. Promise.race() for all async operations
2. Network request/response tracking
3. Browser console monitoring
4. Response listeners before clicks
5. Page detection and validation
6. Detailed diagnostic error messages
7. networkidle for initial loads
8. Return values from helper functions
9. Unique test data per run

**Copy the helper function pattern from `gm-dashboard-flow.spec.ts` as a template!**
