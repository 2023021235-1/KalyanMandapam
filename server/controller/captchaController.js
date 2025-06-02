// controllers/captchaController.js

const svgCaptcha = require("svg-captcha");
const jwt = require("jsonwebtoken");

// Load a separate CAPTCHA secret (could be the same as your JWT secret, but better to keep it distinct)
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "CHANGE_THIS_TO_A_RANDOM_STRING";

// 1) Generate a new CAPTCHA and return both the SVG and a signed token
const getCaptcha = (req, res) => {
  // Create random text + SVG
  const captcha = svgCaptcha.create({
    size: 5,                // length of random string
    noise: 2,               // number of noise lines
    ignoreChars: "0oO1ilI", // avoid confusing chars
    color: true,
    background: "#f2f2f2",
  });

  // Sign the CAPTCHA text into a JWT (expires in 10 minutes)
  const token = jwt.sign(
    { captcha: captcha.text },
    CAPTCHA_SECRET,
    { expiresIn: "10m" }
  );

  // Send back JSON with both SVG (as a string) and the token
  res.json({
    svg: captcha.data,
    token,
  });
};

// 2) Verify the user’s input against the signed token
const verifyCaptcha = (req, res) => {
  const { captchaInput, captchaToken } = req.body;
  if (!captchaInput || !captchaToken) {
    return res.status(400).json({ success: false, message: "Missing CAPTCHA data" });
  }

  try {
    // Verify token is valid and not expired
    const payload = jwt.verify(captchaToken, CAPTCHA_SECRET);
    // payload.captcha is the original text
    if (payload.captcha.toLowerCase() === captchaInput.toLowerCase()) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: "Invalid CAPTCHA" });
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid or expired CAPTCHA token" });
  }
};

module.exports = { getCaptcha, verifyCaptcha };
