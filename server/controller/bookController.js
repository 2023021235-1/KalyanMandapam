// bookController.js
const Booking = require('../models/bookModel');
const Hall = require('../models/hallModel'); // Need Hall model to update availability

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Authenticated User)
const generateBookingId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

const createBooking = async (req, res) => {
    try {
        const userId = req.user._id;
        // Remove booking_id from destructuring
        const { hall_id_string, booking_date, floor, function_type, booking_amount, booking_type, addon_ac_heating } = req.body;

        // Validation (no booking_id check)
        if (!hall_id_string || !booking_date || !function_type || !booking_amount || !booking_type) {
            return res.status(400).json({ message: 'Please provide all required booking details.' });
        }

        // Generate booking_id
        const booking_id = generateBookingId();

        // Check if generated booking_id is unique
        const existingBooking = await Booking.findOne({ booking_id });
        if (existingBooking) {
            return res.status(400).json({ message: 'Duplicate booking ID generated. Please try again.' });
        }

        // Rest of the code remains the same...
        const hall = await Hall.findOne({ hall_id: hall_id_string });
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        const dateObj = new Date(booking_date);
        dateObj.setUTCHours(0, 0, 0, 0);

        const existingAvailability = hall.availability_details.find(detail =>
            new Date(detail.date).getTime() === dateObj.getTime() &&
            (detail.status === 'booked' || detail.status === 'blocked')
        );

        if (existingAvailability) {
             return res.status(400).json({ message: `Hall is not available on ${booking_date}. Status: ${existingAvailability.status}` });
        }

        // Create booking with generated ID
        const booking = new Booking({
            booking_id, // Use generated ID
            hall_id: hall._id,
            user_id: userId,
            booking_date: dateObj,
            floor,
            function_type,
            booking_amount,
            booking_type,
            addon_ac_heating: addon_ac_heating || false,
            booking_status: 'Pending',
            refund_status: 'N/A',
            refund_amount: 'Rs. 0',
        });

        const createdBooking = await booking.save();

        // Update hall availability (unchanged)
        const availabilityIndex = hall.availability_details.findIndex(detail =>
             new Date(detail.date).getTime() === dateObj.getTime()
        );

        if (availabilityIndex > -1) {
            hall.availability_details[availabilityIndex].status = 'booked';
            hall.availability_details[availabilityIndex].booking_id = createdBooking._id;
        } else {
            hall.availability_details.push({
                date: dateObj,
                status: 'booked',
                booking_id: createdBooking._id,
            });
        }

        await hall.save();
        res.status(201).json(createdBooking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all bookings (can add filters later, e.g., by user)
// @route   GET /api/bookings
// @access  Private (Authenticated User/Admin)
const getAllBookings = async (req, res) => {
    try {
        // Example: Filter by user if not admin
        // const filter = req.user.isAdmin ? {} : { user_id: req.user._id };
        const filter = {}; // For now, get all bookings

        const bookings = await Booking.find(filter).populate('hall_id', 'hall_name hall_id'); // Populate hall name and hall_id

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Authenticated User/Admin)
const getBookingById = async (req, res) => {
    try {
        // Find booking by the unique booking_id string
        const booking = await Booking.findOne({ booking_id: req.params.id }).populate('hall_id', 'hall_name hall_id'); // Populate hall details

        if (booking) {
            // Optional: Ensure user is authorized to view this booking
            // if (!req.user.isAdmin && booking.user_id.toString() !== req.user._id.toString()) {
            //     return res.status(403).json({ message: 'Not authorized to view this booking' });
            // }
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update booking details
// @route   PUT /api/bookings/:id
// @access  Private (Authenticated User/Admin)
const updateBooking = async (req, res) => {
    try {
        const { booking_date, floor, function_type, booking_amount, booking_status, addon_ac_heating, refund_status, refund_amount, refund_processed_date } = req.body;

        // Find booking by the unique booking_id string
        const booking = await Booking.findOne({ booking_id: req.params.id });

        if (booking) {
            // Optional: Ensure user is authorized to update this booking
            // if (!req.user.isAdmin && booking.user_id.toString() !== req.user._id.toString()) {
            //     return res.status(403).json({ message: 'Not authorized to update this booking' });
            // }

            const oldBookingDate = new Date(booking.booking_date); // Store old date for availability update
            oldBookingDate.setUTCHours(0, 0, 0, 0);

            // Update booking fields
            booking.floor = floor !== undefined ? floor : booking.floor;
            booking.function_type = function_type || booking.function_type;
            booking.booking_amount = booking_amount || booking.booking_amount;
            booking.booking_status = booking_status || booking.booking_status;
            booking.addon_ac_heating = addon_ac_heating !== undefined ? addon_ac_heating : booking.addon_ac_heating;
            booking.refund_status = refund_status || booking.refund_status;
            booking.refund_amount = refund_amount || booking.refund_amount;
            booking.refund_processed_date = refund_processed_date ? new Date(refund_processed_date) : booking.refund_processed_date;

             // Handle booking date change - requires updating availability on both old and new dates
            let newBookingDateNormalized = null;
            if (booking_date && new Date(booking_date).getTime() !== oldBookingDate.getTime()) {
                 newBookingDateNormalized = new Date(booking_date);
                 newBookingDateNormalized.setUTCHours(0, 0, 0, 0);
                 booking.booking_date = newBookingDateNormalized;
            }


            const updatedBooking = await booking.save();

            // --- Update Hall Availability based on changes ---
            const hall = await Hall.findById(booking.hall_id);
             if (hall) {
                 // Update availability for the old date (if date changed or status changed to cancelled)
                 if (newBookingDateNormalized || booking.booking_status === 'Cancelled') {
                      const oldDateAvailabilityIndex = hall.availability_details.findIndex(detail =>
                           new Date(detail.date).getTime() === oldBookingDate.getTime()
                      );
                      if (oldDateAvailabilityIndex > -1) {
                          // If cancelled or date changed, mark old date as available
                          hall.availability_details[oldDateAvailabilityIndex].status = 'available';
                          hall.availability_details[oldDateAvailabilityIndex].booking_id = undefined; // Remove booking link
                      }
                 }

                 // Update availability for the new date (if date changed or status is confirmed/pending)
                 if (newBookingDateNormalized) {
                      const newDateAvailabilityIndex = hall.availability_details.findIndex(detail =>
                           new Date(detail.date).getTime() === newBookingDateNormalized.getTime()
                      );
                       if (newDateAvailabilityIndex > -1) {
                           // Update existing entry for the new date
                            hall.availability_details[newDateAvailabilityIndex].status = booking.booking_status === 'Cancelled' ? 'available' : 'booked'; // Or 'preliminary'
                            hall.availability_details[newDateAvailabilityIndex].booking_id = booking.booking_status === 'Cancelled' ? undefined : updatedBooking._id;
                       } else if (booking.booking_status !== 'Cancelled') {
                           // Add new entry for the new date if it didn't exist and booking is not cancelled
                           hall.availability_details.push({
                               date: newBookingDateNormalized,
                               status: 'booked', // Or 'preliminary'
                               booking_id: updatedBooking._id,
                           });
                       }
                 } else if (booking_status && booking_status !== 'Cancelled') {
                      // If status changed but date didn't, update status on the existing date entry
                       const dateAvailabilityIndex = hall.availability_details.findIndex(detail =>
                           new Date(detail.date).getTime() === oldBookingDate.getTime()
                       );
                       if (dateAvailabilityIndex > -1) {
                            hall.availability_details[dateAvailabilityIndex].status = booking_status === 'Confirmed' ? 'booked' : booking_status.toLowerCase(); // Map statuses
                            hall.availability_details[dateAvailabilityIndex].booking_id = updatedBooking._id;
                       }
                 } else if (booking_status === 'Cancelled') {
                     // If status changed to cancelled and date didn't change
                      const dateAvailabilityIndex = hall.availability_details.findIndex(detail =>
                           new Date(detail.date).getTime() === oldBookingDate.getTime()
                       );
                       if (dateAvailabilityIndex > -1) {
                            hall.availability_details[dateAvailabilityIndex].status = 'available';
                            hall.availability_details[dateAvailabilityIndex].booking_id = undefined;
                       }
                 }

                 await hall.save(); // Save the updated hall
             }


            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Authenticated User/Admin)
const deleteBooking = async (req, res) => {
    try {
        // Find booking by the unique booking_id string
        const booking = await Booking.findOne({ booking_id: req.params.id });

        if (booking) {
             // Optional: Ensure user is authorized to delete this booking
            // if (!req.user.isAdmin && booking.user_id.toString() !== req.user._id.toString()) {
            //     return res.status(403).json({ message: 'Not authorized to delete this booking' });
            // }

            const bookingDate = new Date(booking.booking_date);
            bookingDate.setUTCHours(0, 0, 0, 0);

            await booking.deleteOne(); // Use deleteOne() for Mongoose 6+
            res.json({ message: 'Booking removed' });

            // --- Update Hall Availability ---
            const hall = await Hall.findById(booking.hall_id);
            if (hall) {
                 const availabilityIndex = hall.availability_details.findIndex(detail =>
                      new Date(detail.date).getTime() === bookingDate.getTime()
                 );

                 if (availabilityIndex > -1) {
                     // Mark the date as available
                     hall.availability_details[availabilityIndex].status = 'available';
                     hall.availability_details[availabilityIndex].booking_id = undefined; // Remove booking link
                     await hall.save(); // Save the updated hall
                 }
            }


        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check refund status for a booking
// @route   GET /api/bookings/:id/refund-status
// @access  Private (Authenticated User/Admin)
const getRefundStatus = async (req, res) => {
    try {
        // Find booking by the unique booking_id string
        const booking = await Booking.findOne({ booking_id: req.params.id });

        if (booking) {
             // Optional: Ensure user is authorized to view this booking's refund status
            // if (!req.user.isAdmin && booking.user_id.toString() !== req.user._id.toString()) {
            //     return res.status(403).json({ message: 'Not authorized to view this refund status' });
            // }

            res.json({
                booking_id: booking.booking_id,
                refund_status: booking.refund_status,
                refund_amount: booking.refund_amount,
                refund_processed_date: booking.refund_processed_date,
            });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getRefundStatus,
};
