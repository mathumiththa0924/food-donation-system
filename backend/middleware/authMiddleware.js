const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 PROTECT (JWT check)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      if (req.user.status !== "active") {
        return res.status(403).json({
          success: false,
          message:
            req.user.status === "pending"
              ? "Account pending admin approval"
              : "Account suspended",
        });
      }

      next();
    } catch (error) {
      console.error("JWT Verify Error:", error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
};

// 🚫 ROLE CHECK (CLEAN VERSION)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found in request" });
    }

    // Ensure case-insensitive comparison
    const userRole = req.user.role ? req.user.role.trim().toLowerCase() : "";
    const allowed = allowedRoles.map((r) => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: insufficient permissions`,
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };