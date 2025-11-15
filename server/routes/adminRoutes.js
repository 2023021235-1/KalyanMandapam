const express = require("express");
const router = express.Router();
const { verifyToken, admin } = require('../middleware/authMiddleware'); // Assuming you have an admin middleware

const adminAuthController = require('../controller/adminAuthController');
// const { nameadmin } = require("../middleWare/nameadmin");

router.post('/add-admin', verifyToken, nameadmin, adminAuthController.addAdmin);
router.get('/admins', verifyToken, nameadmin, adminAuthController.getAllAdmins);
// --- NEW ROUTES ADDED ---
router.patch('/admin/:id', verifyToken, nameadmin, adminAuthController.updateAdmin);
router.delete('/admin/:id', verifyToken, nameadmin, adminAuthController.deleteAdmin);
// 

module.exports = router;