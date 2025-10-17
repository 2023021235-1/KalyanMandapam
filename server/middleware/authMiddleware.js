// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to check if the authenticated user is an admin
// Assumes req.user is populated by the 'protect' middleware and has a 'userType' field
const admin = (req, res, next) => {
    // Check if user is authenticated and if their userType is 'Admin'
    // Adjust 'Admin' string if your system uses a different value
    if (req.user && req.user.role === 'Admin') {
        next(); // User is admin, proceed
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' }); // Forbidden
    }
};
const verifyToken = (req, res, next) => {
   
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { admin,verifyToken  };
