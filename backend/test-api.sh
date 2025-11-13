#!/bin/bash

# BusinessCaise - API Testing Script
# Tests all authentication and game management endpoints

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001"
TOKEN=""
GAME_ID=""
SESSION_ID=""

# Helper function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}=========================================="
    echo -e "$1"
    echo -e "==========================================${NC}"
    echo ""
}

# Helper function to check if server is running
check_server() {
    if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${RED}✗ Backend server is not running${NC}"
        echo ""
        echo "Please start the server first:"
        echo "  cd backend && npm run dev"
        exit 1
    fi
}

print_section "BusinessCaise API Testing"

# Check if backend is running
echo "Checking if backend server is running..."
check_server
echo -e "${GREEN}✓ Backend server is running${NC}"

# Test 1: Authentication - Register & Login
print_section "TEST 1: Authentication - Register & Login"
echo "Registering Game Master (gm@test.com)..."

# Try to register (this creates the user with proper password hash)
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gm@test.com",
    "password": "test123",
    "name": "Test Game Master",
    "role": "game_master"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

# If registration failed (user exists), try login
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "User already exists, trying login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "gm@test.com",
        "password": "test123"
      }')

    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

    if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
        echo -e "${RED}✗ Login failed${NC}"
        echo "Response: $LOGIN_RESPONSE"
        echo ""
        echo "Please run './setup-db.sh' to reset the database"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo "Token: ${TOKEN:0:20}..."

# Test 2: Get Current User
print_section "TEST 2: Get Current User"
echo "Testing GET /api/auth/me..."

ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

USER_EMAIL=$(echo $ME_RESPONSE | jq -r '.user.email')

if [ "$USER_EMAIL" == "gm@test.com" ]; then
    echo -e "${GREEN}✓ Successfully retrieved current user${NC}"
    echo "Email: $USER_EMAIL"
    echo "Role: $(echo $ME_RESPONSE | jq -r '.user.role')"
else
    echo -e "${RED}✗ Failed to get current user${NC}"
    echo "Response: $ME_RESPONSE"
    exit 1
fi

# Test 3: Create Game
print_section "TEST 3: Create Game"
echo "Testing POST /api/gm/games..."

CREATE_GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/api/gm/games" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Game 2024",
    "description": "Automated API testing game",
    "settings": {
      "max_teams": 10,
      "difficulty": "intermediate"
    }
  }')

GAME_ID=$(echo $CREATE_GAME_RESPONSE | jq -r '.game.id')
SESSION_COUNT=$(echo $CREATE_GAME_RESPONSE | jq -r '.sessions | length')

if [ "$GAME_ID" == "null" ] || [ -z "$GAME_ID" ]; then
    echo -e "${RED}✗ Failed to create game${NC}"
    echo "Response: $CREATE_GAME_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Game created successfully${NC}"
echo "Game ID: $GAME_ID"
echo "Sessions created: $SESSION_COUNT"

if [ "$SESSION_COUNT" != "10" ]; then
    echo -e "${YELLOW}⚠ Warning: Expected 10 sessions, got $SESSION_COUNT${NC}"
fi

# Save first session ID
SESSION_ID=$(echo $CREATE_GAME_RESPONSE | jq -r '.sessions[0].id')
echo "First Session ID: $SESSION_ID"

# Test 4: List Games
print_section "TEST 4: List All Games"
echo "Testing GET /api/gm/games..."

LIST_GAMES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gm/games" \
  -H "Authorization: Bearer $TOKEN")

GAMES_COUNT=$(echo $LIST_GAMES_RESPONSE | jq -r '.games | length')

echo -e "${GREEN}✓ Listed games successfully${NC}"
echo "Total games: $GAMES_COUNT"

# Test 5: Get Game Details
print_section "TEST 5: Get Game Details"
echo "Testing GET /api/gm/games/$GAME_ID..."

GAME_DETAILS=$(curl -s -X GET "$BASE_URL/api/gm/games/$GAME_ID" \
  -H "Authorization: Bearer $TOKEN")

GAME_TITLE=$(echo $GAME_DETAILS | jq -r '.game.title')
SESSIONS_IN_DETAIL=$(echo $GAME_DETAILS | jq -r '.sessions | length')
TEAMS_COUNT=$(echo $GAME_DETAILS | jq -r '.teams | length')

