// bookController.js
const Booking = require('../models/bookModel');
const Hall = require('../models/hallModel');

// Helper function to generate a unique ID
const generateUniqueId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}${random}`;
};

// Helper to calculate booking amount based on hall pricing
const calculateBookingAmount = (hall, bookingData) => {
  const {
    function_type,
    booking_type,
    area_sqft,
    is_parking,
    is_conference_hall,
    is_food_prep_area,
    is_lawn,
    is_ac, 
    add_parking, 
    num_ac_rooms_booked, 
    num_non_ac_rooms_booked 
  } = bookingData;

  let totalAmount = 0;

  const getTieredPrice = (priceObject) => {
    if (!priceObject) return 0; 
    switch (booking_type) {
      case 'municipal': return priceObject.municipal;
      case 'municipality': return priceObject.municipality;
      case 'panchayat': return priceObject.panchayat;
      default: return 0;
    }
  };

  if (is_parking) totalAmount += getTieredPrice(hall.parking);
  if (is_conference_hall) totalAmount += getTieredPrice(is_ac ? hall.conference_hall_ac : hall.conference_hall_nonac);
  if (is_food_prep_area) totalAmount += getTieredPrice(is_ac ? hall.food_prep_area_ac : hall.food_prep_area_nonac);
  if (is_lawn) totalAmount += getTieredPrice(is_ac ? hall.lawn_ac : hall.lawn_nonac);
  if (num_ac_rooms_booked && num_ac_rooms_booked > 0) totalAmount += num_ac_rooms_booked * getTieredPrice(hall.room_rent_ac);
  if (num_non_ac_rooms_booked && num_non_ac_rooms_booked > 0) totalAmount += num_non_ac_rooms_booked * getTieredPrice(hall.room_rent_nonac);
  if (add_parking && !is_parking) totalAmount += getTieredPrice(hall.parking); 

  if (function_type && area_sqft) {
    const eventPricing = hall.event_pricing.find(ep => ep.event_type === function_type);
    if (eventPricing) {
      const perSqftPrice = getTieredPrice(is_ac ? eventPricing.prices_per_sqft_ac : eventPricing.prices_per_sqft_nonac);
      totalAmount += (area_sqft * perSqftPrice);
    }
  }

  totalAmount += getTieredPrice(is_ac ? hall.electricity_ac : hall.electricity_nonac);
  totalAmount += getTieredPrice(hall.cleaning);

  return totalAmount;
};

// Helper function to update hall availability
const updateHallAvailability = async (hallId, bookingDate, floor, bookingId, markAsBooked) => {
    const hall = await Hall.findById(hallId);
    if (!hall) return false;

    const normalizedBookingDate = new Date(bookingDate);
    normalizedBookingDate.setUTCHours(0, 0, 0, 0);
    const dateString = normalizedBookingDate.toISOString().split('T')[0];

    const availabilityIndex = hall.availability_details.findIndex(
        (detail) =>
            detail.date.toISOString().split('T')[0] === dateString &&
            detail.floor === floor
    );

    if (markAsBooked) {
        if (availabilityIndex > -1) {
            hall.availability_details[availabilityIndex].status = 'booked';
            hall.availability_details[availabilityIndex].booking_id = bookingId;
        } else {
            hall.availability_details.push({
                date: normalizedBookingDate,
                floor: floor,
                status: 'booked',
                booking_id: bookingId,
            });
        }
    } else { // Mark as available (e.g., on cancellation of a confirmed booking)
        if (availabilityIndex > -1) {
            // Only remove if it was booked by this specific booking
            if (hall.availability_details[availabilityIndex].booking_id && hall.availability_details[availabilityIndex].booking_id.toString() === bookingId.toString()) {
                hall.availability_details.splice(availabilityIndex, 1);
            }
        }
    }
    await hall.save();
    return true;
};


// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Authenticated User)
const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      hall_id_string, booking_date, floor, function_type, booking_type, area_sqft,
      is_parking, is_conference_hall, is_food_prep_area, is_lawn, is_ac,
      add_parking, num_ac_rooms_booked, num_non_ac_rooms_booked
    } = req.body;

    if (!hall_id_string || !booking_date || !floor || !function_type || !booking_type) {
        return res.status(400).json({ message: 'Please provide all required booking details: Hall, Date, Floor, Function Type, and Booking Type.' });
    }

    const hall = await Hall.findOne({ hall_id: hall_id_string });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });

    if (floor < 1 || floor > hall.total_floors) {
        return res.status(400).json({ message: `Invalid floor number. This hall has ${hall.total_floors} floors.` });
    }

    const numAcRoomsToBook = Number(num_ac_rooms_booked) || 0;
    const numNonAcRoomsToBook = Number(num_non_ac_rooms_booked) || 0;

    if (numAcRoomsToBook > hall.num_ac_rooms) {
        return res.status(400).json({ message: `Cannot book ${numAcRoomsToBook} AC rooms. Only ${hall.num_ac_rooms} AC rooms available.` });
    }
    if (numNonAcRoomsToBook > hall.num_non_ac_rooms) {
        return res.status(400).json({ message: `Cannot book ${numNonAcRoomsToBook} Non-AC rooms. Only ${hall.num_non_ac_rooms} Non-AC rooms available.` });
    }

    const desiredBookingDate = new Date(booking_date);
    desiredBookingDate.setUTCHours(0, 0, 0, 0);

    // Check if the same user already booked this hall for the same day (and not cancelled)
    const existingUserBooking = await Booking.findOne({
        user_id: userId,
        hall_id_string: hall_id_string,
        booking_date: desiredBookingDate,
        booking_status: { $ne: 'Cancelled' }
    });

    if (existingUserBooking) {
        return res.status(400).json({ message: 'You have already applied for a booking for this hall on this date.' });
    }
    
    // Availability check will now effectively happen before allowing payment / confirming
    // For creation, we just check if the hall *can* be booked, not blocking the slot yet.
    // A more complex check might look at other 'Confirmed' bookings if we want to prevent even applying.
    // However, the prompt implies availability is affected *after* confirmation.
    // For now, let's check if the specific date and floor is *already confirmed* by someone else.
    const isSlotConfirmedByOther = hall.availability_details.some(
      (detail) =>
        detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
        detail.floor === floor &&
        detail.status === 'booked'
    );

    if (isSlotConfirmedByOther) {
      return res.status(400).json({ message: 'This hall floor is already confirmed by another booking for the selected date.' });
    }


    const calculatedBookingAmount = calculateBookingAmount(hall, { ...req.body, num_ac_rooms_booked: numAcRoomsToBook, num_non_ac_rooms_booked: numNonAcRoomsToBook });
    const booking_id = generateUniqueId();
    const transaction_id = generateUniqueId();

    const newBooking = new Booking({
      booking_id,
       transaction_id:null
       , user_id: userId, hall_id_string, hall_id: hall._id,
      booking_date: desiredBookingDate, floor, function_type,
      area_sqft: area_sqft || (function_type && hall.total_area_sqft ? hall.total_area_sqft : undefined),
      booking_amount: calculatedBookingAmount, booking_type,
      num_ac_rooms_booked: numAcRoomsToBook, num_non_ac_rooms_booked: numNonAcRoomsToBook,
      is_parking: is_parking || false, is_conference_hall: is_conference_hall || false,
      is_food_prep_area: is_food_prep_area || false, is_lawn: is_lawn || false,
      is_ac: is_ac || false, add_parking: add_parking || false,
      isAllowed: false, // New field
      isPaid: false,    // New field
      booking_status: 'Pending', // Initial status
    });

    const createdBooking = await newBooking.save();
    // DO NOT update hall availability here. It will be updated upon payment confirmation.
    res.status(201).json({ message: 'Booking application submitted successfully! Awaiting admin approval.', booking: createdBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Admin allows a booking
// @route   PUT /api/bookings/:id/allow
// @access  Private (Admin)
const allowBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized for this action.' });
        }

        if (booking.booking_status !== 'Pending') {
            return res.status(400).json({ message: `Booking is not in 'Pending' state. Current status: ${booking.booking_status}` });
        }
        
        // Additional check: ensure the slot isn't taken by a now-confirmed booking by someone else in the meantime
        const hall = await Hall.findById(booking.hall_id);
        if(hall){
            const desiredBookingDate = new Date(booking.booking_date);
            desiredBookingDate.setUTCHours(0, 0, 0, 0);
            const isSlotConfirmedByOther = hall.availability_details.some(
              (detail) =>
                detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
                detail.floor === booking.floor &&
                detail.status === 'booked'
            );
            if (isSlotConfirmedByOther) {
              return res.status(400).json({ message: 'This hall floor has been confirmed by another booking since this application was made. Cannot allow.' });
            }
        }


        booking.isAllowed = true;
        booking.booking_status = 'AwaitingPayment';
        const updatedBooking = await booking.save();

        res.json({ message: 'Booking allowed. User can now proceed to payment.', booking: updatedBooking });

    } catch (error) {
        console.error('Error allowing booking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    User records payment for a booking
// @route   PUT /api/bookings/:id/pay
// @access  Private (Authenticated User)
const recordPayment = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.user_id.toString() !== req.user._id.toString() && req.user.userType !== 'Admin') {
             return res.status(403).json({ message: 'Not authorized to pay for this booking' });
        }

        if (!booking.isAllowed || booking.booking_status !== 'AwaitingPayment') {
            return res.status(400).json({ message: 'Booking is not awaiting payment or not allowed.' });
        }
        if (booking.isPaid) {
            return res.status(400).json({ message: 'Booking has already been paid.' });
        }

        booking.isPaid = true;
        booking.booking_status = 'Confirmed';
        const updatedBooking = await booking.save();

        // Update hall availability
        await updateHallAvailability(updatedBooking.hall_id, updatedBooking.booking_date, updatedBooking.floor, updatedBooking._id, true);

        res.json({ message: 'Payment recorded and booking confirmed!', booking: updatedBooking });

    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all bookings for a user (or all bookings if admin)
// @route   GET /api/bookings
// @access  Private (Authenticated User/Admin)
const getAllBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.userType != 'Admin') {
      query.user_id = req.user._id;
    }
    // Populate user_id with 'name' and 'email' fields
    const bookings = await Booking.find(query)
      .populate('hall_id', 'hall_id hall_name location total_floors num_ac_rooms num_non_ac_rooms')
      .populate('user_id', 'name email') // Populate user name and email
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Authenticated User/Admin)
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ booking_id: req.params.id }).populate('hall_id', 'hall_id hall_name location total_floors num_ac_rooms num_non_ac_rooms');

    if (booking) {
      if (req.user.userType !== 'Admin' && booking.user_id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this booking' });
      }
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Update an existing booking (Only if 'Pending')
// @route   PUT /api/bookings/:id
// @access  Private (Authenticated User/Admin)
const updateBooking = async (req, res) => {
  try {

    const  booking_id  = req.params.id; 
    console.log('Updating booking with ID:', booking_id);
    const {
      hall_id_string, booking_date, floor, function_type, booking_type, area_sqft,
      is_parking, is_conference_hall, is_food_prep_area, is_lawn, is_ac,
      add_parking, num_ac_rooms_booked, num_non_ac_rooms_booked,
    } = req.body;

    if (!hall_id_string || !booking_date || !floor || !function_type || !booking_type) {
      return res.status(400).json({ message: 'Please provide all required booking details.' });
    }
    
    const existingBooking = await Booking.findOne({ _id:booking_id});
    if (!existingBooking) return res.status(404).json({ message: 'Booking not found' });
    console.log('Existing booking found:', existingBooking);
    if (req.user.userType !== 'Admin' && existingBooking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (existingBooking.booking_status !== 'Pending') {
      return res.status(400).json({ message: `Only 'Pending' bookings can be edited. Current status: ${existingBooking.booking_status}` });
    }

    const hall = await Hall.findOne({ hall_id: hall_id_string });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });

    if (floor < 1 || floor > hall.total_floors) {
        return res.status(400).json({ message: `Invalid floor number. This hall has ${hall.total_floors} floors.` });
    }
    
    const numAcRoomsToBook = Number(num_ac_rooms_booked) || 0;
    const numNonAcRoomsToBook = Number(num_non_ac_rooms_booked) || 0;

    if (numAcRoomsToBook > hall.num_ac_rooms) return res.status(400).json({ message: `Cannot book ${numAcRoomsToBook} AC rooms. Only ${hall.num_ac_rooms} available.` });
    if (numNonAcRoomsToBook > hall.num_non_ac_rooms) return res.status(400).json({ message: `Cannot book ${numNonAcRoomsToBook} Non-AC rooms. Only ${hall.num_non_ac_rooms} available.` });

    const desiredBookingDate = new Date(booking_date);
    desiredBookingDate.setUTCHours(0, 0, 0, 0);

    // If date, floor or hall changed, check if the new slot is already confirmed by someone else.
     if (
        existingBooking.hall_id_string !== hall_id_string ||
        existingBooking.booking_date.toISOString().split('T')[0] !== desiredBookingDate.toISOString().split('T')[0] ||
        existingBooking.floor !== floor
    ) {
        const isSlotConfirmedByOther = hall.availability_details.some(
            (detail) =>
                detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
                detail.floor === floor &&
                detail.status === 'booked'
        );
        if (isSlotConfirmedByOther) {
            return res.status(400).json({ message: 'The new selected hall/date/floor is already confirmed by another booking.' });
        }
    }


    const recalculatedBookingAmount = calculateBookingAmount(hall, { ...req.body, num_ac_rooms_booked: numAcRoomsToBook, num_non_ac_rooms_booked: numNonAcRoomsToBook });

    existingBooking.hall_id_string = hall_id_string;
    existingBooking.hall_id = hall._id;
    existingBooking.booking_date = desiredBookingDate;
    existingBooking.floor = floor;
    existingBooking.function_type = function_type;
    existingBooking.booking_type = booking_type;
    existingBooking.area_sqft = area_sqft || (function_type && hall.total_area_sqft ? hall.total_area_sqft : undefined);
    existingBooking.num_ac_rooms_booked = numAcRoomsToBook;
    existingBooking.num_non_ac_rooms_booked = numNonAcRoomsToBook;
    existingBooking.is_parking = is_parking !== undefined ? is_parking : existingBooking.is_parking;
    existingBooking.is_conference_hall = is_conference_hall !== undefined ? is_conference_hall : existingBooking.is_conference_hall;
    existingBooking.is_food_prep_area = is_food_prep_area !== undefined ? is_food_prep_area : existingBooking.is_food_prep_area;
    existingBooking.is_lawn = is_lawn !== undefined ? is_lawn : existingBooking.is_lawn;
    existingBooking.is_ac = is_ac !== undefined ? is_ac : existingBooking.is_ac;
    existingBooking.add_parking = add_parking !== undefined ? add_parking : existingBooking.add_parking;
    existingBooking.booking_amount = recalculatedBookingAmount;

    const updatedBooking = await existingBooking.save();
    res.json({ message: 'Booking updated successfully!', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Cancel a booking (User or Admin action)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Authenticated User/Admin)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ booking_id: req.params.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.userType !== 'Admin' && booking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    const wasConfirmed = booking.booking_status === 'Confirmed';
    
    booking.booking_status = 'Cancelled';
    booking.isPaid = false; // Typically, cancellation might involve refund, so mark as not paid.
    // isAllowed might remain true or false depending on policy. Let's leave it as is.
    const cancelledBooking = await booking.save();

    if (wasConfirmed) { // If booking was confirmed, free up the hall slot
      await updateHallAvailability(cancelledBooking.hall_id, cancelledBooking.booking_date, cancelledBooking.floor, cancelledBooking._id, false);
    }

    res.json({ message: 'Booking cancelled successfully!', booking: cancelledBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Delete a booking (Admin action - hard delete)
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized for this action.' });
        }

        const wasConfirmed = booking.booking_status === 'Confirmed';
        if (wasConfirmed) {
            await updateHallAvailability(booking.hall_id, booking.booking_date, booking.floor, booking._id, false);
        }

        await Booking.deleteOne({ booking_id: req.params.id });
        res.json({ message: 'Booking deleted permanently!' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update booking status (Admin action)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin)
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params; // booking_id
        const { status } = req.body; // New status

        if (!status) return res.status(400).json({ message: 'Booking status is required.' });

        const booking = await Booking.findOne({ booking_id: id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized for this action.' });
        }
        
        const allowedStatuses = ['Pending', 'AwaitingPayment', 'Confirmed', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status: ${status}.` });
        }

        const wasConfirmed = booking.booking_status === 'Confirmed';
        const isNowConfirmed = status === 'Confirmed';

        booking.booking_status = status;

        if (status === 'Confirmed') {
            booking.isAllowed = true;
            booking.isPaid = true;
            if (!wasConfirmed) {
                 // Check if slot is available before confirming
                const hall = await Hall.findById(booking.hall_id);
                if(hall){
                    const desiredBookingDate = new Date(booking.booking_date);
                    desiredBookingDate.setUTCHours(0, 0, 0, 0);
                    const isSlotConfirmedByOther = hall.availability_details.some(
                      (detail) =>
                        detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
                        detail.floor === booking.floor &&
                        detail.status === 'booked' &&
                        (!detail.booking_id || detail.booking_id.toString() !== booking._id.toString()) // Exclude self
                    );
                    if (isSlotConfirmedByOther) {
                      return res.status(400).json({ message: 'Cannot confirm. This hall floor has been confirmed by another booking.' });
                    }
                }
                await updateHallAvailability(booking.hall_id, booking.booking_date, booking.floor, booking._id, true);
            }
        } else if (status === 'AwaitingPayment') {
            booking.isAllowed = true;
            booking.isPaid = false; // Ensure isPaid is false
            if (wasConfirmed) { // If it was confirmed, now it's not (e.g. payment failed, admin reverts)
                await updateHallAvailability(booking.hall_id, booking.booking_date, booking.floor, booking._id, false);
            }
        } else if (status === 'Pending') {
            booking.isAllowed = false;
            booking.isPaid = false;
            if (wasConfirmed) {
                await updateHallAvailability(booking.hall_id, booking.booking_date, booking.floor, booking._id, false);
            }
        } else if (status === 'Cancelled') {
            // booking.isPaid = false; // Handled by cancelBooking logic if called directly
            if (wasConfirmed) {
                await updateHallAvailability(booking.hall_id, booking.booking_date, booking.floor, booking._id, false);
            }
        }

        const updatedBooking = await booking.save();
        res.json({ message: 'Booking status updated successfully!', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server Error', error: message });
    }
};


