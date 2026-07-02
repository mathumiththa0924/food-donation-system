const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  // System Settings
  websiteName: { type: String, default: "MealBridge Platform" },
  contactEmail: { type: String, default: "support@mealbridge.com" },
  contactPhone: { type: String, default: "+94 77 123 4567" },
  address: { type: String, default: "Colombo, Sri Lanka" },
  
  // Donation Rules
  cookedFoodExpiryHours: { type: Number, default: 6 },
  packedFoodExpiryDays: { type: Number, default: 3 },
  autoRemoveExpired: { type: Boolean, default: true },
  
  // Notification Settings
  emailNotifications: { type: Boolean, default: true },
  adminAlerts: { type: Boolean, default: true },
  
  // User Control
  autoBlockSpam: { type: Boolean, default: false },
  ngoVerificationRequired: { type: Boolean, default: true },
  
  // Security Settings
  jwtExpiryHours: { type: Number, default: 24 },
  sessionTimeoutMins: { type: Number, default: 60 },
  
  // Media / Appearance
  theme: { type: String, enum: ["light", "dark", "system"], default: "dark" },
  
  // Social Media Links
  socialFacebook: { type: String, default: "" },
  socialTwitter: { type: String, default: "" },
  socialInstagram: { type: String, default: "" },

  // Advanced & API
  maintenanceMode: { type: Boolean, default: false },
  googleMapsApiKey: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
