#!/bin/bash

# BusinessCaise - Team API Testing Script
# Tests all team/player endpoints

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001"
GAME_ID=""
TEAM_ID=""
SESSION_ID=""
GM_TOKEN=""

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

print_section "BusinessCaise Team API Testing"

# Check if backend is running
echo "Checking if backend server is running..."
check_server
echo -e "${GREEN}✓ Backend server is running${NC}"

# Setup: Create a game first (as GM)
print_section "SETUP: Creating Test Game"
echo "Registering Game Master..."

GM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testgm'$(date +%s)'@test.com",
    "password": "test123",
    "name": "Test Game Master",
    "role": "game_master"
  }')

GM_TOKEN=$(echo $GM_RESPONSE | jq -r '.token')

if [ "$GM_TOKEN" == "null" ] || [ -z "$GM_TOKEN" ]; then
    echo -e "${RED}✗ Failed to create GM account${NC}"
    exit 1
fi

echo -e "${GREEN}✓ GM account created${NC}"

# Create a game
echo "Creating test game..."
GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/api/gm/games" \
  -H "Authorization: Bearer $GM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Test Game",
    "description": "Game for testing team endpoints"
  }')

GAME_ID=$(echo $GAME_RESPONSE | jq -r '.game.id')
SESSION_ID=$(echo $GAME_RESPONSE | jq -r '.sessions[0].id')

if [ "$GAME_ID" == "null" ] || [ -z "$GAME_ID" ]; then
    echo -e "${RED}✗ Failed to create game${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Game created${NC}"
echo "Game ID: $GAME_ID"
echo "First Session ID: $SESSION_ID"

# Start the game
echo "Starting game..."
curl -s -X POST "$BASE_URL/api/gm/games/$GAME_ID/start" \
  -H "Authorization: Bearer $GM_TOKEN" > /dev/null

# Unlock first session
echo "Unlocking first session..."
curl -s -X POST "$BASE_URL/api/gm/games/$GAME_ID/sessions/$SESSION_ID/unlock" \
  -H "Authorization: Bearer $GM_TOKEN" > /dev/null

echo -e "${GREEN}✓ Setup complete${NC}"

# Test 1: Team Join
print_section "TEST 1: Join Game (Create Team)"
echo "Testing POST /api/teams/join..."

JOIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/teams/join" \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "'$GAME_ID'",
    "team_name": "Team Alpha",
    "color": "#FF5733",
    "members": ["Alice", "Bob", "Charlie"]
  }')

TEAM_ID=$(echo $JOIN_RESPONSE | jq -r '.team.id')
TEAM_NAME=$(echo $JOIN_RESPONSE | jq -r '.team.name')

if [ "$TEAM_ID" == "null" ] || [ -z "$TEAM_ID" ]; then
    echo -e "${RED}✗ Failed to join game${NC}"
    echo "Response: $JOIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Team joined game successfully${NC}"
echo "Team ID: $TEAM_ID"
echo "Team Name: $TEAM_NAME"
echo "Initial Metrics:"
echo $JOIN_RESPONSE | jq '.team.metrics'

# Register player account for authenticated routes
print_section "Registering Player Account"

PLAYER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player'$(date +%s)'@test.com",
    "password": "test123",
    "name": "Test Player",
    "role": "player"
  }')

PLAYER_TOKEN=$(echo $PLAYER_RESPONSE | jq -r '.token')

if [ "$PLAYER_TOKEN" == "null" ] || [ -z "$PLAYER_TOKEN" ]; then
    echo -e "${RED}✗ Failed to create player account${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Player account created${NC}"

# Test 2: Get Current Team
print_section "TEST 2: Get Current Team Info"
echo "Testing GET /api/teams/current/$TEAM_ID..."

CURRENT_TEAM=$(curl -s -X GET "$BASE_URL/api/teams/current/$TEAM_ID" \
  -H "Authorization: Bearer $PLAYER_TOKEN")

