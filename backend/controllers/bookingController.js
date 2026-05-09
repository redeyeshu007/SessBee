const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { sendBookingEmail } = require('../utils/mailer');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { expert, name, email, phone, date, timeSlot, notes } = req.body;

  try {
    const expertData = await Expert.findById(expert);
    if (!expertData) {
      return res.status(404).json({ message: 'Expert not found' });
    }

    const slotIndex = expertData.availableSlots.findIndex(
      s => s.date === date && s.time === timeSlot
    );

    if (slotIndex === -1) {
      return res.status(400).json({ message: 'Slot not found' });
    }

    const slot = expertData.availableSlots[slotIndex];

    if (slot.status !== 'open') {
      return res.status(400).json({ message: `This slot is ${slot.status}` });
    }

    if (slot.participants.length >= slot.capacity) {
      return res.status(400).json({ message: 'This slot is full' });
    }

    // Check if user already booked this slot
    if (slot.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You have already booked this slot' });
    }

    // Register participant in Expert model
    expertData.availableSlots[slotIndex].participants.push(req.user._id);
    await expertData.save();

    const booking = new Booking({
      user: req.user._id,
      expert,
      name,
      email,
      phone,
      date,
      timeSlot,
      notes,
    });

    const createdBooking = await booking.save();
    
    // Send confirmation email
    try {
      await sendBookingEmail(email, {
        expert: expertData,
        date,
        timeSlot
      });
    } catch (mailError) {
      console.error('Failed to send booking email:', mailError);
    }

    // Emit socket event for real-time update
    if (req.io) {
      req.io.emit('bookingUpdate', { expert, date, timeSlot, participantsCount: slot.participants.length });
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
