const express = require("express");
const router = express.Router();

const {
  createDonation,
  getDonations,
  getAllDonations,
  updateApprovalStatus,
  deleteDonation
} = require("../controllers/donationController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Donor creates donation
router.post("/", protect, authorizeRoles("donor"), createDonation);

// Donor/NGO/Admin views donations
router.get("/", protect, authorizeRoles("donor", "ngo", "admin"), getDonations);

// Admin views every donation (with approval status)
router.get("/all", protect, authorizeRoles("admin"), getAllDonations);

// Admin approves/rejects a donation
router.patch("/:id/status", protect, authorizeRoles("admin"), updateApprovalStatus);

// Admin deletes a donation
router.delete("/:id", protect, authorizeRoles("admin"), deleteDonation);

module.exports = router;