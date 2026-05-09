const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { sendBookingEmail } = require('../utils/mailer');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { expert, name, email, phone, date, timeSlot, notes } = req.body;
  const userId = req.user._id;

  try {
    // Atomic: only push if slot exists, is open, and user hasn't already booked it.
    const reserved = await Expert.findOneAndUpdate(
      {
        _id: expert,
        availableSlots: {
          $elemMatch: { date, time: timeSlot, status: 'open', participants: { $ne: userId } },
        },
      },
      { $push: { 'availableSlots.$.participants': userId } },
      { new: true }
    );

    if (!reserved) {
      // Distinguish "already booked" vs "slot not bookable" for a clearer message.
      const expertData = await Expert.findById(expert);
      if (!expertData) return res.status(404).json({ message: 'Expert not found' });
      const slot = expertData.availableSlots.find(s => s.date === date && s.time === timeSlot);
      if (!slot) return res.status(400).json({ message: 'Slot not found' });
      if (slot.participants.some(p => p.toString() === userId.toString())) {
        return res.status(400).json({ message: 'You have already booked this slot' });
      }
      return res.status(400).json({ message: `This slot is ${slot.status}` });
    }

    const updatedSlot = reserved.availableSlots.find(s => s.date === date && s.time === timeSlot);

    // Capacity check after the atomic push: if we overshot, roll back.
    if (updatedSlot.participants.length > updatedSlot.capacity) {
      await Expert.updateOne(
        { _id: expert },
        { $pull: { 'availableSlots.$[s].participants': userId } },
        { arrayFilters: [{ 's.date': date, 's.time': timeSlot }] }
      );
      return res.status(400).json({ message: 'This slot is full' });
    }

    let createdBooking;
    try {
      createdBooking = await Booking.create({
        user: userId, expert, name, email, phone, date, timeSlot, notes,
      });
    } catch (err) {
      // Booking save failed — release the seat so the user isn't stuck.
      await Expert.updateOne(
        { _id: expert },
        { $pull: { 'availableSlots.$[s].participants': userId } },
        { arrayFilters: [{ 's.date': date, 's.time': timeSlot }] }
      );
      throw err;
    }

    sendBookingEmail(email, { expert: reserved, date, timeSlot })
      .catch(mailError => console.error('Failed to send booking email:', mailError.message));

    if (req.io) {
      req.io.emit('bookingUpdate', {
        expert, date, timeSlot, participantsCount: updatedSlot.participants.length,
      });
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      'expert',
      'name avatar category'
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('expert', 'name').populate('user', 'name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.status = req.body.status || booking.status;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization: only the owner or an admin can delete
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to cancel this booking' });
    }

    // Try to update Expert participants list, but don't fail the whole request if it's an old booking
    try {
      const expert = await Expert.findById(booking.expert);
      if (expert && expert.availableSlots) {
        const slotIndex = expert.availableSlots.findIndex(
          s => s.date === booking.date && (s.time === booking.timeSlot || s === booking.timeSlot)
        );

        if (slotIndex !== -1) {
          expert.availableSlots[slotIndex].participants = (expert.availableSlots[slotIndex].participants || []).filter(
            p => p && p.toString() !== booking.user.toString()
          );
          await expert.save();
          
          if (req.io) {
            req.io.emit('bookingUpdate', { 
              expert: expert._id, 
              date: booking.date, 
              timeSlot: booking.timeSlot, 
              participantsCount: expert.availableSlots[slotIndex].participants.length 
            });
          }
        }
      }
    } catch (err) {
      console.error('Expert participant removal failed:', err);
      // We continue anyway so the user can at least remove their booking
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: `Cancellation failed: ${error.message}` });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};
