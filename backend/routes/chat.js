const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, getConversationId } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');

router.get('/conversations', protect, getConversations);
router.get('/conversation-id/:userId', protect, getConversationId);
router.get('/:conversationId', protect, getMessages);
router.post('/send', protect, sendMessage);

module.exports = router;
