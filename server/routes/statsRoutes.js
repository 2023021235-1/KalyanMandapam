const express = require('express');
const router = express.Router();
const { getStats } = require('../controller/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/stats
 * @desc    Get key application statistics for the admin dashboard.
 * This route is protected and accessible only by users with 'Admin' userType.
 * @access  Private/Admin
 */
router.get('/', protect, admin, getStats);

module.exports = router;
