-- Migration 003: Company Scenario Customization System
-- Description: Adds company archetypes, industry types, and scenario settings to games
-- Date: 2025-11-12

-- ============================================================================
-- COMPANY ARCHETYPES TABLE
-- ============================================================================
-- Stores pre-defined company archetypes (startup, product launch, turnaround, etc.)

CREATE TABLE IF NOT EXISTS company_archetypes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    starting_cash INTEGER NOT NULL,
    starting_team_size INTEGER NOT NULL,
    starting_metrics JSONB NOT NULL,
    difficulty_modifier DECIMAL(3,2) DEFAULT 1.0,
    narrative_template_set VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_starting_cash CHECK (starting_cash >= 0),
    CONSTRAINT check_team_size CHECK (starting_team_size > 0),
    CONSTRAINT check_difficulty CHECK (difficulty_modifier >= 0.5 AND difficulty_modifier <= 2.0)
);

COMMENT ON TABLE company_archetypes IS 'Pre-defined company archetypes (startup, turnaround, scale-up, etc.)';
COMMENT ON COLUMN company_archetypes.starting_metrics IS 'JSONB object with financial, operations, marketing, hr, customer_satisfaction, overall scores';
COMMENT ON COLUMN company_archetypes.difficulty_modifier IS 'Difficulty multiplier for challenges (0.8 = easier, 1.2 = harder)';

-- ============================================================================
-- INDUSTRY TYPES TABLE
-- ============================================================================
-- Stores pre-defined industry types (SaaS, e-commerce, food, etc.)

CREATE TABLE IF NOT EXISTS industry_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    product_examples TEXT[],
    npc_set VARCHAR(50),
    challenge_focus TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE industry_types IS 'Pre-defined industry types (SaaS, e-commerce, food & beverage, etc.)';
COMMENT ON COLUMN industry_types.product_examples IS 'Array of example products/services for this industry';
COMMENT ON COLUMN industry_types.npc_set IS 'Identifier for industry-specific NPCs';
COMMENT ON COLUMN industry_types.challenge_focus IS 'Array of focus areas (marketing, operations, etc.)';

-- ============================================================================
-- ADD SCENARIO COLUMNS TO GAMES TABLE
-- ============================================================================
-- Adds company archetype and industry selection to games

ALTER TABLE games
    ADD COLUMN IF NOT EXISTS archetype_id VARCHAR(50) REFERENCES company_archetypes(id),
    ADD COLUMN IF NOT EXISTS industry_id VARCHAR(50) REFERENCES industry_types(id),
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS product_description TEXT;

COMMENT ON COLUMN games.archetype_id IS 'Company archetype for this game (startup, turnaround, etc.)';
COMMENT ON COLUMN games.industry_id IS 'Industry type for this game (SaaS, food, retail, etc.)';
COMMENT ON COLUMN games.company_name IS 'Optional custom company name set by GM';
COMMENT ON COLUMN games.product_description IS 'Optional custom product/service description set by GM';

-- ============================================================================
-- SEED DATA: COMPANY ARCHETYPES
-- ============================================================================

INSERT INTO company_archetypes (id, name, description, icon, starting_cash, starting_team_size, starting_metrics, difficulty_modifier, narrative_template_set)
VALUES
(
    'startup',
    'Early-Stage Startup',
    'You''re launching a brand new company with a fresh idea, limited resources, and big dreams. Every decision matters as you fight to survive and gain traction.',
    '🚀',
    25000,
    3,
    '{
        "financial": 40,
        "operations": 45,
        "marketing": 35,
        "hr": 50,
        "customer_satisfaction": 30,
        "overall": 40
    }'::jsonb,
    1.0,
    'startup'
),
(
    'product_launch',
    'Product Launch',
    'Your established company is launching a new product line. You have resources and experience, but also stakeholders to answer to and a reputation to maintain.',
    '📦',
    100000,
    15,
    '{
        "financial": 60,
        "operations": 65,
        "marketing": 55,
        "hr": 60,
        "customer_satisfaction": 58,
        "overall": 60
    }'::jsonb,
    1.0,
    'product_launch'
),
(
    'turnaround',
    'Turnaround / Revival',
    'You''ve inherited a struggling business. Morale is low, customers are leaving, and cash is tight. Can you turn it around before it''s too late?',
    '📈',
    50000,
    20,
    '{
        "financial": 35,
        "operations": 40,
        "marketing": 30,
        "hr": 25,
        "customer_satisfaction": 28,
        "overall": 32
    }'::jsonb,
    1.2,
    'turnaround'
),
(
    'scale_up',
    'Scale-Up / Hyper-Growth',
    'Your startup has found product-market fit and is growing fast. Can you build systems and culture to handle explosive growth without losing your soul?',
    '🌟',
    200000,
    8,
    '{
        "financial": 70,
        "operations": 50,
        "marketing": 75,
        "hr": 55,
        "customer_satisfaction": 68,
        "overall": 64
    }'::jsonb,
    1.1,
    'scale_up'
),
(
    'innovation',
    'Innovation / R&D Focus',
    'You''re in a competitive industry where innovation is everything. Balance investment in R&D with immediate business needs.',
    '🔬',
    150000,
    12,
    '{
        "financial": 55,
        "operations": 60,
        "marketing": 50,
        "hr": 65,
        "customer_satisfaction": 52,
        "overall": 56
    }'::jsonb,
    1.0,
    'innovation'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED DATA: INDUSTRY TYPES
