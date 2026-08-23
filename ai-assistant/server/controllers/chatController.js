const { generateAnswer } = require('../services/geminiService');
const skillBridgeKb = require('../data/knowledgeBase');
const universityKb = require('../data/universityKnowledgeBase');

/**
 * @desc    Process a user question and generate an AI answer
 * @route   POST /api/chat
 * @access  Public
 */
const handleChat = async (req, res, next) => {
  try {
    const { message, portalType, customKnowledgeBase, history } = req.body;

    // 1. Validation: Message existence and type
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string.',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty.',
      });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message exceeds maximum length of 1000 characters.',
      });
    }

    // 2. Select Knowledge Base (SkillBridge, University Demo, or Custom)
    let selectedKb = skillBridgeKb;
    if (portalType === 'university') {
      selectedKb = universityKb;
    } else if (customKnowledgeBase && typeof customKnowledgeBase === 'object') {
      selectedKb = customKnowledgeBase;
    }

    // 3. Generate Answer through Service
    const answer = await generateAnswer(trimmedMessage, selectedKb, history || []);

    // 4. Return standard response payload
    return res.status(200).json({
      success: true,
      answer,
      product: selectedKb.productName,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active knowledge base metadata (for debugging or client UI hints)
 * @route   GET /api/knowledge
 * @access  Public
 */
const getKnowledgeBaseInfo = (req, res) => {
  const { portalType } = req.query;
  const kb = portalType === 'university' ? universityKb : skillBridgeKb;

  res.status(200).json({
    success: true,
    productName: kb.productName,
    tagline: kb.tagline,
    modules: (kb.modules || []).map(m => m.name),
    faqsCount: (kb.faqs || []).length,
    sampleQuestions: (kb.faqs || []).map(f => f.question),
  });
};

module.exports = {
  handleChat,
  getKnowledgeBaseInfo,
};
