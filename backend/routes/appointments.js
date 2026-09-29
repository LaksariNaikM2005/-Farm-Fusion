const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments, updateStatus, addFeedback, getAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, authorize('farmer'), bookAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id/status', protect, authorize('expert', 'admin'), updateStatus);
router.post('/:id/feedback', protect, authorize('farmer'), addFeedback);

module.exports = router;
