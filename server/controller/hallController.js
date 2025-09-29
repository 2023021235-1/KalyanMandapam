// hallController.js
const Hall = require('../models/hallModel');
const Booking = require('../models/bookModel');

// @desc    Create a new hall
// @route   POST /api/halls
// @access  Private (Admin)
const createHall = async (req, res) => {
    try {
        const { hall_name, location, pricing } = req.body;

        // Simplified validation for the new schema
        if (!hall_name || pricing === undefined) {
            return res.status(400).json({ message: 'Please provide a hall name and a price.' });
        }
        if (typeof pricing !== 'number' || pricing < 0) {
            return res.status(400).json({ message: 'Price must be a non-negative number.' });
        }

        const hall = new Hall({
            hall_name,
            location,
            pricing,
            availability_details: [] // Initialize with empty availability
        });

        const createdHall = await hall.save();
        res.status(201).json(createdHall);

    } catch (error) {
        console.error('Error creating hall:', error);
        // Handle potential duplicate hall_name if you add a unique index to the schema
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A hall with this name already exists.' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
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
        console.error('Error fetching all halls:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single hall by its ID
// @route   GET /api/halls/:id
// @access  Public
const getHallById = async (req, res) => {
    try {
        // Find hall by MongoDB's standard _id
        const hall = await Hall.findById(req.params.id);

        if (hall) {
            res.json(hall);
        } else {
            res.status(404).json({ message: 'Hall not found' });
        }
    } catch (error) {
        console.error('Error fetching hall by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update hall details
// @route   PUT /api/halls/:id
// @access  Private (Admin)
const updateHall = async (req, res) => {
    try {
        const { hall_name, location, pricing } = req.body;
        const hall = await Hall.findById(req.params.id);

        if (hall) {
            hall.hall_name = hall_name || hall.hall_name;
            hall.location = location || hall.location;
            hall.pricing = pricing !== undefined ? pricing : hall.pricing;

            const updatedHall = await hall.save();
            res.json(updatedHall);
        } else {
            res.status(404).json({ message: 'Hall not found' });
        }
    } catch (error) {
        console.error('Error updating hall:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a hall
// @route   DELETE /api/halls/:id
// @access  Private (Admin)
const deleteHall = async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id);

        if (hall) {
            // Good practice: check for active bookings before deleting
            const activeBookings = await Booking.countDocuments({ 
                hall_id: hall._id, 
                booking_status: { $in: ['Confirmed', 'Pending-Approval', 'AwaitingPayment'] } 
            });
            if (activeBookings > 0) {
                return res.status(400).json({ message: `Cannot delete hall. There are ${activeBookings} active or pending bookings.` });
            }

            await Hall.findByIdAndDelete(req.params.id);
            res.json({ message: 'Hall removed successfully' });
        } else {
            res.status(404).json({ message: 'Hall not found' });
        }
    } catch (error) {
        console.error('Error deleting hall:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check hall availability for a given month and year
// @route   GET /api/halls/:id/availability
// @access  Public
const checkAvailability = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: 'Please provide a month and year.' });
        }

        const hall = await Hall.findById(req.params.id);
        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        const monthInt = parseInt(month, 10) - 1; // JS months are 0-indexed
        const yearInt = parseInt(year, 10);

        // Filter availability details for the requested month and year
        const availabilityForMonth = hall.availability_details.filter(detail => {
            const detailDate = new Date(detail.date);
            return detailDate.getUTCMonth() === monthInt && detailDate.getUTCFullYear() === yearInt;
        });
        
        // Group by date for easier frontend consumption
        const groupedAvailability = availabilityForMonth.reduce((acc, detail) => {
            const dateString = detail.date.toISOString().split('T')[0];
            if (!acc[dateString]) {
                acc[dateString] = [];
            }
            acc[dateString].push({ floor: detail.floor, status: detail.status });
            return acc;
        }, {});


        res.json({
            hall_id: hall._id,
            hall_name: hall.hall_name,
            availability: groupedAvailability,
        });

    } catch (error) {
        console.error('Error checking availability:', error);
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