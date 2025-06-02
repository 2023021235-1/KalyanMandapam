const express = require('express');
const router = express.Router();
const { signup, login,getProfile } = require('../controller/authController');
const { protect, admin } = require('../middleware/authMiddleware');
router.post('/signup', signup);
router.post('/login', login);
router.get("/profile",protect, getProfile);
const { getCaptcha, verifyCaptcha } = require("../controller/captchaController");

// 1) Generate CAPTCHA (SVG + Token)
router.get("/captcha", getCaptcha);

// 2) Verify CAPTCHA (client sends back their input + token to check)
router.post("/verify-captcha", verifyCaptcha);

module.exports = router;