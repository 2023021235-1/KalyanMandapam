// bookModel.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  // --- Core Booking Details ---
  hall_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hall', 
    required: true 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, 
  booking_id: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  booking_date: { 
    type: Date, 
    required: true 
  },
  booking_amount: { 
    type: Number, 
    required: true 
  }, // This will now come directly from hall.pricing

  // --- Payment & Transaction ---
  transaction_id: { 
    type: String, 
    trim: true 
  },
  isPaid: { 
    type: Boolean, 
    default: false 
  },

  isAllowed: { 
    type: Boolean, 
    default: false 
  }, 
  booking_status: {
    type: String,
    enum: ['Pending-Approval', 'AwaitingPayment', 'Confirmed', 'Cancelled', 'Payment-Processing', 'Payment-Failed', 'Refunded', 'Refund-Pending'], 
    default: 'Pending-Approval',
    required: true,
  },

  // --- Refund Details ---
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