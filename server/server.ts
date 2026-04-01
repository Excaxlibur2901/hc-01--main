import express, { Express, Request, Response, NextFunction } from 'express';
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

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

interface ServerToClientEvents {
  queue_updated: (queue: any[]) => void;
  token_created: (token: any) => void;
  patient_called: (token: any) => void;
  consultation_complete: (token: any) => void;
}

interface ClientToServerEvents {
  join_room: (room: string) => void;
  request_queue: () => void;
}

const io = new SocketServer<ServerToClientEvents, ClientToServerEvents>(server, {
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
app.get('/api/health', (req: Request, res: Response) => {
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

// ── Start ──
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🏥 Hospital Queue Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   CORS Origin: ${CORS_ORIGIN}`);
    console.log(`   API: http://localhost:${PORT}/api\n`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

export { io };

