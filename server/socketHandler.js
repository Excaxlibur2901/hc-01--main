import { getQueue } from './services/queueService.js';

let ioInstance = null;

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO instance not initialized. Server not started?');
  }
  return ioInstance;
}

export default function socketHandler(io, socket) {
  ioInstance = io;

  // All clients auto-join queue room for updates
  socket.join('queue-room');
  console.log(`Client connected: ${socket.id}`);

  // Join specific rooms on request
  socket.on('join_room', (room) => {
    // Sanitize input
    const sanitizedRoom = String(room).trim();
    if (sanitizedRoom.length === 0 || sanitizedRoom.length > 50) {
      socket.emit('error', { message: 'Invalid room name' });
      return;
    }
    
    const validRooms = ['queue-room', 'doctor-room', 'display-room', 'reception-room'];
    if (validRooms.includes(sanitizedRoom)) {
      socket.join(sanitizedRoom);
      console.log(`${socket.id} joined ${sanitizedRoom}`);
    } else {
      socket.emit('error', { message: 'Invalid room' });
    }
  });

  // Client requests current queue state
  socket.on('request_queue', async () => {
    try {
      const queue = await getQueue();
      socket.emit('queue_updated', queue);
    } catch (error) {
      console.error('Error sending queue:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}
