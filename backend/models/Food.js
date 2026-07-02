const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  foodType: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  originalQuantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'kg'
  },
  peopleServed: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  pickupTime: {
    type: Date
  },
  expiryTime: {
    type: Date,
    required: true
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'delivered'],
    default: 'pending'
  },
  adminStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  statusHistory: [
    {
      status: {
        type: String,
        required: true
      },
      note: {
        type: String,
        default: ''
      },
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      changedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);