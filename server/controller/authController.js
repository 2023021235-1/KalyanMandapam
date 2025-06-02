// authController.js (or wherever your login controller is)
const User = require('../models/userModel');
const Otp = require('../models/otpModel'); // Assuming you might use this elsewhere
const jwt =require('jsonwebtoken');
// const bcrypt = require('bcryptjs'); // <-- You MUST install and use bcrypt for password hashing

const generateToken = (user) => {
// It's good practice to include userType in the token if you plan to use it for authorization middleware
return jwt.sign({ id: user._id, email: user.email, userType: user.userType }, process.env.JWT_SECRET, {
expiresIn: process.env.JWT_EXPIRES_IN,
});
};

// Signup Controller
const signup = async (req, res) => {
const { name, email, password, otp /*, userType */ } = req.body; // userType could optionally be passed during signup

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

  // --- SECURITY WARNING: Hash the password before saving ---
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt);
  // --- Replace 'password' with 'hashedPassword' in the create call ---

// If userType is provided in req.body, it will be used, otherwise the default 'User' from the schema will apply.
const newUser = await User.create({ name, email, password /*, userType: userType || undefined */ }); // <-- Use hashedPassword here
await Otp.deleteOne({ email }); // remove used OTP

const token = generateToken(newUser);
res.status(201).json({
token,
user: { name: newUser.name, email: newUser.email, userType: newUser.userType } // Send userType here too
});
};

// Login Controller
const login = async (req, res) => {
const { email, password } = req.body;

if (!email || !password) {
return res.status(400).json({ message: 'Email and password required' });
}

const user = await User.findOne({ email });

if (!user) {
return res.status(401).json({ message: 'Invalid credentials' });
}

// --- SECURITY WARNING: Comparing plain text passwords like this is HIGHLY INSECURE. ---
// You MUST hash passwords (e.g., with bcrypt) during signup and compare the hash during login.
// For example: const isMatch = await bcrypt.compare(password, user.password);
// if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
if (user.password !== password) { // This is insecure! Replace with bcrypt.compare
return res.status(401).json({ message: 'Invalid credentials' });
}

const token = generateToken(user);
res.status(200).json({
token,
userType: user.userType, // Send the userType from the fetched user object
 user: {
 id: user._id,
 name: user.name,
 email: user.email,
 userType: user.userType // Send userType in profile too
 // Add other fields you want to expose in the profile
 } // It's good practice to send the user's ID too
});
};

const getProfile = async (req, res) => {
    // req.user is already populated by the 'protect' middleware, excluding the password
    const user = req.user;

 if (!user) {
 // This case should ideally not be reached if 'protect' middleware runs first
 return res.status(404).json({ message: "User not found" });
 }

 res.json({
 user: {
 id: user._id,
 name: user.name,
 email: user.email,
 userType: user.userType // Send userType in profile too
 // Add other fields you want to expose in the profile
 }
 });
};

// New Update Profile Controller
const updateProfile = async (req, res) => {
    const { name } = req.body; // For now, only allowing name update
    
    if (!name || name.trim() === "") {
        return res.status(400).json({ message: 'Name cannot be empty' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, // User ID from 'protect' middleware
            { name },
            { new: true, runValidators: true } // Return updated document, run schema validators
        ).select('-password'); // Exclude password from the result

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return the same structure as getProfile and login
        res.status(200).json({
            token: req.headers.authorization?.split(" ")[1] || generateToken(updatedUser), // Optionally re-issue token or send existing
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                userType: updatedUser.userType
            }
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update profile' });
    }
};


module.exports = { signup, login, getProfile, updateProfile }; // Added updateProfile