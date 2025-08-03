import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const socketAuth = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    socket.userId = decoded.id;
    
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

export const initializeSocketIO = (io: Server) => {
  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.userId} connected`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle joining conversation rooms
    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending messages
    socket.on('message:send', async (data: {
      conversationId: string;
      receiverId: string;
      content: string;
    }) => {
      try {
        // Emit to receiver
        io.to(`user:${data.receiverId}`).emit('message:new', {
          conversationId: data.conversationId,
          senderId: socket.userId,
          content: data.content,
          timestamp: new Date(),
        });

        // Emit to conversation room
        socket.to(`conversation:${data.conversationId}`).emit('message:new', {
          conversationId: data.conversationId,
          senderId: socket.userId,
          content: data.content,
          timestamp: new Date(),
        });

        logger.info(`Message sent from ${socket.userId} to ${data.receiverId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:user', {
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:user', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // Handle message read status
    socket.on('message:read', (data: { messageId: string; senderId: string }) => {
      io.to(`user:${data.senderId}`).emit('message:read:update', {
        messageId: data.messageId,
        readBy: socket.userId,
        readAt: new Date(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected`);
    });
  });

  // Utility function to emit notifications
  const emitNotification = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('notification:new', notification);
  };

  // Utility function to emit booking updates
  const emitBookingUpdate = (userId: string, booking: any) => {
    io.to(`user:${userId}`).emit('booking:update', booking);
  };

  return {
    io,
    emitNotification,
    emitBookingUpdate,
  };
};
