const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

// Same user can't book the same slot twice. Multiple users can share a slot up to its capacity.
bookingSchema.index({ user: 1, expert: 1, date: 1, timeSlot: 1 }, { unique: true });
bookingSchema.index({ expert: 1, date: 1, timeSlot: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
