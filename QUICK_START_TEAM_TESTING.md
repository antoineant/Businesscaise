# Quick Start: Test Team Frontend Integration

## 🚀 One-Command Setup

### Start All Services

```bash
# Terminal 1: Start Backend API
cd backend
npm start

# Terminal 2: Start GM Dashboard
cd gm-dashboard
npm run dev

# Terminal 3: Start Team Frontend
npm run dev
```

## ✅ Quick Test (5 Minutes)

### 1. Disable Demo Mode
```bash
# Open team frontend and disable demo mode
open http://localhost:5173/?demo=false
```

### 2. Create Game as GM
1. Open GM Dashboard: http://localhost:3002
2. Register: `gm@test.com` / `password123`
3. Create game: "Test Game"
4. Start the game
5. Unlock Session 1
6. **Copy game ID** from URL

### 3. Join as Player
1. Open Team Frontend: http://localhost:5173/?demo=false
2. Register: `player@test.com` / `password123` (role: player)
3. Enter the game ID you copied
4. Create team: "The Innovators"
5. **Success!** You should see the team dashboard

### 4. Test Submission Flow
1. Click "Current Challenge" tab
2. Enter a decision
3. Click "Submit Decision"
4. Switch to GM Dashboard
5. Score the submission (score: 85)
6. Switch back to Team Frontend
7. **Check**: Metrics should update automatically!

## 🔍 Verify Everything Works

Run this checklist:

- [ ] Player registration works
- [ ] Player can join game with game ID
- [ ] Dashboard loads with metrics
- [ ] Can submit decisions
- [ ] GM can score submissions
- [ ] Metrics update in real-time (WebSocket)
- [ ] Leaderboard shows rankings
- [ ] Multiple sessions work

## 🐛 Troubleshooting

### "Network Error" or CORS issues
```bash
# Check backend CORS settings in backend/src/server.ts
# Should allow http://localhost:5173
```

### "Demo mode still active"
```bash
# Clear localStorage
localStorage.clear()

# Or use URL parameter
http://localhost:5173/?demo=false
```

### "Team not found"
```bash
# Check team was created in database
psql -d businesscaise -c "SELECT * FROM teams;"

# Clear stale localStorage
localStorage.removeItem('team_<gameId>')
```

### WebSocket not connecting
```bash
# Check backend WebSocket server
# Look for "Socket.IO server listening" in backend logs
```

## 📊 Test with Multiple Teams

```bash
# Open multiple browsers/incognito windows
# Register different players
# Join same game
# Create different teams
# Test leaderboard rankings
```

## 🎯 Next Steps

Once manual testing passes:

1. Run detailed test plan: `TEST_TEAM_FRONTEND.md`
2. Add E2E tests with Playwright
3. Test WebSocket real-time updates thoroughly
4. Load test with multiple concurrent teams
5. Document player user guide

## 📝 Report Issues

Found a bug? Document:
- What you did
- What you expected
- What actually happened
- Browser console errors
- Network tab errors

Good luck! 🚀
