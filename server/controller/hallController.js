// hallController.js
const Hall = require('../models/hallModel');
const Booking = require('../models/bookModel'); // Need Booking model for availability check logic

// @desc    Create a new hall
// @route   POST /api/halls
// @access  Private (Admin) - Assuming only admins can add halls
const createHall = async (req, res) => {
    try {
        const { hall_name, location, capacity, description, rent_commercial, rent_social, rent_non_commercial, total_floors } = req.body;

        // Basic validation
        if (!hall_name || !rent_commercial || !rent_social || !rent_non_commercial || !total_floors) {
            return res.status(400).json({ message: 'Please provide required hall details (Hall Name, Rent types, Total Floors).' });
        }

     const [lastHall] = await Hall.aggregate([
  { 
    $addFields: { numericId: { $toInt: "$hall_id" } }
  },
  { $sort: { numericId: -1 } },
  { $limit: 1 }
]);

// If none exists yet, lastHall will be undefined
const lastNum = lastHall ? lastHall.numericId : 0;
const nextHallId = (lastNum + 1).toString();

        // Check if the generated hall_id already exists (unlikely with auto-increment but good practice)
        const existingHall = await Hall.findOne({ hall_id: nextHallId });
        if (existingHall) {
             // This scenario should ideally not happen with proper id generation,
             // but as a fallback, you might want to handle it or log an error.
             // For now, let's return an error, indicating a potential issue with ID generation.
             return res.status(500).json({ message: `${existingHall}Failed to generate a unique hall ID.` });
        }

        const hall_id = nextHallId; // Assign the generated ID

        const hall = new Hall({
            hall_id, // Use the generated ID
            hall_name,
            location,
            capacity,
            description,
            rent_commercial,
            rent_social,
            rent_non_commercial,
            total_floors, // Add total_floors
            availability_details: [] // Initialize with empty availability
        });

        const createdHall = await hall.save();
        res.status(201).json(createdHall);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllHalls = async (req, res) => {
    try {
        const halls = await Hall.find({});
        res.json(halls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

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
        const { hall_name, location, capacity, description, rent_commercial, rent_social, rent_non_commercial, total_floors, availability_details } = req.body;

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
            hall.total_floors = total_floors || hall.total_floors; // Handle update for total_floors

            // Handle updating availability_details - this is a simplified approach.
            // In a real app, you'd merge/update carefully, likely per date/floor.
            // Replacing the whole array is dangerous if bookings exist.
            if (availability_details && Array.isArray(availability_details)) {
                   // Clear existing and add new - BE CAREFUL with this in production
                   // A better approach would be to find and update specific entries or add new ones.
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
            // Note: Booking model would need to store the hall's _id for this check.
            // Assuming Booking has a hall_id field referencing Hall._id
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

        // Find the hall by its unique hall_id string and populate availability details for the month
        const hall = await Hall.findOne({ hall_id: hallIdString });

        if (!hall) {
            return res.status(404).json({ message: 'Hall not found' });
        }

        // Filter availability details for the requested month and year
        // Note: With floor_number in availability_details, this now returns availability per floor for the month.
        // Frontend will need to process this list to show availability per date/floor.
        const availabilityForMonth = hall.availability_details.filter(detail => {
            const detailDate = new Date(detail.date);
            return detailDate.getMonth() === monthInt - 1 && detailDate.getFullYear() === yearInt;
        });

        // For checkAvailability, you might want to return availability grouped by date,
        // where each date lists the availability of its floors.
        // Let's transform the flat list into a date-keyed object.
        const groupedAvailability = {};
        availabilityForMonth.forEach(detail => {
            const dateString = detail.date.toISOString().split('T')[0]; // YYYY-MM-DD format
            if (!groupedAvailability[dateString]) {
                groupedAvailability[dateString] = [];
            }
            groupedAvailability[dateString].push({
                floor_number: detail.floor_number,
                status: detail.status,
                booking_id: detail.booking_id, // Include booking_id if needed
            });
        });


        res.json({
            hall_id: hall.hall_id,
            hall_name: hall.hall_name,
            total_floors: hall.total_floors,
            availability: groupedAvailability // Return availability grouped by date
        });


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