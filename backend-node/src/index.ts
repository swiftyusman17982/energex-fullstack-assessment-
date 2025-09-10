import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { cacheRoutes } from './controllers/cacheController';
import { webSocketRoutes } from './controllers/WebSocketController';
import { RedisService } from './services/RedisService';
import { DatabaseService } from './services/DatabaseService';
import { WebSocketService } from './services/WebSocketService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Routes
app.use('/cache', cacheRoutes);
app.use('/ws', webSocketRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
const redisService = new RedisService();
const databaseService = new DatabaseService();
const webSocketService = new WebSocketService(io);

// Initialize services
async function initializeServices() {
  try {
    await redisService.connect();
    await databaseService.connect();
    
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisService.disconnect();
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisService.disconnect();
  await databaseService.disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeServices();
  
  server.listen(PORT, () => {
    console.log(`🚀 Cache service running on port ${PORT}`);
    console.log(`🔌 WebSocket server running on port ${WS_PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { app, server, io };
