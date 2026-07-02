const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/paymentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/create-checkout-session", protect, authorizeRoles("donor"), createCheckoutSession);

module.exports = router;
