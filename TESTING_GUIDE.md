# BusinessCaise Integration Testing Guide

This guide provides step-by-step instructions for testing the complete BusinessCaise business simulation game platform.

## Prerequisites

Before testing, ensure you have:
- PostgreSQL 14+ running locally
- Node.js 18+ installed
- Backend and frontend dependencies installed (`npm install`)
- Backend `.env` file configured (see backend/.env.example)
- Frontend `.env` file configured (see .env.example)

## Environment Setup

### Backend (.env in backend/)
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/businesscaise
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env in root)
```
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_ENV=development
```

### Database Setup
```bash
# Navigate to backend directory
cd backend

# Run database migrations
psql -U your_user -d businesscaise -f src/db/migrations/initial_schema.sql
```

## Starting the Application

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
Expected output: "Server running on port 3001"

### Terminal 2: Frontend Dev Server
```bash
npm run dev
```
Expected output: "Local: http://localhost:5173/"

## Complete Integration Test Scenarios

### Test 1: Game Master Account Creation and Game Setup

**Steps:**
1. Navigate to http://localhost:5173/register
2. Fill in registration form:
   - Name: "Test Game Master"
   - Email: "gm@test.com"
   - Password: "password123"
   - Role: Select "Game Master"
3. Click "Create Account"

**Expected Results:**
- ✅ Redirected to /dashboard
- ✅ See "Create New Game" button
- ✅ No games listed initially

**Create a Game:**
4. Click "Create New Game"
5. Enter game details:
   - Title: "Business Simulation Week 1"
   - Description: "5-day intensive business game"
6. Click "Create"

**Expected Results:**
- ✅ Game created successfully
- ✅ Redirected to game details page
- ✅ 10 sessions visible (Monday-Friday AM/PM)
- ✅ All sessions show "Locked" status
- ✅ Game status is "Setup"

### Test 2: Game Master Dashboard Navigation

**Steps:**
1. Navigate through all tabs: Overview, Sessions, Teams, Submissions

**Expected Results:**
- ✅ Overview Tab: Shows game status, start/pause buttons
- ✅ Sessions Tab: Lists all 10 sessions with unlock buttons
- ✅ Teams Tab: "No teams have joined yet" message
- ✅ Submissions Tab: Filter buttons (All, Pending, Scored)

### Test 3: Starting the Game

**Steps:**
1. In Overview tab, click "Start Game"

**Expected Results:**
- ✅ Game status changes to "Active"
- ✅ Button changes to "Pause Game"
- ✅ Sessions remain locked but can now be unlocked

### Test 4: Player Account Creation and Team Join

**Open New Incognito/Private Window:**

**Steps:**
1. Navigate to http://localhost:5173/register
2. Register as Player 1:
   - Name: "Player One"
   - Email: "player1@test.com"
   - Password: "password123"
   - Role: Select "Player"
