-- Migration 004: Pod Competition & Category Awards System
-- Description: Adds pod competition and category awards functionality for large class scalability
-- Date: 2025-11-12

-- ============================================================================
-- PODS TABLE (Optional Metadata)
-- ============================================================================
-- Stores pod metadata for organizational purposes

CREATE TABLE IF NOT EXISTS pods (
    id VARCHAR(50) PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE pods IS 'Pod metadata for organizing teams in large games';
COMMENT ON COLUMN pods.id IS 'Pod identifier (e.g., pod_A, pod_B, pod_Alpha)';
COMMENT ON COLUMN pods.name IS 'Display name for the pod (e.g., "Pod Alpha", "Morning Section")';

-- ============================================================================
-- CATEGORY RANKINGS TABLE
-- ============================================================================
-- Stores historical snapshot of category rankings (financial, operations, etc.)

CREATE TABLE IF NOT EXISTS category_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    scope VARCHAR(20) NOT NULL,
    pod_id VARCHAR(50),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    rank INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_category CHECK (category IN ('financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall')),
    CONSTRAINT check_scope CHECK (scope IN ('pod', 'global')),
    CONSTRAINT check_pod_scope CHECK ((scope = 'pod' AND pod_id IS NOT NULL) OR (scope = 'global' AND pod_id IS NULL))
);

COMMENT ON TABLE category_rankings IS 'Historical snapshots of category rankings (Financial Excellence, Operations Leader, etc.)';
COMMENT ON COLUMN category_rankings.category IS 'Category type: financial, operations, marketing, hr, customer_satisfaction, overall';
COMMENT ON COLUMN category_rankings.scope IS 'Ranking scope: pod (within pod) or global (all teams)';
COMMENT ON COLUMN category_rankings.pod_id IS 'Pod ID if scope is "pod", null for global rankings';
COMMENT ON COLUMN category_rankings.rank IS 'Team rank in this category (1st, 2nd, 3rd, etc.)';

-- ============================================================================
-- ADD POD COMPETITION COLUMNS TO GAMES TABLE
-- ============================================================================
-- Adds pod competition settings to games

ALTER TABLE games
    ADD COLUMN IF NOT EXISTS enable_pods BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS pod_size INTEGER DEFAULT 4,
    ADD COLUMN IF NOT EXISTS pod_assignment_method VARCHAR(20) DEFAULT 'random',
    ADD COLUMN IF NOT EXISTS enable_category_awards BOOLEAN DEFAULT true;

COMMENT ON COLUMN games.enable_pods IS 'Whether pod competition is enabled for this game';
COMMENT ON COLUMN games.pod_size IS 'Number of teams per pod (default: 4)';
COMMENT ON COLUMN games.pod_assignment_method IS 'How teams are assigned to pods: random, manual, balanced';
COMMENT ON COLUMN games.enable_category_awards IS 'Whether to show category rankings (Financial, Operations, etc.)';

ALTER TABLE games ADD CONSTRAINT check_pod_size CHECK (pod_size >= 2 AND pod_size <= 10);
ALTER TABLE games ADD CONSTRAINT check_pod_method CHECK (pod_assignment_method IN ('random', 'manual', 'balanced'));

-- ============================================================================
-- ADD POD COLUMNS TO TEAMS TABLE
-- ============================================================================
-- Adds pod assignment to teams

ALTER TABLE teams
    ADD COLUMN IF NOT EXISTS pod_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS pod_name VARCHAR(100);

