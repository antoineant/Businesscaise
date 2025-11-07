#!/bin/bash

# BusinessCaise - Local PostgreSQL Setup Script
# This script will set up PostgreSQL database for local testing

set -e  # Exit on error

echo "=========================================="
echo "BusinessCaise PostgreSQL Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL is not installed${NC}"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  macOS:   brew install postgresql@14"
    echo "  Ubuntu:  sudo apt install postgresql postgresql-contrib"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is installed${NC}"

# Check if PostgreSQL is running
echo "Checking if PostgreSQL is running..."
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠ PostgreSQL is not running${NC}"
    echo ""
    echo "Starting PostgreSQL..."

    # Try to start PostgreSQL (platform-specific)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start postgresql@14 || brew services start postgresql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start postgresql
    else
        echo "Please start PostgreSQL manually for your platform"
        exit 1
    fi

    # Wait for PostgreSQL to start
    sleep 2

    if ! pg_isready -q; then
        echo -e "${RED}✗ Failed to start PostgreSQL${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Set database credentials
DB_NAME="businesscaise"
DB_USER="${PGUSER:-postgres}"
DB_PASSWORD="${PGPASSWORD:-postgres}"

echo ""
echo "Using database credentials:"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo ""

# Check if database already exists
echo "Checking if database exists..."
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠ Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo -e "${GREEN}✓ Database dropped${NC}"
    else
        echo "Keeping existing database"
        exit 0
    fi
fi

# Create database
echo "Creating database '$DB_NAME'..."
psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" || {
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
}
echo -e "${GREEN}✓ Database created${NC}"

# Run migrations
echo ""
echo "Running database migrations..."
MIGRATION_FILE="$(dirname "$0")/migrations/001_initial_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}✗ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

psql -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE" || {
    echo -e "${RED}✗ Failed to run migrations${NC}"
    exit 1
}
echo -e "${GREEN}✓ Migrations completed${NC}"

# Verify tables were created
echo ""
echo "Verifying tables..."
TABLE_COUNT=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo -e "${GREEN}✓ Created $TABLE_COUNT tables${NC}"

# List tables
echo ""
echo "Database tables:"
psql -U "$DB_USER" -d "$DB_NAME" -c "\dt" || true

# Create test user accounts
echo ""
echo "Creating test user accounts..."

# Delete existing test users first
psql -U "$DB_USER" -d "$DB_NAME" <<EOF > /dev/null 2>&1
DELETE FROM users WHERE email IN ('gm@test.com', 'player@test.com');
EOF

echo -e "${GREEN}✓ Test users will be created via API${NC}"
echo ""
echo "Note: Test accounts will be created when you run the test script"
echo "  Game Master: gm@test.com / test123"
echo "  Player:      player@test.com / test123"

# Update .env file if it doesn't exist
ENV_FILE="$(dirname "$0")/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo ""
    echo "Creating .env file..."
    cat > "$ENV_FILE" <<EOF
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=businesscaise_dev_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:5173
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists (not modified)${NC}"
fi

# Final verification
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Database is ready. You can now:"
echo "  1. Start the backend server: npm run dev"
echo "  2. Run the test script: ./test-api.sh"
echo ""
echo "To verify the database manually:"
echo "  psql -U $DB_USER -d $DB_NAME"
echo ""
