# BusinessCaise UX-Only Testing Guide

## 🎯 Quick Start (No Backend Setup Required!)

This guide shows you how to test the complete BusinessCaise application **using only your browser** - no backend server, no database, no configuration needed!

## What is Demo Mode?

Demo Mode simulates the entire backend infrastructure in the frontend using mock data and services. This allows you to:
- ✅ Test all user interfaces and workflows
- ✅ Experience real-time updates via simulated WebSocket
- ✅ Try all features without any setup
- ✅ Demo the application to stakeholders
- ✅ Develop and iterate on UI/UX without backend dependency
- ✅ Run training sessions

## 🚀 Getting Started

### Option 1: Direct URL Access (Easiest)
Simply open the application with the demo parameter:
```
http://localhost:5173/?demo=true
```

The application will automatically enable Demo Mode!

### Option 2: Toggle from UI
1. Open the application: `http://localhost:5173`
2. Click the **Demo Mode Toggle** button in the bottom-right corner
3. The page will reload in Demo Mode

### Option 3: Build and Serve
```bash
# Build the frontend
npm run build

# Serve the built application
npx serve -s dist -l 5173

# Open browser
open http://localhost:5173/?demo=true
```

## 📋 Pre-Loaded Demo Data

When you enable Demo Mode, the following data is automatically available:

### User Accounts
| Role | Email | Password | Name |
|------|-------|----------|------|
| Game Master | demo-gm@businesscaise.com | demo123 | Demo Game Master |
| Player 1 | demo-player1@businesscaise.com | demo123 | Demo Player 1 |
| Player 2 | demo-player2@businesscaise.com | demo123 | Demo Player 2 |

### Pre-Loaded Game
- **Title**: Demo Business Simulation - Winter 2025
- **ID**: game-demo-001
- **Status**: Active
- **Sessions**: 10 (Monday-Friday AM/PM)
- **Active Session**: Monday Morning - Session 1

