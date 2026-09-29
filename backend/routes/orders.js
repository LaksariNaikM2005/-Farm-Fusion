const express = require('express');
const router = express.Router();
const { createCheckoutSession, getOrders, getOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/checkout-session', protect, authorize('farmer'), createCheckoutSession);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

module.exports = router;
