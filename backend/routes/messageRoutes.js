const express = require("express");
const { getMessagesByRequestId, getMessagesByMoneyRequestId } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/fund/:moneyRequestId", protect, getMessagesByMoneyRequestId);
router.get("/:requestId", protect, getMessagesByRequestId);

module.exports = router;
