const express = require("express");
const router = express.Router();
const {
  sendPhoneOtp,
  verifyPhoneOtp,
  login,
  getProfile,
  updateProfile,
  initiatePasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  // --- Import the new functions for profile editing ---
  updatePassword,
  requestPhoneUpdate,
  confirmPhoneUpdate
} = require("../controller/authController.js"); //
const { verifyToken } = require("../middleware/authMiddleware.js");

const rateLimit = require("express-rate-limit");

// Limit to 5 login attempts per 10 minutes per IP:
const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 4,                   // limit each IP to 5 requests per window
  message: {
    status: 429,
    error: "Too many attempts, please try again later."
  }
});

router.post("/send-phone-otp", rateLimiter,sendPhoneOtp); //
router.post("/verify-phone-otp", verifyPhoneOtp); //

// --- Routes for Forgot Password Flow ---
router.post("/forgot-password", initiatePasswordReset); //
router.post("/verify-reset-otp", verifyPasswordResetOtp); //
router.post("/reset-password", resetPassword); //

// --- Route for User Login ---
router.post("/login", login); //


router.get("/profile", verifyToken,getProfile); //


router.put("/profile",verifyToken,rateLimiter, updateProfile); //

// POST to change the user's password (requires current password)
router.post("/profile/change-password", rateLimiter,verifyToken,updatePassword);

// POST to request an OTP for a phone number change
router.post("/profile/request-phone-update", rateLimiter,verifyToken,requestPhoneUpdate);

// POST to confirm the OTP and finalize the phone number change
router.post("/profile/confirm-phone-update", rateLimiter,verifyToken,confirmPhoneUpdate);
// In your authRoutes.js
router.post("/logout", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none"
    })
    .json({ message: "Logged out" });
});

module.exports = router; 