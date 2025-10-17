const express = require('express');
const router = express.Router();
const { getStats } = require('../controller/statsController');
const { verifyToken, admin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/stats
 * @desc    Get key application statistics for the admin dashboard.
 * This route is verifyTokened and accessible only by users with 'Admin' userType.
 * @access  Private/Admin
 */
router.get('/', verifyToken, admin, getStats);

module.exports = router;
