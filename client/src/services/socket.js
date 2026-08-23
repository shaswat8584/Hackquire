import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  const authToken = token || localStorage.getItem('skillbridge_token');
  if (!authToken) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: authToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket.io] Connected with socket ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.io Connection Warning]', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversationRoom = (conversationId) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('join_conversation', conversationId);
  }
};

export const leaveConversationRoom = (conversationId) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('leave_conversation', conversationId);
  }
};

export const emitTypingStart = (conversationId) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('typing_start', { conversationId });
  }
};

export const emitTypingStop = (conversationId) => {
  const s = getSocket();
  if (s && conversationId) {
    s.emit('typing_stop', { conversationId });
  }
};
