const mongoose = require('mongoose');

const expertSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    experience: { type: String, required: true },
    rating: { type: Number, default: 0 },
    bio: { type: String, required: true },
    avatar: { type: String, required: true },
    availableSlots: [
      {
        date: { type: String },
        time: { type: String },
        capacity: { type: Number, default: 1 },
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        status: { type: String, enum: ['open', 'closed', 'finalized'], default: 'open' }
      },
    ],
  },
  { timestamps: true }
);

const Expert = mongoose.model('Expert', expertSchema);
module.exports = Expert;
