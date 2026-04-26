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
router.post("/", protect, authorizeRoles("ngo"), createRequest);

// 📄 GET requests
router.get("/", protect, authorizeRoles("ngo", "admin"), getRequests);

// 🔄 UPDATE status
router.put("/:id", protect, authorizeRoles("admin", "ngo"), updateStatus);

// export
module.exports = router;
