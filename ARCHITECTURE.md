# BusinessCaise Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React 18 + TypeScript + Vite + Tailwind CSS               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages      │  │  Components  │  │   Services   │     │
│  │              │  │              │  │              │     │
│  │ - Login      │  │ - File       │  │ - API Client │     │
│  │ - Register   │  │   Upload     │  │ - WebSocket  │     │
│  │ - GameMaster │  │ - Submission │  │ - i18n       │     │
│  │   Dashboard  │  │   Form       │  │              │     │
│  │ - PlayerGame │  │ - Department │  │              │     │
│  │ - Selection  │  │   Dashboard  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Context: AuthProvider (Global State)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP REST + WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│       Node.js + Express + TypeScript + Socket.IO            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │  │    Models    │  │  Middleware  │     │
│  │              │  │              │  │              │     │
│  │ - auth       │  │ - User       │  │ - auth       │     │
│  │ - gm         │  │ - Game       │  │ - validation │     │
│  │ - team       │  │ - Team       │  │ - upload     │     │
│  │              │  │ - Session    │  │ - error      │     │
│  │              │  │ - Submission │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Services   │  │    Socket    │                        │
│  │              │  │              │                        │
│  │ - metrics    │  │ - handler    │                        │
│  │              │  │ - rooms      │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL 14+                            │
│                                                              │
│  Tables: users, games, teams, sessions, submissions,        │
│          metrics_history, submission_files, game_settings   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router v6**: Client-side routing
- **axios**: HTTP client with interceptors
- **Socket.IO Client**: Real-time WebSocket client
- **react-i18next**: Internationalization (EN/FR)
- **Lucide React**: Icon library

### Backend
- **Node.js 18+**: JavaScript runtime
- **Express**: Web application framework
- **TypeScript**: Type-safe JavaScript
- **Socket.IO**: Real-time bidirectional communication
- **PostgreSQL**: Relational database
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **Multer**: File upload handling
- **express-validator**: Request validation
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

## Project Structure

```
BusinessCaise/
├── src/                           # Frontend source
│   ├── components/               # React components
│   │   ├── DepartmentDashboard.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── FileUpload.tsx       # Legacy base64 upload
│   │   ├── FileUploadBackend.tsx # Backend API upload
│   │   ├── SubmissionForm.tsx   # Decision submission
│   │   └── DecisionView.tsx     # Game decision UI
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx      # Global auth state
│   ├── locales/                 # i18n translations
│   │   ├── en/                  # English
│   │   └── fr/                  # French
│   ├── pages/                   # Route pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── GameSelection.tsx
│   │   ├── GameMasterDashboard.tsx
│   │   └── PlayerGame.tsx
│   ├── routes/                  # React Router config
│   │   └── index.tsx            # Protected routes
│   ├── services/                # API services
│   │   ├── api.client.ts        # REST API client
│   │   └── websocket.service.ts # Socket.IO client
│   ├── types/                   # TypeScript types
│   │   └── game.ts             # Game data types
│   ├── utils/                   # Utility functions
│   │   └── gameEngine.ts       # Game logic utils
│   ├── App.tsx                 # Root component
│   └── main.tsx                # App entry point
│
├── backend/                      # Backend source
│   ├── src/
│   │   ├── config/              # Configuration
│   │   │   ├── database.ts      # PostgreSQL config
│   │   │   └── auth.ts          # JWT config
│   │   ├── controllers/         # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── gm.controller.ts    # Game Master
│   │   │   └── team.controller.ts  # Player/Team
│   │   ├── db/
│   │   │   └── migrations/      # SQL migrations
│   │   │       └── initial_schema.sql
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── upload.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── models/              # Data models
│   │   │   ├── User.model.ts
│   │   │   ├── Game.model.ts
│   │   │   ├── Team.model.ts
│   │   │   ├── Session.model.ts
│   │   │   └── Submission.model.ts
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── gm.routes.ts
│   │   │   ├── team.routes.ts
│   │   │   └── upload.routes.ts
│   │   ├── services/            # Business logic
│   │   │   └── metrics.service.ts
│   │   ├── socket/              # WebSocket
│   │   │   └── socket.handler.ts
│   │   └── server.ts            # Server entry point
│   └── uploads/                 # Uploaded files
│
├── public/                       # Static assets
├── dist/                         # Build output
├── .env                         # Frontend environment
├── backend/.env                 # Backend environment
├── package.json                 # Frontend dependencies
├── backend/package.json         # Backend dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
├── TESTING_GUIDE.md            # This document
└── ARCHITECTURE.md             # Architecture overview
```

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'game_master' | 'player'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Games Table
```sql
games (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  game_master_id UUID REFERENCES users(id),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  current_session_id UUID,
  status VARCHAR(50) NOT NULL, -- 'setup' | 'active' | 'paused' | 'completed'
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Teams Table
```sql
teams (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) NOT NULL,
  members TEXT[], -- Array of member names
  metrics JSONB NOT NULL, -- { financial, hr, market_communication, operations, customer_satisfaction }
  overall_score DECIMAL(5,2) DEFAULT 50.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Sessions Table
