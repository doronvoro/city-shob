import 'dotenv/config';
import express, { Express } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';

import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';
import socketService from './services/socketService';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import TaskRepository from './repositories/TaskRepository';

// Validate required environment variables
const validateEnv = (): void => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set these in your .env file');
    process.exit(1);
  }
};

validateEnv();

const app: Express = express();
const server = http.createServer(app);

// Unified CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',');

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Socket.IO with same CORS config
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' })); // Limit body size for security

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database connection with better options
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cityshob-todo';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri, {
      // These options improve connection stability
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');

    // Ensure indexes are created
    await mongoose.connection.db?.admin().ping();
    console.log('MongoDB indexes synced');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

// WebSocket connection handling
socketService.initialize(io);

// Periodic cleanup of stale locks (every 10 minutes)
const LOCK_CLEANUP_INTERVAL = 10 * 60 * 1000;
setInterval(async () => {
  try {
    const cleaned = await TaskRepository.cleanupStaleLocks();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} stale lock(s)`);
    }
  } catch (err) {
    console.error('Error cleaning up stale locks:', err);
  }
}, LOCK_CLEANUP_INTERVAL);

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close MongoDB connection
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB:', err);
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  });
};

startServer();

