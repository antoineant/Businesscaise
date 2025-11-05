# BusinessCaise Backend API

Backend server for the BusinessCaise Professional Edition - A Game Master-controlled business simulation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OR Docker & Docker Compose

### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run database migrations
npm run migrate:up

# Start development server
npm run dev
```

### Option 2: Local PostgreSQL

```bash
# Install dependencies
npm install

# Set up PostgreSQL database
createdb businesscaise

# Configure .env file with your database credentials
cp .env.example .env
# Edit .env with your settings

# Run database migrations
npm run migrate:up

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── socket/          # WebSocket handlers
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── migrations/          # Database migrations
├── uploads/             # File uploads (gitignored)
└── dist/                # Compiled TypeScript (gitignored)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Game Master Routes
- `POST /api/gm/games` - Create game
- `GET /api/gm/games` - List games
- `GET /api/gm/games/:id` - Get game details
- `POST /api/gm/games/:id/start` - Start game
- `POST /api/gm/games/:gameId/sessions/:sessionId/unlock` - Unlock session
- `GET /api/gm/games/:id/teams` - Monitor teams
- `POST /api/gm/submissions/:id/score` - Score submission
- `POST /api/gm/games/:id/narratives` - Create narrative
- `GET /api/gm/games/:id/leaderboard` - Get leaderboard

### Team Routes
- `POST /api/teams/join` - Join game
- `GET /api/teams/dashboard` - Get dashboard
- `GET /api/teams/sessions/current` - Get current session
- `POST /api/teams/submit` - Submit decision
- `GET /api/teams/results/latest` - Get results

## 🔄 WebSocket Events

### Client → Server
- `join:game` - Join game room
- `join:team` - Join team room
- `join:gm` - Join GM monitoring room

### Server → Client (Teams)
- `session:unlocked` - New session available
- `deadline:extended` - Deadline changed
- `results:published` - New results available
- `news:published` - Breaking news
- `metrics:updated` - Team metrics changed

### Server → Client (GM)
- `submission:received` - Team submitted
- `team:metrics:changed` - Metrics updated
- `session:completed` - All teams submitted

## 🗄️ Database Schema

See `migrations/001_initial_schema.sql` for complete schema.

**Main Tables:**
- `users` - Game Masters and Players
- `games` - Game sessions
- `teams` - Teams in games
- `sessions` - 10 milestone sessions per game
- `challenges` - Decisions within sessions
- `submissions` - Team submissions
- `metrics_history` - Track metric changes
- `narratives` - Story content and news

## 🔧 Development

```bash
# Start dev server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Environment Variables

Required environment variables for production:

```env
PORT=3001
NODE_ENV=production
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=businesscaise
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment

```bash
# Build Docker image
docker build -t businesscaise-backend .

# Run container
docker run -p 3001:3001 --env-file .env businesscaise-backend
```

## 📝 API Documentation

Full API documentation will be generated using Swagger/OpenAPI (Phase 2).

## 🛡️ Security

- JWT authentication
- Helmet.js security headers
- CORS configuration
- Password hashing with bcrypt
- SQL injection prevention (parameterized queries)
- File upload validation

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Database connection monitoring
- WebSocket connection tracking

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License
