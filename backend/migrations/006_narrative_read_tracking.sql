-- Migration 006: Narrative Read Tracking
-- Description: Adds read tracking for narratives to support unread counts and notifications
-- Date: 2025-11-13

-- ============================================================================
-- NARRATIVE READS TABLE
-- ============================================================================
-- Tracks when teams mark narratives as read

CREATE TABLE IF NOT EXISTS narrative_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    narrative_id UUID NOT NULL REFERENCES narratives(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Ensure one read record per team per narrative
    UNIQUE(narrative_id, team_id)
);

COMMENT ON TABLE narrative_reads IS 'Tracks when teams have read narratives for unread count tracking';
COMMENT ON COLUMN narrative_reads.narrative_id IS 'Reference to the narrative that was read';
COMMENT ON COLUMN narrative_reads.team_id IS 'Team that read the narrative';
COMMENT ON COLUMN narrative_reads.read_at IS 'Timestamp when narrative was marked as read';
COMMENT ON COLUMN narrative_reads.read_by IS 'User who marked it as read (optional)';

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Optimize queries for unread counts and read tracking

-- Fast lookup by narrative (who has read this narrative?)
CREATE INDEX idx_narrative_reads_narrative ON narrative_reads(narrative_id);

-- Fast lookup by team (what has this team read?)
CREATE INDEX idx_narrative_reads_team ON narrative_reads(team_id, read_at DESC);

-- Composite index for unread queries
CREATE INDEX idx_narrative_reads_team_narrative ON narrative_reads(team_id, narrative_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

/**
 * Function to mark narrative as read
 * Returns true if newly marked, false if already read
 */
CREATE OR REPLACE FUNCTION mark_narrative_read(
    p_narrative_id UUID,
    p_team_id UUID,
    p_read_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_already_read BOOLEAN;
BEGIN
    -- Check if already read
    SELECT EXISTS(
        SELECT 1 FROM narrative_reads
        WHERE narrative_id = p_narrative_id AND team_id = p_team_id
    ) INTO v_already_read;

    -- If not read, insert read record
    IF NOT v_already_read THEN
        INSERT INTO narrative_reads (narrative_id, team_id, read_by)
        VALUES (p_narrative_id, p_team_id, p_read_by);
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_narrative_read IS 'Mark a narrative as read by a team. Returns true if newly marked.';

/**
 * Function to get unread count for a team
 */
CREATE OR REPLACE FUNCTION get_team_unread_count(
    p_team_id UUID,
    p_game_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_unread_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_unread_count
    FROM narratives n
    WHERE n.game_id = p_game_id
    AND (n.target_teams IS NULL OR p_team_id = ANY(n.target_teams))
    AND NOT EXISTS (
        SELECT 1 FROM narrative_reads nr
        WHERE nr.narrative_id = n.id AND nr.team_id = p_team_id
    );

    RETURN v_unread_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_team_unread_count IS 'Get count of unread narratives for a team in a game';

/**
 * Function to mark all narratives as read for a team
 */
CREATE OR REPLACE FUNCTION mark_all_narratives_read(
    p_team_id UUID,
    p_game_id UUID,
    p_read_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_marked_count INTEGER := 0;
    v_narrative RECORD;
BEGIN
    -- Get all unread narratives for team
    FOR v_narrative IN
        SELECT n.id
        FROM narratives n
        WHERE n.game_id = p_game_id
        AND (n.target_teams IS NULL OR p_team_id = ANY(n.target_teams))
        AND NOT EXISTS (
            SELECT 1 FROM narrative_reads nr
            WHERE nr.narrative_id = n.id AND nr.team_id = p_team_id
        )
    LOOP
        INSERT INTO narrative_reads (narrative_id, team_id, read_by)
        VALUES (v_narrative.id, p_team_id, p_read_by)
        ON CONFLICT (narrative_id, team_id) DO NOTHING;

        v_marked_count := v_marked_count + 1;
    END LOOP;

    RETURN v_marked_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_all_narratives_read IS 'Mark all narratives as read for a team. Returns count of newly marked narratives.';

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Uncomment to add sample read records for development

-- Mark some narratives as read
-- INSERT INTO narrative_reads (narrative_id, team_id, read_by)
-- SELECT
--     n.id,
--     t.id,
--     (SELECT id FROM users WHERE role = 'player' LIMIT 1)
-- FROM narratives n
-- CROSS JOIN teams t
-- WHERE n.type = 'briefing'
-- LIMIT 5
-- ON CONFLICT (narrative_id, team_id) DO NOTHING;