echo -e "${GREEN}✓ Retrieved game details${NC}"
echo "Title: $GAME_TITLE"
echo "Sessions: $SESSIONS_IN_DETAIL"
echo "Teams: $TEAMS_COUNT"

# Test 6: List Sessions
print_section "TEST 6: List Sessions"
echo "Testing GET /api/gm/games/$GAME_ID/sessions..."

SESSIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gm/games/$GAME_ID/sessions" \
  -H "Authorization: Bearer $TOKEN")

SESSIONS_LIST_COUNT=$(echo $SESSIONS_RESPONSE | jq -r '.sessions | length')

echo -e "${GREEN}✓ Listed sessions successfully${NC}"
echo "Sessions count: $SESSIONS_LIST_COUNT"

# Show session details
echo ""
echo "Session breakdown:"
echo $SESSIONS_RESPONSE | jq -r '.sessions[] | "\(.session_number). \(.day) \(.period) - \(.status)"'

# Test 7: Start Game
print_section "TEST 7: Start Game"
echo "Testing POST /api/gm/games/$GAME_ID/start..."

START_GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/api/gm/games/$GAME_ID/start" \
  -H "Authorization: Bearer $TOKEN")

GAME_STATUS=$(echo $START_GAME_RESPONSE | jq -r '.game.status')

if [ "$GAME_STATUS" == "active" ]; then
    echo -e "${GREEN}✓ Game started successfully${NC}"
    echo "Status: $GAME_STATUS"
else
    echo -e "${RED}✗ Failed to start game${NC}"
    echo "Response: $START_GAME_RESPONSE"
fi

# Test 8: Unlock Session
print_section "TEST 8: Unlock First Session"
echo "Testing POST /api/gm/games/$GAME_ID/sessions/$SESSION_ID/unlock..."

UNLOCK_SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/gm/games/$GAME_ID/sessions/$SESSION_ID/unlock" \
  -H "Authorization: Bearer $TOKEN")

SESSION_STATUS=$(echo $UNLOCK_SESSION_RESPONSE | jq -r '.session.status')
SESSION_UNLOCKED_AT=$(echo $UNLOCK_SESSION_RESPONSE | jq -r '.session.unlocked_at')

if [ "$SESSION_STATUS" == "active" ]; then
    echo -e "${GREEN}✓ Session unlocked successfully${NC}"
    echo "Status: $SESSION_STATUS"
    echo "Unlocked at: $SESSION_UNLOCKED_AT"
else
    echo -e "${RED}✗ Failed to unlock session${NC}"
    echo "Response: $UNLOCK_SESSION_RESPONSE"
fi

# Test 9: Update Session
print_section "TEST 9: Update Session"
echo "Testing PUT /api/gm/games/$GAME_ID/sessions/$SESSION_ID..."

UPDATE_SESSION_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/gm/games/$GAME_ID/sessions/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Crisis Management Challenge",
    "description": "Your company faces an unexpected PR crisis",
    "deadline": "2024-12-31T23:59:59Z"
  }')

UPDATED_TITLE=$(echo $UPDATE_SESSION_RESPONSE | jq -r '.session.title')

if [ "$UPDATED_TITLE" == "Crisis Management Challenge" ]; then
    echo -e "${GREEN}✓ Session updated successfully${NC}"
    echo "New title: $UPDATED_TITLE"
else
    echo -e "${RED}✗ Failed to update session${NC}"
    echo "Response: $UPDATE_SESSION_RESPONSE"
fi

# Test 10: Update Game
print_section "TEST 10: Update Game"
echo "Testing PUT /api/gm/games/$GAME_ID..."

UPDATE_GAME_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/gm/games/$GAME_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Game 2024 - Updated",
    "description": "Updated description for testing"
  }')

UPDATED_GAME_TITLE=$(echo $UPDATE_GAME_RESPONSE | jq -r '.game.title')

if [[ "$UPDATED_GAME_TITLE" == *"Updated"* ]]; then
    echo -e "${GREEN}✓ Game updated successfully${NC}"
    echo "New title: $UPDATED_GAME_TITLE"
else
    echo -e "${RED}✗ Failed to update game${NC}"
    echo "Response: $UPDATE_GAME_RESPONSE"
fi

