// middleware/isAdmin.js
const jwt = require("jsonwebtoken");
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    console.log("not admin")
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
