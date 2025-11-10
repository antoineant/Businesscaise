#!/bin/bash

# Script to apply database migration 002
# This updates the submissions table to fix the "session_id does not exist" error

echo "🔧 Applying database migration 002..."
echo ""
echo "⚠️  Note: If you already ran this migration and still getting errors,"
echo "   you need to re-run it because challenge_id type was updated."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create .env file with your database credentials:"
    echo "  DB_HOST=localhost"
    echo "  DB_PORT=5432"
    echo "  DB_NAME=businesscaise"
    echo "  DB_USER=postgres"
    echo "  DB_PASSWORD=your_password"
    echo ""
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Build PostgreSQL connection string
export PGPASSWORD=$DB_PASSWORD
DB_CONN="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo "Connecting to database: $DB_NAME@$DB_HOST:$DB_PORT"
echo ""

# Apply migration
psql "$DB_CONN" -f migrations/002_update_submissions_table.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Run your E2E tests again"
    echo "  2. The submit test should now pass!"
else
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Please check:"
    echo "  1. PostgreSQL is running"
    echo "  2. Database credentials in .env are correct"
    echo "  3. Database 'businesscaise' exists"
fi
