const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createBooking).get(protect, admin, getAllBookings);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id/status').patch(protect, admin, updateBookingStatus);
router.route('/:id').delete(protect, deleteBooking);

module.exports = router;
