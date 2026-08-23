import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { conversationAPI } from '../services/api';
import {
  getSocket,
  initSocket,
  joinConversationRoom,
  leaveConversationRoom,
  emitTypingStart,
  emitTypingStop,
} from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const activeIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const typingTimeoutRef = useRef(null);


  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingConversations(true);
      const [convRes, unreadRes] = await Promise.all([
        conversationAPI.getConversations(),
        conversationAPI.getTotalUnread(),
      ]);

      if (convRes.data && convRes.data.conversations) {
        setConversations(convRes.data.conversations);
      }
      if (unreadRes.data && typeof unreadRes.data.totalUnread === 'number') {
        setTotalUnreadCount(unreadRes.data.totalUnread);
      }
    } catch (err) {
      console.error('[ChatContext Fetch Error]', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setConversations([]);
      setActiveConversationId(null);
      setMessages([]);
      setTotalUnreadCount(0);
      setOnlineUserIds([]);
      setTypingUsers([]);
    }
  }, [isAuthenticated, fetchConversations]);

  // Socket Connection & Real-Time Listeners
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = initSocket(token);
    if (!socket) return;

    // Handle initial online users list
    socket.on('online_users', (userIds) => {
      setOnlineUserIds(userIds || []);
    });

    // Handle presence changes
    socket.on('user_presence_change', (data) => {
      if (data && data.onlineUserIds) {
        setOnlineUserIds(data.onlineUserIds);
      }
    });

    // Handle incoming messages
    socket.on('receive_message', ({ conversationId, message }) => {
      if (!conversationId || !message) return;

      const currentActiveId = activeIdRef.current;

      if (currentActiveId && currentActiveId.toString() === conversationId.toString()) {
        // Active chat: append message directly
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });

        // Automatically mark as read if message is from someone else
        if (message.sender?._id?.toString() !== user?._id?.toString()) {
          conversationAPI.markAsRead(conversationId).catch(() => {});
        }
      } else {
        // Inactive chat: increment total unread count if from another user
        if (message.sender?._id?.toString() !== user?._id?.toString()) {
          setTotalUnreadCount((prev) => prev + 1);
        }
      }

      // Update conversations sidebar list preview & unread count
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id.toString() === conversationId.toString());
        if (index === -1) {
          // If conversation is brand new, refresh list
          fetchConversations();
          return prev;
        }

        const updatedConv = { ...prev[index] };
        updatedConv.lastMessage = message;
        updatedConv.lastMessageAt = message.createdAt || new Date();

        if (
          (!currentActiveId || currentActiveId.toString() !== conversationId.toString()) &&
          message.sender?._id?.toString() !== user?._id?.toString()
        ) {
          updatedConv.unreadCount = (updatedConv.unreadCount || 0) + 1;
        }

        const newList = [...prev];
        newList.splice(index, 1);
        newList.unshift(updatedConv);
        return newList;
      });
    });

    // Handle conversation updates
    socket.on('conversation_updated', ({ conversationId, lastMessage, lastMessageAt }) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id.toString() === conversationId.toString());
        if (index === -1) {
          fetchConversations();
          return prev;
        }
        const updatedConv = { ...prev[index], lastMessage, lastMessageAt };
        const newList = [...prev];
        newList.splice(index, 1);
        newList.unshift(updatedConv);
        return newList;
      });
    });

    // Handle typing indicators
    socket.on('user_typing', ({ conversationId, userId: typingId, name }) => {
      if (typingId !== user?._id?.toString()) {
        setTypingUsers((prev) => {
          if (prev.some((t) => t.userId === typingId && t.conversationId === conversationId)) {
            return prev;
          }
          return [...prev, { conversationId, userId: typingId, name }];
        });
      }
    });

    socket.on('user_stop_typing', ({ conversationId, userId: typingId }) => {
      setTypingUsers((prev) =>
        prev.filter((t) => !(t.userId === typingId && t.conversationId === conversationId))
      );
    });

    // Handle read receipts
    socket.on('messages_marked_read', ({ conversationId, userId: readerId, readAt }) => {
      if (activeIdRef.current === conversationId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (!msg.readBy?.some((r) => r.user?._id?.toString() === readerId || r.user === readerId)) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), { user: readerId, readAt }],
              };
            }
            return msg;
          })
        );
      }
    });

    return () => {
      socket.off('online_users');
      socket.off('user_presence_change');
      socket.off('receive_message');
      socket.off('conversation_updated');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('messages_marked_read');
    };
  }, [isAuthenticated, token, user, fetchConversations]);

  // Select and load a conversation
  const selectConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      setActiveConversationId(null);
      setMessages([]);
      return;
    }

    if (activeIdRef.current && activeIdRef.current !== conversationId) {
      leaveConversationRoom(activeIdRef.current);
    }

    setActiveConversationId(conversationId);
    joinConversationRoom(conversationId);

    // Reset unread count for this conversation in UI
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id.toString() === conversationId.toString()) {
          if (c.unreadCount > 0) {
            setTotalUnreadCount((total) => Math.max(0, total - c.unreadCount));
          }
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );

    // Mark as read on server
    conversationAPI.markAsRead(conversationId).catch(() => {});

    try {
      setLoadingMessages(true);
      const res = await conversationAPI.getMessages(conversationId);
      if (res.data && res.data.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('[Load Messages Error]', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Start or open direct 1-on-1 chat
  const startDirectChat = async (recipientId) => {
    try {
      const res = await conversationAPI.getOrCreateDirect(recipientId);
      if (res.data && res.data.conversation) {
        const conv = res.data.conversation;
        setConversations((prev) => {
          if (!prev.some((c) => c._id.toString() === conv._id.toString())) {
            return [conv, ...prev];
          }
          return prev;
        });
        await selectConversation(conv._id);
        return conv;
      }
    } catch (err) {
      console.error('[Start Direct Chat Error]', err);
      throw err;
    }
  };

  // Open team squad group chat
  const openTeamChat = async (teamId) => {
    try {
      const res = await conversationAPI.getOrCreateTeam(teamId);
      if (res.data && res.data.conversation) {
        const conv = res.data.conversation;
        setConversations((prev) => {
          if (!prev.some((c) => c._id.toString() === conv._id.toString())) {
            return [conv, ...prev];
          }
          return prev;
        });
        await selectConversation(conv._id);
        return conv;
      }
    } catch (err) {
      console.error('[Open Team Chat Error]', err);
      throw err;
    }
  };

  // Send a message
  const sendMessage = async (text, attachments = []) => {
    if (!activeConversationId || !text.trim()) return;

    try {
      setSendingMessage(true);
      emitTypingStop(activeConversationId);

      const res = await conversationAPI.sendMessage(activeConversationId, {
        text: text.trim(),
        attachments,
      });

      if (res.data && res.data.message) {
        const savedMessage = res.data.message;
        setMessages((prev) => {
          if (prev.some((m) => m._id === savedMessage._id)) return prev;
          return [...prev, savedMessage];
        });
        return savedMessage;
      }
    } catch (err) {
      console.error('[Send Message Error]', err);
      throw err;
    } finally {
      setSendingMessage(false);
    }
  };

  // Typing helper with auto-debounce stop
  const sendTypingNotification = () => {
    if (!activeConversationId) return;

    emitTypingStart(activeConversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (activeConversationId) {
        emitTypingStop(activeConversationId);
      }
    }, 2500);
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUserIds.includes(userId.toString());
  };

  const activeConversation = conversations.find(
    (c) => c._id.toString() === activeConversationId?.toString()
  );

  const activeTypingUsers = typingUsers.filter(
    (t) => t.conversationId === activeConversationId
  );

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        totalUnreadCount,
        onlineUserIds,
        activeTypingUsers,
        loadingConversations,
        loadingMessages,
        sendingMessage,
        fetchConversations,
        selectConversation,
        startDirectChat,
        openTeamChat,
        sendMessage,
        sendTypingNotification,
        isUserOnline,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
