const bcrypt = require("bcryptjs");
const User = require("../models/userModel"); // Your User model

/**
 * @route   POST /api/admin/add-admin
 * @desc    Allows a super-admin to create a new admin user.
 * @access  Private (Admin Only)
 */
exports.addAdmin = async (req, res) => {
  // Use 'name' from req.body instead of 'username'
  const { name, phone, password } = req.body;

  // 1. Validation
  if (!name || !phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // --- Standardize phone number ---
    let standardizedPhone = phone.trim();
    if (!standardizedPhone.startsWith('+91')) {
      standardizedPhone = '+91' + standardizedPhone;
    }

    // --- Check for existing phone number ---
    let existingUser = await User.findOne({ phone: standardizedPhone });

    if (existingUser) {
      return res.status(400).json({ message: "Phone number already exists." });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create new admin user
    const newUser = new User({
      name, // Use 'name'
      phone: standardizedPhone,
      password: hashedPassword,
      userType: "Admin", // Use 'userType'
    });

    await newUser.save();

    res.status(201).json({ message: "Admin user created successfully." });
  } catch (error) {
    console.error("Add Admin error:", error);
    res.status(500).json({ message: "Server error while creating admin." });
  }
};

/**
 * @route   GET /api/admin/admins
 * @desc    Gets a list of all admin users.
 * @access  Private (Admin Only)
 */
exports.getAllAdmins = async (req, res) => {
  try {
    // Find by 'userType'
    const admins = await User.find({ userType: "Admin" })
                             .select("-password"); // Only select out password
    res.json(admins);
  } catch (error) {
    console.error("Get All Admins error:", error);
    res.status(500).json({ message: "Server error while fetching admins." });
  }
};

/**
 * @route   PATCH /api/admin/admin/:id
 * @desc    Updates an admin's details
 * @access  Private (Admin Only)
 */
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  // Use 'name' from req.body
  const { name, phone, password } = req.body;

  // 1. Validation
  if (!name || !phone) {
    return res.status(400).json({ message: "Name and Phone are required." });
  }

  try {
    // --- Standardize phone number ---
    let standardizedPhone = phone.trim();
    if (!standardizedPhone.startsWith('+91')) {
      standardizedPhone = '+91' + standardizedPhone;
    }

    // --- Check if new phone number is already taken by ANOTHER user ---
    const existingUser = await User.findOne({
      phone: standardizedPhone,
      _id: { $ne: id } // Find user with this phone, but exclude the current user
    });

    if (existingUser) {
      return res.status(400).json({ message: "This phone number is already in use by another account." });
    }

    // --- Find the admin to update ---
    const adminToUpdate = await User.findById(id);
    if (!adminToUpdate) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    // --- Prepare update object ---
    adminToUpdate.name = name; // Use 'name'
    adminToUpdate.phone = standardizedPhone;

    // --- Only update password if a new one is provided ---
    if (password && password.length >= 6) {
      adminToUpdate.password = await bcrypt.hash(password, 10);
    } else if (password && password.length < 6) {
      // Don't proceed if password is provided but too short
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    await adminToUpdate.save();

    res.status(200).json({ message: "Admin user updated successfully." });

  } catch (error) {
    console.error("Update Admin error:", error);
    res.status(500).json({ message: "Server error while updating admin." });
  }
};


/**
 * @route   DELETE /api/admin/admin/:id
 * @desc    Deletes an admin user
 *access  Private (Admin Only)
 */
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // --- CRITICAL: Check if this is the last admin ---
    // Count by 'userType'
    const adminCount = await User.countDocuments({ userType: "Admin" });

    if (adminCount <= 1) {
      return res.status(400).json({ message: "Cannot delete the last admin account." });
    }

    // --- Proceed with deletion ---
    // Find by 'userType'
    const deletedUser = await User.findOneAndDelete({ _id: id, userType: "Admin" });

    if (!deletedUser) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    res.status(200).json({ message: "Admin user deleted successfully." });

  } catch (error) {
    console.error("Delete Admin error:", error);
    res.status(500).json({ message: "Server error while deleting admin." });
  }
};