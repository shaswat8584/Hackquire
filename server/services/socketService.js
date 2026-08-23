const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;
// Map of userId -> Set of socketIds (support multiple tabs/windows per user)
const userSocketsMap = new Map();

const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('Authentication error: Token missing'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillbridge_jwt_secret_key_2026_super_secure_key');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('[Socket Auth Error]', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track online user sockets
    if (!userSocketsMap.has(userId)) {
      userSocketsMap.set(userId, new Set());
    }
    userSocketsMap.get(userId).add(socket.id);

    // Join personal user room for direct alerts & unread badges
    socket.join(`user_${userId}`);

    // Broadcast user presence
    io.emit('user_presence_change', {
      userId,
      status: 'online',
      onlineUserIds: Array.from(userSocketsMap.keys()),
    });

    // Provide initial list of online users to connected client
    socket.emit('online_users', Array.from(userSocketsMap.keys()));

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
      }
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // Typing start indicator
    socket.on('typing_start', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          conversationId,
          userId,
          name: socket.user.name,
        });
      }
    });

    // Typing stop indicator
    socket.on('typing_stop', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
          conversationId,
          userId,
        });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      const userSockets = userSocketsMap.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          userSocketsMap.delete(userId);
          // Broadcast offline status if no active sockets remain for user
          io.emit('user_presence_change', {
            userId,
            status: 'offline',
            onlineUserIds: Array.from(userSocketsMap.keys()),
          });
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId.toString()}`).emit(event, data);
  }
};

const emitToConversation = (conversationId, event, data) => {
  if (io && conversationId) {
    io.to(`conversation_${conversationId.toString()}`).emit(event, data);
  }
};

const getOnlineUserIds = () => {
  return Array.from(userSocketsMap.keys());
};

module.exports = {
  initSocketServer,
  getIO,
  emitToUser,
  emitToConversation,
  getOnlineUserIds,
};
