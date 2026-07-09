const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  moneyRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MoneyRequest'
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

messageSchema.pre('validate', function(next) {
  if (!this.requestId && !this.moneyRequestId) {
    next(new Error('Either requestId or moneyRequestId is required'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Message', messageSchema);
