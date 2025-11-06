# Game Management API Testing Guide

Complete guide for testing all Game Master endpoints in the BusinessCaise backend.

## Prerequisites

1. ✅ PostgreSQL running with database created
2. ✅ Migrations applied (`001_initial_schema.sql`)
3. ✅ Backend server running (`npm run dev`)
4. ✅ Game Master account registered (see AUTH_API_TESTING.md)

## Base URL

```
http://localhost:3001
```

## Authentication

All GM endpoints require authentication. Get your token by logging in:

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gm@test.com","password":"test123"}' \
  | jq -r '.token')

echo $TOKEN
```

Use this token in all subsequent requests:
```bash
Authorization: Bearer $TOKEN
```

---

## 1. Game Management

### Create a New Game

Creates a game with auto-generated 10 sessions (Monday-Friday, AM/PM).

**Endpoint:** `POST /api/gm/games`

**Request:**
```bash
curl -X POST http://localhost:3001/api/gm/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fall 2024 Business Simulation",
    "description": "5-day intensive business strategy game for MBA students",
    "settings": {
      "max_teams": 10,
      "difficulty": "intermediate",
      "auto_unlock_sessions": false
    }
  }' | jq
```

**Success Response (201):**
```json
{
  "message": "Game created successfully",
  "game": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Fall 2024 Business Simulation",
    "description": "5-day intensive business strategy game...",
    "game_master_id": "...",
    "start_date": null,
    "end_date": null,
    "current_session_id": null,
    "status": "setup",
    "settings": {...},
    "created_at": "2024-11-06T10:00:00.000Z",
    "updated_at": "2024-11-06T10:00:00.000Z"
  },
  "sessions": [
    {
      "id": "...",
      "game_id": "550e8400-e29b-41d4-a716-446655440000",
      "session_number": 1,
      "day": "Monday",
      "period": "am",
      "title": "Monday am - Session 1",
      "description": "Business challenge for Monday am",
      "status": "locked",
      ...
    },
    // ... 9 more sessions
  ]
}
```

**Save the Game ID:**
```bash
GAME_ID="<game_id_from_response>"
```

---

### List All Games

Get all games created by the current Game Master.

**Endpoint:** `GET /api/gm/games`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gm/games \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "games": [
    {
      "id": "...",
      "title": "Fall 2024 Business Simulation",
      "status": "setup",
      "created_at": "...",
      ...
    },
    ...
  ]
}
```

---

### Get Game Details

Get comprehensive details about a specific game including teams and sessions.

**Endpoint:** `GET /api/gm/games/:id`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gm/games/$GAME_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "game": {
    "id": "...",
    "title": "Fall 2024 Business Simulation",
    "status": "setup",
    ...
  },
  "teams": [
    // Array of teams (empty initially)
  ],
  "sessions": [
    // Array of 10 sessions
  ]
}
```

---

### Update Game

Update game title, description, or settings.

**Endpoint:** `PUT /api/gm/games/:id`

**Request:**
```bash
curl -X PUT http://localhost:3001/api/gm/games/$GAME_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fall 2024 - Updated Title",
    "description": "Updated description",
    "settings": {
      "max_teams": 12,
      "difficulty": "advanced"
    }
  }' | jq