COMMENT ON COLUMN teams.pod_id IS 'Pod identifier (e.g., pod_A, pod_B)';
COMMENT ON COLUMN teams.pod_name IS 'Pod display name (e.g., "Pod Alpha", "Pod Beta")';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pods_game ON pods(game_id);
CREATE INDEX IF NOT EXISTS idx_category_rankings_game ON category_rankings(game_id);
CREATE INDEX IF NOT EXISTS idx_category_rankings_session ON category_rankings(session_id);
CREATE INDEX IF NOT EXISTS idx_category_rankings_category ON category_rankings(category, scope);
CREATE INDEX IF NOT EXISTS idx_category_rankings_team ON category_rankings(team_id);
CREATE INDEX IF NOT EXISTS idx_games_enable_pods ON games(enable_pods);
CREATE INDEX IF NOT EXISTS idx_teams_pod ON teams(pod_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate category rankings for a game
CREATE OR REPLACE FUNCTION calculate_category_rankings(
    p_game_id UUID,
    p_session_id UUID DEFAULT NULL,
    p_category VARCHAR DEFAULT 'overall',
    p_scope VARCHAR DEFAULT 'global',
    p_pod_id VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    team_id UUID,
    team_name VARCHAR,
    score DECIMAL,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH team_scores AS (
        SELECT
            t.id AS team_id,
            t.name AS team_name,
            CASE p_category
                WHEN 'financial' THEN (t.metrics->>'financial')::DECIMAL
                WHEN 'operations' THEN (t.metrics->>'operations')::DECIMAL
                WHEN 'marketing' THEN (t.metrics->>'marketing')::DECIMAL
                WHEN 'hr' THEN (t.metrics->>'hr')::DECIMAL
                WHEN 'customer_satisfaction' THEN (t.metrics->>'customer_satisfaction')::DECIMAL
                ELSE t.overall_score
            END AS score
        FROM teams t
        WHERE t.game_id = p_game_id
            AND (p_scope = 'global' OR (p_scope = 'pod' AND t.pod_id = p_pod_id))
    )
    SELECT
        ts.team_id,
        ts.team_name,
        ts.score,
        RANK() OVER (ORDER BY ts.score DESC)::INTEGER AS rank
    FROM team_scores ts
    ORDER BY rank ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_category_rankings IS 'Calculate team rankings for a specific category (financial, operations, etc.) with optional pod filtering';

-- Function to snapshot current rankings (call at session end)
CREATE OR REPLACE FUNCTION snapshot_category_rankings(
    p_game_id UUID,
    p_session_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_category VARCHAR;
    v_scope VARCHAR;
    v_pod_id VARCHAR;
    v_inserted_count INTEGER := 0;
    v_pod RECORD;
BEGIN
    -- Loop through all categories
    FOR v_category IN SELECT unnest(ARRAY['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall']) LOOP

        -- Global rankings
        INSERT INTO category_rankings (game_id, session_id, category, scope, pod_id, team_id, team_name, score, rank)
        SELECT
            p_game_id,
            p_session_id,
            v_category,
            'global',
            NULL,
            team_id,
            team_name,
            score,
            rank
        FROM calculate_category_rankings(p_game_id, p_session_id, v_category, 'global', NULL);

        GET DIAGNOSTICS v_inserted_count = v_inserted_count + ROW_COUNT;

        -- Pod rankings (if pods enabled)
        FOR v_pod IN
            SELECT DISTINCT pod_id, pod_name
            FROM teams
            WHERE game_id = p_game_id AND pod_id IS NOT NULL
        LOOP
            INSERT INTO category_rankings (game_id, session_id, category, scope, pod_id, team_id, team_name, score, rank)
            SELECT
                p_game_id,
                p_session_id,
                v_category,
                'pod',
                v_pod.pod_id,
                team_id,
                team_name,
                score,
                rank
            FROM calculate_category_rankings(p_game_id, p_session_id, v_category, 'pod', v_pod.pod_id);

            GET DIAGNOSTICS v_inserted_count = v_inserted_count + ROW_COUNT;
        END LOOP;
    END LOOP;

    RETURN v_inserted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION snapshot_category_rankings IS 'Snapshot all category rankings (global + pod) for a game session - call at session end';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Pod competition system migration complete';
    RAISE NOTICE 'New tables: pods, category_rankings';
    RAISE NOTICE 'Enhanced tables: games (4 columns), teams (2 columns)';
    RAISE NOTICE 'Helper functions: calculate_category_rankings, snapshot_category_rankings';
END $$;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

/*
-- To rollback this migration:

-- Drop helper functions
DROP FUNCTION IF EXISTS calculate_category_rankings(UUID, UUID, VARCHAR, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS snapshot_category_rankings(UUID, UUID);

-- Remove columns from teams table
ALTER TABLE teams
    DROP COLUMN IF EXISTS pod_id,
    DROP COLUMN IF EXISTS pod_name;

-- Remove columns from games table
ALTER TABLE games
    DROP COLUMN IF EXISTS enable_pods,
    DROP COLUMN IF EXISTS pod_size,
    DROP COLUMN IF EXISTS pod_assignment_method,
    DROP COLUMN IF EXISTS enable_category_awards;

-- Drop indexes
DROP INDEX IF EXISTS idx_teams_pod;
DROP INDEX IF EXISTS idx_games_enable_pods;
DROP INDEX IF EXISTS idx_category_rankings_team;
DROP INDEX IF EXISTS idx_category_rankings_category;
DROP INDEX IF EXISTS idx_category_rankings_session;
DROP INDEX IF EXISTS idx_category_rankings_game;
DROP INDEX IF EXISTS idx_pods_game;

-- Drop tables
DROP TABLE IF EXISTS category_rankings CASCADE;
DROP TABLE IF EXISTS pods CASCADE;
*/