```sql
sessions (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  session_number INTEGER NOT NULL,
  day VARCHAR(50) NOT NULL, -- 'Monday', 'Tuesday', etc.
  period VARCHAR(10) NOT NULL, -- 'AM' | 'PM'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  unlock_type VARCHAR(50) NOT NULL, -- 'manual' | 'scheduled'
  scheduled_unlock_time TIMESTAMP,
  actual_unlock_time TIMESTAMP,
  deadline TIMESTAMP,
  status VARCHAR(50) NOT NULL, -- 'locked' | 'active' | 'completed'
  challenges JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Submissions Table
```sql
submissions (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  session_id UUID REFERENCES sessions(id),
  challenge_id VARCHAR(255) NOT NULL,
  submission_data JSONB NOT NULL,
  file_urls TEXT[],
  submitted_at TIMESTAMP DEFAULT NOW(),
  scored_at TIMESTAMP,
  score INTEGER, -- 0-100
  feedback TEXT,
  status VARCHAR(50) NOT NULL -- 'pending' | 'scored' | 'rejected'
)
```

### Metrics History Table
```sql
metrics_history (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  metrics JSONB NOT NULL,
  overall_score DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
)
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and get JWT token
- `GET /me` - Get current user info
- `POST /logout` - Logout user

### Game Master (`/api/gm`)
- `POST /games` - Create new game (auto-creates 10 sessions)
- `GET /games` - List GM's games
- `GET /games/:id` - Get game details with teams and sessions
- `POST /games/:id/start` - Start game
- `POST /games/:id/pause` - Pause game
- `POST /games/:id/resume` - Resume game
- `DELETE /games/:id` - Delete game
- `GET /games/:id/sessions` - List sessions
- `POST /games/:id/sessions/:sessionId/unlock` - Unlock session
- `PUT /games/:id/sessions/:sessionId` - Update session
- `GET /games/:id/teams` - List teams
- `GET /games/:id/teams/:teamId` - Get team details
- `GET /games/:id/teams/:teamId/history` - Get metrics history
- `GET /games/:id/submissions` - List submissions (filterable by status)
- `GET /submissions/:id` - Get submission details
- `POST /submissions/:id/score` - Score a submission
- `GET /games/:id/leaderboard` - Get game leaderboard
- `GET /games/:id/analytics` - Get game analytics

### Team/Player (`/api/teams`)
- `POST /` - Create/join team
- `GET /:id` - Get team details
- `GET /:id/dashboard` - Get dashboard data
- `POST /:id/submit` - Submit decision
- `GET /:id/results/latest` - Get latest results
- `GET /:id/history` - Get metrics history
- `GET /:id/leaderboard` - Get leaderboard

### File Upload (`/api/upload`)
- `POST /` - Upload files (multipart/form-data, max 5 files, 10MB each)

