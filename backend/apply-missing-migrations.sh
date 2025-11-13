#!/bin/bash

# Apply missing Phase 3 migrations to existing database
# This script applies migrations 003 and 004 without dropping the database

set -e

echo "=========================================="
echo "Applying Missing Phase 3 Migrations"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Database credentials
DB_NAME="businesscase"
DB_USER="${PGUSER:-postgres}"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo "Please start PostgreSQL first"
    exit 1
fi

# Check if database exists
if ! psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${RED}✗ Database '$DB_NAME' does not exist${NC}"
    echo "Please run ./setup-db.sh first"
    exit 1
fi

echo "Applying migration 003 (Scenario Customization)..."
psql -U "$DB_USER" -d "$DB_NAME" -f migrations/003_scenario_customization.sql || {
    echo -e "${RED}✗ Failed to apply migration 003${NC}"
    exit 1
}
echo -e "${GREEN}✓ Migration 003 applied${NC}"

echo ""
echo "Applying migration 004 (Pod Competition System)..."
psql -U "$DB_USER" -d "$DB_NAME" -f migrations/004_pod_competition_system.sql || {
    echo -e "${RED}✗ Failed to apply migration 004${NC}"
    exit 1
}
echo -e "${GREEN}✓ Migration 004 applied${NC}"

echo ""
echo "=========================================="
echo "Migrations Applied Successfully!"
echo "=========================================="
echo ""
echo "The database now has all Phase 3 columns:"
echo "  - archetype_id, industry_id, company_name, product_description"
echo "  - enable_pods, pod_size, pod_assignment_method, enable_category_awards"
echo ""
echo "You can now restart the backend server and tests should pass."
echo ""
