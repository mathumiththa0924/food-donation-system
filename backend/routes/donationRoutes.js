const express = require("express");
const router = express.Router();

const {
  createDonation,
  getDonations
} = require("../controllers/donationController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Donor creates donation
router.post("/", protect, authorizeRoles("donor"), createDonation);

// Donor/NGO/Admin views donations
router.get("/", protect, authorizeRoles("donor", "ngo", "admin"), getDonations);

module.exports = router;