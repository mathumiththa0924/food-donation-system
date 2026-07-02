const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe, updateProfile, updatePassword, updateDonationSettings } = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", require("../controllers/userController").resetPassword);
router.get("/me", protect, getMe);
router.get("/verify", protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
router.put("/profile", protect, upload.single('profileImage'), updateProfile);
router.put("/donation-settings", protect, authorizeRoles("ngo"), upload.single("qrCodeImage"), updateDonationSettings);
router.put("/password", protect, updatePassword);

module.exports = router;