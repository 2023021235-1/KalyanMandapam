// bookModel.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  hall_id_string:    { type: String, required: true },
  hall_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  user_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming user is authenticated

  booking_id:        { type: String, required: true, unique: true, trim: true }, // Unique ID for the booking
  transaction_id:    { type: String,  unique: true, trim: true }, // Unique ID for payment transaction
  booking_date:      { type: Date, required: true },
  floor:             { type: Number, required: true, min: 1 },

  function_type:     { type: String, required: true, trim: true },

  // area only for per-sqft events
  area_sqft:         { type: Number }, // Made optional as not all bookings are per-sqft

  booking_type: { // 'municipal', 'municipality', 'panchayat'
    type: String,
    enum: ['municipal', 'municipality', 'panchayat'],
    required: true
  },

  // Number of AC and Non-AC rooms booked by the user
  num_ac_rooms_booked:   { type: Number, default: 0, min: 0 },
  num_non_ac_rooms_booked: { type: Number, default: 0, min: 0 },

  // flags for fixed-price blocks
  is_parking:          { type: Boolean, default: false },
  is_conference_hall:  { type: Boolean, default: false },
  is_food_prep_area:   { type: Boolean, default: false },
  is_lawn:             { type: Boolean, default: false },
  is_ac:               { type: Boolean, default: false }, // Indicates if AC prices were applied for general areas/sqft events

  // legacy add-ons (if you still want extra beyond fixed blocks)
  add_parking:         { type: Boolean, default: false },
  
  isAllowed:         { type: Boolean, default: false }, // Admin allows the booking
  isPaid:            { type: Boolean, default: false }, // User has paid

  booking_status: {
    type: String,
    enum: ['Pending', 'AwaitingPayment', 'Confirmed', 'Cancelled'], // Updated statuses
    default: 'Pending',
    required: true,
  },
  booking_amount:      { type: Number, required: true },
   refund_status: {
        type: String,
        enum: ['Processed', 'Pending', 'Rejected', 'N/A'], 
        default: 'N/A',
    },
    refund_amount: {
        type: String, 
        default: 'Rs. 0',
    },
    refund_processed_date: {
        type: Date,
    },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Booking', bookSchema);