## WebSocket Events

### Client → Server
- `join:game` - Join game room
- `leave:game` - Leave game room
- `join:team` - Join team room
- `leave:team` - Leave team room

### Server → Client

**Game Events:**
- `game:started` - Game has started
- `game:paused` - Game has been paused
- `game:resumed` - Game has resumed
- `game:completed` - Game has ended

**Session Events:**
- `session:unlocked` - Session has been unlocked
- `session:completed` - Session marked complete

**Team Events:**
- `team:joined` - New team joined game
- `metrics:updated` - Team metrics updated
- `submission:scored` - Submission scored

**Leaderboard Events:**
- `leaderboard:updated` - Rankings changed

## Authentication Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Backend │          │ Database │
└─────┬────┘          └─────┬────┘          └─────┬────┘
      │                     │                     │
      │  POST /auth/login   │                     │
      ├────────────────────>│                     │
      │  {email, password}  │                     │
      │                     │   Query user        │
      │                     ├────────────────────>│
      │                     │                     │
      │                     │   User data         │
      │                     │<────────────────────┤
      │                     │                     │
      │                     │ Verify password     │
      │                     │ (bcrypt.compare)    │
      │                     │                     │
      │                     │ Generate JWT        │
      │                     │ (jwt.sign)          │
      │                     │                     │
      │  {token, user}      │                     │
      │<────────────────────┤                     │
      │                     │                     │
      │ Store in localStorage                     │
      │                     │                     │
      │  Subsequent requests│                     │
      │  Header: Bearer JWT │                     │
      ├────────────────────>│                     │
      │                     │                     │
      │                     │ Verify JWT          │
      │                     │ (jwt.verify)        │
      │                     │                     │
      │                     │ Attach user to req  │
      │                     │                     │
```

## Metrics Calculation System

### Scoring Formula
```typescript
Overall Score = (Financial × 0.4) + (HR × 0.3) + (Market Communication × 0.3)
```

### Impact Calculation
When a submission is scored, the system:
1. Determines challenge type (marketing, finance, operations, hr)
2. Calculates impact factor: `(score - 50) / 10`
3. Applies challenge-specific multipliers to different metrics
4. Updates team metrics
5. Recalculates overall score
6. Records in metrics history
7. Broadcasts updates via WebSocket

### Example Impact (85 score on Marketing Challenge):
```typescript
{
  market_communication: +3.5,  // 85-50 = 35 / 10 = 3.5 × 1.0
  customer_satisfaction: +2.8, // 3.5 × 0.8
  financial: +1.7,            // 3.5 × 0.5
}
```

## Real-time Architecture

### WebSocket Rooms
- `game:{gameId}` - All participants in a game
- `team:{teamId}` - All members of a team
- `gm:{gameId}` - Game Master private channel

### Event Flow Example: Scoring a Submission
```
GM Dashboard                    Backend                     Player Dashboard
     │                             │                              │
     │ Click "Submit Score"        │                              │
     ├────────────────────────────>│                              │
     │                             │                              │
     │                             │ Update submission in DB      │
     │                             │                              │
     │                             │ Calculate metrics impact     │
     │                             │                              │
     │                             │ Update team metrics          │
     │                             │                              │
     │                             │ Broadcast to team room       │
     │                             ├─────────────────────────────>│
     │                             │   submission:scored event    │
     │                             │                              │
     │                             │                              │ Update UI
     │                             │                              │
     │                             │ Broadcast to game room       │
     │                             ├─────────────────────────────>│
     │                             │   leaderboard:updated event  │
     │                             │                              │
     │                             │                              │ Update leaderboard
     │ Success response            │                              │
     │<────────────────────────────┤                              │
     │                             │                              │
     │ Refresh submissions         │                              │
     │                             │                              │
