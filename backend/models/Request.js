const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  estimatedPickupTime: {
    type: Date
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'picked_up', 'completed'],
    default: 'pending'
  },
  feedbackSubmitted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);