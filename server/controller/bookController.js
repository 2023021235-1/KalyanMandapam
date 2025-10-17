// bookController.js
const { get } = require('mongoose');
const Booking = require('../models/bookModel');
const Hall = require('../models/hallModel');

// --- Helper Functions ---

/**
 * Generates a unique, timestamp-based ID for a new booking.
 */
const generateUniqueId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
};

/**
 * Updates a hall's availability array when a booking is confirmed or cancelled.
 */
const updateHallAvailability = async (hallId, bookingDate, bookingId, markAsBooked) => {
    const hall = await Hall.findById(hallId);
    if (!hall) return;

    const normalizedDate = new Date(bookingDate);
    normalizedDate.setUTCHours(0, 0, 0, 0);
    const dateString = normalizedDate.toISOString().split('T')[0];

    // Find the index of the availability detail for the specific date
    const availabilityIndex = hall.availability_details.findIndex(
        (detail) => detail.date.toISOString().split('T')[0] === dateString
    );

    if (markAsBooked) {
        // If marking as booked, add or update the entry
        if (availabilityIndex > -1) {
            hall.availability_details[availabilityIndex].status = 'booked';
            hall.availability_details[availabilityIndex].booking_id = bookingId;
        } else {
            // Note: 'floor' is hardcoded to 1 as it's no longer a variable in the new model.
            hall.availability_details.push({ date: normalizedDate, floor: 1, status: 'booked', booking_id: bookingId });
        }
    } else { 
        // If un-booking (e.g., cancellation), remove the entry
        if (availabilityIndex > -1 && hall.availability_details[availabilityIndex].booking_id?.toString() === bookingId.toString()) {
            hall.availability_details.splice(availabilityIndex, 1);
        }
    }
    await hall.save();
};


// --- Core Controller Functions ---

/**
 * @desc    Create a new booking application
 * @route   POST /api/bookings
 * @access  Private (Authenticated User)
 */