```

**Success Response (200):**
```json
{
  "message": "Game updated successfully",
  "game": {
    "id": "...",
    "title": "Fall 2024 - Updated Title",
    ...
  }
}
```

---

### Delete Game

Delete a game and all associated data (cascades to sessions, teams, submissions).

**Endpoint:** `DELETE /api/gm/games/:id`

**Request:**
```bash
curl -X DELETE http://localhost:3001/api/gm/games/$GAME_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "message": "Game deleted successfully"
}
```

---

## 2. Game Status Control

### Start Game

Change game status from `setup` to `active`. This signals that the game is live.

**Endpoint:** `POST /api/gm/games/:id/start`

**Request:**
```bash
curl -X POST http://localhost:3001/api/gm/games/$GAME_ID/start \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "message": "Game started successfully",
  "game": {
    "id": "...",
    "status": "active",
    ...
  }
}
```

**WebSocket Event Emitted:**
```javascript
// Event: 'game:status_changed'
// Room: `game:${gameId}`
{
  "status": "active",
  "game": {...},
  "timestamp": "2024-11-06T10:00:00.000Z"
}
```

---

### Pause Game

Temporarily pause an active game.

**Endpoint:** `POST /api/gm/games/:id/pause`

**Request:**
```bash
curl -X POST http://localhost:3001/api/gm/games/$GAME_ID/pause \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "message": "Game paused successfully",
  "game": {
    "id": "...",
    "status": "paused",
    ...
  }
}
```

---

### Resume Game

Resume a paused game.

**Endpoint:** `POST /api/gm/games/:id/resume`

**Request:**
```bash
curl -X POST http://localhost:3001/api/gm/games/$GAME_ID/resume \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "message": "Game resumed successfully",
  "game": {
    "id": "...",
    "status": "active",
    ...
  }
}
```

---

## 3. Session Management

### List All Sessions

Get all 10 sessions for a game.

**Endpoint:** `GET /api/gm/games/:id/sessions`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gm/games/$GAME_ID/sessions \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "sessions": [
    {
      "id": "...",
      "game_id": "...",
      "session_number": 1,
      "day": "Monday",
      "period": "am",
      "title": "Monday am - Session 1",
      "description": "Business challenge for Monday am",
      "status": "locked",
      "narrative": null,
      "start_time": null,
      "deadline": null,
      "unlocked_at": null,
      "created_at": "...",
      "updated_at": "..."
    },
    // ... sessions 2-10
  ]
}
```

**Save a Session ID:**
```bash
SESSION_ID="<session_id_from_first_session>"
```

---

### Unlock a Session

Unlock a session, making it available for teams to work on.

**Endpoint:** `POST /api/gm/games/:gameId/sessions/:sessionId/unlock`

**Request:**
```bash
curl -X POST http://localhost:3001/api/gm/games/$GAME_ID/sessions/$SESSION_ID/unlock \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "message": "Session unlocked successfully",
  "session": {
    "id": "...",
    "status": "active",
    "unlocked_at": "2024-11-06T10:00:00.000Z",
    ...
  }
}
```

**WebSocket Event Emitted:**
```javascript
// Event: 'session:unlocked'
// Room: `game:${gameId}`
{
  "session": {...},
  "timestamp": "2024-11-06T10:00:00.000Z"
}
```

**Side Effects:**
- Session status changes from `locked` to `active`
- `unlocked_at` timestamp is set
- Game's `current_session_id` is updated to this session
- All teams in the game are notified via WebSocket

---

### Update Session

Update session details like title, description, or deadline.

**Endpoint:** `PUT /api/gm/games/:gameId/sessions/:sessionId`

**Request:**
```bash
curl -X PUT http://localhost:3001/api/gm/games/$GAME_ID/sessions/$SESSION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Crisis Management Challenge",
    "description": "Your company faces an unexpected PR crisis. Make critical decisions in the next 4 hours.",
    "deadline": "2024-11-06T14:00:00.000Z"
  }' | jq
```

**Success Response (200):**
```json
{
  "message": "Session updated successfully",
  "session": {
    "id": "...",
    "title": "Crisis Management Challenge",
    "description": "Your company faces an unexpected PR crisis...",
    "deadline": "2024-11-06T14:00:00.000Z",
    ...
  }
}
```

---

## 4. Team Monitoring

### List All Teams

Get all teams participating in a game.

**Endpoint:** `GET /api/gm/games/:id/teams`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gm/games/$GAME_ID/teams \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "teams": [
    {
      "id": "...",
      "game_id": "...",
      "name": "Team Alpha",
      "color": "#FF5733",
      "members": [...],
      "metrics": {
        "financial": 50,
        "hr": 50,
        "market_communication": 50,
        "operations": 50,
        "customer_satisfaction": 50
      },
      "overall_score": 50.00,
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ]
}
```

---

### Get Team Details

Get detailed information about a specific team.

**Endpoint:** `GET /api/gm/games/:gameId/teams/:teamId`

**Request:**
```bash
TEAM_ID="<team_id>"

