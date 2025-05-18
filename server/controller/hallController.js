// hallController.js
const Hall = require('../models/hallModel');
const Booking = require('../models/bookModel'); // Need Booking model for availability check logic

// @desc    Create a new hall
// @route   POST /api/halls
// @access  Private (Admin) - Assuming only admins can add halls
const createHall = async (req, res) => {
    try {
        const { hall_id, hall_name, location, capacity, description, rent_commercial, rent_social, rent_non_commercial } = req.body;

        // Basic validation
        if (!hall_id || !hall_name || !rent_commercial || !rent_social || !rent_non_commercial) {
            return res.status(400).json({ message: 'Please provide required hall details.' });
        }

        // Check if hall_id already exists
        const existingHall = await Hall.findOne({ hall_id });
        if (existingHall) {
            return res.status(400).json({ message: 'Hall with this ID already exists.' });
        }

        const hall = new Hall({
            hall_id,
            hall_name,
            location,
            capacity,
            description,
            rent_commercial,
            rent_social,
            rent_non_commercial,
            availability_details: [] // Initialize with empty availability
        });

        const createdHall = await hall.save();
        res.status(201).json(createdHall);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all halls
// @route   GET /api/halls
// @access  Public
const getAllHalls = async (req, res) => {
    try {
        const halls = await Hall.find({});
        res.json(halls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get hall by ID
// @route   GET /api/halls/:id
// @access  Public
const getHallById = async (req, res) => {
    try {
        // Find hall by the unique hall_id string
        const hall = await Hall.findOne({ hall_id: req.params.id });

        if (hall) {
            res.json(hall);
        } else {
            res.status(404).json({ message: 'Hall not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update hall details
// @route   PUT /api/halls/:id
// @access  Private (Admin)
const updateHall = async (req, res) => {
    try {
        const { hall_name, location, capacity, description, rent_commercial, rent_social, rent_non_commercial, availability_details } = req.body;

        // Find hall by the unique hall_id string
        const hall = await Hall.findOne({ hall_id: req.params.id });

        if (hall) {
            hall.hall_name = hall_name || hall.hall_name;
            hall.location = location || hall.location;
            hall.capacity = capacity || hall.capacity;
            hall.description = description || hall.description;
            hall.rent_commercial = rent_commercial || hall.rent_commercial;
            hall.rent_social = rent_social || hall.rent_social;
            hall.rent_non_commercial = rent_non_commercial || hall.rent_non_commercial;

            // Handle updating availability_details - this is a simplified approach.
            // In a real app, you'd merge/update carefully.
            if (availability_details && Array.isArray(availability_details)) {
                 // Clear existing and add new - BE CAREFUL with this in production
                 hall.availability_details = availability_details;
            }


            const updatedHall = await hall.save();
            res.json(updatedHall);
        } else {
            res.status(404).json({ message: 'Hall not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a hall
// @route   DELETE /api/halls/:id
// @access  Private (Admin)
const deleteHall = async (req, res) => {
    try {
        // Find hall by the unique hall_id string
        const hall = await Hall.findOne({ hall_id: req.params.id });

        if (hall) {
            // Optional: Check if there are any active bookings for this hall before deleting
            const activeBookings = await Booking.countDocuments({ hall_id: hall._id, booking_status: { $in: ['Confirmed', 'Pending'] } });
            if (activeBookings > 0) {
                return res.status(400).json({ message: 'Cannot delete hall with active bookings.' });
            }

            await hall.deleteOne(); // Use deleteOne() for Mongoose 6+
            res.json({ message: 'Hall removed' });
        } else {
            res.status(404).json({ message: 'Hall not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check availability for a hall within a date range
// @route   GET /api/halls/:id/availability
// @access  Public
// Query params: start_date, end_date (optional), month, year (optional)
const checkAvailability = async (req, res) => {
    try {
        const hallIdString = req.params.id; // The hall_id string
        const { month, year } = req.query; // Get month and year from query params

        if (!month || !year) {
             return res.status(400).json({ message: 'Please provide month and year for availability check.' });
        }

        const monthInt = parseInt(month);
        const yearInt = parseInt(year);

        if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
             return res.status(400).json({ message: 'Invalid month or year.' });
        }

        // Find the hall by its unique hall_id string
        const hall = await Hall.findOne({ hall_id: hallIdString });

        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        // Filter availability details for the requested month and year
        const availabilityForMonth = hall.availability_details.filter(detail => {
            const detailDate = new Date(detail.date);
            return detailDate.getMonth() === monthInt - 1 && detailDate.getFullYear() === yearInt;
        });

        // Format the output to match the frontend's expected structure if needed
        // For now, just return the filtered details
        res.json(availabilityForMonth);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = {
    createHall,
    getAllHalls,
    getHallById,
    updateHall,
    deleteHall,
    checkAvailability,
};
