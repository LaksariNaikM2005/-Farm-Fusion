const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const Forum = require('../models/Forum');

// GET /api/v1/admin/analytics
const getAnalytics = async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, totalAppointments] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Appointment.countDocuments(),
  ]);

  const farmers = await User.countDocuments({ role: 'farmer' });
  const experts = await User.countDocuments({ role: 'expert' });

  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  const monthlySales = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }, { $limit: 12 },
  ]);

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('buyer', 'name email');
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');

  res.json({
    success: true,
    stats: { totalUsers, farmers, experts, totalProducts, totalOrders, totalAppointments, revenue: revenueAgg[0]?.total || 0 },
    monthlySales,
    recentOrders,
    recentUsers,
  });
};

// GET /api/v1/admin/users
const getUsers = async (req, res) => {
  const { role, page = 1, limit = 15, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, total });
};

// PUT /api/v1/admin/users/:id
const updateUser = async (req, res) => {
  const { isActive, isVerified, role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive, isVerified, role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// GET /api/v1/admin/orders
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const query = {};
  if (status) query.status = status;
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).populate('buyer', 'name email'),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, total });
};

// GET /api/v1/admin/appointments
const getAllAppointments = async (req, res) => {
  const { page = 1, limit = 15, status } = req.query;
  const query = status ? { status } : {};
  const [appointments, total] = await Promise.all([
    Appointment.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(Number(limit))
      .populate('farmer', 'name email').populate('expert', 'name email specialization'),
    Appointment.countDocuments(query),
  ]);
  res.json({ success: true, appointments, total });
};

// GET /api/v1/admin/forum
const getForumPosts = async (req, res) => {
  const { page = 1, limit = 15 } = req.query;
  const [posts, total] = await Promise.all([
    Forum.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).populate('author', 'name email'),
    Forum.countDocuments(),
  ]);
  res.json({ success: true, posts, total });
};

module.exports = { getAnalytics, getUsers, updateUser, getAllOrders, getAllAppointments, getForumPosts };
