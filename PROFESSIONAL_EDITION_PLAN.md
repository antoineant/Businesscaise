# BusinessCaise - Professional Edition
## Architecture & Development Plan

### System Overview

**Architecture Type:** Full-Stack Web Application
- **Frontend (Teams):** React + TypeScript (existing app, enhanced)
- **Frontend (Game Master):** React + TypeScript (new admin dashboard)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **Real-time:** Socket.IO (WebSocket)
- **File Storage:** Local filesystem (Phase 1) → AWS S3 (Phase 2)
- **Authentication:** JWT-based auth

---

## Database Schema

### Core Tables

#### `games`
```sql
id UUID PRIMARY KEY
title VARCHAR(255)
description TEXT
game_master_id UUID REFERENCES users(id)
start_date TIMESTAMP
end_date TIMESTAMP
current_session_id UUID REFERENCES sessions(id)
status ENUM('setup', 'active', 'paused', 'completed')
settings JSONB (game configuration)
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### `users`
```sql
id UUID PRIMARY KEY
email VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
role ENUM('game_master', 'player')
name VARCHAR(255)
created_at TIMESTAMP
```

#### `teams`
```sql
id UUID PRIMARY KEY
game_id UUID REFERENCES games(id)
name VARCHAR(255)
color VARCHAR(7)
members JSONB [{name, role: 'finance'|'hr'|'sales'|'product'}]
metrics JSONB (current DepartmentMetrics)
overall_score DECIMAL(5,2)
created_at TIMESTAMP
```

#### `sessions`
```sql
id UUID PRIMARY KEY
game_id UUID REFERENCES games(id)
session_number INT (1-10)
day VARCHAR(10) ('monday', 'tuesday', etc.)
period VARCHAR(10) ('am', 'pm')
title VARCHAR(255)
description TEXT
narrative TEXT
start_time TIMESTAMP
deadline TIMESTAMP
status ENUM('locked', 'active', 'completed')
unlocked_at TIMESTAMP
```

#### `challenges`
```sql
id UUID PRIMARY KEY
session_id UUID REFERENCES sessions(id)
type ENUM('numeric', 'file_upload', 'multiple_choice')
title VARCHAR(255)
description TEXT
order INT
config JSONB (numericConfig, fileConfig, options, etc.)
impacts JSONB (DepartmentImpact[])
required BOOLEAN
```

#### `submissions`
```sql
id UUID PRIMARY KEY
team_id UUID REFERENCES teams(id)
challenge_id UUID REFERENCES challenges(id)
value_numeric DECIMAL
value_text TEXT
value_choice VARCHAR(100)
file_name VARCHAR(255)
file_path VARCHAR(500)
file_size INT
submitted_at TIMESTAMP
gm_score DECIMAL(5,2)
gm_feedback TEXT
scored_at TIMESTAMP
```

#### `metrics_history`
```sql
id UUID PRIMARY KEY
team_id UUID REFERENCES teams(id)
session_id UUID REFERENCES sessions(id)
metrics_before JSONB
metrics_after JSONB
impacts_applied JSONB (DepartmentImpact[])
created_at TIMESTAMP
```

#### `narratives`
```sql
id UUID PRIMARY KEY
game_id UUID REFERENCES games(id)
type ENUM('briefing', 'news', 'email', 'alert')
title VARCHAR(255)
content TEXT
author VARCHAR(100) (NPC name: 'CEO', 'Investor Sarah Chen', etc.)
target_teams UUID[] (null = broadcast to all)
published_at TIMESTAMP
session_id UUID REFERENCES sessions(id)
```

#### `gm_events`
```sql
id UUID PRIMARY KEY
game_id UUID REFERENCES games(id)
event_type ENUM('market_crash', 'viral_success', 'custom')
title VARCHAR(255)
description TEXT
impacts JSONB (DepartmentImpact[] applied to all or specific teams)
target_teams UUID[]
applied_at TIMESTAMP
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login (returns JWT)
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user
```

### Game Master - Game Management
```
POST   /api/gm/games               - Create new game
GET    /api/gm/games               - List all GM's games
GET    /api/gm/games/:id           - Get game details
PUT    /api/gm/games/:id           - Update game
DELETE /api/gm/games/:id           - Delete game
POST   /api/gm/games/:id/start     - Start game
POST   /api/gm/games/:id/pause     - Pause game
POST   /api/gm/games/:id/resume    - Resume game
```

### Game Master - Session Management
```
GET    /api/gm/games/:id/sessions           - List all sessions
POST   /api/gm/games/:id/sessions/:sid/unlock  - Unlock session
PUT    /api/gm/games/:id/sessions/:sid      - Update session
POST   /api/gm/games/:id/sessions/:sid/extend - Extend deadline
```

### Game Master - Team Monitoring
```
GET    /api/gm/games/:id/teams              - List all teams with live metrics
GET    /api/gm/games/:id/teams/:tid         - Get team details
GET    /api/gm/games/:id/teams/:tid/history - Get metrics history
GET    /api/gm/games/:id/submissions        - All submissions
GET    /api/gm/games/:id/submissions/:sid   - Get submission details
POST   /api/gm/submissions/:sid/score       - Score submission (GM manual)
```

### Game Master - Narrative & Events
```
POST   /api/gm/games/:id/narratives         - Create narrative/news
GET    /api/gm/games/:id/narratives         - List narratives
POST   /api/gm/games/:id/events             - Inject custom event
GET    /api/gm/games/:id/events             - List events
```

### Game Master - Results & Analytics
```
GET    /api/gm/games/:id/leaderboard        - Current standings
POST   /api/gm/games/:id/generate-briefing  - Generate results briefing
GET    /api/gm/games/:id/analytics          - Analytics dashboard data
POST   /api/gm/games/:id/export             - Export all data
```

### Teams - Game Participation
```
GET    /api/teams/games/:id/join            - Join game (with code)
GET    /api/teams/current                   - Get current team info
GET    /api/teams/dashboard                 - Get dashboard data
GET    /api/teams/sessions/current          - Get current active session
GET    /api/teams/sessions/:sid/challenges  - Get challenges for session
POST   /api/teams/submit                    - Submit decision
GET    /api/teams/results/latest            - Get latest results briefing
GET    /api/teams/history                   - Get metrics history
```

### WebSocket Events
```
// Server → Client (Teams)
'session:unlocked'      - New session available
'deadline:extended'     - Deadline changed
'results:published'     - New results available
'news:published'        - Breaking news
'metrics:updated'       - Team metrics changed

