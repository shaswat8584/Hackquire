const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Team = require('../models/Team');
const User = require('../models/User');
const { emitToConversation, emitToUser } = require('../services/socketService');

// @desc    Get all conversations for the current user
// @route   GET /api/conversations
// @access  Private
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find conversations where user is participant or team member
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email profileImage skills bio preferredRoles availability experienceLevel')
      .populate({
        path: 'team',
        select: 'name description opportunity owner members requiredRoles',
        populate: [
          { path: 'owner', select: 'name email profileImage' },
          { path: 'members.user', select: 'name email profileImage' },
        ],
      })
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name profileImage' },
      })
      .sort({ lastMessageAt: -1 });

    const formattedConversations = conversations.map((conv) => {
      const convObj = conv.toObject();
      const unreadItem = conv.unreadCounts?.find(
        (u) => u.user.toString() === userId.toString()
      );
      convObj.unreadCount = unreadItem ? unreadItem.count : 0;
      return convObj;
    });

    res.json({
      success: true,
      count: formattedConversations.length,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error('[Get Conversations Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching conversations' });
  }
};

// @desc    Get or create a 1-on-1 direct conversation with a recipient student
// @route   POST /api/conversations/direct/:recipientId
// @access  Private
const getOrCreateDirectConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { recipientId } = req.params;

    if (userId.toString() === recipientId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot create conversation with yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient student not found' });
    }

    // Look for existing direct conversation
    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [userId, recipientId], $size: 2 },
    })
      .populate('participants', 'name email profileImage skills bio preferredRoles availability experienceLevel')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name profileImage' },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [userId, recipientId],
        unreadCounts: [
          { user: userId, count: 0 },
          { user: recipientId, count: 0 },
        ],
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email profileImage skills bio preferredRoles availability experienceLevel');
    }

    const convObj = conversation.toObject();
    const unreadItem = convObj.unreadCounts?.find(
      (u) => u.user.toString() === userId.toString()
    );
    convObj.unreadCount = unreadItem ? unreadItem.count : 0;

    res.json({ success: true, conversation: convObj });
  } catch (error) {
    console.error('[Get/Create Direct Conv Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error initializing direct conversation' });
  }
};

// @desc    Get or create a team squad discussion channel
// @route   GET /api/conversations/team/:teamId
// @access  Private
const getOrCreateTeamConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate('owner members.user');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify user is owner or accepted member
    const isOwner = team.owner._id.toString() === userId.toString();
    const isMember = (team.members || []).some(
      (m) => m.user?._id?.toString() === userId.toString() && m.status === 'accepted'
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ success: false, message: 'Only accepted team members can access team chat' });
    }

    // Gather all participant user IDs
    const participantIds = [team.owner._id];
    (team.members || []).forEach((m) => {
      if (m.status === 'accepted' && m.user) {
        const memberIdStr = m.user._id.toString();
        if (!participantIds.some((id) => id.toString() === memberIdStr)) {
          participantIds.push(m.user._id);
        }
      }
    });

    let conversation = await Conversation.findOne({
      type: 'team',
      team: teamId,
    })
      .populate('participants', 'name email profileImage skills bio preferredRoles availability experienceLevel')
      .populate({
        path: 'team',
        select: 'name description opportunity owner members requiredRoles',
        populate: [
          { path: 'owner', select: 'name email profileImage' },
          { path: 'members.user', select: 'name email profileImage' },
        ],
      })
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name profileImage' },
      });

    if (!conversation) {
      const unreadCounts = participantIds.map((id) => ({ user: id, count: 0 }));
      conversation = await Conversation.create({
        type: 'team',
        team: teamId,
        participants: participantIds,
        unreadCounts,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email profileImage skills bio preferredRoles availability experienceLevel')
        .populate({
          path: 'team',
          select: 'name description opportunity owner members requiredRoles',
          populate: [
            { path: 'owner', select: 'name email profileImage' },
            { path: 'members.user', select: 'name email profileImage' },
          ],
        });
    } else {
      // Sync participants if team roster changed
      const existingIds = conversation.participants.map((p) => p._id.toString());
      let updated = false;
      participantIds.forEach((id) => {
        if (!existingIds.includes(id.toString())) {
          conversation.participants.push(id);
          conversation.unreadCounts.push({ user: id, count: 0 });
          updated = true;
        }
      });
      if (updated) {
        await conversation.save();
      }
    }

    const convObj = conversation.toObject();
    const unreadItem = convObj.unreadCounts?.find(
      (u) => u.user.toString() === userId.toString()
    );
    convObj.unreadCount = unreadItem ? unreadItem.count : 0;

    res.json({ success: true, conversation: convObj });
  } catch (error) {
    console.error('[Get/Create Team Conv Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error initializing team conversation' });
  }
};

// @desc    Get message history for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages in this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email profileImage')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('[Get Messages Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching messages' });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;
    const { text, attachments } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized to post to this conversation' });
    }

    // Create and save message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      text: text.trim(),
      attachments: attachments || [],
      readBy: [{ user: userId, readAt: new Date() }],
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name email profileImage'
    );

    // Update conversation lastMessage & lastMessageAt
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    // Increment unread count for other participants
    conversation.participants.forEach((pId) => {
      if (pId.toString() !== userId.toString()) {
        const unreadEntry = conversation.unreadCounts.find(
          (u) => u.user.toString() === pId.toString()
        );
        if (unreadEntry) {
          unreadEntry.count += 1;
        } else {
          conversation.unreadCounts.push({ user: pId, count: 1 });
        }
      }
    });

    await conversation.save();

    // Real-time broadcast to conversation room
    emitToConversation(conversationId, 'receive_message', {
      conversationId,
      message: populatedMessage,
    });

    // Notify each participant's user room of conversation update / new message preview
    conversation.participants.forEach((pId) => {
      emitToUser(pId, 'conversation_updated', {
        conversationId,
        lastMessage: populatedMessage,
        lastMessageAt: conversation.lastMessageAt,
      });
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error('[Send Message Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error sending message' });
  }
};

// @desc    Mark conversation as read by current user
// @route   PUT /api/conversations/:id/read
// @access  Private
const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Reset unread count for current user
    const unreadEntry = conversation.unreadCounts.find(
      (u) => u.user.toString() === userId.toString()
    );
    if (unreadEntry) {
      unreadEntry.count = 0;
      await conversation.save();
    }

    // Add read receipt to messages that haven't been read by this user
    await Message.updateMany(
      {
        conversation: conversationId,
        'readBy.user': { $ne: userId },
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } },
      }
    );

    // Notify conversation room of read update
    emitToConversation(conversationId, 'messages_marked_read', {
      conversationId,
      userId,
      readAt: new Date(),
    });

    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    console.error('[Mark Read Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error marking conversation as read' });
  }
};

// @desc    Get total unread messages count for active user
// @route   GET /api/conversations/unread-total
// @access  Private
const getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    });

    let totalUnread = 0;
    conversations.forEach((conv) => {
      const entry = conv.unreadCounts?.find(
        (u) => u.user.toString() === userId.toString()
      );
      if (entry && entry.count > 0) {
        totalUnread += entry.count;
      }
    });

    res.json({ success: true, totalUnread });
  } catch (error) {
    console.error('[Get Total Unread Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Error calculating unread count' });
  }
};

module.exports = {
  getUserConversations,
  getOrCreateDirectConversation,
  getOrCreateTeamConversation,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  getTotalUnreadCount,
};
