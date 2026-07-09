const Message = require('../models/Message');
const MoneyRequest = require('../models/MoneyRequest');

const getMessagesByRequestId = async (req, res) => {
  try {
    const { requestId } = req.params;
    const messages = await Message.find({ requestId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMessagesByMoneyRequestId = async (req, res) => {
  try {
    const { moneyRequestId } = req.params;
    const moneyRequest = await MoneyRequest.findById(moneyRequestId);

    if (!moneyRequest) {
      return res.status(404).json({ success: false, message: "Fundraiser not found" });
    }

    const isNgo = moneyRequest.ngoId.toString() === req.user._id.toString();
    const isDonor = req.user.role === 'donor';

    if (!isNgo && !isDonor) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const messages = await Message.find({ moneyRequestId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching fundraiser messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getMessagesByRequestId,
  getMessagesByMoneyRequestId
};
