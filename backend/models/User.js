const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['farmer', 'expert', 'admin'], default: 'farmer' },
    profileImage: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    // Expert-specific fields
    specialization: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    languages: [{ type: String }],
    notifications: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
