const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['seeds', 'fertilizers', 'pesticides', 'tools', 'machinery', 'organic', 'irrigation', 'other'],
      required: true,
    },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'kg' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
