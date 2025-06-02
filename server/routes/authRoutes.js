const express = require('express');
const router = express.Router();
const { signup, login,getProfile } = require('../controller/authController');
const { protect, admin } = require('../middleware/authMiddleware');
router.post('/signup', signup);
router.post('/login', login);
router.get("/profile",protect, getProfile);
const { getCaptcha, verifyCaptcha } = require("../controller/captchaController");

// Since we’re using sessions, ensure `express-session` is configured in index.js
// 1) Generate CAPTCHA SVG
router.get("/captcha", getCaptcha);

// 2) Verify CAPTCHA before proceeding to login
router.post("/verify-captcha", verifyCaptcha);

module.exports = router;