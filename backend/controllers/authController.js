const User = require('../models/User');
const { generateToken, formatImageUrl } = require('../utils/helpers');

// @route POST /api/v1/auth/register
const register = async (req, res) => {
  const { name, email, password, role, phone, location, specialization, experience, consultationFee } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

  const userData = { name, email, password, role: role || 'farmer', phone, location };
  if (role === 'expert') {
    userData.specialization = specialization;
    userData.experience = experience;
    userData.consultationFee = consultationFee;
  }

  const user = await User.create(userData);
  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user });
};

// @route POST /api/v1/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });

  const token = generateToken(user._id);
  res.json({ success: true, token, user });
};

// @route GET /api/v1/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @route PUT /api/v1/auth/update-profile
const updateProfile = async (req, res) => {
  const updates = { ...req.body };
  delete updates.password;
  delete updates.role;
  delete updates.email;

  if (req.file) updates.profileImage = formatImageUrl(req.file.path);

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, user });
};

// @route PUT /api/v1/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
};

module.exports = { register, login, getMe, updateProfile, changePassword };
