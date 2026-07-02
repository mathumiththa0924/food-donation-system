const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: false,
    maxlength: 500
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Request",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "completed"
  }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