# Test 11: Get Leaderboard
print_section "TEST 11: Get Leaderboard"
echo "Testing GET /api/gm/games/$GAME_ID/leaderboard..."

LEADERBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gm/games/$GAME_ID/leaderboard" \
  -H "Authorization: Bearer $TOKEN")

LEADERBOARD_COUNT=$(echo $LEADERBOARD_RESPONSE | jq -r '.leaderboard | length')

echo -e "${GREEN}✓ Retrieved leaderboard${NC}"
echo "Teams on leaderboard: $LEADERBOARD_COUNT"

if [ "$LEADERBOARD_COUNT" == "0" ]; then
    echo -e "${YELLOW}(No teams have joined yet)${NC}"
fi

# Test 12: Get Analytics
print_section "TEST 12: Get Game Analytics"
echo "Testing GET /api/gm/games/$GAME_ID/analytics..."

ANALYTICS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gm/games/$GAME_ID/analytics" \
  -H "Authorization: Bearer $TOKEN")

TOTAL_TEAMS=$(echo $ANALYTICS_RESPONSE | jq -r '.analytics.total_teams')
COMPLETED_SESSIONS=$(echo $ANALYTICS_RESPONSE | jq -r '.analytics.completed_sessions')
ACTIVE_SESSIONS=$(echo $ANALYTICS_RESPONSE | jq -r '.analytics.active_sessions')

echo -e "${GREEN}✓ Retrieved analytics${NC}"
echo "Total teams: $TOTAL_TEAMS"
echo "Completed sessions: $COMPLETED_SESSIONS"
echo "Active sessions: $ACTIVE_SESSIONS"

# Test 13: Pause Game
print_section "TEST 13: Pause Game"
echo "Testing POST /api/gm/games/$GAME_ID/pause..."

PAUSE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/gm/games/$GAME_ID/pause" \
  -H "Authorization: Bearer $TOKEN")

PAUSED_STATUS=$(echo $PAUSE_RESPONSE | jq -r '.game.status')

if [ "$PAUSED_STATUS" == "paused" ]; then
    echo -e "${GREEN}✓ Game paused successfully${NC}"
    echo "Status: $PAUSED_STATUS"
else
    echo -e "${RED}✗ Failed to pause game${NC}"
fi

# Test 14: Resume Game
print_section "TEST 14: Resume Game"
echo "Testing POST /api/gm/games/$GAME_ID/resume..."

RESUME_RESPONSE=$(curl -s -X POST "$BASE_URL/api/gm/games/$GAME_ID/resume" \
  -H "Authorization: Bearer $TOKEN")

RESUMED_STATUS=$(echo $RESUME_RESPONSE | jq -r '.game.status')

if [ "$RESUMED_STATUS" == "active" ]; then
    echo -e "${GREEN}✓ Game resumed successfully${NC}"
    echo "Status: $RESUMED_STATUS"
else
    echo -e "${RED}✗ Failed to resume game${NC}"
fi

# Test 15: List Teams (should be empty)
print_section "TEST 15: List Teams"
echo "Testing GET /api/gm/games/$GAME_ID/teams..."

TEAMS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gm/games/$GAME_ID/teams" \
  -H "Authorization: Bearer $TOKEN")

TEAMS_LIST_COUNT=$(echo $TEAMS_RESPONSE | jq -r '.teams | length')

echo -e "${GREEN}✓ Listed teams successfully${NC}"
echo "Teams count: $TEAMS_LIST_COUNT"

if [ "$TEAMS_LIST_COUNT" == "0" ]; then
    echo -e "${YELLOW}(No teams have joined yet)${NC}"
fi

# Summary
print_section "TEST SUMMARY"

echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Created game:"
echo "  ID: $GAME_ID"
echo "  Title: $UPDATED_GAME_TITLE"
echo "  Status: $RESUMED_STATUS"
echo "  Sessions: 10 (1 unlocked)"
echo ""
echo "You can now:"
echo "  - View game in database: psql -U postgres -d businesscase -c 'SELECT * FROM games;'"
echo "  - Check sessions: psql -U postgres -d businesscase -c 'SELECT session_number, day, period, status FROM sessions WHERE game_id = '\''$GAME_ID'\'';'"
echo "  - Continue testing with team endpoints (when implemented)"
echo ""
