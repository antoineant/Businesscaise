# Backend Issues Found During E2E Testing

## Issue 1: Login Test - Credentials Mismatch ❌

### Problem
The login test is failing because it's trying to login with credentials that were never registered.

### Root Cause
`e2e/team-player-flow.spec.ts`:
- Line 20-25: `TEST_PLAYER` constant generates a random email at module load time
- Line 36-38: `registerAndLoginPlayer()` generates NEW unique credentials each time
- Line 262-270: Login test calls `registerAndLoginPlayer()` (which creates new creds), then tries to login with `TEST_PLAYER.email` (different email!)

### Code Flow
```typescript
// Module-level constant (generated once)
const TEST_PLAYER = {
  email: `player-${Date.now()}-${random}@...` // Email A
};

// Helper function (generates NEW email each call)
async function registerAndLoginPlayer(page) {
  const playerData = {
    email: `player-${Date.now()}-${random}@...` // Email B (different!)
  };
  // Registers Email B
}

// Login test
test('should login', async ({ page }) => {
  await registerAndLoginPlayer(page); // Registers Email B
  await logout();
  await page.getByLabel(/email/).fill(TEST_PLAYER.email); // Tries to login with Email A ❌
});
```

### Solution
The helper function should return the created credentials, and the login test should use them:

```typescript
async function registerAndLoginPlayer(page: Page) {
  const playerData = { /* ... */ };
  // ... registration code ...
  return playerData; // Return the credentials
}

test('should login', async ({ page }) => {
  const credentials = await registerAndLoginPlayer(page); // Save credentials
  await logout();
  await page.getByLabel(/email/).fill(credentials.email); // Use same email ✓
  await page.getByLabel(/password/).fill(credentials.password); // Use same password ✓
});
```

---

## Issue 2: Submit Decision - Database Schema Mismatch ❌

### Problem
Backend returns 500 error when teams try to submit decisions:
```
POST http://localhost:3001/api/teams/{teamId}/submit
Response: 500 Internal Server Error
```

### Root Cause
**Database schema is out of date!** There's a mismatch between:

1. **Database Schema** (`backend/migrations/001_initial_schema.sql` line 78-93):
```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES teams(id),
    challenge_id UUID REFERENCES challenges(id), -- ❌ Foreign key constraint!
    value_numeric DECIMAL,
    value_text TEXT,
    value_choice VARCHAR(100),
    ...
);
```

2. **Code** (`backend/src/models/Submission.model.ts` line 31-46):
```typescript
static async create(data: CreateSubmissionData) {
  query(`INSERT INTO submissions (
    team_id, session_id, challenge_id, submission_data, file_urls
  ) VALUES ($1, $2, $3, $4, $5)`, [
    data.team_id,
    data.session_id,      // ❌ Column doesn't exist in old schema!
    data.challenge_id,    // ❌ Value like "session-1" violates FK constraint!
    JSON.stringify(data.submission_data), // ❌ Column doesn't exist!
    JSON.stringify(data.file_urls)        // ❌ Column doesn't exist!
  ]);
}
```

### Why It Fails
1. **Foreign Key Violation**: Code passes `challenge_id = "session-1"` (from PlayerGame.tsx:398)
2. **Schema expects**: `challenge_id` to be a UUID that exists in the `challenges` table
3. **Result**: PostgreSQL rejects the INSERT with foreign key constraint violation → 500 error

### Additional Issues
- Schema has columns: `value_numeric`, `value_text`, `value_choice`, `file_name`, `file_path`, `file_size`
- Code tries to insert into columns: `session_id`, `submission_data`, `file_urls`
- These columns don't exist in the schema → SQL error

### Solution Options

#### Option A: Update Schema to Match Code (RECOMMENDED)
Create a new migration `002_update_submissions_table.sql`:

```sql
-- Drop old foreign key constraint
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_challenge_id_fkey;

-- Add new columns
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS submission_data JSONB,
  ADD COLUMN IF NOT EXISTS file_urls JSONB,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Remove foreign key constraint from challenge_id (make it optional)
ALTER TABLE submissions ALTER COLUMN challenge_id DROP NOT NULL;

-- Drop old columns that are no longer used
ALTER TABLE submissions
  DROP COLUMN IF EXISTS value_numeric,
  DROP COLUMN IF EXISTS value_text,
  DROP COLUMN IF EXISTS value_choice,
  DROP COLUMN IF EXISTS file_name,
  DROP COLUMN IF EXISTS file_path,
  DROP COLUMN IF EXISTS file_size;
```

#### Option B: Update Code to Match Schema
- Create actual Challenge records in the `challenges` table for each session
- Use proper UUIDs for `challenge_id`
- Update Submission.model.ts to use old column names

**Recommendation**: Go with Option A (update schema) because the new structure is more flexible.

---

## Summary

| Issue | Location | Type | Severity | Fix Complexity |
|-------|----------|------|----------|----------------|
| Login credentials mismatch | `e2e/team-player-flow.spec.ts:269` | Test Bug | Medium | Easy (5 min) |
| Schema mismatch - submissions | `backend/migrations/` | Backend Bug | High | Medium (15 min) |

## Priority
1. **HIGH**: Fix schema mismatch (blocks all submission tests)
2. **MEDIUM**: Fix login test (blocks 1 test)

## Impact
- **Before fixes**: 3/7 tests passing
- **After fixes**: 6/7 tests passing (only backend login 500 remains, which is a separate issue)
