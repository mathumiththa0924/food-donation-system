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
  role: {
    type: String,
    enum: ["donor", "ngo", "admin"],
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
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);