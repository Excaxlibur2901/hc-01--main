import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

import socketHandler from './socketHandler.js';
import tokenRoutes from './routes/tokenRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://hc01staxoverflow-bpd4gij1p-vipulpahirrao200-9819s-projects.vercel.app'
    ],
    credentials: true,
  })
);

// Routes
app.use('/api/tokens', tokenRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/emergency', emergencyRoutes);

// Optional test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://hc01staxoverflow-bpd4gij1p-vipulpahirrao200-9819s-projects.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});

// Handle socket connections
io.on('connection', (socket) => {
  socketHandler(io, socket);
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});