curl -X GET http://localhost:3001/api/gm/games/$GAME_ID/teams/$TEAM_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "team": {
    "id": "...",
    "name": "Team Alpha",
    "metrics": {...},
    "overall_score": 65.50,
    ...
  }
}
```

---

### Get Team Metrics History

View historical changes in a team's metrics over time.

**Endpoint:** `GET /api/gm/games/:gameId/teams/:teamId/history`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gm/games/$GAME_ID/teams/$TEAM_ID/history \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "history": [
    {
      "id": "...",
      "team_id": "...",
      "session_id": "...",
      "metrics_before": {
        "financial": 50,
        "hr": 50,
        ...
      },
      "metrics_after": {
        "financial": 55,
        "hr": 52,
        ...
      },
      "impacts_applied": [...],
      "recorded_at": "2024-11-06T10:00:00.000Z"
    },
    ...
  ]
}
```

---

## 5. Analytics & Leaderboard

### Get Leaderboard

Get sorted leaderboard of all teams by overall score.

**Endpoint:** `GET /api/gm/games/:id/leaderboard`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gm/games/$GAME_ID/leaderboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "team_id": "...",
      "team_name": "Team Alpha",
      "overall_score": 75.50,
      "metrics": {
        "financial": 80,
        "hr": 72,
        ...
      }
    },
    {
      "rank": 2,
      "team_id": "...",
      "team_name": "Team Bravo",
      "overall_score": 68.30,
      ...
    },
    ...
  ]
}
```

---

### Get Game Analytics

Get comprehensive analytics for a game.

**Endpoint:** `GET /api/gm/games/:id/analytics`

**Request:**
```bash
curl -X GET http://localhost:3001/api/gm/games/$GAME_ID/analytics \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Success Response (200):**
```json
{
  "game": {
    "id": "...",
    "title": "Fall 2024 Business Simulation",
    "status": "active",
    ...
  },
  "analytics": {
    "total_teams": 8,
    "completed_sessions": 3,
    "active_sessions": 1,
    "average_metrics": {
      "financial": 62.5,
      "hr": 58.3,
      "market_communication": 65.7,
      "operations": 60.2,
      "customer_satisfaction": 70.1
    }
  }
}
```

---

## 6. Complete Testing Workflow

### Full Game Setup and Execution

```bash
# 1. Login as Game Master
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gm@test.com","password":"test123"}' \
  | jq -r '.token')

# 2. Create a game
GAME_RESPONSE=$(curl -s -X POST http://localhost:3001/api/gm/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Game 2024",
    "description": "Test game for API validation"
  }')

GAME_ID=$(echo $GAME_RESPONSE | jq -r '.game.id')
echo "Game ID: $GAME_ID"

# 3. Verify 10 sessions were created
SESSIONS=$(curl -s -X GET http://localhost:3001/api/gm/games/$GAME_ID/sessions \
  -H "Authorization: Bearer $TOKEN")

echo "Session count: $(echo $SESSIONS | jq '.sessions | length')"

# 4. Get first session ID
SESSION_ID=$(echo $SESSIONS | jq -r '.sessions[0].id')
echo "Session ID: $SESSION_ID"

# 5. Start the game
curl -s -X POST http://localhost:3001/api/gm/games/$GAME_ID/start \
  -H "Authorization: Bearer $TOKEN" | jq

# 6. Unlock first session
curl -s -X POST http://localhost:3001/api/gm/games/$GAME_ID/sessions/$SESSION_ID/unlock \
  -H "Authorization: Bearer $TOKEN" | jq

# 7. Get game details with teams and sessions
curl -s -X GET http://localhost:3001/api/gm/games/$GAME_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 8. Get leaderboard (will be empty until teams join)
curl -s -X GET http://localhost:3001/api/gm/games/$GAME_ID/leaderboard \
  -H "Authorization: Bearer $TOKEN" | jq

# 9. Get analytics
curl -s -X GET http://localhost:3001/api/gm/games/$GAME_ID/analytics \
  -H "Authorization: Bearer $TOKEN" | jq

# 10. Pause game
curl -s -X POST http://localhost:3001/api/gm/games/$GAME_ID/pause \
  -H "Authorization: Bearer $TOKEN" | jq

# 11. Resume game
curl -s -X POST http://localhost:3001/api/gm/games/$GAME_ID/resume \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 7. Testing with Postman

### Environment Setup

Create a Postman environment with:
- `baseUrl`: `http://localhost:3001`
- `token`: (will be set automatically)
- `gameId`: (will be set automatically)
- `sessionId`: (will be set automatically)