const createBooking = async (req, res) => {
  try {
    const { hall_id, booking_date } = req.body;

    if (!hall_id || !booking_date) {
        return res.status(400).json({ message: 'Please provide a Hall and a Booking Date.' });
    }

    const hall = await Hall.findById(hall_id);
    if (!hall) {
        return res.status(404).json({ message: 'Hall not found.' });
    }

    const desiredDate = new Date(booking_date);
    desiredDate.setUTCHours(0, 0, 0, 0);
    
    // Check if the slot is already booked in the hall's availability details
    const isSlotBooked = hall.availability_details.some(
        (detail) => detail.date.toISOString().split('T')[0] === desiredDate.toISOString().split('T')[0] && detail.status === 'booked'
    );
    if (isSlotBooked) {
        return res.status(400).json({ message: 'This hall is already booked for the selected date.' });
    }

    // Check if the same user already has a pending or confirmed booking for this hall and date
    const existingUserBooking = await Booking.findOne({
        user_id: req.user.userId,
        hall_id: hall._id,
        booking_date: desiredDate,
        booking_status: { $nin: ['Cancelled', 'Payment-Failed', 'Refunded'] } // Check against any active status
    });
    if (existingUserBooking) {
        return res.status(400).json({ message: 'You already have an active booking application for this hall on this date.' });
    }

    // Create the new booking with the simplified data
    const newBooking = new Booking({
      user_id: req.user.userId,
      hall_id: hall._id,
      booking_id: generateUniqueId(),
      booking_date: desiredDate,
      booking_amount: hall.pricing, // Price is taken directly from the hall document!
      booking_status: 'Pending-Approval',
    });

    const createdBooking = await newBooking.save();
    res.status(201).json({ message: 'Booking application submitted successfully! Awaiting admin approval.', booking: createdBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get all bookings (for the logged-in user or all bookings if admin)
 * @route   GET /api/bookings
 * @access  Private (User or Admin)
 */
const getAllBookings = async (req, res) => {
  try {
    //console.log(req.user)
    const query = req.user.role === 'Admin' ? {} : { user_id: req.user.userId };
    
    const bookings = await Booking.find(query)
      .populate('hall_id', 'hall_name location pricing') // Populate with new simplified hall fields
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getBookingById = async (req, res) => {
  try {
      
    const booking = await Booking.findOne({ booking_id: req.params.id })
      .populate('hall_id', 'hall_name location pricing')
      .populate('user_id', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure only the owner or an admin can view the booking
    if (req.user.userType !== 'Admin' && booking.user_id._id.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this booking' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


/**
 * @desc    Update a booking (only if status is 'Pending-Approval')
 * @route   PUT /api/bookings/:id
 * @access  Private (User who owns it or Admin)
 */
const updateBooking = async (req, res) => {
    try {
        const { hall_id, booking_date } = req.body;
        const booking = await Booking.findOne({ booking_id: req.params.id });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user.userType !== 'Admin' && booking.user_id.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        if (booking.booking_status !== 'Pending-Approval') {
            return res.status(400).json({ message: `Only 'Pending-Approval' bookings can be edited. Current status: ${booking.booking_status}` });
        }

        // Update booking date if provided
        if (booking_date) {
            booking.booking_date = new Date(booking_date);
            booking.booking_date.setUTCHours(0, 0, 0, 0);
        }

        // If hall is being changed, update hall_id and recalculate the booking_amount
        if (hall_id && hall_id.toString() !== booking.hall_id.toString()) {
            const newHall = await Hall.findById(hall_id);
            if (!newHall) {
                return res.status(404).json({ message: 'The new hall selected was not found' });
            }
            booking.hall_id = newHall._id;
            booking.booking_amount = newHall.pricing; // Update the price!
        }

        const updatedBooking = await booking.save();
        res.json({ message: 'Booking updated successfully!', booking: updatedBooking });

    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Workflow Functions ---

/**
 * @desc    Admin allows a booking, moving it to 'AwaitingPayment' status
 * @route   PUT /api/bookings/:id/allow
 * @access  Private (Admin)
 */
const allowBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id }).populate('user_id');
        
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        const phone=booking.user_id.phone;

        if (booking.booking_status !== 'Pending-Approval') {
            return res.status(400).json({ message: `Cannot approve this booking. Its status is '${booking.booking_status}'.` });
        }

        // Final check to ensure the slot wasn't taken by another booking in the meantime
        const hall = await Hall.findById(booking.hall_id);
        const isSlotBooked = hall.availability_details.some(
            (detail) => detail.date.toISOString().split('T')[0] === new Date(booking.booking_date).toISOString().split('T')[0] && detail.status === 'booked'
        );
        if (isSlotBooked) {
            booking.booking_status = 'Cancelled'; // Auto-cancel if slot is now unavailable
            await booking.save();
            return res.status(400).json({ message: 'Cannot approve. Slot has been confirmed by another booking. This application has been cancelled.' });
        }

        booking.isAllowed = true;
        booking.booking_status = 'AwaitingPayment';
        await booking.save();
         const message = `Dear Applicant, your Kalyan Mandapam booking request has been allowed by Nagar Nigam Gorakhpur.Please complete the payment to confirm the booking.Thank you.`;
         const apiUrl = `${process.env.SMS_API_URL}?authentic-key=${process.env.SMS_API_KEY}&senderid=${process.env.SMS_SENDER_ID}&route=${process.env.SMS_ROUTE}&number=${phone}&message=${encodeURIComponent(message)}&templateid=${process.env.SMS_TEMPLATE_ID_ALLOW}`;

         const response = await fetch(apiUrl);
         const result = await response.text();
        res.json({ message: 'Booking approved. User can now proceed to payment.', booking });

    } catch (error) {
        console.error('Error allowing booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    User records payment for a booking, confirming it
 * @route   PUT /api/bookings/:id/pay
 * @access  Private (User who owns it)
 */
const recordPayment = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user_id.toString() !== req.user.userId.toString()) {
             return res.status(403).json({ message: 'Not authorized to pay for this booking' });
        }

        if (booking.booking_status !== 'AwaitingPayment') {
            return res.status(400).json({ message: 'This booking is not awaiting payment.' });
        }

        booking.isPaid = true;
        booking.booking_status = 'Confirmed';
        
        // IMPORTANT: Mark the hall as booked in its availability details
        await updateHallAvailability(booking.hall_id, booking.booking_date, booking._id, true);
        
        const updatedBooking = await booking.save();
        res.json({ message: 'Payment recorded and booking confirmed!', booking: updatedBooking });

    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Cancel a booking (by User or Admin)
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private (User who owns it or Admin)
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ booking_id: req.params.id }).populate('user_id');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const phone=booking.user_id.phone;
    if (req.user.role !== 'Admin' && booking.user_id._id.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
     const sendMsg=req.user.role == 'Admin';
    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    const wasConfirmed = booking.booking_status === 'Confirmed';
    booking.booking_status = 'Cancelled';
    
    // If the booking was already paid and confirmed, free up the hall slot for others
    if (wasConfirmed) {
      await updateHallAvailability(booking.hall_id, booking.booking_date, booking._id, false);
    }
    
    const cancelledBooking = await booking.save();
    if(sendMsg)
     {const message = `Dear Applicant,
We regret to inform you that we were unable to process your booking request for the Kalyan Mandapam for the requested date.
We apologize for the inconvenience. If you would like to inquire about alternative dates or need further information, visit our website.
Best regards,
Nagar Nigam Gorakhpur`;
         const apiUrl = `${process.env.SMS_API_URL}?authentic-key=${process.env.SMS_API_KEY}&senderid=${process.env.SMS_SENDER_ID}&route=${process.env.SMS_ROUTE}&number=${phone}&message=${encodeURIComponent(message)}&templateid=${process.env.SMS_TEMPLATE_ID_REJECT}`;

         const response = await fetch(apiUrl);
         const result = await response.text();}
    res.json({ message: 'Booking cancelled successfully!', booking: cancelledBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Delete a booking permanently (Admin only)
 * @route   DELETE /api/bookings/:id
 * @access  Private (Admin)
 */
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        // Free up availability if the deleted booking was confirmed
        if (booking.booking_status === 'Confirmed') {
            await updateHallAvailability(booking.hall_id, booking.booking_date, booking._id, false);
        }

        await Booking.deleteOne({ _id: booking._id });
        res.json({ message: 'Booking deleted permanently!' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Update booking status manually (Admin only)
 * @route   PUT /api/bookings/:id/status
 * @access  Private (Admin)
 */
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findOne({ booking_id: req.params.id });

        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (!status) return res.status(400).json({ message: 'New status is required.' });

        const wasConfirmed = booking.booking_status === 'Confirmed';
        const isNowConfirmed = status === 'Confirmed';

        booking.booking_status = status;

        if (isNowConfirmed && !wasConfirmed) {
            // Logic to confirm a booking: mark as paid and update availability
            booking.isAllowed = true;
            booking.isPaid = true;
            await updateHallAvailability(booking.hall_id, booking.booking_date, booking._id, true);
        } else if (wasConfirmed && !isNowConfirmed) {
            // Logic for when a confirmed booking is moved to another state (e.g., cancelled)
            await updateHallAvailability(booking.hall_id, booking.booking_date, booking._id, false);
        }

        const updatedBooking = await booking.save();
        res.json({ message: 'Booking status updated successfully!', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- Refund Functions --- (These are largely unaffected by the schema change)

const requestRefund = async (req, res) => {
    // This logic remains the same.
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.refund_status = 'Pending';
        booking.refund_amount = `Rs. ${booking.booking_amount}`;
        await booking.save();
        res.json({ message: 'Refund request submitted!', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const processRefund = async (req, res) => {
    // This logic remains the same.
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        booking.refund_status = 'Processed';
        booking.refund_processed_date = new Date();
        await booking.save();
        res.json({ message: 'Refund processed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
const getRefundStatus = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id }).select('+transaction_id');
        if (booking) {
            res.json({
                booking_id: booking.booking_id, transaction_id: booking.transaction_id,
                refund_status: booking.refund_status, refund_amount: booking.refund_amount,
                refund_processed_date: booking.refund_processed_date,
            });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error('Error fetching refund status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    cancelBooking,
    deleteBooking,
    updateBookingStatus,
    getRefundStatus,
    allowBooking,
    recordPayment,
    requestRefund,
    processRefund,
};