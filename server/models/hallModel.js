// hallModel.js
const mongoose = require('mongoose');

// Assuming availabilitySchema remains the same
const availabilitySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    floor: { type: Number, required: true, min: 1, default: 1 }, // Note: You might remove 'floor' if it's no longer needed.
    status: {
        type: String,
        enum: ['available', 'preliminary', 'booked', 'blocked', 'special'],
        default: 'available',
        required: true,
    },
    booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
});

const hallSchema = new mongoose.Schema({
  hall_name:            { type: String, required: true, trim: true },
  location:             { type: String, trim: true },
  pricing:              { type: Number, min: 0, required: true }, // A single price per booking
  availability_details: [availabilitySchema],
}, {
  timestamps: true
});

module.exports = mongoose.model('Hall', hallSchema);