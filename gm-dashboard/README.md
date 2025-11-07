# GM Dashboard - BusinessCaise Game Master Control Panel

The GM Dashboard is a React-based admin interface for managing BusinessCaise business simulation games. It provides game masters with complete control over game creation, session management, team monitoring, and analytics.

## Features

### ✅ Implemented (MVP)

- **Authentication System**
  - Login/Register for Game Masters
  - JWT token-based authentication
  - Role-based access control
  - Persistent sessions with localStorage

- **Game Management**
  - Create new games with custom titles and descriptions
  - Automatically generates 10 sessions (Monday-Friday, AM/PM)
  - List all games with status indicators
  - View detailed game information
  - Delete games

- **Game Control**
  - Start games (draft → active)
  - Pause active games
  - Resume paused games
  - Real-time status updates

- **Session Management**
  - View all 10 sessions per game
  - Unlock sessions manually
  - See unlock status at a glance
  - Quick navigation to session editing

- **Team Monitoring**
  - View all teams participating in a game
  - See team scores and member counts
  - Quick access to detailed team information
  - Team ranking display

- **Dashboard Overview**
  - Stats cards (teams, sessions, progress)
  - Quick access to leaderboard
  - Quick access to analytics
  - Responsive layout

### 🚧 To Be Implemented

- Session editing (narrative, deadlines, descriptions)
- Detailed team monitoring page
- Leaderboard with rankings and trends
- Analytics dashboard with charts
- WebSocket real-time notifications
- Submission scoring interface
- Narrative system integration

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Utilities**: date-fns
- **Forms**: React Hook Form
- **WebSocket**: Socket.IO Client (planned)

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3001`
- PostgreSQL database configured

## Installation

```bash
# Navigate to GM Dashboard directory
cd gm-dashboard

# Install dependencies
npm install

# Create environment file (already exists)
# Update .env with your backend API URL if different
# VITE_API_URL=http://localhost:3001/api
```

## Development

```bash
# Start development server (runs on port 3002)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

The dashboard will be available at `http://localhost:3002`

## Project Structure

```
gm-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main app layout with navigation
│   │   └── ProtectedRoute.tsx  # Auth guard wrapper
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx    # Login form
│   │   ├── RegisterPage.tsx # Registration form
│   │   ├── GamesListPage.tsx    # List all games
│   │   ├── CreateGamePage.tsx   # Create new game
│   │   └── GameDetailsPage.tsx  # Game management dashboard
│   ├── services/            # API services
│   │   └── api.ts           # Axios instance + API methods
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared types
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles + Tailwind
├── public/                  # Static assets
├── .env                     # Environment variables
├── package.json
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Usage Guide

### 1. Register/Login

First time using the dashboard:
1. Navigate to `http://localhost:3002/register`
2. Create a Game Master account
3. You'll be automatically logged in

Returning users:
1. Navigate to `http://localhost:3002/login`
2. Sign in with your credentials

### 2. Create a Game

1. Click "Create Game" button on the Games page
2. Fill in:
   - **Title** (required): e.g., "Fall 2024 Business Simulation"
   - **Description** (optional): Context for teams
   - **Start Date** (optional): When teams can begin
   - **End Date** (optional): Simulation deadline
3. Click "Create Game"
4. 10 sessions will be auto-generated (Monday-Friday, AM/PM)
5. Game starts in "draft" status

### 3. Manage a Game

From the Game Details page you can:

**Control Game Status:**
- Click "Start Game" to begin (draft → active)
- Click "Pause Game" to temporarily stop
- Click "Resume Game" to continue

**Unlock Sessions:**
- Sessions start locked
- Click "Unlock" button on any session
- Teams can only access unlocked sessions

**Monitor Teams:**
- View team count in stats
- See team list with scores
- Click on a team for detailed view

**Access Analytics:**
- Click "Leaderboard" card to see rankings
- Click "Analytics" card for game statistics

### 4. Delete a Game

- From Games List, click the trash icon on any game card
- Confirm deletion (cannot be undone)
- All associated sessions and data will be removed

## API Integration

The dashboard communicates with the backend via REST API:

### Authentication Endpoints
- `POST /api/auth/register` - Create GM account
- `POST /api/auth/login` - Authenticate
- `GET /api/auth/me` - Get current user

### Game Management Endpoints
- `POST /api/gm/games` - Create game
- `GET /api/gm/games` - List games
- `GET /api/gm/games/:id` - Get game details
- `PUT /api/gm/games/:id` - Update game
- `DELETE /api/gm/games/:id` - Delete game
- `POST /api/gm/games/:id/start` - Start game
- `POST /api/gm/games/:id/pause` - Pause game
- `POST /api/gm/games/:id/resume` - Resume game

### Session Management Endpoints
- `GET /api/gm/games/:gameId/sessions` - List sessions
- `POST /api/gm/games/:gameId/sessions/:sessionId/unlock` - Unlock session
- `PUT /api/gm/games/:gameId/sessions/:sessionId` - Update session

### Team Monitoring Endpoints
- `GET /api/gm/games/:gameId/teams` - List teams
- `GET /api/gm/games/:gameId/teams/:teamId` - Team details
- `GET /api/gm/games/:gameId/teams/:teamId/history` - Metrics history

### Analytics Endpoints
- `GET /api/gm/games/:gameId/leaderboard` - Team rankings
- `GET /api/gm/games/:gameId/analytics` - Game statistics

## Environment Variables

The `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api
```

## Troubleshooting

### Cannot connect to API
- Ensure backend server is running on port 3001
- Check `VITE_API_URL` in `.env`
- Verify CORS is configured in backend

### Login fails
- Verify you're registered as a Game Master (not Player)
- Check backend logs for authentication errors
- Clear localStorage and try again

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 18 or higher

### Port 3002 already in use
- Change port in `vite.config.ts`:
  ```typescript
  server: {
    port: 3003, // or any available port
  }
  ```

## Development Roadmap

### Phase 1: Core Features (✅ Complete)
- ✅ Authentication
- ✅ Game CRUD
- ✅ Basic session management
- ✅ Team list view

### Phase 2: Enhanced Monitoring (Next)
- Session editing interface
- Detailed team monitoring
- Leaderboard with charts
- Analytics dashboard

### Phase 3: Real-time Features
- WebSocket integration
- Live team updates
- Session unlock notifications
- Submission alerts

### Phase 4: Advanced Features
- Submission scoring interface
- Narrative management
- Custom event creation
- Export/reporting tools

## Contributing

When adding new features:

1. Create components in `src/components/` or `src/pages/`
2. Add API methods to `src/services/api.ts`
3. Define types in `src/types/index.ts`
4. Update routing in `src/App.tsx`
5. Test build: `npm run build`
6. Test functionality with running backend

## License

Proprietary - BusinessCaise Professional Edition

## Support

For issues or questions:
- Check backend logs at `backend/logs/`
- Review API documentation in `backend/`
- Verify database connections are working
