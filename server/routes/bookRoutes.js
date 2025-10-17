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
const { verifyToken, admin } = require('../middleware/authMiddleware'); // Assuming you have an admin middleware


// verifyTokened routes using the 'verifyToken' middleware
router.post('/', verifyToken, createBooking); 
router.get('/', verifyToken, getAllBookings); 
router.get('/:id', verifyToken, getBookingById); 
router.put('/:id', verifyToken, updateBooking); 

// Specific routes for status changes and refund actions
router.put('/:id/cancel', verifyToken, cancelBooking); 
router.put('/:id/status', verifyToken, admin, updateBookingStatus); // Admin action
router.put('/:id/request-refund', verifyToken, requestRefund); 
router.put('/:id/process-refund', verifyToken, admin, processRefund); // Admin action

router.put('/:id/allow', verifyToken, admin, allowBooking); // Admin allows a booking
router.put('/:id/pay', verifyToken, recordPayment);       // User records payment

router.delete('/:id', verifyToken, admin, deleteBooking); // Admin hard delete

router.get('/:id/refund-status', verifyToken, getRefundStatus); 


module.exports = router;