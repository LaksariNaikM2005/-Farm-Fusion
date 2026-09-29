const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendNotification } = require('../config/socket');

let io;
const setIO = (socketIO) => { io = socketIO; };

// POST /api/v1/appointments — Farmer books
const bookAppointment = async (req, res) => {
  const { expert, date, timeSlot, topic, description, type, duration } = req.body;
  const expertUser = await User.findById(expert);
  if (!expertUser || expertUser.role !== 'expert') {
    return res.status(404).json({ success: false, message: 'Expert not found' });
  }

  // Check for time conflicts
  const conflict = await Appointment.findOne({
    expert, date: new Date(date), timeSlot,
    status: { $in: ['pending', 'accepted'] },
  });
  if (conflict) return res.status(400).json({ success: false, message: 'This time slot is already booked' });

  const appointment = await Appointment.create({
    farmer: req.user._id, expert, date: new Date(date), timeSlot,
    topic, description, type, duration, fee: expertUser.consultationFee,
  });

  const notif = await Notification.create({
    user: expert, type: 'appointment',
    title: 'New Consultation Request',
    message: `${req.user.name} has requested a consultation on "${topic}"`,
    link: `/expert/appointments/${appointment._id}`,
  });
  if (io) sendNotification(io, expert.toString(), notif);

  const populated = await appointment.populate(['farmer', 'expert']);
  res.status(201).json({ success: true, appointment: populated });
};

// GET /api/v1/appointments — list for current user
const getAppointments = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (req.user.role === 'farmer') filter.farmer = req.user._id;
  else if (req.user.role === 'expert') filter.expert = req.user._id;
  if (status) filter.status = status;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(Number(limit))
      .populate('farmer', 'name email phone profileImage location')
      .populate('expert', 'name email specialization consultationFee profileImage'),
    Appointment.countDocuments(filter),
  ]);
  res.json({ success: true, appointments, total });
};

// PUT /api/v1/appointments/:id/status — Expert accepts/rejects
const updateStatus = async (req, res) => {
  const { status, meetLink, notes } = req.body;
  const appointment = await Appointment.findById(req.params.id).populate('farmer expert');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  if (appointment.expert._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  appointment.status = status;
  if (meetLink) appointment.meetLink = meetLink;
  if (notes) appointment.notes = notes;
  await appointment.save();

  const notif = await Notification.create({
    user: appointment.farmer._id, type: 'appointment',
    title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your appointment with ${appointment.expert.name} has been ${status}`,
    link: `/farmer/appointments`,
  });
  if (io) sendNotification(io, appointment.farmer._id.toString(), notif);

  res.json({ success: true, appointment });
};

// POST /api/v1/appointments/:id/feedback — Farmer rates after completion
const addFeedback = async (req, res) => {
  const { rating, feedback } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  if (appointment.farmer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  appointment.rating = rating;
  appointment.feedback = feedback;
  appointment.status = 'completed';
  await appointment.save();

  // Update expert rating
  const allRated = await Appointment.find({ expert: appointment.expert, rating: { $exists: true } });
  const avgRating = allRated.reduce((sum, a) => sum + a.rating, 0) / allRated.length;
  await User.findByIdAndUpdate(appointment.expert, { rating: avgRating, totalReviews: allRated.length });

  res.json({ success: true, appointment });
};

// GET /api/v1/appointments/:id
const getAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('farmer', 'name email phone profileImage location')
    .populate('expert', 'name email specialization consultationFee profileImage rating');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, appointment });
};

module.exports = { bookAppointment, getAppointments, updateStatus, addFeedback, getAppointment, setIO };
