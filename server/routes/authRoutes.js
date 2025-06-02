const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile } = require('../controller/authController'); // Added updateProfile
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile); // New route for updating profile

module.exports = router;