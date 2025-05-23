// bookRoutes.js
const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    deleteBooking, // Added
    updateBookingStatus, // Added
    requestRefund, // Added
    getRefundStatus,
    processRefund, // Added
} = require('../controller/bookController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware


// Protected routes using the 'protect' middleware
router.post('/', protect, createBooking); // Create a new booking
router.get('/', protect, getAllBookings); // Get all bookings (can add logic in controller to filter by user or admin)
router.get('/:id', protect, getBookingById); // Get booking by unique booking_id string
router.put('/:id', protect, updateBooking); // Update booking details by unique booking_id string

// Specific routes for status changes and refund actions
router.put('/:id/cancel', protect, cancelBooking); // Cancel a booking
router.put('/:id/status', protect, updateBookingStatus); // Update booking status (Admin action)
router.put('/:id/request-refund', protect, requestRefund); // Request a refund
router.put('/:id/process-refund', protect, processRefund); // Process a refund (Admin action)

router.delete('/:id', protect, deleteBooking); // Delete a booking (Admin hard delete)

router.get('/:id/refund-status', protect, getRefundStatus); // Check refund status by unique booking_id string


module.exports = router;