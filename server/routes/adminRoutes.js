const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware.js");
const adminAuthController = require('../controller/adminAuthController');
const { isAdmin } = require("../middleWare/isAdmin");

router.post('/add-admin', verifyToken, isAdmin, adminAuthController.addAdmin);
router.get('/admins', verifyToken, isAdmin, adminAuthController.getAllAdmins);
// --- NEW ROUTES ADDED ---
router.patch('/admin/:id', verifyToken, isAdmin, adminAuthController.updateAdmin);
router.delete('/admin/:id', verifyToken, isAdmin, adminAuthController.deleteAdmin);
// 

module.exports = router;