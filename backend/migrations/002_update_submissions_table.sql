-- Migration: Update submissions table to match current code structure
-- This fixes the schema mismatch that was causing 500 errors on submission

-- Drop old foreign key constraint on challenge_id
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_challenge_id_fkey;

-- Drop the unique constraint that was on (team_id, challenge_id)
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_team_id_challenge_id_key;

-- Add new columns needed by the code
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS submission_data JSONB,
  ADD COLUMN IF NOT EXISTS file_urls JSONB,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scored', 'rejected')),
  ADD COLUMN IF NOT EXISTS score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS feedback TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Make challenge_id nullable (no longer requires FK)
ALTER TABLE submissions ALTER COLUMN challenge_id DROP NOT NULL;

-- Rename gm_score to keep compatibility if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'gm_score'
  ) THEN
    -- Copy gm_score to score if not already done
    UPDATE submissions SET score = gm_score WHERE score IS NULL AND gm_score IS NOT NULL;
  END IF;
END $$;

-- Rename gm_feedback to feedback if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'gm_feedback'
  ) THEN
    -- Copy gm_feedback to feedback if not already done
    UPDATE submissions SET feedback = gm_feedback WHERE feedback IS NULL AND gm_feedback IS NOT NULL;
  END IF;
END $$;

-- Drop old columns that are no longer used (after data migration)
ALTER TABLE submissions
  DROP COLUMN IF EXISTS value_numeric,
  DROP COLUMN IF EXISTS value_text,
  DROP COLUMN IF EXISTS value_choice,
  DROP COLUMN IF EXISTS file_name,
  DROP COLUMN IF EXISTS file_path,
  DROP COLUMN IF EXISTS file_size,
  DROP COLUMN IF EXISTS gm_score,
  DROP COLUMN IF EXISTS gm_feedback;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

-- Add new unique constraint (team can only submit once per session)
CREATE UNIQUE INDEX IF NOT EXISTS submissions_team_session_unique
  ON submissions(team_id, session_id)
  WHERE session_id IS NOT NULL;
