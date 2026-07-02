const Request = require('../models/Request');
const Food = require('../models/Food');
const mongoose = require("mongoose");
const Notification = require('../models/Notification');

const createRequest = async (req, res) => {
  try {
    const { foodId, qty, message, estimatedPickupTime } = req.body;

    if (!foodId || !qty) {
      return res.status(400).json({ success: false, message: "foodId and qty are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: "Invalid foodId" });
    }

    const numericQty = Number(qty);
    if (isNaN(numericQty) || numericQty <= 0) {
      return res.status(400).json({ success: false, message: "qty must be a positive number" });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }
    if (food.status !== "pending") {
      return res.status(400).json({ success: false, message: "Food is not available for request" });
    }
    if (numericQty > food.quantity) {
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available quantity" });
    }

    const existingRequest = await Request.findOne({
      foodId,
      ngoId: req.user._id,
      status: { $in: ["pending", "accepted"] },
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "You already have an active request for this food" });
    }

    const request = await Request.create({
      foodId,
      ngoId: req.user._id,
      qty: numericQty,
      message: message || "",
      estimatedPickupTime: estimatedPickupTime ? new Date(estimatedPickupTime) : undefined,
    });

    food.quantity -= numericQty;
    await food.save();

    const notif = await Notification.create({
      recipientId: food.donor,
      message: `${req.user.name || 'An NGO'} requested ${numericQty} ${food.unit || 'units'} of your food: ${food.foodName}`,
      type: 'request_received',
      relatedId: request._id
    });

    const io = req.app.get("io");
    if (io) {
      io.to(food.donor.toString()).emit("new_notification", notif);
    }

    res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid request id" });
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'picked_up', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const request = await Request.findById(id).populate('foodId');

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Role checks
    if (req.user.role === "ngo" && request.ngoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "NGO can update only own requests" });
    }
    if (req.user.role === "donor" && request.foodId.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Donor can update only requests for their food" });
    }

    const transitionMap = {
      pending: ["accepted", "rejected"],
      accepted: ["picked_up", "completed", "rejected"],
      picked_up: ["completed"],
      rejected: [],
      completed: [],
    };
    if (request.status !== status && !transitionMap[request.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${request.status} to ${status}`,
      });
    }

    request.status = status;
    await request.save();

    // Record donation-level history for the request workflow
    if (status === 'picked_up') {
      await Food.findByIdAndUpdate(request.foodId._id, {
        statusHistory: [
          ...request.foodId.statusHistory,
          {
            status: 'picked_up',
            note: `Picked up by donor ${req.user.name || req.user._id}`,
            changedBy: req.user._id,
            changedAt: new Date(),
          }
        ]
      });
    }

    if (status === 'rejected') {
      const updatedQty = request.foodId.quantity + request.qty;
      await Food.findByIdAndUpdate(request.foodId._id, { 
        quantity: updatedQty,
        ...(request.foodId.status === 'delivered' && updatedQty > 0 ? { status: 'pending' } : {}) 
      });
    }

    if (status === 'completed') {
      const remainingQty = request.foodId.quantity;
      const update = {};
      const historyUpdate = {
        statusHistory: [
          ...request.foodId.statusHistory,
          {
            status: remainingQty <= 0 ? 'delivered' : 'pending',
            note: remainingQty <= 0 ? 'Donation fully delivered' : 'Donation partially delivered',
            changedBy: req.user._id,
            changedAt: new Date(),
          }
        ]
      };

      if (remainingQty <= 0) {
        update.status = 'delivered';
      }
      await Food.findByIdAndUpdate(request.foodId._id, { ...update, ...historyUpdate });
    }

    const recipientId = req.user.role === 'ngo' ? request.foodId.donor : request.ngoId;
    
    const notif = await Notification.create({
      recipientId: recipientId,
      message: `Status of food request for '${request.foodId.foodName}' updated to ${status}`,
      type: 'status_change',
      relatedId: request._id
    });

    const io = req.app.get("io");
    if (io) {
      io.to(recipientId.toString()).emit("new_notification", notif);
    }

    res.json({
      success: true,
      message: "Request status updated",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const query = req.user.role === "ngo" ? { ngoId: req.user._id } : {};
    const requests = await Request.find(query)
      .populate({
        path: "foodId",
        select: "foodName donor status quantity unit expiryTime location image description foodType",
        populate: { path: "donor", select: "name email phone organization" }
      })
      .populate("ngoId", "name email")
      .sort({ createdAt: -1 });

    let finalRequests = requests;
    if (req.user.role === "donor") {
      finalRequests = requests.filter(
        (r) => r.foodId && r.foodId.donor && r.foodId.donor._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      message: "Requests fetched successfully",
      data: finalRequests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRequest, updateStatus, getRequests };