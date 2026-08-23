const express = require('express');
const router = express.Router();
const { handleChat, getKnowledgeBaseInfo } = require('../controllers/chatController');

// Chat endpoint
router.post('/chat', handleChat);

// Knowledge base info endpoint
router.get('/knowledge', getKnowledgeBaseInfo);

module.exports = router;
