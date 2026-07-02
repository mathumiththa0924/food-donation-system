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
router.post("/", protect, authorizeRoles("donor", "admin"), upload.single('image'), createDonation);

// Donor updates own donation
router.put("/:id", protect, authorizeRoles("donor", "admin"), upload.single('image'), updateDonation);

// Donor or Admin deletes donation
router.delete("/:id", protect, authorizeRoles("donor", "admin"), deleteDonation);

// Donor views own donations and stats
router.get("/my", protect, authorizeRoles("donor", "admin"), getMyDonations);
router.get("/my/stats", protect, authorizeRoles("donor", "admin"), getMyStats);

// Get donation detail by id
router.get("/:id", protect, authorizeRoles("donor", "ngo", "admin"), getDonationById);

// Donor/NGO/Admin views donations
router.get("/", protect, authorizeRoles("donor", "ngo", "admin"), getDonations);

module.exports = router;