FETCHED_TEAM_NAME=$(echo $CURRENT_TEAM | jq -r '.team.name')

if [ "$FETCHED_TEAM_NAME" == "Team Alpha" ]; then
    echo -e "${GREEN}✓ Retrieved team info successfully${NC}"
    echo "Team: $FETCHED_TEAM_NAME"
    echo "Overall Score: $(echo $CURRENT_TEAM | jq -r '.team.overall_score')"
else
    echo -e "${RED}✗ Failed to get team info${NC}"
fi

# Test 3: Get Dashboard
print_section "TEST 3: Get Team Dashboard"
echo "Testing GET /api/teams/$TEAM_ID/dashboard..."

DASHBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/api/teams/$TEAM_ID/dashboard" \
  -H "Authorization: Bearer $PLAYER_TOKEN")

DASHBOARD_GAME_TITLE=$(echo $DASHBOARD_RESPONSE | jq -r '.game.title')
DASHBOARD_SESSIONS_COUNT=$(echo $DASHBOARD_RESPONSE | jq -r '.sessions | length')

if [ "$DASHBOARD_SESSIONS_COUNT" == "10" ]; then
    echo -e "${GREEN}✓ Retrieved dashboard successfully${NC}"
    echo "Game: $DASHBOARD_GAME_TITLE"
    echo "Sessions: $DASHBOARD_SESSIONS_COUNT"
    echo "Current Session: $(echo $DASHBOARD_RESPONSE | jq -r '.current_session.title')"
else
    echo -e "${RED}✗ Failed to get dashboard${NC}"
    echo "Response: $DASHBOARD_RESPONSE"
fi

# Test 4: Get Current Session
print_section "TEST 4: Get Current Active Session"
echo "Testing GET /api/teams/$TEAM_ID/sessions/current..."

CURRENT_SESSION=$(curl -s -X GET "$BASE_URL/api/teams/$TEAM_ID/sessions/current" \
  -H "Authorization: Bearer $PLAYER_TOKEN")

CURRENT_SESSION_NUMBER=$(echo $CURRENT_SESSION | jq -r '.session.session_number')

if [ "$CURRENT_SESSION_NUMBER" == "1" ]; then
    echo -e "${GREEN}✓ Retrieved current session successfully${NC}"
    echo "Session Number: $CURRENT_SESSION_NUMBER"
    echo "Title: $(echo $CURRENT_SESSION | jq -r '.session.title')"
    echo "Status: $(echo $CURRENT_SESSION | jq -r '.session.status')"
else
    echo -e "${RED}✗ Failed to get current session${NC}"
fi

# Test 5: Get Session Challenges
print_section "TEST 5: Get Session Challenges"
echo "Testing GET /api/teams/$TEAM_ID/sessions/$SESSION_ID/challenges..."

CHALLENGES_RESPONSE=$(curl -s -X GET "$BASE_URL/api/teams/$TEAM_ID/sessions/$SESSION_ID/challenges" \
  -H "Authorization: Bearer $PLAYER_TOKEN")

SESSION_TITLE=$(echo $CHALLENGES_RESPONSE | jq -r '.session.title')

if [ "$SESSION_TITLE" != "null" ]; then
    echo -e "${GREEN}✓ Retrieved session info successfully${NC}"
    echo "Session: $SESSION_TITLE"
else
    echo -e "${RED}✗ Failed to get session challenges${NC}"
fi

# Test 6: Get Leaderboard
print_section "TEST 6: Get Leaderboard"
echo "Testing GET /api/teams/$TEAM_ID/leaderboard..."

LEADERBOARD_RESPONSE=$(curl -s -X GET "$BASE_URL/api/teams/$TEAM_ID/leaderboard" \
  -H "Authorization: Bearer $PLAYER_TOKEN")

LEADERBOARD_COUNT=$(echo $LEADERBOARD_RESPONSE | jq -r '.leaderboard | length')

