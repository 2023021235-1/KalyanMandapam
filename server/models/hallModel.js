// hallModel.js
const mongoose = require('mongoose');

// Define the schema for availability details within a hall for a specific floor
const availabilitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    floor: { // Changed from floor_number to floor to match bookModel and bookController
        type: Number,
        required: true,
        min: 1,
        default: 1
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

// reusable tiered prices schema
const tieredSchema = new mongoose.Schema({
  municipal:    { type: Number, required: true },
  municipality: { type: Number, required: true },
  panchayat:    { type: Number, required: true }
}, { _id: false });

// per-sqft event pricing - NOW WITH AC AND NON-AC TIERS
const eventPriceSchema = new mongoose.Schema({
  event_type:            { type: String, required: true, trim: true },
  prices_per_sqft_ac:    { type: tieredSchema, required: true }, // AC tiered prices
  prices_per_sqft_nonac: { type: tieredSchema, required: true }  // Non-AC tiered prices
}, { _id: false });

const hallSchema = new mongoose.Schema({
  hall_id:               { type: String, required: true, unique: true, trim: true },
  hall_name:             { type: String, required: true, trim: true },
  location:              { type: String, trim: true },
  capacity:              { type: Number, min: 1 },
  total_floors:          { type: Number, required: true, min: 0 }, // Changed min to 0
  total_area_sqft:       { type: Number, min: 0 }, // Added total_area_sqft
  description:           { type: String, trim: true },

  // Number of AC and Non-AC rooms available in the hall
  num_ac_rooms:          { type: Number, default: 0, min: 0 },
  num_non_ac_rooms:      { type: Number, default: 0, min: 0 },

  // fixed-price blocks with AC & Non-AC tiered rates
  conference_hall_ac:    { type: tieredSchema, required: true },
  conference_hall_nonac: { type: tieredSchema, required: true },

  food_prep_area_ac:     { type: tieredSchema, required: true },
  food_prep_area_nonac:  { type: tieredSchema, required: true },

  lawn_ac:               { type: tieredSchema, required: true },
  lawn_nonac:            { type: tieredSchema, required: true },

  room_rent_ac:          { type: tieredSchema, required: true }, // Price per AC room
  room_rent_nonac:       { type: tieredSchema, required: true }, // Price per Non-AC room

  parking:               { type: tieredSchema, required: true },

  // electricity charges tiered, split AC vs Non-AC
  electricity_ac:        { type: tieredSchema, required: true },
  electricity_nonac:     { type: tieredSchema, required: true },

  // cleaning charges tiered, same for AC & Non-AC
  cleaning:              { type: tieredSchema, required: true },

  // any additional per-sqft events
  event_pricing:         { type: [eventPriceSchema], default: [] },

  availability_details: [availabilitySchema],
}, {
  timestamps: true
});

module.exports = mongoose.model('Hall', hallSchema);