// @desc    Request a refund for a booking (User action)
// @route   PUT /api/bookings/:id/request-refund
// @access  Private (Authenticated User)
const requestRefund = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.userType !== 'Admin' && booking.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!['Confirmed', 'Cancelled'].includes(booking.booking_status)) {
            return res.status(400).json({ message: 'Refund can only be requested for Confirmed or Cancelled bookings.' });
        }
        if (['Pending', 'Processed', 'Rejected'].includes(booking.refund_status)) {
            return res.status(400).json({ message: `Refund is already ${booking.refund_status}.` });
        }

        booking.refund_status = 'Pending';
        booking.refund_amount = `Rs. ${booking.booking_amount}`;
        const updatedBooking = await booking.save();
        res.json({ message: 'Refund request submitted!', booking: updatedBooking });

    } catch (error) {
        console.error('Error requesting refund:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Check refund status for a booking
// @route   GET /api/bookings/:id/refund-status
// @access  Private (Authenticated User/Admin)
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


// @desc    Process refund for a booking (Admin action)
// @route   PUT /api/bookings/:id/process-refund
// @access  Private (Admin)
const processRefund = async (req, res) => {
    try {
        const booking = await Booking.findOne({ booking_id: req.params.id });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.userType !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        if (booking.refund_status !== 'Pending') {
            return res.status(400).json({ message: `Refund is not 'Pending'. Current status: ${booking.refund_status}` });
        }

        booking.refund_status = 'Processed';
        booking.refund_processed_date = new Date();
        const updatedBooking = await booking.save();
        res.json({ message: 'Refund processed successfully', booking: updatedBooking });

    } catch (error) {
        console.error('Error processing refund:', error);
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
    requestRefund,
    getRefundStatus,
    processRefund,
    allowBooking,    // Export new function
    recordPayment,   // Export new function
};