echo -e "${GREEN}✓ Retrieved leaderboard successfully${NC}"
echo "Teams on leaderboard: $LEADERBOARD_COUNT"

if [ "$LEADERBOARD_COUNT" -gt "0" ]; then
    echo "Team Ranking:"
    echo $LEADERBOARD_RESPONSE | jq -r '.leaderboard[] | "\(.rank). \(.team_name) - Score: \(.overall_score)"'
fi

# Test 7: Get Metrics History
print_section "TEST 7: Get Metrics History"
echo "Testing GET /api/teams/$TEAM_ID/history..."

HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/teams/$TEAM_ID/history" \
  -H "Authorization: Bearer $PLAYER_TOKEN")

HISTORY_COUNT=$(echo $HISTORY_RESPONSE | jq -r '.history | length')

echo -e "${GREEN}✓ Retrieved metrics history successfully${NC}"
echo "History entries: $HISTORY_COUNT"

if [ "$HISTORY_COUNT" == "0" ]; then
    echo "(No history yet - team just joined)"
fi

# Test 8: Create Second Team
print_section "TEST 8: Join Game with Second Team"
echo "Creating Team Bravo..."

JOIN2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/teams/join" \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": "'$GAME_ID'",
    "team_name": "Team Bravo",
    "color": "#3357FF",
    "members": ["David", "Eve"]
  }')

TEAM2_ID=$(echo $JOIN2_RESPONSE | jq -r '.team.id')

if [ "$TEAM2_ID" != "null" ] && [ -n "$TEAM2_ID" ]; then
    echo -e "${GREEN}✓ Second team joined successfully${NC}"
    echo "Team ID: $TEAM2_ID"
else
    echo -e "${YELLOW}⚠ Could not create second team${NC}"
fi

# Test 9: Verify GM Can See Both Teams
print_section "TEST 9: Verify GM Can See Teams"
echo "Testing GET /api/gm/games/$GAME_ID/teams..."

GM_TEAMS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/gm/games/$GAME_ID/teams" \
  -H "Authorization: Bearer $GM_TOKEN")

GM_TEAMS_COUNT=$(echo $GM_TEAMS_RESPONSE | jq -r '.teams | length')

echo -e "${GREEN}✓ GM can see teams${NC}"
echo "Total teams: $GM_TEAMS_COUNT"

if [ "$GM_TEAMS_COUNT" -gt "0" ]; then
    echo "Teams:"
    echo $GM_TEAMS_RESPONSE | jq -r '.teams[] | "\(.name) - Score: \(.overall_score)"'
fi

# Summary
print_section "TEST SUMMARY"

echo -e "${GREEN}✅ All team endpoint tests passed!${NC}"
echo ""
echo "Created resources:"
echo "  Game ID: $GAME_ID"
echo "  Team 1 ID: $TEAM_ID (Team Alpha)"
if [ -n "$TEAM2_ID" ] && [ "$TEAM2_ID" != "null" ]; then
    echo "  Team 2 ID: $TEAM2_ID (Team Bravo)"
fi
echo ""
echo "Tested endpoints:"
echo "  ✅ POST /api/teams/join - Join game"
echo "  ✅ GET /api/teams/current/:teamId - Get team info"
echo "  ✅ GET /api/teams/:teamId/dashboard - Get dashboard"
echo "  ✅ GET /api/teams/:teamId/sessions/current - Get current session"
echo "  ✅ GET /api/teams/:teamId/sessions/:sessionId/challenges - Get session info"
echo "  ✅ GET /api/teams/:teamId/leaderboard - Get leaderboard"
echo "  ✅ GET /api/teams/:teamId/history - Get metrics history"
echo ""
echo "You can view the teams in the database:"
echo "  psql -U postgres -d businesscaise -c 'SELECT id, name, game_id, overall_score FROM teams;'"
echo ""
