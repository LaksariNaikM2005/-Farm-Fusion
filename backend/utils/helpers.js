const generateToken = (id) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const generateConversationId = (userId1, userId2) => {
  const sorted = [userId1.toString(), userId2.toString()].sort();
  return sorted.join('_');
};

const paginate = (page, limit, defaultLimit = 12) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || defaultLimit;
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

const formatImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  return `${backendUrl}/${path.replace(/\\/g, '/')}`;
};

module.exports = { generateToken, generateConversationId, paginate, formatImageUrl };
