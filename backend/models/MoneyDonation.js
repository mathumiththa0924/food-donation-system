const mongoose = require('mongoose');

const moneyDonationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moneyRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoneyRequest',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  donationMethod: {
    type: String,
    enum: ['online', 'bank_transfer', 'cash_handover', 'qr_payment', 'recurring', 'handover'],
    default: 'online'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'success'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['monthly', ''],
    default: ''
  },
  donorNote: {
    type: String,
    default: ''
  },
  handoverNote: {
    type: String,
    default: ''
  },
  receiptImage: {
    type: String,
    default: ''
  },
  confirmedAt: {
    type: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('MoneyDonation', moneyDonationSchema);
