import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import socketHandler from './socketHandler.js';
import tokenRoutes from './routes/tokenRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Middleware ──
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use('/api/tokens', tokenRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/emergency', emergencyRoutes);

// ── Error Handling ──
app.use(notFoundHandler);
app.use(errorHandler);

// ── Socket.IO ──
io.on('connection', (socket) => {
  socketHandler(io, socket);
});

// ── Start ── (FIXED: Added .catch() + process error handlers)
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`\n🏥 Hospital Queue Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   CORS Origin: ${CORS_ORIGIN}`);
      console.log(`   API: http://localhost:${PORT}/api\n`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('💥 Server startup failed. Exiting...');
    process.exit(1);
  });

// Process error handlers (CRITICAL for production)
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🔴 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received (Ctrl+C). Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

export { io };
