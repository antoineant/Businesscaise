# Database Setup Guide

This guide will help you set up the PostgreSQL database for BusinessCaise backend.

## Prerequisites

- PostgreSQL 14+ installed on your system
- Terminal access with sufficient privileges

## Installation

### macOS

```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows

Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

## Database Creation

### 1. Access PostgreSQL

```bash
# Switch to postgres user (Linux)
sudo -u postgres psql

# Or connect directly (if you have permissions)
psql -U postgres
```

### 2. Create Database and User

```sql
-- Create the database
CREATE DATABASE businesscase;

-- Create a user (optional, for production)
CREATE USER businesscase_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE businesscase TO businesscase_user;

-- Connect to the database
\c businesscase

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO businesscase_user;

-- Exit psql
\q
```

### 3. Run Migrations

```bash
# From the backend directory
cd backend

# Run the initial schema migration
psql -U postgres -d businesscase -f migrations/001_initial_schema.sql

# Or if using the created user
psql -U businesscase_user -d businesscase -f migrations/001_initial_schema.sql
```

## Verify Installation

### Check Database Connection

```bash
# Test connection
psql -U postgres -d businesscase -c "SELECT version();"
```

### Verify Tables

```bash
psql -U postgres -d businesscase -c "\dt"
```

You should see the following tables:
- `users`
- `games`
- `teams`
- `sessions`
- `challenges`
- `submissions`
- `metrics_history`
- `narratives`
- `gm_events`

## Environment Configuration

Ensure your `.env` file has the correct database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=businesscase
DB_USER=postgres
DB_PASSWORD=your_password_here
```

## Testing the Connection

Start the backend server and check for the database connection message:

```bash
npm run dev
```

You should see:
```
✓ Database connected successfully
```

## Common Issues

### Port Already in Use

```bash
# Check if PostgreSQL is running on the correct port
sudo lsof -i :5432
```

### Permission Denied

```bash
# Ensure PostgreSQL is accepting local connections
# Edit pg_hba.conf to allow local connections
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add or modify this line:
local   all             all                                     md5
```

### UUID Extension Error

If you get an error about uuid-ossp extension:

```sql
-- Connect to your database
psql -U postgres -d businesscase

-- Enable the extension manually
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Seeding Test Data (Optional)

To create a test user for development:

```sql
-- Connect to the database
psql -U postgres -d businesscase

-- Insert a Game Master user
INSERT INTO users (email, password_hash, role, name)
VALUES (
    'gm@test.com',
    '$2a$10$rH5K.8GKZ5pCqZQY5YqQKef1y7BZ5xZ5vZQxH3xH5xH5xH5xH5xH5',  -- password: "test123"
    'game_master',
    'Test Game Master'
);

-- Insert a Player user
INSERT INTO users (email, password_hash, role, name)
VALUES (
    'player@test.com',
    '$2a$10$rH5K.8GKZ5pCqZQY5YqQKef1y7BZ5xZ5vZQxH3xH5xH5xH5xH5xH5',  -- password: "test123"
    'player',
    'Test Player'
);
```

## Database Schema Overview

### Core Tables

1. **users** - User accounts (Game Masters and Players)
2. **games** - Game instances created by Game Masters
3. **teams** - Student teams participating in games
4. **sessions** - 10 sessions per game (5 days × 2 periods)
5. **challenges** - Business challenges for each session
6. **submissions** - Team responses to challenges
7. **metrics_history** - Track team metrics over time
8. **narratives** - Story content (briefings, news, emails)
9. **gm_events** - Game Master interventions

### Key Features

- **UUID Primary Keys** - Secure, non-sequential identifiers
- **Foreign Key Constraints** - Data integrity across tables
- **Indexes** - Optimized query performance
- **Triggers** - Automatic `updated_at` timestamp updates
- **JSONB Fields** - Flexible data storage for metrics and settings
- **Check Constraints** - Valid enum values enforced at database level

## Next Steps

After setting up the database:

1. Test the authentication endpoints using the API documentation
2. Create your first Game Master account
3. Explore the backend API endpoints (see `backend/README.md`)
4. Begin developing additional API endpoints

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [BusinessCaise Backend README](./README.md)
- [API Architecture](../ARCHITECTURE.md)
