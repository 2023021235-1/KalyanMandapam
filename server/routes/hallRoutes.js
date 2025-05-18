// hallRoutes.js
const express = require('express');
const router = express.Router();
const {
    createHall,
    getAllHalls,
    getHallById,
    updateHall,
    deleteHall,
    checkAvailability,
} = require('../controller/hallController');
const { protect, admin } = require('../middleware/authMiddleware'); // Import the protect and admin middleware


// Public routes
router.get('/', getAllHalls); // Get all halls
router.get('/:id', getHallById); // Get hall by unique hall_id string
router.get('/:id/availability', checkAvailability); // Check availability for a hall by unique hall_id string

// Admin routes (using both protect and admin middleware)
router.post('/', protect, admin, createHall); // Create a new hall
router.put('/:id', protect, admin, updateHall); // Update hall details by unique hall_id string
router.delete('/:id', protect, admin, deleteHall); // Delete a hall by unique hall_id string


module.exports = router;
