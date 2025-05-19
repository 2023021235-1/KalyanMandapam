// hallModel.js
const mongoose = require('mongoose');

// Define the schema for availability details within a hall for a specific floor
const availabilitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        // Note: Uniqueness per date AND floor will be enforced at the application level
        // when embedded in the hall's availability_details array.
    },
   floor_number: {
    type: Number,
    required: true,
    min: 1,
    default: 1              // ← ensure we always have at least “1”
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

// Add a compound index for date and floor_number to the subdocument schema
// This provides validation if you were using the subdocument directly,
// but application logic is needed for uniqueness within the embedded array.
availabilitySchema.index({ date: 1, floor_number: 1 }, { unique: true });


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
    total_floors: {
        type: Number,
        required: true,
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
    // Array to store availability details per floor per date
    availability_details: [availabilitySchema],
    // Add a compound index for date and floor_number within the availability_details array
    // This is a bit tricky for embedded documents, usually handled in application logic
    // Mongoose does not directly support unique compound indexes on nested arrays this way.
    // We will rely on application-level validation in the controller for unique date/floor per hall.
    // Mongoose unique compound index on the subdocument schema (above) is for validation when using the subdocument directly.
    // When embedded in an array, you typically need application logic to enforce uniqueness.
    // However, let's keep the index definition on the subschema as it's good practice.
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the Mongoose model
const Hall = mongoose.model('Hall', hallSchema);

module.exports = Hall;