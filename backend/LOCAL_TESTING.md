# Local Testing Guide

Quick guide to set up and test BusinessCaise backend locally.

## Prerequisites

- PostgreSQL 14+ installed
- Node.js 18+ installed
- Terminal/command line access

## Quick Start (3 Steps)

### 1. Set up Database

```bash
cd backend
./setup-db.sh
```

This script will:
- ✅ Check if PostgreSQL is installed and running
- ✅ Create the `businesscaise` database
- ✅ Run all migrations (9 tables)
- ✅ Create test user accounts
- ✅ Create `.env` file with correct settings

**Test accounts created:**
- Game Master: `gm@test.com` / `test123`
- Player: `player@test.com` / `test123`

### 2. Start Backend Server

```bash
npm install  # if you haven't already
npm run dev
```

You should see:
```
╔══════════════════════════════════════╗
║   BusinessCaise Backend Server       ║
║   Environment: development           ║
║   Port: 3001                         ║
║   Status: Running                    ║
╚══════════════════════════════════════╝
```

### 3. Run API Tests

In a **new terminal**:

```bash
cd backend
./test-api.sh
```

This will test all 15 endpoints:
- ✅ Authentication (login, get user)
- ✅ Create game (with 10 auto-generated sessions)
- ✅ List games
- ✅ Get game details
- ✅ List sessions
- ✅ Start game
- ✅ Unlock session
- ✅ Update session
- ✅ Update game
- ✅ Get leaderboard
- ✅ Get analytics
- ✅ Pause/resume game
- ✅ List teams

---

## Manual Testing

### Using curl

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gm@test.com","password":"test123"}' \
  | jq -r '.token')

# 2. Create game
curl -X POST http://localhost:3001/api/gm/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Test Game","description":"Testing the API"}' | jq

# 3. List games
curl -X GET http://localhost:3001/api/gm/games \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Using Postman

1. Import the environment variables:
   - `baseUrl`: `http://localhost:3001`
   - `token`: (leave empty, will be set automatically)

2. Use the examples in `GAME_API_TESTING.md`

---

## Database Verification

### View all tables

```bash
psql -U postgres -d businesscaise -c "\dt"
```

### Check games

```sql
psql -U postgres -d businesscaise

SELECT id, title, status, created_at FROM games;
```

### Check sessions for a game

```sql
SELECT session_number, day, period, title, status, unlocked_at
FROM sessions
WHERE game_id = 'YOUR_GAME_ID_HERE'
ORDER BY session_number;
```

### Check users

```sql
SELECT id, email, role, name FROM users;
```

---

## Troubleshooting

### PostgreSQL not running

**macOS:**
```bash
brew services start postgresql@14
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Windows:**
- Start PostgreSQL from Services app
- Or start from pgAdmin

### Port 3001 already in use

```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or change the port in .env
PORT=3002
```

### Database connection error

Check your `.env` file has correct credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=businesscaise
DB_USER=postgres
DB_PASSWORD=postgres  # or your password
```

### "jq: command not found"

The test script uses `jq` for JSON parsing.

**Install jq:**
- macOS: `brew install jq`
- Ubuntu: `sudo apt install jq`
- Windows: Download from https://stedolan.github.io/jq/download/

Or test manually without the script using curl.

---

## What Gets Tested

### Authentication (2 tests)
- ✅ POST /api/auth/login
- ✅ GET /api/auth/me

### Game CRUD (5 tests)
- ✅ POST /api/gm/games - Create game
- ✅ GET /api/gm/games - List games
- ✅ GET /api/gm/games/:id - Get details
- ✅ PUT /api/gm/games/:id - Update
- ✅ DELETE - (not tested to preserve data)

### Game Control (3 tests)
- ✅ POST /api/gm/games/:id/start
- ✅ POST /api/gm/games/:id/pause
- ✅ POST /api/gm/games/:id/resume

### Session Management (3 tests)
- ✅ GET /api/gm/games/:id/sessions
- ✅ POST /api/gm/games/:gameId/sessions/:sessionId/unlock
- ✅ PUT /api/gm/games/:gameId/sessions/:sessionId

### Analytics (2 tests)
- ✅ GET /api/gm/games/:id/leaderboard
- ✅ GET /api/gm/games/:id/analytics

### Total: 15 endpoint tests

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. Explore the database to see created data
3. Try the frontend (when available)
4. Implement team controller for player endpoints
5. Build Game Master Dashboard

---

## Full Documentation

- **Database Setup:** `DATABASE_SETUP.md`
- **Auth API Testing:** `AUTH_API_TESTING.md`
- **Game API Testing:** `GAME_API_TESTING.md`
- **Implementation Notes:** `IMPLEMENTATION_NOTES.md`
- **Architecture:** `../ARCHITECTURE.md`

---

## Quick Reset

To start fresh:

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS businesscaise;"
./setup-db.sh

# Restart server
# Kill server (Ctrl+C) and run:
npm run dev
```

---

**Happy Testing! 🚀**
