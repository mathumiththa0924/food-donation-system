const mongoose = require('mongoose');

const moneyRequestSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  amountNeeded: {
    type: Number,
    required: true
  },
  amountRaised: {
    type: Number,
    default: 0
  },
  image: {
    type: String, // URL of the uploaded image
    default: ""
  },
  documents: {
    needStatement: { type: String, required: true },
    registrationCertificate: { type: String, required: true },
    bankDetails: { type: String, required: true },
    usageReport: { type: String } // optional
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('MoneyRequest', moneyRequestSchema);
