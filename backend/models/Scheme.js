const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    benefits: { type: String, default: '' },
    howToApply: { type: String, default: '' },
    deadline: { type: Date },
    link: { type: String, default: '' },
    category: {
      type: String,
      enum: ['subsidy', 'loan', 'insurance', 'training', 'equipment', 'crop_support', 'market', 'other'],
      default: 'other',
    },
    state: { type: String, default: 'All India' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