// Server → Client (GM Dashboard)
'submission:received'   - Team submitted decision
'team:metrics:changed'  - Team metrics updated
'session:completed'     - All teams submitted
```

---

## File Structure

```
businesscase/
├── frontend/              # Team interface (existing React app)
├── admin/                 # GM dashboard (new React app)
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── Game.ts
│   │   │   ├── Team.ts
│   │   │   ├── Session.ts
│   │   │   ├── Challenge.ts
│   │   │   └── Submission.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── gm.controller.ts
│   │   │   └── team.controller.ts
│   │   ├── services/
│   │   │   ├── gameEngine.service.ts
│   │   │   ├── scoring.service.ts
│   │   │   ├── narrative.service.ts
│   │   │   └── results.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── gm.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── gm.routes.ts
│   │   │   └── team.routes.ts
│   │   ├── socket/
│   │   │   └── socket.handler.ts
│   │   ├── utils/
│   │   │   ├── fileUpload.ts
│   │   │   └── email.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── migrations/
│   └── seeds/
└── docker-compose.yml     # PostgreSQL + backend
```

---

## Development Phases

### Phase 1: Backend Foundation (Week 1-2)
**Goal:** Working API with authentication and basic game management

**Tasks:**
1. Set up Express + TypeScript project
2. Set up PostgreSQL database
3. Implement authentication (JWT)
4. Create database migrations
5. Build core models (Game, Team, Session, Challenge, Submission)
6. Implement basic CRUD endpoints
7. Set up WebSocket server
8. File upload handling

**Deliverables:**
- ✅ Backend API running
- ✅ Database schema created
- ✅ GM can create games
- ✅ Teams can join games
- ✅ Basic authentication working

---

### Phase 2: Game Master Dashboard (Week 3-4)
**Goal:** GM can control entire game flow

**Tasks:**
1. Create React admin dashboard (separate from team app)
2. Game creation wizard
3. Session management interface
4. Live team monitoring dashboard
5. Manual session unlocking
6. Submission review interface
7. Scoring interface for creative deliverables
8. Real-time updates via WebSocket

**Deliverables:**
- ✅ GM dashboard functional
- ✅ GM can create and manage games
- ✅ GM can unlock sessions
- ✅ GM can see all team submissions
- ✅ GM can score PDF submissions

---

### Phase 3: Enhanced Team Experience (Week 5)
**Goal:** Teams get immersive narrative experience

**Tasks:**
1. Results briefing display
2. Narrative/news feed integration
3. Results history view
4. Role assignment interface
5. Team collaboration features
6. Notification system
7. Mobile-responsive improvements

**Deliverables:**
- ✅ Teams see rich narrative content
- ✅ Morning briefings displayed
- ✅ News feed working
- ✅ Role-based views

---

### Phase 4: Storytelling & Automation (Week 6)
**Goal:** Automated results generation

**Tasks:**
1. Results briefing template system
2. Automated metric calculations
3. Comparative analytics
4. News feed generator
5. Email integration
6. Template variables and personalization

**Deliverables:**
- ✅ Automated morning briefings
- ✅ Email notifications
- ✅ Rich storytelling content

---

### Phase 4.5: Company Scenario Customization (Week 7)
**Goal:** Context-aware simulation with industry-specific narratives
**Status:** 📝 Design Complete (COMPANY_SCENARIO_CUSTOMIZATION_DESIGN.md)

**Tasks:**
1. **Backend (Week 1):** Database schema, models, API endpoints
   - Create company_archetypes and industry_types tables
   - Seed 5 archetypes and 8 industry types
   - Add scenario columns to games table
   - Update game creation endpoint to accept archetype/industry
   - Create scenario preview endpoint
   - Update team join logic to initialize with archetype metrics

2. **GM Dashboard UI (Week 2):** Scenario selection interface
   - Update CreateGamePage with scenario settings section
   - Build ScenarioPreview component
   - Add archetype and industry dropdown selectors
   - Add optional company name and product customization
   - Update GameDetailsPage to show game scenario
   - Add scenario badges and cards

3. **Team Player UI (Week 2):** Scenario display
   - Create public game info endpoint
   - Update JoinGamePage to show scenario (read-only)
   - Update PlayerGame dashboard with scenario context
   - Add company name and scenario badges to header

4. **Narrative Integration (Week 3):** Scenario-aware templates
   - Create 25+ scenario-specific narrative templates
   - Update NarrativeService with template selection logic
   - Implement variable substitution ({{company_name}}, {{product}})
   - Create industry-specific NPC definitions
   - Test all archetype × industry combinations

5. **Testing & Polish (Week 4):** E2E tests and documentation
   - Unit tests for scenario logic
   - E2E tests for GM scenario selection
   - E2E tests for team joining with scenario
   - Test 10+ archetype/industry combinations
   - GM documentation (how to choose scenarios)

**Deliverables:**
- ⏳ GM selects company archetype and industry when creating game
- ⏳ 5 company archetypes (startup, product launch, turnaround, scale-up, innovation)
- ⏳ 8 industry types (SaaS, e-commerce, food, healthcare, services, education, manufacturing, custom)
- ⏳ Teams inherit scenario from game (no selection)
- ⏳ Starting metrics vary by archetype
- ⏳ Narratives adapt to scenario with 50+ templates
- ⏳ Industry-specific NPCs and challenges
- ⏳ Optional company name and product customization
- ⏳ E2E tests for complete scenario workflow

**Design Highlights:**
- **GM-Controlled:** Like a traditional RPG, GM orchestrates entire scenario
- **Fair Comparison:** All teams face same conditions within a game
- **Flexibility:** GM creates different games for different scenarios
- **Educational Impact:** Better alignment with course objectives (startup course vs. turnaround course)

**Estimated Effort:** 85-107 hours over 4 weeks

---

### Phase 5: Analytics & Reporting (Week 7)
**Goal:** Comprehensive assessment tools

**Tasks:**
1. Advanced scoring algorithms
2. Leaderboard with breakdown
3. Analytics dashboard for GM
4. Export functionality
5. Certificate generation
6. Post-game survey system

**Deliverables:**
- ✅ Complete scoring system
- ✅ Data export
- ✅ Analytics for faculty

---

### Phase 6: Testing & Polish (Week 8)
**Goal:** Production-ready system

**Tasks:**
1. Full 5-day simulation test
2. Load testing
3. UI/UX refinements
4. Documentation
5. Video tutorials
6. Beta testing with pilot school

**Deliverables:**
- ✅ Tested with real users
- ✅ Documentation complete
- ✅ Ready for pilot deployment

---

## Immediate Next Steps

**Right Now:**
1. Create backend project structure
2. Set up PostgreSQL database
3. Create database migrations
4. Build authentication system
5. Create basic API endpoints

**This will give us:**
- Working backend API
- Database ready for game data
- Foundation for GM dashboard

---

## Questions to Answer Before Full Build:

1. **Hosting Preference?**
   - Cloud (AWS/Heroku/DigitalOcean)?
   - Self-hosted?
   - Docker containers?

2. **Database Hosting?**
   - Managed PostgreSQL (AWS RDS, Heroku Postgres)?
   - Self-hosted?

3. **File Storage?**
   - Local filesystem (simple, good for MVP)?
   - AWS S3 (scalable)?
   - Other cloud storage?

4. **Email Service?**
   - SendGrid?
   - AWS SES?
   - Mailgun?
   - Not needed for Phase 1?

5. **Timeline Priority?**
   - Do you need GM dashboard first?
   - Or full 5-day simulation flow first?
   - Or both in parallel?

---

**Ready to proceed with implementation?**

I'll start building the backend infrastructure now!
