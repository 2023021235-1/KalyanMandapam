const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup Controller
const signup = async (req, res) => {
  const { name, email, password, otp } = req.body;

  if (!name || !email || !password || !otp) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = await User.create({ name, email, password });
  await Otp.deleteOne({ email }); // remove used OTP

  const token = generateToken(newUser);
  res.status(201).json({ token, user: { name: newUser.name, email: newUser.email } });
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  // SECURITY WARNING: Comparing plain text passwords like this is HIGHLY INSECURE.
  // You should hash passwords (e.g., with bcrypt) and compare the hash.
  const user = await User.findOne({ email });

  if (!user || user.password !== password)
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.status(200).json({ token, user: { name: user.name, email: user.email } });
};

const getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // FIX: Access decoded.id instead of decoded.userId
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Also ensure the fields you're returning exist on your User model
    // Based on signup, you have 'name' and 'email'. 'username', 'phone', 'role' might be missing.
    // Adjust the response fields based on your User model structure.
    res.json({ user: { name: user.name, email: user.email /* , add other fields if they exist */ } });

  } catch (err) {
    // Log the error for debugging server-side
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { signup, login, getProfile };