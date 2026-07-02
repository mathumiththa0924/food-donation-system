const express = require("express");
const router = express.Router();
const {
  createMoneyDonation,
  confirmPendingDonation,
  cancelPendingDonation,
  confirmHandover,
  cancelHandover,
  addFeedback,
  getNgoMoneyDonations,
  getAllMoneyDonations,
  deleteMoneyDonation
} = require("../controllers/moneyDonationController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.post("/", protect, authorizeRoles("donor", "admin"), upload.single("receipt"), createMoneyDonation);
router.get("/", protect, authorizeRoles("admin"), getAllMoneyDonations);
router.delete("/:id", protect, authorizeRoles("admin"), deleteMoneyDonation);
router.put("/:id/feedback", protect, authorizeRoles("donor", "admin"), addFeedback);
router.put("/:id/confirm-pending", protect, authorizeRoles("ngo", "admin"), confirmPendingDonation);
router.put("/:id/cancel-pending", protect, authorizeRoles("donor", "ngo", "admin"), cancelPendingDonation);
router.put("/:id/confirm-handover", protect, authorizeRoles("ngo", "admin"), confirmHandover);
router.put("/:id/cancel-handover", protect, authorizeRoles("donor", "ngo", "admin"), cancelHandover);
router.get("/ngo", protect, authorizeRoles("ngo", "admin"), getNgoMoneyDonations);

module.exports = router;
