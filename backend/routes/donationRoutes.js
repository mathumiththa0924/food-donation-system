const express = require("express");
const router = express.Router();

const {
  createDonation,
  updateDonation,
  deleteDonation,
  getDonations,
  getMyDonations,
  getMyStats,
  getDonationById,
} = require("../controllers/donationController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

const { upload } = require("../config/cloudinary");

// Donor creates donation
router.post("/", protect, authorizeRoles("donor"), upload.single('image'), createDonation);

// Donor or NGO updates own donation
router.put("/:id", protect, authorizeRoles("donor", "ngo", "admin"), upload.single('image'), updateDonation);

// Donor, NGO or Admin deletes donation
router.delete("/:id", protect, authorizeRoles("donor", "ngo", "admin"), deleteDonation);

// Donor views own donations and stats
router.get("/my", protect, authorizeRoles("donor", "admin"), getMyDonations);
router.get("/my/stats", protect, authorizeRoles("donor", "admin"), getMyStats);

// Donor downloads receipt
router.get("/:id/receipt", protect, authorizeRoles("donor", "admin"), require("../controllers/donationController").downloadReceipt);

// Get donation detail by id
router.get("/:id", protect, authorizeRoles("donor", "ngo", "admin"), getDonationById);

// Donor/NGO/Admin views donations
router.get("/", protect, authorizeRoles("donor", "ngo", "admin"), getDonations);

module.exports = router;