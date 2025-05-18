// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Optional: for handling async errors
const User = require('../models/userModel'); // Assuming you have a User model

// Middleware to protect routes and verify JWT
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in the Authorization header (Bearer scheme)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret from environment variables

            // The 'exp' claim is automatically checked by jwt.verify()

            // Find user by ID from the token payload
            // Select('-password') excludes the password field for security
            req.user = await User.findById(decoded.id).select('-password');

            // Check if user exists
            if (!req.user) {
                 res.status(401); // Unauthorized
                 throw new Error('User not found');
            }

            // At this point, req.user contains the user document (excluding password)
            // The userType from the token payload (decoded.userType) is also available if needed,
            // but fetching the user ensures we have the most current user data.

            next(); // Proceed to the next middleware or route handler

        } catch (error) {
            console.error(error);
            // Specific error handling for expired tokens
            if (error.name === 'TokenExpiredError') {
                 res.status(401).json({ message: 'Not authorized, token expired' });
            } else if (error.name === 'JsonWebTokenError') {
                 // Handle other JWT errors like invalid signature
                 res.status(401).json({ message: 'Not authorized, invalid token' });
            }
            else {
                 // Catch any other errors during the process
                 res.status(401).json({ message: 'Not authorized, token validation failed' });
            }
        }
    } else {
        // If no token is provided
        res.status(401).json({ message: 'Not authorized, no token' });
    }
});

// Middleware to check if the authenticated user is an admin
// Assumes req.user is populated by the 'protect' middleware and has a 'userType' field
const admin = (req, res, next) => {
    // Check if user is authenticated and if their userType is 'Admin'
    // Adjust 'Admin' string if your system uses a different value
    if (req.user && req.user.userType === 'Admin') {
        next(); // User is admin, proceed
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' }); // Forbidden
    }
};


module.exports = { protect, admin };
