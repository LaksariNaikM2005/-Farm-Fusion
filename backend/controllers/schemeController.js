const Scheme = require('../models/Scheme');

const getSchemes = async (req, res) => {
  const { category, state, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (state) query.state = { $in: [state, 'All India'] };
  const [schemes, total] = await Promise.all([
    Scheme.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Scheme.countDocuments(query),
  ]);
  res.json({ success: true, schemes, total });
};

const createScheme = async (req, res) => {
  const scheme = await Scheme.create({ ...req.body, addedBy: req.user._id });
  res.status(201).json({ success: true, scheme });
};

const updateScheme = async (req, res) => {
  const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.json({ success: true, scheme });
};

const deleteScheme = async (req, res) => {
  await Scheme.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Scheme removed' });
};

module.exports = { getSchemes, createScheme, updateScheme, deleteScheme };
