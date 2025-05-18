const mongoose = require('mongoose');

// Define the schema for the Booking model
const bookSchema = new mongoose.Schema({
    booking_id: {
        type: String,
        required: true,
        unique: true, // Ensure booking_id is unique
        trim: true,
    },
    hall_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Hall model's internal _id
        ref: 'Hall', // Reference to the Hall model
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to a User model's internal _id
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    booking_date: {
        type: Date,
        required: true,
    },
    floor: {
        type: String,
        trim: true,
    },
    function_type: {
        type: String,
        required: true,
        trim: true,
    },
    booking_amount: {
        type: String, // Storing as string to match frontend format 'Rs. X'
        required: true, // Keeping booking_amount required as a price must be set
        trim: true,
    },
    booking_status: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Cancelled'], // Align with frontend statuses
        default: 'Pending',
        required: true,
    },
    addon_ac_heating: {
        type: Boolean, // Using boolean for Yes/No
        default: false,
    },
    booking_type: {
        type: String,
        // Removed 'required: true' to make it optional
        enum: ['employee', 'ex-employee', 'ndmc-resident', 'non-ndmc-resident', 'commercial', 'social', 'non-commercial'], // Added commercial, social, non-commercial to enum for clarity, though not strictly required by schema now
    },
    refund_status: {
        type: String,
        enum: ['Processed', 'Pending', 'Rejected', 'N/A'], // Align with frontend statuses, add N/A
        default: 'N/A',
    },
    refund_amount: {
        type: String, // Storing as string
        default: 'Rs. 0',
    },
    refund_processed_date: {
        type: Date,
        // Only required if refund_status is 'Processed'
        required: function() {
            return this.refund_status === 'Processed';
        },
    },
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the Mongoose model
const Booking = mongoose.model('Booking', bookSchema);

module.exports = Booking;