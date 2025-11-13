# BusinessCaise Backend API

Professional backend API for the BusinessCaise business simulation game platform. Built with Node.js, Express, TypeScript, PostgreSQL, and Socket.IO for real-time updates.

## ✨ Features

### Core Functionality
- **JWT Authentication** - Secure user authentication with role-based access control (Game Master/Player)
- **Game Management** - Complete CRUD operations for game sessions
- **Team Operations** - Team creation, metrics tracking, and decision submissions
- **Session Control** - Manual/scheduled unlocking, deadline management
- **Submission Scoring** - Manual GM scoring with sophisticated metrics calculation
- **Real-time Updates** - WebSocket notifications for all major game events
- **File Uploads** - Support for PDFs, Office documents, and images
- **Metrics System** - Multi-dimensional scoring across 5 business areas
- **Leaderboard** - Dynamic ranking with weighted scoring formula

### Architecture
- **RESTful API** - Clean endpoint structure following REST principles
- **MVC Pattern** - Separated concerns with Models, Controllers, and Routes
- **Service Layer** - Business logic isolated in service modules
- **Middleware Chain** - Authentication, validation, error handling
- **WebSocket Rooms** - Isolated real-time communication channels
- **TypeScript** - Full type safety across the codebase

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **File Upload**: Multer
- **Security**: Helmet, bcryptjs
- **Performance**: Compression

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── auth.ts      # JWT and password utilities
│   │   └── database.ts  # PostgreSQL connection pool
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── gm.controller.ts
│   │   └── team.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/          # Database models
│   │   ├── User.model.ts
│   │   ├── Game.model.ts
│   │   ├── Team.model.ts
│   │   ├── Session.model.ts
│   │   └── Submission.model.ts
│   ├── routes/          # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── gm.routes.ts
│   │   ├── team.routes.ts
│   │   └── upload.routes.ts
│   ├── services/        # Business logic
│   │   └── metrics.service.ts
│   ├── socket/          # WebSocket handlers
│   │   └── socket.handler.ts
│   └── server.ts        # Express app initialization
├── migrations/          # Database migrations
│   └── 001_initial_schema.sql
├── uploads/            # File storage (gitignored)
├── .env.example        # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🏃 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Docker (optional, for containerized database)

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL** (using Docker):
   ```bash
   cd ..
   docker-compose up -d
   ```

4. **Run migrations**:
   ```bash
   npm run migrate:up
   ```

5. **Build TypeScript**:
   ```bash
   npm run build
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`.

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=businesscase
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "game_master" | "player"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Game Master Endpoints

All GM endpoints require authentication and Game Master role.

#### Create Game
```http
POST /api/gm/games
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Spring 2024 Business Challenge",
  "description": "Week-long intensive simulation",
  "settings": {}
}
```

Creates a game with automatic 10-session structure (Monday-Friday, AM/PM).

#### List Games
```http
GET /api/gm/games
Authorization: Bearer {token}
```

#### Get Game Details
```http
GET /api/gm/games/{gameId}
Authorization: Bearer {token}
```

#### Start Game
```http
POST /api/gm/games/{gameId}/start
Authorization: Bearer {token}
```

#### Unlock Session
```http
POST /api/gm/games/{gameId}/sessions/{sessionId}/unlock
Authorization: Bearer {token}
```

#### Score Submission
```http
POST /api/gm/submissions/{submissionId}/score
Authorization: Bearer {token}
Content-Type: application/json

{
  "score": 85,
  "feedback": "Excellent strategic thinking!"
}
```

#### Get Leaderboard
```http
GET /api/gm/games/{gameId}/leaderboard
Authorization: Bearer {token}
```

#### Get Analytics
```http
GET /api/gm/games/{gameId}/analytics
Authorization: Bearer {token}
```

### Team Endpoints

#### Join Game
```http
POST /api/teams/join
Content-Type: application/json

{
  "game_id": "uuid",
  "team_name": "The Innovators",
  "color": "#3B82F6",
  "members": ["Alice", "Bob", "Charlie"]
}
```

#### Get Dashboard
```http
GET /api/teams/{teamId}/dashboard
Authorization: Bearer {token}
```

#### Submit Decision
```http
POST /api/teams/{teamId}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "session_id": "uuid",
  "challenge_id": "marketing-1",
  "submission_data": { "budget": 50000, "channels": ["social", "tv"] },
  "file_urls": ["http://example.com/uploads/proposal.pdf"]
}
```

#### Get Leaderboard
```http
GET /api/teams/{teamId}/leaderboard
Authorization: Bearer {token}
```

### File Upload Endpoint

