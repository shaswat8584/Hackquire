const Connection = require('../models/Connection');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { emitToUser } = require('../services/socketService');

// @desc    Send a connection / friend request to a student
// @route   POST /api/connections/request/:recipientId
// @access  Private
const sendConnectionRequest = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { recipientId } = req.params;

    if (requesterId.toString() === recipientId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send a connection request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient student not found' });
    }

    // Check if an existing connection exists in either direction
    let existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'You are already connected with this student' });
      }
      if (existingConnection.status === 'pending') {
        if (existingConnection.requester.toString() === requesterId.toString()) {
          return res.status(400).json({ success: false, message: 'Connection request already sent and pending' });
        } else {
          // If the other user already sent a request, automatically accept it
          existingConnection.status = 'accepted';
          await existingConnection.save();

          // Create or find direct conversation
          let conversation = await Conversation.findOne({
            type: 'direct',
            participants: { $all: [requesterId, recipientId], $size: 2 },
          });

          if (!conversation) {
            conversation = await Conversation.create({
              type: 'direct',
              participants: [requesterId, recipientId],
              unreadCounts: [
                { user: requesterId, count: 0 },
                { user: recipientId, count: 0 },
              ],
            });
          }

          emitToUser(recipientId, 'connection_accepted', {
            connectionId: existingConnection._id,
            peer: req.user,
            conversationId: conversation._id,
          });

          return res.json({
            success: true,
            message: 'Mutual connection request accepted!',
            connection: existingConnection,
            status: 'accepted',
            conversationId: conversation._id,
          });
        }
      }

      // If rejected earlier, reset to pending
      if (existingConnection.status === 'rejected') {
        existingConnection.requester = requesterId;
        existingConnection.recipient = recipientId;
        existingConnection.status = 'pending';
        await existingConnection.save();

        const populated = await Connection.findById(existingConnection._id)
          .populate('requester', 'name email profileImage skills bio preferredRoles experienceLevel availability')
          .populate('recipient', 'name email profileImage skills bio preferredRoles experienceLevel availability');

        emitToUser(recipientId, 'connection_request', {
          connection: populated,
        });

        return res.json({
          success: true,
          message: 'Connection request sent successfully',
          connection: populated,
          status: 'pending_sent',
        });
      }
    }

    // Create fresh connection request
    const newConnection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    const populated = await Connection.findById(newConnection._id)
      .populate('requester', 'name email profileImage skills bio preferredRoles experienceLevel availability')
      .populate('recipient', 'name email profileImage skills bio preferredRoles experienceLevel availability');

    // Notify recipient in real-time via Socket.IO
    emitToUser(recipientId, 'connection_request', {
      connection: populated,
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      connection: populated,
      status: 'pending_sent',
    });
  } catch (error) {
    console.error('[Send Connection Request Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error sending connection request' });
  }
};

// @desc    Accept a connection / friend request
// @route   PUT /api/connections/:id/accept
// @access  Private
const acceptConnectionRequest = async (req, res) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user._id;

    const connection = await Connection.findById(connectionId)
      .populate('requester', 'name email profileImage skills bio preferredRoles experienceLevel availability')
      .populate('recipient', 'name email profileImage skills bio preferredRoles experienceLevel availability');

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (connection.recipient._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this request' });
    }

    connection.status = 'accepted';
    await connection.save();

    // Ensure direct 1-on-1 conversation channel is ready
    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [connection.requester._id, connection.recipient._id], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [connection.requester._id, connection.recipient._id],
        unreadCounts: [
          { user: connection.requester._id, count: 0 },
          { user: connection.recipient._id, count: 0 },
        ],
      });
    }

    // Real-time socket notification to requester
    emitToUser(connection.requester._id, 'connection_accepted', {
      connectionId: connection._id,
      peer: req.user,
      conversationId: conversation._id,
    });

    res.json({
      success: true,
      message: 'Connection request accepted',
      connection,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('[Accept Connection Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error accepting connection request' });
  }
};

