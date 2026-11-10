
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from '../prisma';

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
      
      // Notify others in room
      socket.to(roomId).emit('user-joined', { userId });
    });

    socket.on('send-message', async ({ roomId, userId, content }) => {
      try {
        // Persist to DB
        const message = await prisma.message.create({
          data: {
            content,
            roomId,
            authorId: userId
          },
          include: { author: { select: { displayName: true } } }
        });

        // Broadcast to room
        io.to(roomId).emit('new-message', message);
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on('leave-room', ({ roomId, userId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
