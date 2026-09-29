const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    duration: { type: Number, default: 30 }, // minutes
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    type: { type: String, enum: ['video', 'chat', 'farm_visit'], default: 'video' },
    meetLink: { type: String, default: '' },
    topic: { type: String, required: true },
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    feedback: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5 },
    fee: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
