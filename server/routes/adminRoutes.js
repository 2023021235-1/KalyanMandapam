const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require('../middleware/authMiddleware'); // Assuming you have an admin middleware

const adminAuthController = require('../controller/adminAuthController');
// const { admin } = require("../middleWare/admin");

router.post('/add-admin', verifyToken, admin, adminAuthController.addAdmin);
router.get('/admins', verifyToken, admin, adminAuthController.getAllAdmins);
// --- NEW ROUTES ADDED ---
router.patch('/admin/:id', verifyToken, admin, adminAuthController.updateAdmin);
router.delete('/admin/:id', verifyToken, admin, adminAuthController.deleteAdmin);
// 

module.exports = router;