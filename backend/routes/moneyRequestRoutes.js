const express = require("express");
const router = express.Router();
const User = require("../models/User");
const MoneyRequest = require("../models/MoneyRequest");

router.get("/fix-na", async (req, res) => {
  try {
    const naUsers = await User.find({ name: "Na", role: "ngo" });
    if (naUsers.length === 0) return res.json({ message: "No Na users found" });
    const activeNaUser = naUsers[naUsers.length - 1]; // pick the most recently created or just the first one
    
    const requests = await MoneyRequest.find({});
    let updated = 0;
    for (let r of requests) {
      const u = await User.findById(r.ngoId);
      if (u && u.name === "Na" && r.ngoId.toString() !== activeNaUser._id.toString()) {
        r.ngoId = activeNaUser._id;
        await r.save();
        updated++;
      }
    }
    res.json({ message: `Fixed ${updated} requests. Now assigned to ${activeNaUser._id}` });
  } catch (e) {
    res.json({ error: e.message });
  }
});

const {
  createMoneyRequest,
  getMoneyRequests,
  updateStatus,
  deleteMoneyRequest
} = require("../controllers/moneyRequestController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const uploadFields = upload.fields([
  { name: 'needStatement', maxCount: 1 },
  { name: 'registrationCertificate', maxCount: 1 },
  { name: 'bankDetails', maxCount: 1 },
  { name: 'usageReport', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

router.post("/", protect, authorizeRoles("ngo", "admin"), uploadFields, createMoneyRequest);
router.get("/", protect, authorizeRoles("donor", "admin", "ngo"), getMoneyRequests);
router.put("/:id/status", protect, authorizeRoles("admin"), updateStatus);
router.delete("/:id", protect, authorizeRoles("admin"), deleteMoneyRequest);

module.exports = router;
