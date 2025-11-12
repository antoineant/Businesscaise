import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import gmRoutes from './routes/gm.routes';
import teamRoutes from './routes/team.routes';
import uploadRoutes from './routes/upload.routes';
import scenarioRoutes from './routes/scenario.routes';
import podRoutes from './routes/pod.routes';

// Import socket handler
import { initializeSocket } from './socket/socket.handler';

// Create Express app
const app: Express = express();
const httpServer = createServer(app);

// Parse CORS origins (comma-separated string to array)
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

// Log CORS configuration on startup
console.log('🔒 CORS configured for origins:', corsOrigins);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/gm', gmRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/gm', podRoutes); // Pod and category routes (GM-protected)

// Initialize WebSocket handlers
initializeSocket(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500,
    },
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
    ╔══════════════════════════════════════╗
    ║   BusinessCaise Backend Server       ║
    ║   Environment: ${process.env.NODE_ENV?.padEnd(22)}║
    ║   Port: ${PORT.toString().padEnd(29)}║
    ║   Status: Running                    ║
    ╚══════════════════════════════════════╝
  `);
});

export { app, io };
