// controllers/captchaController.js
const svgCaptcha = require("svg-captcha");

// Generate a CAPTCHA SVG and store its text in session
const getCaptcha = (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5,                // length of random string
    noise: 2,               // number of noise lines
    ignoreChars: "0oO1ilI", // avoid confusing characters
    color: true,            // colored text
    background: "#f2f2f2"   // light gray background
  });
  req.session.captcha = captcha.text; // save the text for later verification
  res.type("svg").send(captcha.data);
};

// Verify the user’s input against the stored session CAPTCHA
const verifyCaptcha = (req, res) => {
  const { captchaInput } = req.body;
  if (req.session.captcha && captchaInput === req.session.captcha) {
    return res.json({ success: true });
  }
  return res.status(400).json({ success: false, message: "Invalid CAPTCHA" });
};

module.exports = { getCaptcha, verifyCaptcha };
