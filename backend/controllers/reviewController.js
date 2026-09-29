const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

const createReview = async (req, res) => {
  const { targetType, targetId, rating, comment } = req.body;
  const existing = await Review.findOne({ author: req.user._id, targetType, targetId });
  if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this' });

  const review = await Review.create({ author: req.user._id, targetType, targetId, rating, comment });
  await review.populate('author', 'name profileImage');

  // Update aggregate rating
  const reviews = await Review.find({ targetType, targetId });
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  if (targetType === 'product') await Product.findByIdAndUpdate(targetId, { rating: avg, totalReviews: reviews.length });
  if (targetType === 'expert') await User.findByIdAndUpdate(targetId, { rating: avg, totalReviews: reviews.length });

  res.status(201).json({ success: true, review });
};

const getReviews = async (req, res) => {
  const { targetType, targetId } = req.query;
  const reviews = await Review.find({ targetType, targetId }).sort({ createdAt: -1 }).populate('author', 'name profileImage');
  res.json({ success: true, reviews });
};

module.exports = { createReview, getReviews };
