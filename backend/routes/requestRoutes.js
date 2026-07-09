const express = require("express");

const {
  createRequest,
  updateStatus,
  getRequests,
} = require("../controllers/requestController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ❗ THIS LINE WAS MISSING (MAIN ERROR)
const router = express.Router();

// 🏥 NGO creates request
router.post("/", protect, authorizeRoles("ngo", "admin"), createRequest);

// 📄 GET requests
router.get("/", protect, authorizeRoles("ngo", "admin", "donor", "volunteer"), getRequests);

// 🔄 UPDATE status
router.put("/:id", protect, authorizeRoles("admin", "ngo", "donor", "volunteer"), updateStatus);

// 🚚 ASSIGN Volunteer
router.put("/:id/assign", protect, authorizeRoles("volunteer"), require("../controllers/requestController").assignVolunteer);

// export
module.exports = router;
