// bookRoutes.js
const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getRefundStatus,
} = require('../controller/bookController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware


// Protected routes using the 'protect' middleware
router.post('/', protect, createBooking); // Create a new booking
router.get('/', protect, getAllBookings); // Get all bookings (can add logic in controller to filter by user or admin)
router.get('/:id', protect, getBookingById); // Get booking by unique booking_id string
router.put('/:id', protect, updateBooking); // Update booking details by unique booking_id string
router.delete('/:id', protect, deleteBooking); // Delete a booking by unique booking_id string
router.get('/:id/refund-status', protect, getRefundStatus); // Check refund status by unique booking_id string


// Example of a public route (if any) - none in this set based on previous discussion
// router.get('/public', getPublicBookings);


module.exports = router;
