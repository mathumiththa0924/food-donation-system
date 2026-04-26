const express = require("express");
const router = express.Router();

// ✅ FIX: import both protect + authorizeRoles
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ======================
// USER PROFILE ROUTE
// ======================
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Profile fetched successfully",
    data: req.user,
  });
});

// ======================
// ADMIN DASHBOARD ROUTE
// ======================
router.get("/admin-dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin! You have access to this route.",
  });
});

module.exports = router;