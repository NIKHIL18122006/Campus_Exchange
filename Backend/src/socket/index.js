import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { verifyToken } from '../services/token.js';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientOrigin },
  });

  // Runs once per connection attempt, before it is accepted
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('AUTH_REQUIRED'));

      const payload = verifyToken(token);
      const result = await query(
        'SELECT id FROM users WHERE id = $1 AND is_verified = TRUE',
        [payload.sub]
      );
      if (result.rows.length === 0) return next(new Error('AUTH_INVALID'));

      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('AUTH_INVALID'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`);
  });

  return io;
}

export function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}