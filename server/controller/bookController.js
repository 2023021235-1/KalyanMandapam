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
    is_ac, // This flag now applies to general/sqft pricing, not rooms specifically
    add_parking, // Legacy
    num_ac_rooms_booked, // New
    num_non_ac_rooms_booked // New
  } = bookingData;

  let totalAmount = 0;

  const getTieredPrice = (priceObject) => {
    if (!priceObject) return 0; // Handle cases where a price object might be missing
    switch (booking_type) {
      case 'municipal': return priceObject.municipal;
      case 'municipality': return priceObject.municipality;
      case 'panchayat': return priceObject.panchayat;
      default: return 0;
    }
  };

  // Calculate fixed-price block costs
  if (is_parking) {
    totalAmount += getTieredPrice(hall.parking);
  }
  if (is_conference_hall) {
    totalAmount += getTieredPrice(is_ac ? hall.conference_hall_ac : hall.conference_hall_nonac);
  }
  if (is_food_prep_area) {
    totalAmount += getTieredPrice(is_ac ? hall.food_prep_area_ac : hall.food_prep_area_nonac);
  }
  if (is_lawn) {
    totalAmount += getTieredPrice(is_ac ? hall.lawn_ac : hall.lawn_nonac);
  }

  // Calculate cost for AC rooms booked
  if (num_ac_rooms_booked && num_ac_rooms_booked > 0) {
    totalAmount += num_ac_rooms_booked * getTieredPrice(hall.room_rent_ac);
  }

  // Calculate cost for Non-AC rooms booked
  if (num_non_ac_rooms_booked && num_non_ac_rooms_booked > 0) {
    totalAmount += num_non_ac_rooms_booked * getTieredPrice(hall.room_rent_nonac);
  }

  // Add legacy add-ons if they represent distinct charges not covered by fixed blocks
  // If add_parking means something separate from is_parking flag
  if (add_parking && !is_parking) { // Only add if not already covered by is_parking
      totalAmount += getTieredPrice(hall.parking); // Re-use parking pricing
  }


  // Calculate per-sqft event costs
  if (function_type && area_sqft) {
    const eventPricing = hall.event_pricing.find(ep => ep.event_type === function_type);
    if (eventPricing) {
      // is_ac flag determines if AC per-sqft prices are used
      const perSqftPrice = getTieredPrice(is_ac ? eventPricing.prices_per_sqft_ac : eventPricing.prices_per_sqft_nonac);
      totalAmount += (area_sqft * perSqftPrice);
    }
  }

  // Add electricity and cleaning charges
  // is_ac flag determines if AC electricity charges are applied
  totalAmount += getTieredPrice(is_ac ? hall.electricity_ac : hall.electricity_nonac);
  totalAmount += getTieredPrice(hall.cleaning);


  return totalAmount;
};


// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Authenticated User)
const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      hall_id_string,
      booking_date,
      floor,
      function_type,
      booking_type, // 'municipal', 'municipality', 'panchayat'
      area_sqft, // Only for per-sqft events
      is_parking,
      is_conference_hall,
      is_food_prep_area,
      is_lawn,
      is_ac, // General AC flag for sqft events / main areas
      add_parking, // Legacy
      num_ac_rooms_booked, // New
      num_non_ac_rooms_booked // New
    } = req.body;
    //console.log(hall_id_string);
    // Required fields validation - explicitly check for empty strings for hall_id_string
    if (!hall_id_string || !booking_date || !floor || !function_type || !booking_type) {
        return res.status(400).json({ message: 'Please provide all required booking details: Hall, Date, Floor, Function Type, and Booking Type.' });
    }

    const hall = await Hall.findOne({ hall_id: hall_id_string });
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    // Check if the floor exists in the hall
    if (floor < 1 || floor > hall.total_floors) {
        return res.status(400).json({ message: `Invalid floor number. This hall has ${hall.total_floors} floors.` });
    }

    // Basic check for room availability (more sophisticated checks might be needed for concurrent bookings)
    // Ensure num_ac_rooms_booked and num_non_ac_rooms_booked are numbers before comparison
    const numAcRoomsToBook = Number(num_ac_rooms_booked) || 0;
    const numNonAcRoomsToBook = Number(num_non_ac_rooms_booked) || 0;

    if (numAcRoomsToBook > hall.num_ac_rooms) {
        return res.status(400).json({ message: `Cannot book ${numAcRoomsToBook} AC rooms. Only ${hall.num_ac_rooms} AC rooms available in this hall.` });
    }
    if (numNonAcRoomsToBook > hall.num_non_ac_rooms) {
        return res.status(400).json({ message: `Cannot book ${numNonAcRoomsToBook} Non-AC rooms. Only ${hall.num_non_ac_rooms} Non-AC rooms available in this hall.` });
    }


    // Check availability for the specific date and floor
    const desiredBookingDate = new Date(booking_date);
    desiredBookingDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

    const isBooked = hall.availability_details.some(
      (detail) =>
        detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
        detail.floor === floor &&
        detail.status === 'booked'
    );

    if (isBooked) {
      return res.status(400).json({ message: 'This hall floor is already booked for the selected date.' });
    }

    // Calculate booking amount
    // Pass the numeric values for rooms to calculateBookingAmount
    const calculatedBookingAmount = calculateBookingAmount(hall, {
        ...req.body,
        num_ac_rooms_booked: numAcRoomsToBook,
        num_non_ac_rooms_booked: numNonAcRoomsToBook
    });


    const booking_id = generateUniqueId();
    const transaction_id = generateUniqueId(); // Assuming a transaction ID is generated on booking

    const newBooking = new Booking({
      booking_id,
      transaction_id,
      user_id: userId,
      hall_id_string, // Store the string ID
      hall_id: hall._id, // Store the ObjectId reference
      booking_date: desiredBookingDate,
      floor,
      function_type,
      area_sqft: area_sqft || (function_type && hall.total_area_sqft ? hall.total_area_sqft : undefined), // Set total_area_sqft if function_type is present and area_sqft is not provided
      booking_amount: calculatedBookingAmount,
      booking_type,
      num_ac_rooms_booked: numAcRoomsToBook,
      num_non_ac_rooms_booked: numNonAcRoomsToBook,
      is_parking: is_parking || false,
      is_conference_hall: is_conference_hall || false,
      is_food_prep_area: is_food_prep_area || false,
      is_lawn: is_lawn || false,
      is_ac: is_ac || false, // General AC status
      add_parking: add_parking || false,
      // add_room removed
      booking_status: 'Pending', // Default status for new bookings
    });

    const createdBooking = await newBooking.save();

    // Update hall availability details
    // Find if an availability entry for this date and floor already exists
    const existingAvailabilityIndex = hall.availability_details.findIndex(
      (detail) =>
        detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
        detail.floor === floor
    );

    if (existingAvailabilityIndex > -1) {
      // Update existing entry
      hall.availability_details[existingAvailabilityIndex].status = 'booked';
      hall.availability_details[existingAvailabilityIndex].booking_id = createdBooking._id;
    } else {
      // Add new entry
      hall.availability_details.push({
        date: desiredBookingDate,
        floor: floor,
        status: 'booked',
        booking_id: createdBooking._id,
      });
    }
    await hall.save();

    res.status(201).json({ message: 'Booking created successfully!', booking: createdBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Get all bookings for a user (or all bookings if admin)
// @route   GET /api/bookings
// @access  Private (Authenticated User/Admin)
const getAllBookings = async (req, res) => {
  try {
    let query = {};
    // If not admin, only fetch bookings for the current user
    if (req.user.userType != 'Admin') {
      query.user_id = req.user._id;
    }
    // Populate hall_id to get hall details, but only necessary fields
    const bookings = await Booking.find(query).populate('hall_id', 'hall_id hall_name location total_floors num_ac_rooms num_non_ac_rooms'); // Populate relevant hall fields
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
      // Ensure user is authorized to view this booking
      if (!req.user.userType === 'Admin' && booking.user_id.toString() !== req.user._id.toString()) {
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


// @desc    Update an existing booking
// @route   PUT /api/bookings/:id
// @access  Private (Authenticated User/Admin)
const updateBooking = async (req, res) => {
  try {
    const { booking_id } = req.params; // This is the custom booking_id string
    const {
      hall_id_string,
      booking_date,
      floor,
      function_type,
      booking_type,
      area_sqft,
      is_parking,
      is_conference_hall,
      is_food_prep_area,
      is_lawn,
      is_ac, // General AC flag
      add_parking,
      num_ac_rooms_booked, // New
      num_non_ac_rooms_booked, // New
      // booking_amount // Amount will be recalculated
    } = req.body;

    // --- Input Validation ---
    if (!hall_id_string || !booking_date || !floor || !function_type || !booking_type) {
      return res.status(400).json({ message: 'Please provide all required booking details: Hall, Date, Floor, Function Type, and Booking Type.' });
    }
    
    const existingBooking = await Booking.findOne({ booking_id });

    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure user is authorized to update this booking
    if (!req.user.userType === 'Admin' && existingBooking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // --- Editing Restriction: Only allow updates if status is 'Pending' ---
    if (existingBooking.booking_status !== 'Pending') {
      return res.status(400).json({ message: `Booking with status '${existingBooking.booking_status}' cannot be updated. Only 'Pending' bookings can be edited.` });
    }


    const hall = await Hall.findOne({ hall_id: hall_id_string });
    if (!hall) {
      return res.status(404).json({ message: 'Hall not found' });
    }

    // Check if the floor exists in the hall
    if (floor < 1 || floor > hall.total_floors) {
        return res.status(400).json({ message: `Invalid floor number. This hall has ${hall.total_floors} floors.` });
    }
    
    const numAcRoomsToBook = Number(num_ac_rooms_booked) || 0;
    const numNonAcRoomsToBook = Number(num_non_ac_rooms_booked) || 0;

    // Basic check for room availability on update
    if (numAcRoomsToBook > hall.num_ac_rooms) {
        return res.status(400).json({ message: `Cannot book ${numAcRoomsToBook} AC rooms. Only ${hall.num_ac_rooms} AC rooms available.` });
    }
    if (numNonAcRoomsToBook > hall.num_non_ac_rooms) {
        return res.status(400).json({ message: `Cannot book ${numNonAcRoomsToBook} Non-AC rooms. Only ${hall.num_non_ac_rooms} Non-AC rooms available.` });
    }

    const desiredBookingDate = new Date(booking_date);
    desiredBookingDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC

    // If date or floor changed, check for new availability
    if (
        existingBooking.booking_date.toISOString().split('T')[0] !== desiredBookingDate.toISOString().split('T')[0] ||
        existingBooking.floor !== floor
    ) {
        const isBooked = hall.availability_details.some(
            (detail) =>
                detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
                detail.floor === floor &&
                detail.status === 'booked' &&
                detail.booking_id.toString() !== existingBooking._id.toString() // Exclude the current booking's own slot
        );

        if (isBooked) {
            return res.status(400).json({ message: 'This hall floor is already booked for the selected date.' });
        }

        // --- Update Hall Availability (Remove old, add new) ---
        // 1. Remove old availability entry (if it existed)
        const oldAvailabilityIndex = hall.availability_details.findIndex(
            (detail) =>
                detail.date.toISOString().split('T')[0] === existingBooking.booking_date.toISOString().split('T')[0] &&
                detail.floor === existingBooking.floor &&
                detail.booking_id && detail.booking_id.toString() === existingBooking._id.toString()
        );

        if (oldAvailabilityIndex > -1) {
            hall.availability_details.splice(oldAvailabilityIndex, 1);
        }

        // 2. Add or update new availability entry
        const newAvailabilityIndex = hall.availability_details.findIndex(
            (detail) =>
                detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
                detail.floor === floor
        );

        if (newAvailabilityIndex > -1) {
            hall.availability_details[newAvailabilityIndex].status = 'booked';
            hall.availability_details[newAvailabilityIndex].booking_id = existingBooking._id;
        } else {
            hall.availability_details.push({
                date: desiredBookingDate,
                floor: floor,
                status: 'booked',
                booking_id: existingBooking._id,
            });
        }
        await hall.save(); // Save hall changes immediately
    }


    // Recalculate booking amount if relevant fields have changed
    const recalculatedBookingAmount = calculateBookingAmount(hall, {
        ...req.body,
        num_ac_rooms_booked: numAcRoomsToBook,
        num_non_ac_rooms_booked: numNonAcRoomsToBook
    });


    // Update booking fields
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
    existingBooking.is_ac = is_ac !== undefined ? is_ac : existingBooking.is_ac; // General AC flag
    existingBooking.add_parking = add_parking !== undefined ? add_parking : existingBooking.add_parking;
    // existingBooking.add_room removed
    existingBooking.booking_amount = recalculatedBookingAmount; // Update with recalculated amount

    const updatedBooking = await existingBooking.save();

    res.json({ message: 'Booking updated successfully!', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// @desc    Cancel a booking (User action)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Authenticated User/Admin)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // This `id` is the booking_id string

    const booking = await Booking.findOne({ booking_id: id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure user is authorized to cancel this booking
    if (!req.user.userType === 'Admin' && booking.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Only allow cancellation if booking is Pending or Confirmed
    if (booking.booking_status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    booking.booking_status = 'Cancelled';
    const cancelledBooking = await booking.save();

    // --- Delete Availability from Hall Schema ---
    const hall = await Hall.findById(cancelledBooking.hall_id); // Find hall using its ObjectId reference
    if (hall) {
      const availabilityIndex = hall.availability_details.findIndex(
        (detail) =>
          detail.date.toISOString().split('T')[0] === cancelledBooking.booking_date.toISOString().split('T')[0] &&
          detail.floor === cancelledBooking.floor &&
          detail.booking_id && detail.booking_id.toString() === cancelledBooking._id.toString()
      );

      if (availabilityIndex > -1) {
        hall.availability_details.splice(availabilityIndex, 1); // Remove the entry
        await hall.save(); // Save the updated hall document
      }
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
        const { id } = req.params; // This `id` is the booking_id string

        const booking = await Booking.findOne({ booking_id: id });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Before deleting the booking, remove its availability from the hall schema
        const hall = await Hall.findById(booking.hall_id);
        if (hall) {
             const availabilityIndex = hall.availability_details.findIndex(
                (detail) =>
                    detail.date.toISOString().split('T')[0] === booking.booking_date.toISOString().split('T')[0] &&
                    detail.floor === booking.floor &&
                    detail.booking_id && detail.booking_id.toString() === booking._id.toString()
            );

            if (availabilityIndex > -1) {
                hall.availability_details.splice(availabilityIndex, 1); // Remove the entry
                await hall.save(); // Save the updated hall document
            }
        }

        await Booking.deleteOne({ booking_id: id }); // Use deleteOne with the unique booking_id string
        res.json({ message: 'Booking deleted successfully!' });
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
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Booking status is required.' });
        }

        const booking = await Booking.findOne({ booking_id: id });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Validate the new status against allowed enum values from the schema
        const allowedStatuses = ['Confirmed', 'Pending', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status: ${status}. Allowed statuses are ${allowedStatuses.join(', ')}.` });
        }

        booking.booking_status = status;
        const updatedBooking = await booking.save();

        if (status === 'Confirmed') {
            const hall = await Hall.findById(updatedBooking.hall_id);
            if (hall) {
                const availabilityIndex = hall.availability_details.findIndex(
                    (detail) =>
                        detail.date.toISOString().split('T')[0] === updatedBooking.booking_date.toISOString().split('T')[0] &&
                        detail.floor === updatedBooking.floor &&
                        detail.booking_id && detail.booking_id.toString() === updatedBooking._id.toString()
                );

                if (availabilityIndex > -1) {
                    hall.availability_details[availabilityIndex].status = 'booked';
                } else {
                    hall.availability_details.push({
                        date: updatedBooking.booking_date,
                        floor: updatedBooking.floor,
                        status: 'booked',
                        booking_id: updatedBooking._id,
                    });
                }
                await hall.save();
            }
        } else if (status === 'Cancelled') { // If admin changes status to Cancelled directly
            const hall = await Hall.findById(updatedBooking.hall_id);
            if (hall) {
                const availabilityIndex = hall.availability_details.findIndex(
                    (detail) =>
                    detail.date.toISOString().split('T')[0] === updatedBooking.booking_date.toISOString().split('T')[0] &&
                    detail.floor === updatedBooking.floor &&
                    detail.booking_id && detail.booking_id.toString() === updatedBooking._id.toString()
                );
                if (availabilityIndex > -1) {
                    hall.availability_details.splice(availabilityIndex, 1);
                    await hall.save();
                }
            }
        }


        res.json({ message: 'Booking status updated successfully!', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Request a refund for a booking (User action)
// @route   PUT /api/bookings/:id/request-refund
// @access  Private (Authenticated User)
const requestRefund = async (req, res) => {
    try {
        const { id } = req.params; // booking_id string

        const booking = await Booking.findOne({ booking_id: id });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure user is authorized
        if (!req.user.userType === 'Admin' && booking.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to request refund for this booking' });
        }

        // Only allow refund request for Confirmed or Cancelled bookings
        if (!['Confirmed', 'Cancelled'].includes(booking.booking_status)) {
            return res.status(400).json({ message: 'Refund can only be requested for Confirmed or Cancelled bookings.' });
        }

        // Prevent multiple refund requests or requests if already processed/rejected
        if (['Pending', 'Processed', 'Rejected'].includes(booking.refund_status)) {
            return res.status(400).json({ message: `Refund is already ${booking.refund_status}.` });
        }

        booking.refund_status = 'Pending';
        // Set refund amount to the original booking amount by default for admin review
        booking.refund_amount = `Rs. ${booking.booking_amount}`; // Storing as string with "Rs. " prefix

        const updatedBooking = await booking.save();
        res.json({ message: 'Refund request submitted successfully! Awaiting admin review.', booking: updatedBooking });

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
        // Find booking by the unique booking_id string and include transaction_id
        const booking = await Booking.findOne({ booking_id: req.params.id }).select('+transaction_id');

        if (booking) {
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

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.refund_status !== 'Pending') {
            return res.status(400).json({ message: `Refund for booking ${booking.booking_id} is not in 'Pending' status. Current status: ${booking.refund_status}` });
        }

        booking.refund_status = 'Processed';
        booking.refund_processed_date = new Date(); // Set current date as processed date

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
};