const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordResetCode: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: {
    type: String,
    default: null,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ["donor", "ngo", "admin", "volunteer"],
    default: "donor",
  },
  phone: {
    type: String,
  },
  profileImage: {
    type: String,
    default: "",
  },
  organization: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "active", "suspended"],
    default: "active",
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  totalFeedback: {
    type: Number,
    default: 0,
  },
  donationSettings: {
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    branch: { type: String, default: "" },
    swift: { type: String, default: "" },
    officeAddress: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    qrCodeImage: { type: String, default: "" }
  },
  // Gamification Fields
  points: {
    type: Number,
    default: 0,
  },
  totalDonations: {
    type: Number,
    default: 0,
  },
  badge: {
    type: String,
    enum: ["Newcomer", "Bronze", "Silver", "Gold", "Platinum"],
    default: "Newcomer",
  }
  ,
  // Optional office location for NGOs (saved fallback)
  officeLocation: {
    address: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);