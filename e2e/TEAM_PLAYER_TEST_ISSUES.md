# Team Player E2E Test Issues and Fixes

## Summary
After running team player E2E tests, we identified and fixed several UI selector mismatches. One test now passes, but there are remaining issues to address.

## Fixed Issues ✅

### 1. Register Link Text Mismatch
**Problem:** Tests looked for "Register" link, but UI shows "Sign up"
**Location:** `src/pages/Login.tsx:163`
**Fix:** Updated tests to use `/sign up/i` instead of `/register/i`
**Files:**
- `e2e/team-player-flow.spec.ts:67`
- `e2e/integration-gm-player.spec.ts:206`

### 2. Team Name Input Selector
**Problem:** Tests used `getByPlaceholder(/team name/i)` but placeholder is "The Innovators"
**Location:** `src/pages/PlayerGame.tsx:515`
**Fix:** Changed to `getByLabel(/team name/i)` (label is "Team Name *")
**Files:**
- `e2e/team-player-flow.spec.ts:113`

## Outstanding Issues ⚠️

### 1. Login 500 Error (Backend Issue)
**Test:** "should login with player credentials"
**Error:** `[DIAGNOSTIC] Response: 500 http://localhost:3001/api/auth/login`
**Diagnosis:** Backend returns 500 Internal Server Error after successful logout
**Impact:** Login test fails
**Next Steps:**
- Investigate backend `/api/auth/login` endpoint
- Check if there's a session/token issue after logout
- May be related to token cleanup or database state

**Diagnostic Logs:**
```
[DIAGNOSTIC] Request: POST http://localhost:3001/api/auth/logout
[DIAGNOSTIC] Response: 200 http://localhost:3001/api/auth/logout
[DIAGNOSTIC] Request: POST http://localhost:3001/api/auth/login
[DIAGNOSTIC] Response: 500 http://localhost:3001/api/auth/login
[DIAGNOSTIC] Browser error: Login failed: AxiosError
```

### 2. Join Game Flow Success (Needs Verification)
**Tests:** All join game tests now reach the team join modal successfully
**Status:** Need to re-run tests to verify the label selector fix works
**Files:**
- "should join game with game code"
- "should display dashboard with metrics"
- "should show current session information"
- "should submit a decision for current session"
- "should display leaderboard with team rankings"

## Test Results After Fixes

### Passing Tests (1/7) ✅
- `should register new player account successfully` ✓

### Failing Tests (6/7) ❌
- `should login with player credentials` - Backend 500 error
- `should join game with game code` - Needs re-test with label fix
- `should display dashboard with metrics` - Needs re-test with label fix
- `should show current session information` - Needs re-test with label fix
- `should submit a decision for current session` - Needs re-test with label fix
- `should display leaderboard with team rankings` - Needs re-test with label fix

## Recommendations

1. **Fix backend login issue first** - This is blocking the login test
2. **Re-run tests** after label selector fix to verify join game flow works
3. **Add data-testid attributes** to critical form inputs for more stable selectors
4. **Consider adding backend error logging** to diagnose 500 errors more easily

## Form Selectors Reference

For future test development, here are the correct selectors for the player flow:

| Form Field | Selector Type | Selector | Location |
|------------|--------------|----------|----------|
| Login → Register link | text | `Sign up` | Login.tsx:163 |
| Register Name | label | `Full Name` | Register.tsx:104 |
| Register Email | label | `Email Address` | Register.tsx:128 |
| Register Password | label | `Password` | Register.tsx:219 |
| Register Confirm Password | label | `Confirm Password` | Register.tsx:243 |
| Game Code Input | placeholder | `Enter game code` | GameSelection.tsx:240 |
| Team Name Input | label | `Team Name *` | PlayerGame.tsx:508 |
| Team Member Input | placeholder | `Member name` | PlayerGame.tsx:547 |

## Next Actions

1. Push current fixes to remote
2. Investigate backend login 500 error
3. Re-run team player tests to verify join game flow
4. Document any additional issues found