```

## File Upload Flow

```
Player                 Frontend              Backend                 Filesystem
  │                       │                     │                         │
  │ Select files          │                     │                         │
  ├──────────────────────>│                     │                         │
  │                       │                     │                         │
  │                       │ Validate files      │                         │
  │                       │ (size, type)        │                         │
  │                       │                     │                         │
  │ Click "Upload"        │                     │                         │
  ├──────────────────────>│                     │                         │
  │                       │                     │                         │
  │                       │ Create FormData     │                         │
  │                       │                     │                         │
  │                       │ POST /api/upload    │                         │
  │                       ├────────────────────>│                         │
  │                       │ multipart/form-data │                         │
  │                       │                     │                         │
  │                       │                     │ Multer middleware       │
  │                       │                     │ parses files            │
  │                       │                     │                         │
  │                       │                     │ Save to disk            │
  │                       │                     ├───────────────────────>│
  │                       │                     │ uploads/gameId/teamId/  │
  │                       │                     │                         │
  │                       │                     │ File paths              │
  │                       │                     │<────────────────────────┤
  │                       │                     │                         │
  │                       │ { files: [...] }    │                         │
  │                       │<────────────────────┤                         │
  │                       │                     │                         │
  │                       │ Store URLs          │                         │
  │                       │                     │                         │
  │ Upload complete       │                     │                         │
  │<──────────────────────┤                     │                         │
  │                       │                     │                         │
```

## Security Measures

### Authentication
- JWT tokens with configurable expiration (default 7 days)
- Bcrypt password hashing with 10 salt rounds
- Token stored in localStorage (consider httpOnly cookies for production)

### Authorization
- Middleware checks user role for protected routes
- GM routes require `role === 'game_master'`
- Team routes require team ownership verification
- Submission scoring only by GM

### Input Validation
- express-validator on all input
- File type whitelist
- File size limits (10MB)
- SQL injection prevention via parameterized queries

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting (recommended for production)

## Deployment Considerations

### Environment Variables
**Backend:**
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time
- `NODE_ENV` - Environment (development/production)

**Frontend:**
- `VITE_API_URL` - Backend API base URL
- `VITE_SOCKET_URL` - WebSocket server URL
- `VITE_ENV` - Environment identifier

### Production Checklist
- [ ] Use production database with SSL
- [ ] Enable httpOnly cookies for tokens
- [ ] Implement rate limiting
- [ ] Set up HTTPS/TLS
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Database backups configured
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring (e.g., New Relic)
- [ ] Load balancing for scaling

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Lazy loading for non-critical components
- Memoization for expensive calculations
- Virtual scrolling for large lists

### Backend
- Database indexing on foreign keys
- Connection pooling for PostgreSQL
- Caching for frequently accessed data (Redis)
- Compression middleware (gzip)
- Optimize queries (avoid N+1)

### WebSocket
- Room-based broadcasting (not global)
- Throttle high-frequency events
- Connection pooling
- Load balancing with Socket.IO adapter

## Testing Strategy

### Unit Tests
- Model methods
- Utility functions
- Service calculations (metrics)

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### End-to-End Tests
- Complete user flows
- Multi-user scenarios
- Real-time synchronization

### Load Tests
- Concurrent users
- File upload stress
- WebSocket connections
- Database performance

## Future Enhancements

### Features
- [ ] Advanced analytics dashboard for GM
- [ ] Team chat/collaboration
- [ ] Custom challenge templates
- [ ] Historical game replay
- [ ] Mobile native apps
- [ ] AI-powered feedback suggestions
- [ ] Automated game scenarios

### Technical
- [ ] GraphQL API option
- [ ] Redis caching layer
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Real-time collaboration on documents
- [ ] Video conferencing integration

## Support and Maintenance

### Monitoring
- Server uptime
- API response times
- Database performance
- WebSocket connection health
- File upload success rate

### Logging
- Application logs (Winston/Pino)
- Access logs (Morgan)
- Error tracking (Sentry)
- Audit logs for GM actions

### Backup Strategy
- Daily database backups
- File storage backups
- Configuration backups
- Disaster recovery plan

---

For detailed testing procedures, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)
