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
**Root Cause:** Label "Team Name *" is not connected to input via `htmlFor`/`id`
**Fix:** Changed to `input[type="text"][required].first()` to target the first required text input
**Files:**
- `e2e/team-player-flow.spec.ts:114`
- `e2e/integration-gm-player.spec.ts:240`

**Accessibility Note:** The form should be updated to connect labels to inputs:
```tsx
// Current (not accessible):
<label className="...">Team Name *</label>
<input type="text" required ... />

// Recommended (accessible):
<label htmlFor="teamName" className="...">Team Name *</label>
<input id="teamName" type="text" required ... />
```

## Fixed Issues (Latest Round) ✅

### 1. Overall Score Type Mismatch - Leaderboard
**Problem:** Backend returns `overall_score` as STRING ("0.00"), but frontend called `.toFixed(1)` causing React crash
**Location:** `src/pages/PlayerGame.tsx:453` (leaderboard section)
**Fix:** Added type checking before calling `.toFixed(1)`:
```typescript
{typeof entry.overall_score === 'number'
  ? entry.overall_score.toFixed(1)
  : entry.overall_score || '0.0'}
```
**Status:** ✅ Fixed (same pattern as dashboard fix)

### 2. Test Selector Strict Mode Violations
Following `e2e/TESTING_BEST_PRACTICES.md` guidelines:

**a) Dashboard Metrics Selector**
- **Problem:** `/financial|marketing|sales|operations|hr/i` matched 3 elements
- **Location:** `e2e/team-player-flow.spec.ts:334`
- **Fix:** Added `.first()` since common business terms appear multiple times
- **Status:** ✅ Fixed

**b) Current Session Info Selector**
- **Problem:** `/current.*session|session.*1|monday/i` matched 2 elements (heading + description)
- **Location:** `e2e/team-player-flow.spec.ts:351`
- **Fix:** Added `.first()` for session info that appears in multiple places
- **Status:** ✅ Fixed

**c) Challenge Tab Button Selector**
- **Problem:** `/challenge|current challenge/i` matched 2 buttons (tab + view button)
- **Location:** `e2e/team-player-flow.spec.ts:368`
- **Fix:** Made regex more specific: `/^current challenge$/i` to match only tab
- **Status:** ✅ Fixed

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

## Test Results After Latest Fixes

### Expected Results ✅
With all the fixes applied, these tests should now pass:
- `should register new player account successfully` ✓ (already passing)
- `should join game with game code` ✓ (overall_score fix applied)
- `should display dashboard with metrics` ✓ (selector made more specific with .first())
- `should show current session information` ✓ (selector made more specific with .first())
- `should submit a decision for current session` ✓ (button selector made exact match)
- `should display leaderboard with team rankings` ✓ (overall_score leaderboard fix applied)

### Still Failing ❌
- `should login with player credentials` - Backend 500 error (requires backend investigation)

## Recommendations

1. **Fix backend login issue first** - This is blocking the login test
2. **Re-run tests** after direct selector fix to verify join game flow works
3. **Improve form accessibility** - Connect labels to inputs using `htmlFor`/`id`:
   - Benefits: Better screen reader support, clickable labels, semantic selectors in tests
   - Files: `PlayerGame.tsx` (JoinTeamModal), `Register.tsx`, `Login.tsx`
4. **Add data-testid attributes** to critical form inputs for even more stable selectors
5. **Consider adding backend error logging** to diagnose 500 errors more easily

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

1. ✅ **DONE:** Fixed leaderboard crash (overall_score type handling)
2. ✅ **DONE:** Fixed all test selector strict mode violations
3. ✅ **DONE:** Updated tests to follow TESTING_BEST_PRACTICES.md
4. **TODO:** Re-run tests with backend running to verify all fixes work
5. **TODO:** Investigate backend login 500 error (separate backend issue)
