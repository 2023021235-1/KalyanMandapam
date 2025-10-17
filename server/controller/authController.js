const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel"); // Your User model


const phoneOtpStore = {};

exports.sendPhoneOtp = async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
    
  try {
    existingUser = await User.findOne({ phone }); //
      if (existingUser) return res.status(400).json({ message: "Phone number already exists" });
      
    const message = `Dear Applicant, your OTP for Nagar Nigam Gorakhpur Kalyan Mandapam Portal is ${otp}. Do not share it with anyone,NNGGKP.`;
    const apiUrl = `${process.env.SMS_API_URL}?authentic-key=${process.env.SMS_API_KEY}&senderid=${process.env.SMS_SENDER_ID}&route=${process.env.SMS_ROUTE}&number=${phone}&message=${encodeURIComponent(message)}&templateid=${process.env.SMS_TEMPLATE_ID_OTP}`;

    const response = await fetch(apiUrl);
    const result = await response.text();

    // Check if the SMS was sent successfully
    // You'll need to adjust this based on the actual response format from the API
    if (response.ok || result.includes("msg-id")) {
      phoneOtpStore[phone] = otp;
      setTimeout(() => delete phoneOtpStore[phone], 600000);
      res.json({ message: "OTP sent to phone" });
    } else {
      console.error("SMS API Error:", result);
      res.status(500).json({ message: "Failed to send phone OTP" });
    }
  } catch (err) {
    console.error("Send Phone OTP error:", err);
    res.status(500).json({ message: "Failed to send phone OTP" });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  const { phone, otp, username:name, password } = req.body; //
  if (phoneOtpStore[phone] === parseInt(otp)) { //
    delete phoneOtpStore[phone]; //
    try {
      let existingUser = await User.findOne({ name }); //
      if (existingUser) return res.status(400).json({ message: "Username already exists" });
      existingUser = await User.findOne({ phone }); //
      if (existingUser) return res.status(400).json({ message: "Phone number already exists" });
      
      const hashedPassword = await bcrypt.hash(password, 10); //
      await new User({ name:name, password: hashedPassword, phone }).save(); //
      res.json({ message: "Signup successful" }); //
    } catch (error) {
      console.error("Verify Phone OTP error:", error);
      res.status(500).json({ message: "Error during signup process."});
    }
  } else {
    res.status(400).json({ message: "Invalid OTP" }); //
  }
};



// Add these new functions to authController.js

exports.initiatePasswordReset = async (req, res) => {
  const { phone } = req.body;
  
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    phoneOtpStore[phone] = otp;
    setTimeout(() => delete phoneOtpStore[phone], 600000);

    const message = `Dear Applicant, your OTP for Nagar Nigam Gorakhpur Dog Licensing Portal is ${otp}. Do not share it with anyone, NNGGKP.`;
    const apiUrl = `${process.env.SMS_API_URL}?authentic-key=${process.env.SMS_API_KEY}&senderid=${process.env.SMS_SENDER_ID}&route=${process.env.SMS_ROUTE}&number=${phone}&message=${encodeURIComponent(message)}&templateid=${process.env.SMS_TEMPLATE_ID_OTP}`;

    const response = await fetch(apiUrl);
    const result = await response.text();

    if (response.ok || result.includes("msg-id")) {
      res.json({ message: "OTP sent to phone for password reset" });
    } else {
      console.error("SMS API Error:", result);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to initiate password reset" });
  }
};

exports.verifyPasswordResetOtp = async (req, res) => {
  const { phone, otp } = req.body;
  
  if (phoneOtpStore[phone] !== parseInt(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete phoneOtpStore[phone];
  res.json({ message: "OTP verified successfully", verified: true });
};

exports.resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;
  
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  console.log("here")
  try {
    const user = await User.findOne({ phone });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.userType }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'none',
      maxAge: 4 * 60 * 60 * 1000 
    });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.userType,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user is populated by the verifyToken middleware
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.userType,
      }
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name: newUsername } = req.body;

    if (!newUsername || typeof newUsername !== 'string' || newUsername.trim() === '') {
        return res.status(400).json({ message: "Username is required and cannot be empty." });
    }

    const trimmedNewUsername = newUsername.trim();

    const existingUserWithNewUsername = await User.findOne({ name: trimmedNewUsername });
    if (existingUserWithNewUsername && existingUserWithNewUsername._id.toString() !== userId) {
        return res.status(400).json({ message: "This name is already taken. Please choose a different one." });
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    userToUpdate.name = trimmedNewUsername;
    await userToUpdate.save();

    res.json({
      message: "Profile updated successfully!",
      user: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        phone: userToUpdate.phone,
        role: userToUpdate.role,
      }
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile. Please try again." });
  }
};
// A dedicated store for OTPs related to phone number changes for logged-in users.
const phoneChangeOtpStore = {};

/**
 * @route   POST /api/auth/profile/change-password
 * @desc    Allows a logged-in user to change their password.
 * @access  Private
 */
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }
    if (newPassword.length < 6) { // Basic password policy
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Failed to update password." });
  }
};

/**
 * @route   POST /api/auth/profile/request-phone-update
 * @desc    Initiates a phone number change by sending an OTP to the new number.
 * @access  Private
 */
exports.requestPhoneUpdate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newPhone } = req.body;

    if (!newPhone) {
      return res.status(400).json({ message: "A new phone number is required." });
    }

    const existingUser = await User.findOne({ phone: newPhone });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "This phone number is already in use." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
      
    const message = `Dear Applicant, your OTP for Nagar Nigam Gorakhpur Dog Licensing Portal is ${otp}. Do not share it with anyone, NNGGKP.`;
    const apiUrl = `${process.env.SMS_API_URL}?authentic-key=${process.env.SMS_API_KEY}&senderid=${process.env.SMS_SENDER_ID}&route=${process.env.SMS_ROUTE}&number=${newPhone}&message=${encodeURIComponent(message)}&templateid=${process.env.SMS_TEMPLATE_ID_OTP}`;
    const response = await fetch(apiUrl);
    const result = await response.text();

    if (response.ok || result.includes("msg-id")) {
      phoneChangeOtpStore[userId] = { otp, newPhone };
      setTimeout(() => delete phoneChangeOtpStore[userId], 600000);

      res.json({ message: "OTP sent to your new phone number." });
    } else {
      console.error("SMS API Error:", result);
      res.status(500).json({ message: "Failed to send OTP." });
    }
  } catch (err) {
    console.error("Request phone update error:", err);
    res.status(500).json({ message: "Server error during phone update request." });
  }
};

/**
 * @route   POST /api/auth/profile/confirm-phone-update
 * @desc    Verifies the OTP and completes the phone number update.
 * @access  Private
 */
exports.confirmPhoneUpdate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;

    const storedData = phoneChangeOtpStore[userId];

    if (!storedData || storedData.otp !== parseInt(otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.phone = storedData.newPhone;
    await user.save();

    delete phoneChangeOtpStore[userId];

    res.json({ message: "Phone number updated successfully.", phone: user.phone });
  } catch (err) {
    console.error("Confirm phone update error:", err);
    res.status(500).json({ message: "Failed to update phone number." });
  }
};