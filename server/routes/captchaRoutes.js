const express = require('express');
const router = express.Router();
const { getCaptcha, verifyCaptcha } = require("../controller/captchaController");

// 1) Generate CAPTCHA (SVG + Token)
router.get("/get-captcha", getCaptcha);

router.post("/verify-captcha", verifyCaptcha);
module.exports = router;