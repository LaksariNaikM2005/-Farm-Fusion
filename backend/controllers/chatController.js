const Message = require('../models/Message');
const User = require('../models/User');
const { generateConversationId } = require('../utils/helpers');

// GET /api/v1/chat/conversations — all conversations for current user
const getConversations = async (req, res) => {
  const userId = req.user._id.toString();

  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
  }).sort({ createdAt: -1 });

  const convMap = new Map();
  for (const msg of messages) {
    const cId = msg.conversationId;
    if (!convMap.has(cId)) convMap.set(cId, msg);
  }

  const conversations = await Promise.all(
    Array.from(convMap.values()).map(async (msg) => {
      const otherId = msg.sender.toString() === userId ? msg.receiver : msg.sender;
      const other = await User.findById(otherId).select('name profileImage role isAvailable');
      const unread = await Message.countDocuments({ conversationId: msg.conversationId, receiver: req.user._id, read: false });
      return { conversationId: msg.conversationId, lastMessage: msg, participant: other, unreadCount: unread };
    })
  );

  res.json({ success: true, conversations });
};

// GET /api/v1/chat/:conversationId — messages in conversation
const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))
    .populate('sender', 'name profileImage');

  // Mark as read
  await Message.updateMany({ conversationId, receiver: req.user._id, read: false }, { read: true });

  res.json({ success: true, messages: messages.reverse() });
};

// POST /api/v1/chat/send — send message (REST fallback, Socket preferred)
const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const conversationId = generateConversationId(req.user._id, receiverId);
  const message = await Message.create({ sender: req.user._id, receiver: receiverId, content, conversationId });
  const populated = await message.populate('sender', 'name profileImage');
  res.status(201).json({ success: true, message: populated });
};

// GET /api/v1/chat/conversation-id/:userId — get conversation ID with a user
const getConversationId = async (req, res) => {
  const conversationId = generateConversationId(req.user._id, req.params.userId);
  res.json({ success: true, conversationId });
};

module.exports = { getConversations, getMessages, sendMessage, getConversationId };