// @desc    Reject / decline a connection request
// @route   PUT /api/connections/:id/reject
// @access  Private
const rejectConnectionRequest = async (req, res) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user._id;

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (connection.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request' });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({ success: true, message: 'Connection request declined' });
  } catch (error) {
    console.error('[Reject Connection Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error declining connection request' });
  }
};

// @desc    Cancel an outgoing pending connection request
// @route   DELETE /api/connections/:id/cancel
// @access  Private
const cancelConnectionRequest = async (req, res) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user._id;

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (connection.requester.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this request' });
    }

    await Connection.findByIdAndDelete(connectionId);
    res.json({ success: true, message: 'Connection request cancelled' });
  } catch (error) {
    console.error('[Cancel Connection Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error cancelling request' });
  }
};

// @desc    Remove an existing friend connection
// @route   DELETE /api/connections/:id
// @access  Private
const removeConnection = async (req, res) => {
  try {
    const connectionId = req.params.id;
    const userId = req.user._id;

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    if (
      connection.requester.toString() !== userId.toString() &&
      connection.recipient.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this connection' });
    }

    await Connection.findByIdAndDelete(connectionId);
    res.json({ success: true, message: 'Connection removed successfully' });
  } catch (error) {
    console.error('[Remove Connection Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error removing connection' });
  }
};

// @desc    Get all connections for current user (accepted, pending incoming, pending outgoing)
// @route   GET /api/connections
// @access  Private
const getMyConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const allConnections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
    })
      .populate('requester', 'name email profileImage skills bio preferredRoles experienceLevel availability')
      .populate('recipient', 'name email profileImage skills bio preferredRoles experienceLevel availability')
      .sort({ updatedAt: -1 });

    const accepted = [];
    const pendingIncoming = [];
    const pendingOutgoing = [];

    allConnections.forEach((conn) => {
      if (conn.status === 'accepted') {
        const isRequester = conn.requester._id.toString() === userId.toString();
        const peer = isRequester ? conn.recipient : conn.requester;
        accepted.push({
          connectionId: conn._id,
          peer,
          connectedAt: conn.updatedAt,
        });
      } else if (conn.status === 'pending') {
        if (conn.recipient._id.toString() === userId.toString()) {
          pendingIncoming.push({
            connectionId: conn._id,
            requester: conn.requester,
            requestedAt: conn.createdAt,
          });
        } else {
          pendingOutgoing.push({
            connectionId: conn._id,
            recipient: conn.recipient,
            requestedAt: conn.createdAt,
          });
        }
      }
    });

    res.json({
      success: true,
      data: {
        accepted,
        pendingIncoming,
        pendingOutgoing,
        counts: {
          accepted: accepted.length,
          pendingIncoming: pendingIncoming.length,
          pendingOutgoing: pendingOutgoing.length,
        },
      },
    });
  } catch (error) {
    console.error('[Get My Connections Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching connections' });
  }
};

// @desc    Get connection status map for rapid UI lookup
// @route   GET /api/connections/statuses
// @access  Private
const getConnectionStatuses = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
    });

    const statusMap = {};

    connections.forEach((conn) => {
      const isRequester = conn.requester.toString() === userId.toString();
      const peerId = isRequester ? conn.recipient.toString() : conn.requester.toString();

      if (conn.status === 'accepted') {
        statusMap[peerId] = { status: 'accepted', connectionId: conn._id };
      } else if (conn.status === 'pending') {
        statusMap[peerId] = {
          status: isRequester ? 'pending_sent' : 'pending_received',
          connectionId: conn._id,
        };
      } else if (conn.status === 'rejected') {
        statusMap[peerId] = { status: 'rejected', connectionId: conn._id };
      }
    });

    res.json({ success: true, statusMap });
  } catch (error) {
    console.error('[Get Connection Statuses Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching connection statuses' });
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getMyConnections,
  getConnectionStatuses,
};
