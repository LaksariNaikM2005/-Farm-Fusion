const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, updateUser, getAllOrders, getAllAppointments, getForumPosts } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const adminOnly = [protect, authorize('admin')];

router.get('/analytics', ...adminOnly, getAnalytics);
router.get('/users', ...adminOnly, getUsers);
router.put('/users/:id', ...adminOnly, updateUser);
router.get('/orders', ...adminOnly, getAllOrders);
router.get('/appointments', ...adminOnly, getAllAppointments);
router.get('/forum', ...adminOnly, getForumPosts);

module.exports = router;
