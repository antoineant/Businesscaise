#!/bin/bash

# BusinessCaise - Reset Test Users
# Deletes existing test users so they can be recreated with proper passwords

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

DB_USER="${PGUSER:-postgres}"
DB_NAME="businesscaise"

echo "Resetting test users..."

# Delete existing test users
psql -U "$DB_USER" -d "$DB_NAME" <<EOF
DELETE FROM users WHERE email IN ('gm@test.com', 'player@test.com');
EOF

echo -e "${GREEN}✓ Test users deleted${NC}"
echo ""
echo "Run './test-api.sh' to recreate them with proper passwords"
