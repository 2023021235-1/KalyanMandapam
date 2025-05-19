// bookController.js
const Booking = require('../models/bookModel');
const Hall = require('../models/hallModel');

// Helper function to generate a unique ID (can be used for booking_id and transaction_id)
const generateUniqueId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    // Add a random component to further ensure uniqueness, especially for transaction_id
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${random}`;
};


const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      hall_id_string,
      booking_date,
      floor,
      function_type,
      booking_amount,
      booking_type,
      addon_ac_heating
    } = req.body;

    // Required fields validation
    if (!hall_id_string || !booking_date || !function_type || !booking_amount || !booking_type) {
      return res.status(400).json({ message: 'Please provide all required booking details.' });
    }

    // Normalize floor (default to 1)
    const floorNumber = floor !== undefined ? floor : 1;

    // Generate unique IDs
    const booking_id = generateUniqueId();
    const transaction_id = generateUniqueId();

    // Check for duplicate IDs
    const existingBooking = await Booking.findOne({
      $or: [{ booking_id }, { transaction_id }]
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'Duplicate ID generated. Please try again.' });
    }

    // Fetch the hall document
    const hall = await Hall.findOne({ hall_id: hall_id_string });
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    // Normalize booking date
    const dateObj = new Date(booking_date);
    dateObj.setUTCHours(0, 0, 0, 0);

    // Check availability
    const clash = hall.availability_details.find(d =>
      new Date(d.date).getTime() === dateObj.getTime() &&
      ['booked', 'blocked'].includes(d.status)
    );
    if (clash) {
      return res.status(400).json({ message: `Hall not available on ${booking_date}. Status: ${clash.status}` });
    }

    // Create and save booking first
    const booking = new Booking({
      booking_id,
      transaction_id,
      hall_id: hall._id,
      user_id: userId,
      booking_date: dateObj,
      floor: floorNumber,
      function_type,
      booking_amount,
      booking_type,
      addon_ac_heating: addon_ac_heating || false,
      booking_status: 'Pending',
      refund_status: 'N/A',
      refund_amount: 'Rs. 0',
    });

    const createdBooking = await booking.save();

    // Update hall availability with the newly created booking
    const idx = hall.availability_details.findIndex(d =>
      new Date(d.date).getTime() === dateObj.getTime() && d.floor_number === floorNumber
    );
    const availEntry = {
      date: dateObj,
      status: 'booked',
      booking_id: createdBooking._id,
      floor_number: floorNumber
    };

    if (idx > -1) {
      hall.availability_details[idx] = { ...hall.availability_details[idx].toObject(), ...availEntry };
    } else {
      hall.availability_details.push(availEntry);
    }
    console.log(hall.total_floors)
    // Ensure total_floors is preserved to avoid validation errors
    if (hall.total_floors == null) {
      hall.total_floors = 2; 
    }

    await hall.save();

    return res.status(201).json(createdBooking);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};


const getAllBookings = async (req, res) => {
  try {
    // req.user is loaded by protect()
    const { _id: userId, userType } = req.user;

    // Admins see everyone’s bookings; non‑admins only their own
    const filter = userType === 'Admin'
      ? {}
      : { user_id: userId };   // make sure this matches your Booking schema’s FK field

    const bookings = await Booking
      .find(filter)
      .populate('hall_id', 'hall_name hall_id')
      .select('+transaction_id');

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getBookingById = async (req, res) => {
    try {
        // Find booking by the unique booking_id string and include transaction_id
        const booking = await Booking.findOne({ booking_id: req.params.id }).populate('hall_id', 'hall_name hall_id').select('+transaction_id');

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


const updateBooking = async (req, res) => {
    try {
        // Include transaction_id in destructuring if it's allowed to be updated (usually not recommended)
        const { booking_date, floor, function_type, booking_amount, booking_status, addon_ac_heating, refund_status, refund_amount, refund_processed_date, transaction_id } = req.body;

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
            // Only update transaction_id if provided and allowed (handle with care)
            // booking.transaction_id = transaction_id || booking.transaction_id;


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
                            hall.availability_details[newDateAvailabilityIndex].floor_number = booking.floor;
                       } else if (booking.booking_status !== 'Cancelled') {
                           // Add new entry for the new date if it didn't exist and booking is not cancelled
                           hall.availability_details.push({
                               date: newBookingDateNormalized,
                               status: 'booked', // Or 'preliminary'
                               booking_id: updatedBooking._id,
                               floor_number: booking.floor 
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


const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });

        if (booking) {
            const bookingDate = new Date(booking.booking_date);
            bookingDate.setUTCHours(0, 0, 0, 0);
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            if (bookingDate.getTime() > today.getTime()) {
                booking.booking_status = 'Cancelled';
                booking.refund_status = 'Pending';
                booking.refund_amount = booking.booking_amount;

                await booking.save();

                const hall = await Hall.findById(booking.hall_id);
                if (hall) {
                    const availabilityIndex = hall.availability_details.findIndex(detail =>
                        new Date(detail.date).getTime() === bookingDate.getTime()
                    );

                    if (availabilityIndex > -1) {
                        hall.availability_details.splice(availabilityIndex, 1); // <-- UPDATED LINE
                        await hall.save();
                    }
                }

                res.json({ message: 'Booking cancelled and refund process initiated', booking });
            } else {
                booking.booking_status = 'Cancelled';
                booking.refund_status = 'Rejected';
                booking.refund_amount = 'Rs. 0';

                await booking.save();

                const hall = await Hall.findById(booking.hall_id);
                if (hall) {
                    const availabilityIndex = hall.availability_details.findIndex(detail =>
                        new Date(detail.date).getTime() === bookingDate.getTime()
                    );

                    if (availabilityIndex > -1) {
                        hall.availability_details.splice(availabilityIndex, 1); // <-- UPDATED LINE
                        await hall.save();
                    }
                }

                res.status(400).json({
                    message: 'Booking date is in the past or today. Refund not applicable automatically.',
                    booking
                });
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
        // Find booking by the unique booking_id string and include transaction_id
        const booking = await Booking.findOne({ booking_id: req.params.id }).select('+transaction_id');

        if (booking) {
             // Optional: Ensure user is authorized to view this booking's refund status
            // if (!req.user.isAdmin && booking.user_id.toString() !== req.user._id.toString()) {
            //     return res.status(403).json({ message: 'Not authorized to view this refund status' });
            // }

            res.json({
                booking_id: booking.booking_id,
                transaction_id: booking.transaction_id, // Include transaction_id
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
    cancelBooking, // Renamed from deleteBooking
    getRefundStatus,
};