3. After login, enter game code (from GM's game URL, e.g., the UUID)
4. Join Team Modal appears:
   - Team Name: "Alpha Team"
   - Color: Select Blue (#3B82F6)
   - Add team members:
     - "Alice Johnson" (click +)
     - "Bob Smith" (click +)
5. Click "Join Game"

**Expected Results:**
- ✅ Team created successfully
- ✅ Dashboard shows initial metrics (all at 50)
- ✅ "No Active Challenge" message in Game tab
- ✅ Empty leaderboard

**Repeat for Player 2:**
6. Open another incognito window
7. Register "Player Two" (player2@test.com)
8. Join same game with team "Beta Team", Red color

**Verify in GM Dashboard:**
- ✅ Teams tab now shows 2 teams
- ✅ Each team displays name, color, and score (50.0)

### Test 5: Session Unlocking and WebSocket Updates

**In GM Dashboard:**

**Steps:**
1. Go to Sessions tab
2. Click "Unlock" on "Monday Morning - Session 1"

**Expected Results (GM Dashboard):**
- ✅ Session status changes to "Active"
- ✅ Unlock button becomes "Mark Complete" button

**Expected Results (Player Dashboards - Both Windows):**
- ✅ Real-time notification: "Session unlocked"
- ✅ Dashboard updates automatically
- ✅ "New Challenge Available" button appears
- ✅ Game tab shows active challenge

**Verify WebSocket Console Logs:**
- Open browser console in both player windows
- Should see: "Session unlocked: {session: ...}"

### Test 6: File Upload and Submission

**In Player 1 Window (Alpha Team):**

**Steps:**
1. Click "Game" tab
2. View active session: "Monday Morning - Session 1"
3. Enter submission data:
   ```json
   {
     "decision": "Increase marketing budget by 20%",
     "reasoning": "Market research shows high ROI potential",
     "budget_allocation": {
       "marketing": 120000,
       "operations": 80000
     }
   }
   ```
4. Upload files:
   - Click or drag-drop a PDF file
   - Add an Excel spreadsheet
5. Click "Upload 2 files" button
6. Wait for upload completion (green checkmarks)
7. Click "Submit Decision"

**Expected Results:**
- ✅ Files upload successfully with progress indicators
- ✅ Green checkmarks appear on uploaded files
- ✅ "Submit Decision" button becomes active
- ✅ Submission succeeds with success message
- ✅ Dashboard tab shows new submission in "Recent Submissions" (Pending status)

**In Player 2 Window (Beta Team):**
8. Submit a simpler decision (text only, no files):
   ```json
   {"decision": "Maintain current strategy", "reasoning": "Conservative approach"}
   ```

**Verify in GM Dashboard:**
- ✅ Submissions tab shows 2 pending submissions
- ✅ Alpha Team submission shows "2 file(s) attached"
- ✅ Both submissions show correct timestamps

### Test 7: Scoring Submissions

**In GM Dashboard (Submissions Tab):**

**Steps:**
1. Click "Pending" filter
2. Click "Score" button on Alpha Team's submission
3. Scoring modal opens:
   - Verify team name and color displayed
   - Verify submission data is visible
   - Verify 2 file links are shown
   - Click on file link to verify download
4. Enter score: 85
5. Enter feedback: "Excellent analysis and supporting documents. Strong strategic thinking demonstrated."
6. Click "Submit Score"

**Expected Results (GM Dashboard):**
- ✅ Modal closes
- ✅ Submission list refreshes
- ✅ Alpha Team submission now shows "Scored" badge
- ✅ Score displayed: 85/100
- ✅ Feedback visible in green box

**Expected Results (Player 1 - Alpha Team):**
- ✅ Real-time WebSocket update received
- ✅ Console shows: "Submission scored: {score: 85, ...}"
- ✅ Dashboard metrics update automatically
- ✅ Overall score increases from 50.0 to ~57.0 (varies based on metrics calculation)
- ✅ Recent submission shows "Score: 85/100"

**Expected Results (Player 2 - Beta Team):**
- ✅ Leaderboard updates in real-time
- ✅ Alpha Team moves above Beta Team in rankings
- ✅ Gold medal (🥇) appears next to Alpha Team

**Score Beta Team Submission:**
7. Score Beta Team's submission: 65 points
8. Feedback: "Good conservative approach but lacks innovation."

**Verify Real-time Leaderboard:**
- ✅ Both player windows show updated rankings immediately
- ✅ Scores reflect the weighted formula (Financial 40%, HR 30%, Market 30%)

### Test 8: Multiple Sessions and Continuous Play

**Steps:**
1. GM unlocks Monday PM session
2. Both teams submit new decisions
3. GM scores both submissions
4. Verify metrics history accumulates
5. Check leaderboard ranking changes

**Expected Results:**
- ✅ Metrics evolve over time based on decisions
- ✅ Leaderboard reflects cumulative performance
- ✅ Each session's impact is visible in metrics

### Test 9: Pause and Resume Game

**In GM Dashboard:**

**Steps:**
1. Click "Pause Game" button
2. Verify players see "Game Paused" status
3. Click "Resume Game"
4. Verify players see game is active again

**Expected Results:**
- ✅ Pause/Resume state synchronizes across all clients
- ✅ WebSocket events broadcast game state changes

### Test 10: Submission Filtering and Management

**In GM Dashboard (Submissions Tab):**

**Steps:**
1. Click "Scored" filter
2. Verify only scored submissions appear
3. Click "All" filter
4. Click "View/Edit" on a scored submission
5. Modify score from 85 to 90
6. Update feedback
7. Submit changes

**Expected Results:**
- ✅ Filters work correctly
- ✅ Can re-score submissions
- ✅ Updates propagate to players in real-time
- ✅ Metrics recalculate based on new scores

### Test 11: Complete Game Week Simulation

**Simulate Full 5-Day Game:**

1. Monday AM & PM - Complete with submissions and scoring
2. Tuesday AM & PM - Complete with submissions and scoring
3. Wednesday AM & PM - Complete with submissions and scoring
4. Thursday AM & PM - Complete with submissions and scoring
5. Friday AM & PM - Complete with submissions and scoring

**Verify:**
- ✅ 10 submissions per team (if all sessions completed)
- ✅ Metrics evolve realistically over time
- ✅ Final leaderboard determines winner
- ✅ Overall scores reflect complete week performance

## WebSocket Event Verification

Monitor browser console for these events:

**Player Events:**
- `session:unlocked` - When GM unlocks a session
- `submission:scored` - When GM scores a submission
- `metrics:updated` - When team metrics change
- `leaderboard:updated` - When leaderboard changes
- `game:status` - When game starts/pauses/resumes

**GM Events:**
- All player events (for monitoring)
- `team:joined` - When a team joins the game
- `submission:received` - When a team submits

## API Endpoint Testing Checklist

### Authentication Endpoints
- ✅ POST /api/auth/register (GM)
- ✅ POST /api/auth/register (Player)
- ✅ POST /api/auth/login
- ✅ GET /api/auth/me
- ✅ POST /api/auth/logout

### Game Master Endpoints
- ✅ POST /api/gm/games (Create game)
- ✅ GET /api/gm/games/:id (Get game details)
- ✅ POST /api/gm/games/:id/start
- ✅ POST /api/gm/games/:id/pause
- ✅ POST /api/gm/games/:id/resume
- ✅ POST /api/gm/games/:id/sessions/:sessionId/unlock
- ✅ GET /api/gm/games/:id/teams (List teams)
- ✅ GET /api/gm/games/:id/submissions (List submissions)
- ✅ POST /api/gm/submissions/:id/score (Score submission)
- ✅ GET /api/gm/games/:id/leaderboard

### Team/Player Endpoints
- ✅ POST /api/teams (Create/join team)
- ✅ GET /api/teams/:id (Get team details)
- ✅ GET /api/teams/:id/dashboard (Get dashboard data)
- ✅ POST /api/teams/:id/submit (Submit decision)
- ✅ GET /api/teams/:id/leaderboard

### File Upload Endpoints
- ✅ POST /api/upload (Upload files)

## Expected Metrics Calculation

The scoring formula should follow:
```
Overall Score = (Financial × 0.4) + (HR × 0.3) + (Market Communication × 0.3)
```

### Score to Metrics Impact Example:
- Score 85/100 on marketing challenge:
  - Market Communication: +3.5 points
  - Customer Satisfaction: +2.8 points
  - Financial: +1.7 points

### Verification:
Test that scoring actually updates metrics according to the formula in:
- `backend/src/services/metrics.service.ts`

## Common Issues and Troubleshooting

### Backend Won't Start
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep businesscaise`
- Check port 3001 is available: `lsof -i :3001`

### Frontend Won't Connect
- Verify VITE_API_URL in .env matches backend URL
- Check browser console for CORS errors
- Ensure backend is running before frontend

### WebSocket Not Working
- Check VITE_SOCKET_URL matches backend
- Verify Socket.IO client version matches server
- Look for connection errors in console

### File Upload Fails
- Check uploads/ directory exists and is writable
- Verify multer configuration in backend
- Check file size limits (10MB default)

### Metrics Not Updating
- Verify metrics.service.ts calculations
- Check database triggers/constraints
- Review backend console logs for errors

## Performance Testing

### Load Testing Scenarios:
1. **Multiple Teams:** Create 10+ teams, verify performance
2. **Rapid Submissions:** Submit multiple decisions quickly
3. **File Upload Stress:** Upload maximum size files (10MB × 5)
4. **WebSocket Scale:** Open 20+ browser tabs as players

### Expected Performance:
- Page load: < 2 seconds
- API response: < 500ms
- WebSocket latency: < 100ms
- File upload (10MB): < 5 seconds

## Security Testing

### Authentication:
- ✅ Cannot access GM routes as Player
- ✅ Cannot access other teams' data
- ✅ JWT tokens expire correctly
- ✅ Logout clears tokens

### Authorization:
- ✅ Players cannot unlock sessions
- ✅ Players cannot score submissions
- ✅ Players cannot view all teams' data
- ✅ Cannot access API without valid token

### File Upload Security:
- ✅ File type validation works
- ✅ File size limits enforced
- ✅ Malicious file names handled
- ✅ Path traversal prevented

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Multilingual Testing

Switch language using the language selector:
- ✅ English (EN) - All UI labels translate
- ✅ French (FR) - All UI labels translate
- ✅ Language persists across page reloads

## Final Checklist

Before considering testing complete, verify:

- [ ] All 11 test scenarios pass
- [ ] All API endpoints respond correctly
- [ ] WebSocket events work in real-time
- [ ] File upload and download work
- [ ] Metrics calculations are accurate
- [ ] Leaderboard updates correctly
- [ ] No console errors in browser
- [ ] No errors in backend logs
- [ ] Multiple concurrent users work smoothly
- [ ] Mobile responsive design works
- [ ] Both languages (EN/FR) display correctly
- [ ] Authentication and authorization work
- [ ] Database persists data correctly
- [ ] Can complete full 5-day simulation

## Success Criteria

The integration is successful if:
1. ✅ GM can create games and manage all aspects
2. ✅ Players can join, submit, and track progress
3. ✅ Real-time updates work across all clients
4. ✅ File upload system functions properly
5. ✅ Scoring impacts metrics correctly
6. ✅ Leaderboard reflects accurate rankings
7. ✅ No critical bugs or errors
8. ✅ System handles multiple concurrent users
9. ✅ All security measures work
10. ✅ Complete game week can be simulated

---

**Next Steps After Testing:**
1. Document any bugs found
2. Create bug fix tickets
3. Plan production deployment
4. Set up monitoring and logging
5. Prepare user documentation
