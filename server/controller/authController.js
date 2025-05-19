// authController.js (or wherever your login controller is)
const User = require('../models/userModel');
const Otp = require('../models/otpModel'); // Assuming you might use this elsewhere
const jwt = require('jsonwebtoken');
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
// The 'protect' middleware should handle token verification and user fetching
    // If you are using 'protect' middleware before this route, the following token check is redundant
    // and req.user will already be populated.
    // If this route is NOT protected, then the token check below is necessary.

    // Assuming 'protect' middleware is used before this route:
    if (!req.user) {
        // This case should ideally not be reached if 'protect' middleware runs first
        return res.status(401).json({ message: 'Not authenticated' });
    }

    // req.user is already populated by the 'protect' middleware, excluding the password
    const user = req.user;

 if (!user) {
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

    // If this route is NOT protected by the 'protect' middleware, uncomment and use the code below:
    /*
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        res.status(500).json({ message: "Failed to authenticate token" });
    }
    */
};


module.exports = { signup, login, getProfile };
