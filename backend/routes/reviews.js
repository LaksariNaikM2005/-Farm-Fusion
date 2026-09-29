const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.get('/', getReviews);
router.post('/', protect, createReview);

module.exports = router;