### Pre-Loaded Teams
1. **Alpha Innovators** (Blue #3B82F6)
   - Members: Alice Johnson, Bob Smith, Carol Davis
   - Score: 54.2 (1st place)
   - Has 1 scored submission

2. **Beta Strategists** (Red #EF4444)
   - Members: David Lee, Emma Wilson, Frank Chen
   - Score: 49.7 (3rd place)
   - Has 1 pending submission

3. **Gamma Disruptors** (Green #10B981)
   - Members: Grace Kim, Henry Taylor, Iris Martinez
   - Score: 52.1 (2nd place)
   - Has 1 pending submission

## 🎮 Complete UX Test Scenarios

### Scenario 1: Game Master Experience

**Goal**: Test the complete GM dashboard and controls

**Steps**:
1. Click **Demo Mode** toggle (bottom-right) if not already enabled
2. Login as GM:
   - Email: `demo-gm@businesscaise.com`
   - Password: `demo123`

3. **Dashboard Overview**:
   - ✅ See game status badge (Active)
   - ✅ View game statistics
   - ✅ See Start/Pause buttons
   - ✅ Click "Pause Game" → verify status changes
   - ✅ Click "Resume Game" → verify status restores

4. **Sessions Tab**:
   - ✅ See all 10 sessions (Monday-Friday AM/PM)
   - ✅ Session 1 shows "Active" status
   - ✅ Other sessions show "Locked" status
   - ✅ Click "Unlock" on Session 2 (Monday PM)
   - ✅ Verify session status updates immediately
   - ✅ Note: Real-time update simulation

5. **Teams Tab**:
   - ✅ See 3 teams listed with colors
   - ✅ View team scores and rankings
   - ✅ Check team member lists

6. **Submissions Tab**:
   - ✅ Click "All" filter → see 3 submissions
   - ✅ Click "Pending" filter → see 2 pending
   - ✅ Click "Scored" filter → see 1 scored
   - ✅ Click "Score" button on a pending submission
   - ✅ Review submission data in modal
   - ✅ See attached files (simulated)
   - ✅ Enter score: `78`
   - ✅ Enter feedback: `Good strategic approach`
   - ✅ Click "Submit Score"
   - ✅ Verify submission updates to "Scored"

**Expected Duration**: 10-15 minutes

---

### Scenario 2: Player Experience (Single User)

**Goal**: Test player interface, team creation, and submission

**Steps**:
1. Logout from GM account (or open new incognito window)
2. Login as Player:
   - Email: `demo-player1@businesscaise.com`
   - Password: `demo123`

3. **Game Selection**:
   - ✅ See game code input field
   - ✅ Enter game ID: `game-demo-001`
   - ✅ Click "Join Game"

4. **Team Join Modal**:
   - ✅ Modal appears with team creation form
   - ✅ Enter team name: `Delta Force`
   - ✅ Select color: Orange (#F97316)
   - ✅ Add team members:
     - Click "+" button
     - Enter: `John Doe`
     - Click "+" again
     - Enter: `Jane Smith`
   - ✅ Click "Join Game"
   - ✅ Verify team is created

5. **Dashboard Tab**:
   - ✅ See Department Dashboard with 5 sections
   - ✅ View metrics (all start at 50)
   - ✅ See Current Session info
   - ✅ View Recent Submissions (empty for new team)
   - ✅ Check overall score display

6. **Game Tab**:
   - ✅ See active challenge: "Monday Morning - Session 1"
   - ✅ View challenge description
   - ✅ Enter submission data in JSON format:
     ```json
     {
       "decision": "Expand into European market",
       "reasoning": "Strong growth potential",
       "budget": 500000
     }
     ```
   - ✅ Test file upload:
     - Drag and drop a file (or click to browse)
     - Verify file appears in list
     - See file size display
     - Try removing file
     - Re-add file
     - Click "Upload 1 file" button
     - Wait for green checkmark
   - ✅ Click "Submit Decision"
   - ✅ See success message
   - ✅ Verify submission appears in Dashboard tab

7. **Leaderboard Tab**:
   - ✅ See all teams ranked
   - ✅ Find your team (Delta Force) at 4th place (50.0 score)
   - ✅ See top 3 with medals (🥇🥈🥉)
   - ✅ Verify your team row is highlighted

**Expected Duration**: 15-20 minutes

---

### Scenario 3: Real-Time Multi-User Simulation

**Goal**: Test real-time synchronization between GM and players

**Setup**: You'll need 3 browser windows (use regular + incognito + different browser)

**Window 1 - Game Master**:
1. Login as GM
2. Navigate to Submissions tab
3. Keep this window visible

**Window 2 - Player 1** (Alpha Innovators):
1. Login as `demo-player1@businesscaise.com`
2. Enter game ID: `game-demo-001`
3. Note: Alpha Innovators team already exists, you'll join it
4. Navigate to Dashboard tab
5. Keep this window visible

**Window 3 - Player 2** (New Team):
1. Login as `demo-player2@businesscaise.com`
2. Create new team: "Echo Squad"
3. Navigate to Leaderboard tab
4. Keep this window visible

**Test Real-Time Updates**:

**Action 1: GM Scores a Submission**
- In **Window 1 (GM)**, score a pending submission with 85 points
- **Expected Results**:
  - Window 1: Submission updates immediately to "Scored"
  - Window 2 (Player): Metrics update automatically (no refresh)
  - Window 2 (Player): Recent submission shows score
  - Window 3 (Player): Leaderboard re-ranks automatically
  - All updates happen within 1-2 seconds

**Action 2: GM Unlocks New Session**
- In **Window 1 (GM)**, unlock "Tuesday Morning - Session 3"
- **Expected Results**:
  - Window 1: Session status changes to "Active"
  - Window 2 (Player): "New Challenge Available" notification
  - Window 2 (Player): Dashboard shows new active session
  - Window 3 (Player): No change (on different tab)

**Action 3: Player Submits Decision**
- In **Window 2 (Player)**, go to Game tab and submit a decision
- **Expected Results**:
  - Window 2: Success message appears
  - Window 1 (GM): New submission appears in Pending list (may need to switch filters)
  - Window 3: No immediate change

**Action 4: GM Pauses Game**
- In **Window 1 (GM)**, click "Pause Game"
- **Expected Results**:
  - Window 1: Game status changes to "Paused"
  - Window 2: Subtle status indicator updates
  - Window 3: Subtle status indicator updates

**Expected Duration**: 20-25 minutes

---

### Scenario 4: Complete Game Flow (End-to-End)

**Goal**: Simulate a complete game session from start to finish

**Phase 1: Setup (5 min)**
1. Login as GM
2. Verify game is active
3. Review all 10 sessions
4. Check existing teams

**Phase 2: Session 1 (10 min)**
1. Unlock Monday Morning (already active)
2. Open player windows for each team
3. Each team submits decision
4. GM reviews all submissions
5. GM scores all submissions (varying scores)
6. Verify leaderboard updates correctly

**Phase 3: Session 2 (10 min)**
1. GM unlocks Monday PM
2. All players see new challenge
3. Teams submit decisions
4. GM scores submissions
5. Check metrics evolution

**Phase 4: Session 3 (10 min)**
1. GM unlocks Tuesday Morning
2. Teams submit
3. GM scores
4. Review leaderboard standings

**Phase 5: Analysis (5 min)**
1. Check final leaderboard
2. Verify scoring formula:
   - Overall Score = (Financial × 0.4) + (HR × 0.3) + (Market Comm × 0.3)
3. Review metrics progression
4. Check submission history

**Expected Duration**: 40 minutes

---

### Scenario 5: Edge Cases and Error Handling

**Goal**: Test validation and error scenarios

**Test Cases**:

1. **Empty Submission**:
   - Try to submit without data or files
   - ✅ See validation error message

2. **Invalid Score**:
   - GM tries to enter score > 100
   - ✅ Input validation prevents it
   - Try score < 0
   - ✅ Input validation prevents it

3. **Multiple Rapid Actions**:
   - Submit multiple decisions quickly
   - ✅ Each queues properly
   - Score multiple submissions rapidly
   - ✅ Updates process correctly

4. **Large File Upload**:
   - Try uploading 11MB file
   - ✅ See size validation error
   - Upload 5 files successfully
   - ✅ All appear in list
   - Try adding 6th file
   - ✅ See max files error

5. **Session State Logic**:
   - Try to unlock session while game is paused
   - ✅ Action blocked or warned
   - Resume game
   - ✅ Can unlock sessions again

**Expected Duration**: 15 minutes

---

## 🎨 UI/UX Elements to Verify

### Visual Design
- [ ] Consistent color scheme (Blue #3B82F6, Red #EF4444, Green #10B981)
- [ ] Proper spacing and padding
- [ ] Clear typography hierarchy
- [ ] Icons are meaningful and consistent
- [ ] Loading states are visible
- [ ] Success/error messages are clear

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Navigation adapts to screen size
- [ ] Tables/lists scroll on small screens

### Interactions
- [ ] Buttons have hover states
- [ ] Forms have focus states
- [ ] Transitions are smooth (not jarring)
- [ ] Modals open/close smoothly
- [ ] Tab navigation works
- [ ] Keyboard shortcuts work (if applicable)

### Feedback
- [ ] Click feedback is immediate
- [ ] Loading indicators appear for slow actions
- [ ] Success messages auto-dismiss
- [ ] Error messages persist until dismissed
- [ ] Progress bars show during uploads
- [ ] Real-time updates are noticeable but not disruptive

---

## ⚙️ Demo Mode Features

### Available Features
| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Full | Login/Register/Logout |
| Game Creation | ✅ Full | Creates 10 sessions automatically |
| Game Controls | ✅ Full | Start/Pause/Resume |
| Session Unlocking | ✅ Full | Manual unlock |
| Team Creation | ✅ Full | With colors and members |
| Decision Submission | ✅ Full | JSON/text + files |
| File Upload | ✅ Simulated | Returns mock URLs |
| Scoring System | ✅ Full | 0-100 with feedback |
| Metrics Calculation | ✅ Full | Weighted formula |
| Real-time Updates | ✅ Simulated | 100ms delay |
| Leaderboard | ✅ Full | Live rankings |
| WebSocket Events | ✅ Simulated | All events work |
| Multilingual (EN/FR) | ✅ Full | Language switching |

### Limitations
| Limitation | Impact | Workaround |
|------------|--------|------------|
| Data resets on refresh | 🟡 Medium | Re-login and recreate |
| Files not saved to disk | 🟢 Low | URLs are generated |
| No cross-browser sync | 🟡 Medium | Each browser is isolated |
| Network delay simulated | 🟢 Low | 300-1000ms delays |
| Max 3 demo accounts | 🟢 Low | Can create more via register |

---

## 🐛 Troubleshooting

### Demo Mode Won't Enable
**Problem**: Clicking toggle doesn't switch to demo mode

**Solutions**:
1. Check browser console for errors (F12)
2. Clear localStorage: `localStorage.clear()`
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Try URL parameter: `?demo=true`

### Login Not Working
**Problem**: Demo credentials don't work

**Solutions**:
1. Verify you're in Demo Mode (check toggle button)
2. Use exact credentials (case-sensitive):
   - Email: `demo-gm@businesscaise.com`
   - Password: `demo123`
3. Check if password field is auto-filled incorrectly
4. Clear form and re-enter manually

### Real-Time Updates Not Showing
**Problem**: Scoring doesn't update player metrics

**Solutions**:
1. Verify both windows are in Demo Mode
2. Check browser console for WebSocket messages
3. Wait 1-2 seconds for simulated delay
4. Manually refresh player dashboard
5. Reload pages if issue persists

### File Upload Fails
**Problem**: Upload button doesn't work

**Solutions**:
1. Check file size (<10MB in demo)
2. Check file type (PDF, Office docs, images)
3. Try with a smaller file
4. Check browser console for errors
5. Note: Files aren't actually uploaded, just validated

---

## 📊 Test Results Template

Use this template to document your UX testing:

```markdown
## UX Test Session

**Date**: YYYY-MM-DD
**Tester**: Name
**Browser**: Chrome/Firefox/Safari/Edge
**Screen Size**: 1920x1080

### Scenarios Completed
- [ ] Scenario 1: Game Master Experience
- [ ] Scenario 2: Player Experience
- [ ] Scenario 3: Real-Time Multi-User
- [ ] Scenario 4: Complete Game Flow
- [ ] Scenario 5: Edge Cases

### Issues Found
1. **Issue Title**
   - Severity: High/Medium/Low
   - Location: Page > Component
   - Steps to Reproduce: ...
   - Expected: ...
   - Actual: ...
   - Screenshot: [link]

### UX Improvements Suggested
1. **Suggestion Title**
   - Area: Navigation/Forms/Dashboard/etc.
   - Current State: ...
   - Proposed Change: ...
   - Impact: High/Medium/Low

### Overall Impression
- Usability Score: __/10
- Visual Design: __/10
- Performance: __/10
- Would recommend: Yes/No
- Comments: ...
```

---

## 🎯 Success Criteria

UX testing is successful if:

1. **All scenarios complete** without blocking errors
2. **Real-time updates** work consistently
3. **Visual design** is polished and professional
4. **Navigation** is intuitive without instruction
5. **Forms** validate input appropriately
6. **Error messages** are helpful and actionable
7. **Loading states** provide clear feedback
8. **Mobile responsiveness** works on all devices
9. **Performance** feels snappy (<1s interactions)
10. **Multilingual** switching works seamlessly

---

## 🚀 Next Steps After UX Testing

Once UX testing is complete:

1. **Document Findings**: Create issues for bugs/improvements
2. **Prioritize Changes**: High/Medium/Low impact
3. **Backend Integration**: Test with real backend (see TESTING_GUIDE.md)
4. **Performance Testing**: Load testing with multiple users
5. **Security Testing**: Authentication and authorization
6. **Accessibility Testing**: WCAG compliance
7. **Browser Testing**: Cross-browser compatibility
8. **Production Deployment**: Follow deployment guide

---

## 📚 Additional Resources

- **Full Testing Guide**: See TESTING_GUIDE.md for backend integration testing
- **Architecture**: See ARCHITECTURE.md for system design details
- **API Documentation**: See ARCHITECTURE.md for complete API reference
- **Deployment**: See backend/README.md for production setup

---

**Happy Testing! 🎉**

For questions or issues, please create a GitHub issue or contact the development team.
