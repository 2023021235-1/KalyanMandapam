// hallModel.js
const mongoose = require('mongoose');

// Define the schema for availability details within a hall
const availabilitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        // Ensure uniqueness of date within the availability array for a hall
        // This requires careful handling in the controller when adding/updating
    },
    status: {
        type: String,
        enum: ['available', 'preliminary', 'booked', 'blocked', 'special'],
        default: 'available',
        required: true,
    },
    // Optional: Link to the booking if status is 'booked' or 'preliminary'
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking', // Reference to the Booking model
        required: function() {
            // booking_id is required if status is 'booked' or 'preliminary'
            return this.status === 'booked' || this.status === 'preliminary';
        },
    },
});

// Define the schema for the Hall model
const hallSchema = new mongoose.Schema({
    hall_id: {
        type: String,
        required: true,
        unique: true, // Ensure hall_id is unique
        trim: true,
    },
    hall_name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        // required: true, // Assuming location is essential
        trim: true,
    },
    capacity: {
        type: Number,
        // required: true, // Assuming capacity is important
        min: 1,
    },
    description: {
        type: String,
        trim: true,
    },
    rent_commercial: {
        type: String, // Storing as string to match frontend format 'Rs. X'
        required: true,
        trim: true,
    },
    rent_social: {
        type: String, // Storing as string
        required: true,
        trim: true,
    },
    rent_non_commercial: {
        type: String, // Storing as string
        required: true,
        trim: true,
    },
    // Array to store availability details
    availability_details: [availabilitySchema],
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the Mongoose model
const Hall = mongoose.model('Hall', hallSchema);

module.exports = Hall;
