import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectionAPI } from '../services/api';
import { getSocket, initSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const ConnectionContext = createContext(null);

export const ConnectionProvider = ({ children }) => {
  const { isAuthenticated, token, user } = useAuth();

  const [connections, setConnections] = useState({
    accepted: [],
    pendingIncoming: [],
    pendingOutgoing: [],
    counts: { accepted: 0, pendingIncoming: 0, pendingOutgoing: 0 },
  });
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchConnections = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [connRes, statusRes] = await Promise.all([
        connectionAPI.getMyConnections(),
        connectionAPI.getConnectionStatuses(),
      ]);

      if (connRes.data && connRes.data.data) {
        setConnections(connRes.data.data);
      }
      if (statusRes.data && statusRes.data.statusMap) {
        setStatusMap(statusRes.data.statusMap);
      }
    } catch (err) {
      console.error('[ConnectionContext Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConnections();
    } else {
      setConnections({
        accepted: [],
        pendingIncoming: [],
        pendingOutgoing: [],
        counts: { accepted: 0, pendingIncoming: 0, pendingOutgoing: 0 },
      });
      setStatusMap({});
    }
  }, [isAuthenticated, fetchConnections]);

  // Socket real-time listeners for friend connections
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = initSocket(token);
    if (!socket) return;

    const handleConnectionRequest = (data) => {
      if (data && data.connection) {
        setNotification({
          type: 'request',
          message: `${data.connection.requester.name} sent you a connection request!`,
          data: data.connection,
        });
        fetchConnections();
      }
    };

    const handleConnectionAccepted = (data) => {
      if (data) {
        setNotification({
          type: 'accepted',
          message: `${data.peer?.name || 'A student'} accepted your connection request!`,
          data,
        });
        fetchConnections();
      }
    };

    socket.on('connection_request', handleConnectionRequest);
    socket.on('connection_accepted', handleConnectionAccepted);

    return () => {
      socket.off('connection_request', handleConnectionRequest);
      socket.off('connection_accepted', handleConnectionAccepted);
    };
  }, [isAuthenticated, token, fetchConnections]);

  const sendRequest = async (recipientId) => {
    try {
      const res = await connectionAPI.sendRequest(recipientId);
      if (res.data && res.data.success) {
        setStatusMap((prev) => ({
          ...prev,
          [recipientId]: {
            status: res.data.status || 'pending_sent',
            connectionId: res.data.connection?._id,
          },
        }));
        fetchConnections();
        return { success: true, message: res.data.message, conversationId: res.data.conversationId };
      }
      return { success: false, message: 'Failed to send request' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error sending request';
      return { success: false, message: msg };
    }
  };

  const acceptRequest = async (connectionId) => {
    try {
      const res = await connectionAPI.acceptRequest(connectionId);
      if (res.data && res.data.success) {
        fetchConnections();
        return { success: true, conversationId: res.data.conversationId };
      }
      return { success: false, message: 'Failed to accept request' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error accepting request';
      return { success: false, message: msg };
    }
  };

  const rejectRequest = async (connectionId) => {
    try {
      const res = await connectionAPI.rejectRequest(connectionId);
      if (res.data && res.data.success) {
        fetchConnections();
        return { success: true };
      }
      return { success: false, message: 'Failed to decline request' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error declining request';
      return { success: false, message: msg };
    }
  };

  const cancelRequest = async (connectionId) => {
    try {
      const res = await connectionAPI.cancelRequest(connectionId);
      if (res.data && res.data.success) {
        fetchConnections();
        return { success: true };
      }
      return { success: false, message: 'Failed to cancel request' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error cancelling request';
      return { success: false, message: msg };
    }
  };

  const removeConnection = async (connectionId) => {
    try {
      const res = await connectionAPI.removeConnection(connectionId);
      if (res.data && res.data.success) {
        fetchConnections();
        return { success: true };
      }
      return { success: false, message: 'Failed to remove connection' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Error removing connection';
      return { success: false, message: msg };
    }
  };

  const getConnectionStatus = (peerUserId) => {
    if (!peerUserId) return 'none';
    const entry = statusMap[peerUserId.toString()];
    return entry ? entry.status : 'none';
  };

  const getConnectionId = (peerUserId) => {
    if (!peerUserId) return null;
    const entry = statusMap[peerUserId.toString()];
    return entry ? entry.connectionId : null;
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        statusMap,
        loading,
        notification,
        clearNotification: () => setNotification(null),
        fetchConnections,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        removeConnection,
        getConnectionStatus,
        getConnectionId,
        pendingIncomingCount: connections.counts.pendingIncoming,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
