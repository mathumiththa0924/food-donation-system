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
  quantity: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'donated'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);