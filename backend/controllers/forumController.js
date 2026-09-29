const Forum = require('../models/Forum');
const { paginate } = require('../utils/helpers');

// GET /api/v1/forum
const getPosts = async (req, res) => {
  const { page, limit, category, search, sort } = req.query;
  const { skip, limit: lim, page: pg } = paginate(page, limit, 10);

  const query = { isActive: true };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const sortBy = sort === 'popular' ? { 'likes': -1 } : sort === 'views' ? { views: -1 } : { createdAt: -1 };

  const [posts, total] = await Promise.all([
    Forum.find(query).sort({ isPinned: -1, ...sortBy }).skip(skip).limit(lim)
      .populate('author', 'name profileImage role').select('-comments'),
    Forum.countDocuments(query),
  ]);
  res.json({ success: true, posts, total, page: pg, pages: Math.ceil(total / lim) });
};

// GET /api/v1/forum/:id
const getPost = async (req, res) => {
  const post = await Forum.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
    .populate('author', 'name profileImage role')
    .populate('comments.author', 'name profileImage role');
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, post });
};

// POST /api/v1/forum
const createPost = async (req, res) => {
  const images = req.files ? req.files.map((f) => f.path) : [];
  const post = await Forum.create({ ...req.body, images, author: req.user._id });
  await post.populate('author', 'name profileImage role');
  res.status(201).json({ success: true, post });
};

// PUT /api/v1/forum/:id/like
const toggleLike = async (req, res) => {
  const post = await Forum.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  const idx = post.likes.indexOf(req.user._id);
  if (idx === -1) post.likes.push(req.user._id);
  else post.likes.splice(idx, 1);
  await post.save();
  res.json({ success: true, likes: post.likes.length, liked: idx === -1 });
};

// POST /api/v1/forum/:id/comment
const addComment = async (req, res) => {
  const post = await Forum.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  post.comments.push({ author: req.user._id, content: req.body.content });
  await post.save();
  await post.populate('comments.author', 'name profileImage role');
  res.status(201).json({ success: true, comments: post.comments });
};

// DELETE /api/v1/forum/:id (admin or author)
const deletePost = async (req, res) => {
  const post = await Forum.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  post.isActive = false;
  await post.save();
  res.json({ success: true, message: 'Post removed' });
};

module.exports = { getPosts, getPost, createPost, toggleLike, addComment, deletePost };
