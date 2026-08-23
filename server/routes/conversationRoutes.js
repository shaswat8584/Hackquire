const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserConversations,
  getOrCreateDirectConversation,
  getOrCreateTeamConversation,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  getTotalUnreadCount,
} = require('../controllers/conversationController');

// All conversation routes are protected
router.use(protect);

router.get('/', getUserConversations);
router.get('/unread-total', getTotalUnreadCount);
router.post('/direct/:recipientId', getOrCreateDirectConversation);
router.get('/team/:teamId', getOrCreateTeamConversation);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/messages', sendMessage);
router.put('/:id/read', markConversationAsRead);

module.exports = router;
