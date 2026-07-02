const MoneyRequest = require("../models/MoneyRequest");
const User = require("../models/User");
const Notification = require("../models/Notification");
// @desc    Create a new money request
// @route   POST /api/money-requests
// @access  Private (NGO)
exports.createMoneyRequest = async (req, res) => {
  try {
    const { purpose, amountNeeded } = req.body;

    const files = req.files || {};
    const documents = {
      needStatement: files.needStatement ? files.needStatement[0].path : "",
      registrationCertificate: files.registrationCertificate ? files.registrationCertificate[0].path : "",
      bankDetails: files.bankDetails ? files.bankDetails[0].path : "",
      usageReport: files.usageReport ? files.usageReport[0].path : ""
    };

    if (!documents.needStatement || !documents.registrationCertificate || !documents.bankDetails) {
      return res.status(400).json({ success: false, message: "Missing required documents" });
    }

    const image = files.image ? files.image[0].path : "";

    const newRequest = await MoneyRequest.create({
      ngoId: req.user._id,
      purpose,
      amountNeeded,
      image,
      documents
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all money requests
// @route   GET /api/money-requests
// @access  Private
exports.getMoneyRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'donor') {
      query.status = 'approved';
    } else if (req.user.role === 'ngo') {
      query.ngoId = req.user._id;
    }

    const requests = await MoneyRequest.find(query).populate(
      "ngoId",
      "name email phone organization profileImage donationSettings"
    );
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update status
// @route   PUT /api/money-requests/:id/status
// @access  Private (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await MoneyRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    
    // Notify all donors if the fund request is approved
    if (status === 'approved') {
      const donors = await User.find({ role: "donor" });
      const notifications = donors.map(donor => ({
        recipientId: donor._id,
        message: `New Fundraiser: An NGO requested LKR ${request.amountNeeded} for ${request.purpose}`,
        type: "general",
        relatedId: request._id
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a money request
// @route   DELETE /api/money-requests/:id
// @access  Private (Admin)
exports.deleteMoneyRequest = async (req, res) => {
  try {
    const request = await MoneyRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    
    await request.deleteOne();
    if (req.app.get("io")) {
      req.app.get("io").emit("admin_deleted_item", { type: "money_request", id: req.params.id });
    }
    
    res.status(200).json({ success: true, message: "Request removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
