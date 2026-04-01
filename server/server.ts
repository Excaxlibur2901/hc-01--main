import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

import connectDB from './config/database.js';
import socketHandler from './socketHandler.js';
import tokenRoutes from './routes/tokenRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

// Allowed frontend origins
cconst allowedOrigins: string[] = [
  'http://localhost:5173',
  process.env.CORS_ORIGIN || '',
].filter((origin): origin is string => Boolean(origin));

// Socket.IO setup
const io = new SocketServer(server, {
  path: '/socket.io',
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Express middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/emergency', emergencyRoutes);

// Socket connections
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socketHandler(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} | Reason: ${reason}`);
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server after DB connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🏥 Server running on port ${PORT}`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    process.exit(0);
  });
});

export { io };