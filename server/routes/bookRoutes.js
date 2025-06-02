// bookRoutes.js
const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    deleteBooking, 
    updateBookingStatus, 
    requestRefund, 
    getRefundStatus,
    processRefund, 
    allowBooking,    // Added
    recordPayment    // Added
} = require('../controller/bookController');
const { protect, admin } = require('../middleware/authMiddleware'); // Assuming you have an admin middleware


// Protected routes using the 'protect' middleware
router.post('/', protect, createBooking); 
router.get('/', protect, getAllBookings); 
router.get('/:id', protect, getBookingById); 
router.put('/:id', protect, updateBooking); 

// Specific routes for status changes and refund actions
router.put('/:id/cancel', protect, cancelBooking); 
router.put('/:id/status', protect, admin, updateBookingStatus); // Admin action
router.put('/:id/request-refund', protect, requestRefund); 
router.put('/:id/process-refund', protect, admin, processRefund); // Admin action

router.put('/:id/allow', protect, admin, allowBooking); // Admin allows a booking
router.put('/:id/pay', protect, recordPayment);       // User records payment

router.delete('/:id', protect, admin, deleteBooking); // Admin hard delete

router.get('/:id/refund-status', protect, getRefundStatus); 


module.exports = router;