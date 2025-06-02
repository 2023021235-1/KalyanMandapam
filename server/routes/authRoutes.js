const express = require('express');
const router = express.Router();
const { signup, login,getProfile } = require('../controller/authController');
const { protect, admin } = require('../middleware/authMiddleware');
router.post('/signup', signup);
router.post('/login', login);
router.get("/profile",protect, getProfile);

module.exports = router;