-- Migration 005: Perplexity AI Integration (Reality Lens & Ask the Market)
-- Description: Adds tracking table for Perplexity API usage and AI-powered features
-- Date: 2025-11-13

-- ============================================================================
-- PERPLEXITY USAGE TABLE
-- ============================================================================
-- Tracks all Perplexity AI API calls for cost management, rate limiting, and analytics

CREATE TABLE IF NOT EXISTS perplexity_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    query_type VARCHAR(20) NOT NULL,
    query_text TEXT NOT NULL,
    response_data JSONB,
    sources JSONB DEFAULT '[]'::jsonb,
    credits_used INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),

    CONSTRAINT check_query_type CHECK (query_type IN ('reality_lens', 'market_query', 'event_inspiration', 'enhance_narrative'))
);

COMMENT ON TABLE perplexity_usage IS 'Tracks Perplexity AI API usage for Reality Lens and Ask the Market features';
COMMENT ON COLUMN perplexity_usage.query_type IS 'Type of query: reality_lens, market_query, event_inspiration, enhance_narrative';
COMMENT ON COLUMN perplexity_usage.query_text IS 'Original query or prompt sent to Perplexity';
COMMENT ON COLUMN perplexity_usage.response_data IS 'Full response from Perplexity API (stored as JSON)';
COMMENT ON COLUMN perplexity_usage.sources IS 'Array of sources/citations from Perplexity response';
COMMENT ON COLUMN perplexity_usage.credits_used IS 'API credits/tokens consumed (for cost tracking)';
COMMENT ON COLUMN perplexity_usage.team_id IS 'NULL for GM queries, team ID for student market queries';
COMMENT ON COLUMN perplexity_usage.created_by IS 'User who initiated the query (GM or team member)';

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Optimize queries for rate limiting and analytics

-- Fast lookup by game for usage stats
CREATE INDEX idx_perplexity_usage_game ON perplexity_usage(game_id, created_at DESC);

-- Fast lookup by team for rate limiting
CREATE INDEX idx_perplexity_usage_team ON perplexity_usage(team_id, created_at DESC) WHERE team_id IS NOT NULL;

-- Fast lookup by query type for analytics
CREATE INDEX idx_perplexity_usage_type ON perplexity_usage(query_type, created_at DESC);

-- Fast count for recent team queries (rate limiting)
-- Note: Time filtering should be done in queries, not in index predicate
CREATE INDEX idx_perplexity_usage_team_recent ON perplexity_usage(team_id, query_type, created_at DESC)
    WHERE team_id IS NOT NULL;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Uncomment to add sample Perplexity usage records for development

-- INSERT INTO perplexity_usage (game_id, team_id, query_type, query_text, response_data, sources, created_by)
-- VALUES (
--     (SELECT id FROM games LIMIT 1),
--     NULL,
--     'reality_lens',
--     'What are current trends in the retail industry?',
--     '{"insights": "E-commerce growth continues...", "trends": ["Online shopping", "Supply chain"]}'::jsonb,
--     '[{"title": "Retail Report 2024", "url": "https://example.com"}]'::jsonb,
--     (SELECT id FROM users WHERE role = 'game_master' LIMIT 1)
-- );

-- ============================================================================
-- CLEANUP FUNCTION (Optional)
-- ============================================================================
-- Function to automatically delete old usage records (90+ days)

CREATE OR REPLACE FUNCTION cleanup_old_perplexity_usage()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM perplexity_usage
    WHERE created_at < NOW() - INTERVAL '90 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_perplexity_usage IS 'Deletes perplexity_usage records older than 90 days';

-- Schedule cleanup (optional - requires pg_cron extension)
-- SELECT cron.schedule('cleanup-perplexity-usage', '0 2 * * 0', 'SELECT cleanup_old_perplexity_usage()');
