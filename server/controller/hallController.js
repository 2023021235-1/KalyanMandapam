// hallController.js
const Hall = require('../models/hallModel');
const Booking = require('../models/bookModel'); // Need Booking model for availability check logic

// @desc    Create a new hall
// @route   POST /api/halls
// @access  Private (Admin) - Assuming only admins can add halls
const createHall = async (req, res) => {
    try {
        // Destructure all fields from the request body, including new pricing structures
        const {
            hall_name,
            location,
            capacity,
            description,
            total_floors,
            total_area_sqft, // Added total_area_sqft
            conference_hall_ac,
            conference_hall_nonac,
            food_prep_area_ac,
            food_prep_area_nonac,
            lawn_ac,
            lawn_nonac,
            room_rent_ac,
            room_rent_nonac,
            parking,
            electricity_ac,
            electricity_nonac,
            cleaning,
            event_pricing // This will be an array of event pricing objects
        } = req.body;

        // Basic validation for required hall details and all fixed-price blocks
        if (
            !hall_name || total_floors === undefined || // Check for undefined, 0 is now allowed
            !conference_hall_ac || !conference_hall_nonac ||
            !food_prep_area_ac || !food_prep_area_nonac ||
            !lawn_ac || !lawn_nonac ||
            !room_rent_ac || !room_rent_nonac ||
            !parking ||
            !electricity_ac || !electricity_nonac ||
            !cleaning
        ) {
            return res.status(400).json({ message: 'Please provide all required hall details and pricing information.' });
        }

        // Validate that each tiered price object has all three types
        const validateTieredPrice = (priceObj) => {
            return priceObj && typeof priceObj.municipal === 'number' && typeof priceObj.municipality === 'number' && typeof priceObj.panchayat === 'number';
        };

        // Validate all fixed price blocks
        if (
            !validateTieredPrice(conference_hall_ac) || !validateTieredPrice(conference_hall_nonac) ||
            !validateTieredPrice(food_prep_area_ac) || !validateTieredPrice(food_prep_area_nonac) ||
            !validateTieredPrice(lawn_ac) || !validateTieredPrice(lawn_nonac) ||
            !validateTieredPrice(room_rent_ac) || !validateTieredPrice(room_rent_nonac) ||
            !validateTieredPrice(parking) ||
            !validateTieredPrice(electricity_ac) || !validateTieredPrice(electricity_nonac) ||
            !validateTieredPrice(cleaning)
        ) {
            return res.status(400).json({ message: 'All fixed price blocks must have municipal, municipality, and panchayat rates.' });
        }

        // Validate event_pricing: must be an array and each item must conform to eventPriceSchema
        if (!Array.isArray(event_pricing) || event_pricing.length === 0) {
             return res.status(400).json({ message: 'At least one event pricing entry is required.' });
        }
        for (const event of event_pricing) {
            if (!event.event_type || !validateTieredPrice(event.prices_per_sqft_ac) || !validateTieredPrice(event.prices_per_sqft_nonac)) {
                return res.status(400).json({ message: 'Each event pricing entry must have an event_type and valid AC and Non-AC tiered prices.' });
            }
        }

        // Generate a unique hall_id by finding the last one and incrementing
        const [lastHall] = await Hall.aggregate([
            {
                $addFields: { numericId: { $toInt: "$hall_id" } }
            },
            { $sort: { numericId: -1 } },
            { $limit: 1 }
        ]);

        const lastNum = lastHall ? lastHall.numericId : 0;
        const nextHallId = (lastNum + 1).toString();

        // Check if the generated hall_id already exists (unlikely with auto-increment but good practice)
        const existingHall = await Hall.findOne({ hall_id: nextHallId });
        if (existingHall) {
            return res.status(500).json({ message: `Failed to generate a unique hall ID. Hall ID ${nextHallId} already exists.` });
        }

        const hall_id = nextHallId; // Assign the generated ID

        // Create a new Hall instance with all provided data
        const hall = new Hall({
            hall_id,
            hall_name,
            location,
            capacity,
            description,
            total_floors,
            total_area_sqft, // Added total_area_sqft
            conference_hall_ac,
            conference_hall_nonac,
            food_prep_area_ac,
            food_prep_area_nonac,
            lawn_ac,
            lawn_nonac,
            room_rent_ac,
            room_rent_nonac,
            parking,
            electricity_ac,
            electricity_nonac,
            cleaning,
            event_pricing,
            availability_details: [] // Initialize with empty availability
        });

        const createdHall = await hall.save();
        res.status(201).json(createdHall);

    } catch (error) {
        console.error('Error creating hall:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAllHalls = async (req, res) => {
    try {
        const halls = await Hall.find({});
        res.json(halls);
    } catch (error) {
        console.error('Error fetching all halls:', error);
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
        console.error('Error fetching hall by ID:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update hall details
// @route   PUT /api/halls/:id
// @access  Private (Admin)
const updateHall = async (req, res) => {
    try {
        // Destructure all fields from the request body, including new pricing structures
        const {
            hall_name,
            location,
            capacity,
            description,
            total_floors,
            total_area_sqft, // Added total_area_sqft
            conference_hall_ac,
            conference_hall_nonac,
            food_prep_area_ac,
            food_prep_area_nonac,
            lawn_ac,
            lawn_nonac,
            room_rent_ac,
            room_rent_nonac,
            parking,
            electricity_ac,
            electricity_nonac,
            cleaning,
            event_pricing // This will be an array of event pricing objects
        } = req.body;

        // Find hall by the unique hall_id string
        const hall = await Hall.findOne({ hall_id: req.params.id });

        if (hall) {
            // Update basic hall details
            hall.hall_name = hall_name !== undefined ? hall_name : hall.hall_name;
            hall.location = location !== undefined ? location : hall.location;
            hall.capacity = capacity !== undefined ? capacity : hall.capacity;
            hall.description = description !== undefined ? description : hall.description;
            hall.total_floors = total_floors !== undefined ? total_floors : hall.total_floors;
            hall.total_area_sqft = total_area_sqft !== undefined ? total_area_sqft : hall.total_area_sqft; // Updated

            // Update all fixed-price blocks if provided
            if (conference_hall_ac) hall.conference_hall_ac = conference_hall_ac;
            if (conference_hall_nonac) hall.conference_hall_nonac = conference_hall_nonac;
            if (food_prep_area_ac) hall.food_prep_area_ac = food_prep_area_ac;
            if (food_prep_area_nonac) hall.food_prep_area_nonac = food_prep_area_nonac;
            if (lawn_ac) hall.lawn_ac = lawn_ac;
            if (lawn_nonac) hall.lawn_nonac = lawn_nonac;
            if (room_rent_ac) hall.room_rent_ac = room_rent_ac;
            if (room_rent_nonac) hall.room_rent_nonac = room_rent_nonac;
            if (parking) hall.parking = parking;
            if (electricity_ac) hall.electricity_ac = electricity_ac;
            if (electricity_nonac) hall.electricity_nonac = electricity_nonac;
            if (cleaning) hall.cleaning = cleaning;

            // Update event_pricing if provided and is an array
            if (event_pricing && Array.isArray(event_pricing)) {
                // Validate event_pricing before assigning
                const validateTieredPrice = (priceObj) => {
                    return priceObj && typeof priceObj.municipal === 'number' && typeof priceObj.municipality === 'number' && typeof priceObj.panchayat === 'number';
                };
                for (const event of event_pricing) {
                    if (!event.event_type || !validateTieredPrice(event.prices_per_sqft_ac) || !validateTieredPrice(event.prices_per_sqft_nonac)) {
                        return res.status(400).json({ message: 'Each event pricing entry must have an event_type and valid AC and Non-AC tiered prices.' });
                    }
                }
                hall.event_pricing = event_pricing;
            } else if (event_pricing && !Array.isArray(event_pricing)) {
                return res.status(400).json({ message: 'Event pricing must be an array.' });
            }


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
        // Find hall by the unique hall_id string
        const hall = await Hall.findOne({ hall_id: req.params.id });

        if (hall) {
            // Check if there are any active bookings for this hall before deleting
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
        console.error('Error deleting hall:', error);
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
        const availabilityForMonth = hall.availability_details.filter(detail => {
            const detailDate = new Date(detail.date);
            return detailDate.getMonth() === monthInt - 1 && detailDate.getFullYear() === yearInt;
        });

        // For checkAvailability, you might want to return availability grouped by date,
        // where each date lists the availability of its floors.
        const groupedAvailability = {};
        availabilityForMonth.forEach(detail => {
            const dateString = detail.date.toISOString().split('T')[0]; //YYYY-MM-DD format
            if (!groupedAvailability[dateString]) {
                groupedAvailability[dateString] = [];
            }
            groupedAvailability[dateString].push({
                floor: detail.floor, // Use 'floor' as per bookModel.js and hallModel.js availability_details
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