```http
POST /api/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [file1, file2, ...]
game_id: uuid
team_id: uuid
```

Accepts up to 5 files (10MB each). Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG.

## 🔄 WebSocket Events

Connect to Socket.IO server at `http://localhost:3001`.

### Client → Server Events

```javascript
// Join rooms
socket.emit('join:game', gameId);
socket.emit('join:team', teamId, teamData);
socket.emit('join:gm', gameId);

// Real-time collaboration
socket.emit('team:typing', { teamId, memberId });
socket.emit('decision:draft', { teamId, challengeId, draftData });

// Connection monitoring
socket.emit('ping', (response) => {
  console.log(response.timestamp);
});
```

### Server → Client Events

```javascript
// Game events
socket.on('game:status_changed', (data) => {
  // { status: 'active', game: {...}, timestamp: '...' }
});

socket.on('session:unlocked', (data) => {
  // { session: {...}, timestamp: '...' }
});

// Team events
socket.on('submission:scored', (data) => {
  // { submission_id, score, feedback, metrics, overall_score, timestamp }
});

socket.on('metrics:updated', (data) => {
  // { metrics: {financial, hr, ...}, timestamp }
});

socket.on('leaderboard:updated', (data) => {
  // { leaderboard: [{rank, team_id, team_name, overall_score}], timestamp }
});

// GM events
socket.on('submission:received', (data) => {
  // { submission_id, team_id, team_name, session_id, timestamp }
});

socket.on('team:joined', (data) => {
  // { team: {...}, timestamp }
});
```

## 📊 Metrics System

### Five Business Dimensions
- **Financial** (0-100): Revenue, profitability, cash flow
- **HR** (0-100): Employee satisfaction, retention, productivity
- **Market Communication** (0-100): Brand awareness, market position
- **Operations** (0-100): Efficiency, quality, process optimization
- **Customer Satisfaction** (0-100): NPS, retention, service quality

### Scoring Formula
```
Overall Score = Financial × 0.4 + HR × 0.3 + Market Communication × 0.3
```

### Challenge-Specific Impacts
- **Marketing**: High impact on Market Communication (1.5x), moderate on Customer Satisfaction (0.8x)
- **Finance**: High impact on Financial (1.5x), moderate on Operations (0.7x)
- **HR**: High impact on HR (1.5x), moderate on Operations (0.6x)
- **Strategy**: Balanced impact across all dimensions (0.5-0.8x)

### Timing Bonuses
- **Early submission** (>50% time remaining): +2 bonus points
- **On-time submission**: No bonus/penalty
- **Late submission**: -5 penalty points

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run migrate:up   # Run database migrations
npm run migrate:down # Rollback migrations
```

### Adding New Endpoints

1. **Create model** (if new entity)
2. **Create controller** with asyncHandler
3. **Define routes** with validation
4. **Register routes** in server.ts

## 🗄️ Database Schema

### Main Tables
- **users**: User accounts and authentication
- **games**: Game sessions managed by Game Masters
- **teams**: Teams participating in games
- **sessions**: 10 sessions per game (5 days × AM/PM)
- **challenges**: Business challenges within sessions
- **submissions**: Team decisions submitted for scoring
- **metrics_history**: Historical metrics for trend analysis
- **narratives**: Game Master storytelling and briefings
- **gm_events**: Custom events injected by GM

See `migrations/001_initial_schema.sql` for complete schema.

## 🔒 Security

- **Password hashing**: bcrypt with salt rounds = 10
- **JWT expiration**: 7 days (configurable)
- **CORS**: Restricted to frontend origin
- **Helmet**: Security headers enabled
- **Input validation**: All endpoints validated
- **SQL injection**: Parameterized queries only
- **File uploads**: Type and size restrictions
- **Role-based access**: Middleware enforcement

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -i :3001
kill -9 <PID>
```

### Database Connection Failed
- Check PostgreSQL is running
- Verify credentials in `.env`
- Check firewall settings

### TypeScript Errors
```bash
rm -rf dist/
npm run build
```

## 🚀 Production Deployment

### Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Use managed PostgreSQL (AWS RDS, etc.)
- [ ] Set up file storage (AWS S3, etc.)
- [ ] Configure process manager (PM2)
- [ ] Set up SSL/TLS certificates
- [ ] Enable logging (Winston, Morgan)
- [ ] Set up monitoring (Datadog, New Relic)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### PM2 Configuration
```bash
pm2 start dist/server.js --name businesscase-api -i max
pm2 save
pm2 startup
```

## 📄 License

Proprietary - All rights reserved.

## 📞 Support

For issues and questions, please contact the development team or open an issue in the repository.
