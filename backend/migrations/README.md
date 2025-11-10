# Database Migrations

## ⚡ **QUICK START** - Apply Migration 002

**The easiest way:**

```bash
cd backend

# Mac/Linux:
./apply-migration.sh

# Windows:
apply-migration.bat
```

That's it! The script will:
- ✅ Read your database credentials from `.env`
- ✅ Apply the migration automatically
- ✅ Show clear success/error messages

---

## How to Apply Migrations (Manual Methods)

### Option 1: Using psql (Recommended)

```bash
# Navigate to backend directory
cd backend

# Apply the migration
psql $DATABASE_URL -f migrations/002_update_submissions_table.sql

# Or if using connection params:
psql -h localhost -U your_user -d businesscaise -f migrations/002_update_submissions_table.sql
```

### Option 2: Using npm migrate (if configured)

```bash
cd backend
npm run migrate:up
```

## Migration 002: Update Submissions Table

**Purpose**: Fix schema mismatch causing 500 errors on submission endpoint

**Changes**:
- Removes foreign key constraint on `challenge_id` (was causing FK violations)
- Adds `session_id`, `submission_data`, `file_urls` columns (required by code)
- Adds `status`, `score`, `feedback` columns (required by code)
- Removes old columns: `value_numeric`, `value_text`, `value_choice`, `file_name`, `file_path`, `file_size`
- Adds proper indexes for performance
- Creates unique constraint on (team_id, session_id)

**Why This Was Needed**:
The original schema (001) had an outdated submissions table structure that didn't match the current code. The code was trying to insert into columns that didn't exist, and was passing invalid `challenge_id` values that violated foreign key constraints.

## Verifying Migration Success

After running the migration, verify the changes:

```sql
-- Check new columns exist
\d submissions

-- Should show:
--  - session_id (UUID)
--  - submission_data (JSONB)
--  - file_urls (JSONB)
--  - status (VARCHAR)
--  - score (DECIMAL)
--  - feedback (TEXT)
```

## Testing After Migration

Run the E2E tests to verify submissions now work:

```bash
npm run test:e2e -- e2e/team-player-flow.spec.ts --project=team-player
```

Expected results:
- ✅ "should submit a decision for current session" should now pass
- ✅ Overall: 6/7 tests passing (only login 500 remains)
