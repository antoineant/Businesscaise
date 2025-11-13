# BusinessCaise Quick Start Guide

## 🚀 Try Demo Mode (No Setup Required!)

The fastest way to experience BusinessCaise is through **Demo Mode** - test the entire application in your browser without any backend setup!

### Option 1: Direct Access (Recommended)
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser with demo mode enabled
open http://localhost:5173/?demo=true
```

### Option 2: Build and Serve
```bash
# Build the application
npm run build

# Serve the build
npx serve -s dist -l 5173

# Open with demo mode
open http://localhost:5173/?demo=true
```

## 🎮 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Game Master** | demo-gm@businesscase.com | demo123 |
| **Player 1** | demo-player1@businesscase.com | demo123 |
| **Player 2** | demo-player2@businesscase.com | demo123 |

## 📝 5-Minute Demo Flow

### As Game Master (5 min)
1. Login with GM credentials
2. View existing game: "Demo Business Simulation - Winter 2025"
3. Go to **Sessions** tab → Unlock "Tuesday Morning" session
4. Go to **Submissions** tab → Score a pending submission (score: 85)
5. Go to **Teams** tab → View updated leaderboard

### As Player (5 min)
1. Login with player credentials
2. Enter game ID: `game-demo-001`
3. **Join Team** modal appears:
   - Team name: "Test Team"
   - Pick a color
   - Add 2 members
4. **Dashboard** tab → View your metrics (all start at 50)
5. **Game** tab → Submit a decision with file upload
6. **Leaderboard** tab → See your ranking

### Multi-Window Test (10 min)
1. **Window 1**: Login as GM, go to Submissions tab
2. **Window 2**: Login as Player, navigate to Dashboard
3. **In Window 1**: Score a submission
4. **In Window 2**: Watch metrics update in real-time! ✨

## 📖 Full Guides

- **UX Testing**: See [UX_TESTING_GUIDE.md](./UX_TESTING_GUIDE.md) for complete UX testing scenarios
- **Backend Integration**: See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for full backend setup
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design

## 🛠️ Full Backend Setup (For Production Testing)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create database
psql -U postgres -c "CREATE DATABASE businesscase;"

# Run migrations
psql -U postgres -d businesscase -f src/db/migrations/initial_schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start backend server
npm run dev
```

### Frontend Setup
```bash
# In project root
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001/api

# Start frontend dev server
npm run dev
```

### Verify Setup
- Backend: http://localhost:3001/health
- Frontend: http://localhost:5173
- WebSocket: ws://localhost:3001

## 🎯 Key Features

### Game Master
- ✅ Create and manage multiple games
- ✅ Control game flow (Start/Pause/Resume)
- ✅ Unlock sessions manually or on schedule
- ✅ Review team submissions with file attachments
- ✅ Score submissions with detailed feedback
- ✅ Monitor real-time leaderboard
- ✅ View analytics and metrics history

### Players
- ✅ Join games with unique game codes
- ✅ Create teams with custom colors and members
- ✅ Submit decisions with text and file uploads
- ✅ View department-specific metrics dashboard
- ✅ Track submission history and scores
- ✅ Monitor live leaderboard rankings
- ✅ Receive real-time updates via WebSocket

### System
- ✅ Real-time WebSocket synchronization
- ✅ Multi-dimensional scoring (Financial 40%, HR 30%, Market 30%)
- ✅ File upload support (PDFs, Office docs, images)
- ✅ Multilingual (English/French)
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ PostgreSQL with JSONB for flexible data
- ✅ Responsive design (desktop, tablet, mobile)

## 🔄 Switch Between Modes

### Enable Demo Mode
- Add `?demo=true` to URL
- Or click Demo Mode toggle button (bottom-right)

### Disable Demo Mode (Use Real Backend)
- Remove `?demo=true` from URL
- Or click Demo Mode toggle to switch to "Real Mode"
- Ensure backend server is running!

## 🐛 Troubleshooting

### Demo Mode Issues
**Problem**: Demo mode not working
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R
- Check browser console for errors

### Backend Connection Issues
**Problem**: "Network Error" when not in demo mode
**Solution**:
- Verify backend is running: `curl http://localhost:3001/health`
- Check VITE_API_URL in .env matches backend URL
- Ensure CORS is configured correctly

### Build Errors
**Problem**: TypeScript errors during build
**Solution**:
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## 📊 Project Structure

```
BusinessCaise/
├── src/                      # Frontend source
│   ├── components/          # React components
│   ├── pages/               # Route pages
│   ├── services/            # API & WebSocket services
│   │   ├── api.client.ts         # Real API
│   │   ├── mock-api.client.ts    # Mock API
│   │   ├── api.unified.ts        # Unified router
│   │   └── demo-mode.ts          # Demo mode manager
│   ├── contexts/            # React contexts
│   └── locales/             # i18n translations
├── backend/                 # Backend source
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   └── socket/          # WebSocket handlers
├── UX_TESTING_GUIDE.md     # Complete UX testing guide
├── TESTING_GUIDE.md        # Backend integration testing
├── ARCHITECTURE.md         # System architecture
└── QUICK_START.md          # This file
```

## 🎓 Learning Path

### For Evaluators/Stakeholders
1. Start with **Demo Mode** (5 minutes)
2. Try **Multi-Window Test** (10 minutes)
3. Review **UX_TESTING_GUIDE.md** for detailed scenarios

### For Developers
1. Run **Demo Mode** to understand UX (15 minutes)
2. Read **ARCHITECTURE.md** for system design (30 minutes)
3. Set up **Full Backend** (30 minutes)
4. Follow **TESTING_GUIDE.md** for integration tests (1 hour)
5. Review codebase structure

### For QA Engineers
1. Complete **UX_TESTING_GUIDE.md** scenarios (2 hours)
2. Set up backend and run **TESTING_GUIDE.md** (3 hours)
3. Perform security and performance testing
4. Document bugs and improvements

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] All tests pass (UX + Integration)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers enabled (Helmet.js)
- [ ] HTTPS/TLS configured
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] Logging and monitoring set up
- [ ] Backup strategy implemented
- [ ] Load balancing configured (if needed)
- [ ] CDN set up for static assets
- [ ] Performance optimization applied
- [ ] SEO tags added (if public)
- [ ] Analytics integrated (if needed)

## 📞 Support

- **Issues**: Create a GitHub issue
- **Questions**: Check documentation files
- **Contributions**: Follow CONTRIBUTING.md (if exists)

## 🎉 Success Metrics

You'll know the setup is successful when:
- ✅ Demo mode loads without errors
- ✅ Can login with demo credentials
- ✅ Real-time updates work between windows
- ✅ File uploads complete successfully
- ✅ Scoring updates metrics immediately
- ✅ Leaderboard ranks correctly
- ✅ Language switching works (EN/FR)
- ✅ No console errors
- ✅ All tabs/pages render properly
- ✅ Mobile responsive works

---

**Ready to start? Run `npm run dev` and open http://localhost:5173/?demo=true** 🚀
