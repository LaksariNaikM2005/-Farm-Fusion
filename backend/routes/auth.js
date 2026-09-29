const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, upload.single('profileImage'), updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