-- ============================================================================

INSERT INTO industry_types (id, name, description, icon, product_examples, npc_set, challenge_focus)
VALUES
(
    'saas',
    'Tech SaaS',
    'Cloud-based software serving businesses or consumers',
    '💻',
    ARRAY['Project management tool', 'CRM system', 'Marketing automation platform', 'Team collaboration app', 'Analytics dashboard'],
    'saas',
    ARRAY['customer_acquisition', 'churn', 'pricing', 'features', 'infrastructure']
),
(
    'ecommerce',
    'E-Commerce / Retail',
    'Selling physical products online or in stores',
    '🛍️',
    ARRAY['Fashion/apparel', 'Consumer electronics', 'Home goods', 'Specialty foods', 'Handcrafted items'],
    'ecommerce',
    ARRAY['inventory', 'shipping', 'returns', 'marketing', 'suppliers']
),
(
    'food',
    'Food & Beverage',
    'Restaurant, cafe, food product, or beverage company',
    '🍕',
    ARRAY['Coffee shop', 'Food truck', 'Packaged foods', 'Meal delivery', 'Specialty beverages'],
    'food',
    ARRAY['location', 'suppliers', 'menu', 'health_safety', 'branding']
),
(
    'healthcare',
    'Healthcare / Wellness',
    'Health services, medical devices, or wellness products',
    '🏥',
    ARRAY['Telemedicine platform', 'Fitness app', 'Medical device', 'Wellness coaching', 'Healthcare SaaS'],
    'healthcare',
    ARRAY['compliance', 'outcomes', 'insurance', 'privacy', 'clinical']
),
(
    'services',
    'Professional Services',
    'Consulting, agency, or service-based business',
    '💼',
    ARRAY['Marketing agency', 'Business consulting', 'Design studio', 'Legal services', 'Accounting firm'],
    'services',
    ARRAY['utilization', 'pricing', 'talent', 'client_retention', 'scope']
),
(
    'education',
    'Education / EdTech',
    'Educational products, platforms, or services',
    '📚',
    ARRAY['Online learning platform', 'Educational app', 'Tutoring service', 'Training courses', 'School management software'],
    'education',
    ARRAY['content', 'engagement', 'outcomes', 'pricing', 'instructors']
),
(
    'manufacturing',
    'Manufacturing / Hardware',
    'Physical product manufacturing or hardware devices',
    '🏭',
    ARRAY['Consumer electronics', 'Industrial equipment', 'IoT devices', 'Furniture', 'Automotive parts'],
    'manufacturing',
    ARRAY['supply_chain', 'quality', 'capacity', 'distribution', 'warranty']
),
(
    'custom',
    'Custom / Open-Ended',
    'Define your own industry and product',
    '🎨',
    ARRAY['Your custom industry'],
    'generic',
    ARRAY['general']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_games_archetype ON games(archetype_id);
CREATE INDEX IF NOT EXISTS idx_games_industry ON games(industry_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify archetypes were created
DO $$
DECLARE
    archetype_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO archetype_count FROM company_archetypes;
    RAISE NOTICE 'Created % company archetypes', archetype_count;
END $$;

-- Verify industries were created
DO $$
DECLARE
    industry_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO industry_count FROM industry_types;
    RAISE NOTICE 'Created % industry types', industry_count;
END $$;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================

/*
-- To rollback this migration:

-- Remove columns from games table
ALTER TABLE games
    DROP COLUMN IF EXISTS archetype_id,
    DROP COLUMN IF EXISTS industry_id,
    DROP COLUMN IF EXISTS company_name,
    DROP COLUMN IF EXISTS product_description;

-- Drop indexes
DROP INDEX IF EXISTS idx_games_archetype;
DROP INDEX IF EXISTS idx_games_industry;

-- Drop tables
DROP TABLE IF EXISTS industry_types CASCADE;
DROP TABLE IF EXISTS company_archetypes CASCADE;
*/
