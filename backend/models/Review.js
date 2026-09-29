const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['product', 'expert'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    images: [{ type: String }],
  },
  { timestamps: true }
);

reviewSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
