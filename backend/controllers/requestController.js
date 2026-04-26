const Request = require('../models/Request');
const Food = require('../models/Food');
const mongoose = require("mongoose");

const createRequest = async (req, res) => {
  try {
    const { foodId } = req.body;

    if (!foodId) {
      return res.status(400).json({ success: false, message: "foodId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ success: false, message: "Invalid foodId. Use a valid Food _id from /api/donations response." });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }
    if (food.status !== "available") {
      return res.status(400).json({ success: false, message: "Food is not available for request" });
    }

    const existingRequest = await Request.findOne({
      foodId,
      ngoId: req.user._id,
      status: { $in: ["Pending", "Picked"] },
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "You already have an active request for this food" });
    }

    const request = await Request.create({
      foodId,
      ngoId: req.user._id
    });

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

    const validStatuses = ['Pending', 'Picked', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    if (req.user.role === "ngo" && request.ngoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "NGO can update only own requests" });
    }

    const transitionMap = {
      Pending: ["Picked"],
      Picked: ["Delivered"],
      Delivered: [],
    };
    if (request.status !== status && !transitionMap[request.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${request.status} to ${status}`,
      });
    }

    request.status = status;
    await request.save();

    if (status === 'Picked') {
      await Food.findByIdAndUpdate(request.foodId, { status: 'donated' });
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
    const requests = await Request.find(query).populate("foodId ngoId", "foodName name email");
    res.json({
      success: true,
      message: "Requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRequest, updateStatus, getRequests };