### Pre-request Script (for login)

```javascript
pm.sendRequest({
    url: pm.environment.get('baseUrl') + '/api/auth/login',
    method: 'POST',
    header: 'Content-Type: application/json',
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: 'gm@test.com',
            password: 'test123'
        })
    }
}, function (err, res) {
    if (!err && res.json().token) {
        pm.environment.set('token', res.json().token);
    }
});
```

### Test Scripts (for responses)

**For Create Game:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set('gameId', jsonData.game.id);
    pm.environment.set('sessionId', jsonData.sessions[0].id);
    console.log('Game ID:', jsonData.game.id);
    console.log('First Session ID:', jsonData.sessions[0].id);
}
```

---

## 8. WebSocket Testing

### Connect to WebSocket Server

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001', {
  transports: ['websocket']
});

// Join game room as GM
socket.emit('join:gm', 'GAME_ID_HERE');

// Listen for events
socket.on('game:status_changed', (data) => {
  console.log('Game status changed:', data);
});

socket.on('session:unlocked', (data) => {
  console.log('Session unlocked:', data);
});

socket.on('submission:received', (data) => {
  console.log('Submission received:', data);
});

socket.on('leaderboard:updated', (data) => {
  console.log('Leaderboard updated:', data);
});
```

---

## 9. Error Handling

### Common Error Responses

**401 Unauthorized - No Token:**
```json
{
  "error": "No token provided"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

**403 Forbidden - Not Game Master:**
```json
{
  "error": "Game Master access required"
}
```

**403 Forbidden - Not Owner:**
```json
{
  "error": "Not authorized to access this game"
}
```

**404 Not Found:**
```json
{
  "error": "Game not found"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "errors": [
    {
      "msg": "Title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

---

## 10. Database Verification

After testing, verify database state:

```sql
-- Connect to database
psql -U postgres -d businesscaise

-- Check games
SELECT id, title, status, game_master_id, created_at FROM games;

-- Check sessions for a game
SELECT id, session_number, day, period, title, status, unlocked_at
FROM sessions
WHERE game_id = 'YOUR_GAME_ID'
ORDER BY session_number;

-- Check teams
SELECT id, game_id, name, overall_score FROM teams;

-- Check game with session count
SELECT g.id, g.title, g.status, COUNT(s.id) as session_count
FROM games g
LEFT JOIN sessions s ON g.id = s.game_id
GROUP BY g.id;
```

---

## 11. Performance Testing

### Load Testing with Apache Bench

```bash
# Test game list endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/gm/games

# Test game details endpoint
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/gm/games/$GAME_ID
```

---

## 12. Next Steps

After verifying game management:

1. **Implement Team Controller** (`team.controller.ts`)
2. **Test Team Join Flow** (players joining games)
3. **Test Submission System** (requires Submission model refactoring)
4. **Build Game Master Dashboard** (React frontend)
5. **Integrate WebSocket** in frontend for real-time updates

---

## Resources

- [Authentication API Testing](./AUTH_API_TESTING.md)
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Implementation Notes](./IMPLEMENTATION_NOTES.md)
- [Backend Architecture](../ARCHITECTURE.md)

---

**Last Updated:** 2025-11-06
