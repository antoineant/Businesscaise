# Team Frontend Integration Test Plan

## Prerequisites
- Backend running on `http://localhost:3001`
- GM Dashboard running on `http://localhost:3002`
- Team Frontend running on `http://localhost:5173`
- PostgreSQL database running
- Demo mode **DISABLED** (set `VITE_DEMO_MODE=false` or remove from .env)

## Test Scenarios

### Scenario 1: Player Registration and Join Game

#### Step 1.1: Create Game as GM
1. Open GM Dashboard: `http://localhost:3002`
2. Register new GM account:
   - Name: Test GM
   - Email: gm@test.com
   - Password: password123
3. Create new game:
   - Title: "Integration Test Game"
   - Description: "Testing team frontend integration"
4. **Copy the game ID** from the URL (e.g., `abc-123-def-456`)

#### Step 1.2: Start Game as GM
1. Click on the game
2. Click "Start Game" button
3. Verify game status changes to "active"
4. Unlock first session (click "Unlock" on Session 1)

#### Step 1.3: Register as Player
1. Open Team Frontend: `http://localhost:5173`
2. Click "Register"
3. Fill in player details:
   - Name: Test Player
   - Email: player@test.com
   - Password: password123
   - Role: player
4. Login with player credentials
5. Should see "Ready to Play?" page

#### Step 1.4: Join Game as Player
1. Enter the game ID from Step 1.1
2. Click "Join Game"
3. Fill in team details:
   - Team Name: "The Innovators"
   - Color: Blue
   - Members: ["Alice", "Bob", "Charlie"]
4. Click "Join Game"
5. **Expected**: Should see team dashboard

---

### Scenario 2: Player Dashboard

#### Step 2.1: Verify Dashboard Loads
1. Check that dashboard shows:
   - Game title
   - Team name
   - Overall score (initially 0.0)
   - Three tabs: Dashboard, Current Challenge, Leaderboard

#### Step 2.2: Check Metrics Display
1. Click "Dashboard" tab
2. Verify company performance metrics display
3. Check department metrics:
   - Marketing
   - Sales
   - Research
   - Finance
   - HR

#### Step 2.3: Verify Current Session Info
1. Should see "Current Session" card
2. Should show: "Monday AM - Session 1"
3. Should have "View Challenge" button (since session is unlocked)

---

### Scenario 3: Submit Decision

#### Step 3.1: Navigate to Challenge
1. Click "Current Challenge" tab
2. Should see submission form with:
   - Session title and description
   - Text input area
   - File upload option
   - Submit button

#### Step 3.2: Submit a Decision
1. Enter decision text: "We propose to increase marketing budget by 20% to improve brand awareness."
2. Click "Submit Decision"
3. **Expected**: Success message
4. Return to dashboard
5. **Expected**: See submission in "Recent Submissions" section

---

### Scenario 4: Score Submission (GM Side)

#### Step 4.1: View Submission as GM
1. Switch to GM Dashboard
2. Go to game details
3. Navigate to "Submissions" or "Teams" section
4. Find the submission from "The Innovators"

#### Step 4.2: Score the Submission
1. Open submission details
2. Enter score: 85
3. Enter feedback: "Good proposal. Consider market research data."
4. Click "Score Submission"

#### Step 4.3: Verify Player Sees Update (Real-time)
1. Switch back to Team Frontend (player view)
2. **Expected**: Metrics should update automatically (WebSocket)
3. **Expected**: Submission status changes from "Pending" to "Scored: 85/100"
4. **Expected**: Overall score updates

---

### Scenario 5: Leaderboard

#### Step 5.1: Create Second Team
1. Open new incognito window
2. Register another player: player2@test.com
3. Join same game with team name "Team Challengers"
4. Submit a decision for Session 1

#### Step 5.2: Score Second Team
1. As GM, score the second team's submission: 75

#### Step 5.3: Verify Leaderboard Updates
1. As first player, click "Leaderboard" tab
2. **Expected**: See both teams ranked by score
3. **Expected**: "The Innovators" (85) should be rank #1
4. **Expected**: "Team Challengers" (75) should be rank #2
5. **Expected**: Current team should be highlighted

---

### Scenario 6: Session Progression

#### Step 6.1: Unlock Next Session
1. As GM, unlock Session 2 (Monday PM)
2. **Expected**: Player should see real-time notification (WebSocket)

#### Step 6.2: Verify Session Change
1. As player, check dashboard
2. **Expected**: Current session shows "Monday PM - Session 2"
3. Click "Current Challenge" tab
4. **Expected**: New challenge form for Session 2

---

### Scenario 7: Multi-Session Flow

#### Step 7.1: Complete Multiple Sessions
1. For Sessions 2-5:
   - Player submits decision
   - GM scores submission
   - Verify metrics update
   - Verify leaderboard updates
   - GM unlocks next session

#### Step 7.2: Verify Metrics History
1. As player, go to Dashboard
2. **Expected**: Metrics should reflect accumulated scores
3. Check metrics history (if displayed)

---

## API Endpoints Test Checklist

### Authentication
- [ ] POST /api/auth/register (player role)
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me

### Team Operations
- [ ] POST /api/teams/join
- [ ] GET /api/teams/current/:teamId
- [ ] GET /api/teams/:teamId/dashboard
- [ ] GET /api/teams/:teamId/sessions/current
- [ ] GET /api/teams/:teamId/leaderboard
- [ ] GET /api/teams/:teamId/history
- [ ] POST /api/teams/:teamId/submit

### WebSocket Events
- [ ] session:unlocked
- [ ] submission:scored
- [ ] metrics:updated
- [ ] leaderboard:updated

---

## Common Issues to Check

### Issue 1: CORS Errors
**Symptom**: Network errors, CORS policy blocks
**Fix**: Ensure backend has CORS enabled for `http://localhost:5173`

### Issue 2: WebSocket Connection Fails
**Symptom**: Real-time updates don't work
**Check**:
- Backend WebSocket server running
- Socket.IO client version matches server
- Firewall not blocking WebSocket

### Issue 3: Demo Mode Still Active
**Symptom**: Using mock data instead of real API
**Fix**:
- Check `VITE_DEMO_MODE` environment variable
- Clear localStorage: `localStorage.clear()`
- Hard refresh browser (Ctrl+Shift+R)

### Issue 4: Team Not Found
**Symptom**: "Failed to load game data"
**Check**:
- Team was successfully created (check database)
- teamId stored in localStorage
- Game ID is correct

### Issue 5: Session Not Available
**Symptom**: "No active session"
**Check**:
- Game status is "active"
- At least one session is unlocked
- Session status is "active" (not "locked" or "completed")

---

## Success Criteria

✅ Player can register and login
✅ Player can join game with game ID
✅ Player sees dashboard with metrics
✅ Player can view current unlocked session
✅ Player can submit decisions
✅ GM can score submissions
✅ Player sees real-time updates (WebSocket)
✅ Leaderboard updates correctly
✅ Multiple sessions can be completed
✅ Metrics accumulate correctly across sessions

---

## Next Steps After Manual Testing

1. **Add E2E Tests** - Automate this flow with Playwright
2. **Load Testing** - Test with multiple teams simultaneously
3. **Error Handling** - Test edge cases and error scenarios
4. **Documentation** - Create player user guide
5. **Polish UI** - Improve loading states, animations, notifications

---

## Notes
- Take screenshots of each step for documentation
- Record any bugs or issues in GitHub Issues
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile devices
