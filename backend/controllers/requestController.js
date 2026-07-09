const Request = require('../models/Request');
const Food = require('../models/Food');
const mongoose = require("mongoose");
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateTaxReceipt } = require('../services/pdfService');
const { sendReceiptEmail } = require('../services/emailService');

const sendFoodDonationReceipt = async (request) => {
  const donorUser = await User.findById(request.foodId.donor).select('name email');
  if (!donorUser?.email) return;

  const receiptPath = await generateTaxReceipt(donorUser.name || donorUser.email || 'Donor', {
    type: 'food',
    foodName: request.foodId.foodName,
    quantity: request.qty,
    unit: request.foodId.unit,
    peopleServed: request.qty
  });

  await sendReceiptEmail(
    donorUser.email,
    donorUser.name || 'Donor',
    receiptPath,
    'Your MealBridge Food Donation Receipt'
  );
};

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
    if (req.user.role === "volunteer" && request.volunteerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Volunteer can update only assigned requests" });
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

    if (request.status === status) {
      return res.json({
        success: true,
        message: "Request status is already up to date",
        data: request,
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

      // === GAMIFICATION LOGIC ===
      // Award points to the Donor based on quantity completed
      try {
        const pointsAwarded = request.qty * 10; // 10 points per unit of food
        const donorUser = await User.findById(request.foodId.donor);
        if (donorUser) {
          donorUser.points += pointsAwarded;
          donorUser.totalDonations += 1;
          
          // Badge Logic
          if (donorUser.points >= 1000) donorUser.badge = "Platinum";
          else if (donorUser.points >= 500) donorUser.badge = "Gold";
          else if (donorUser.points >= 200) donorUser.badge = "Silver";
          else if (donorUser.points >= 50) donorUser.badge = "Bronze";

          await donorUser.save();
        }
      } catch (err) {
        console.error("Gamification Error:", err);
      }

      try {
        await sendFoodDonationReceipt(request);
      } catch (err) {
        console.error('Error generating/sending completed food donation receipt:', err);
      }
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
    } else if (req.user.role === "volunteer") {
      // Volunteers see accepted requests (available to pick up) and their assigned ones
      finalRequests = requests.filter(
        (r) => (r.status === "accepted" && !r.volunteerId) || (r.volunteerId && r.volunteerId.toString() === req.user._id.toString())
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

const assignVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid request id" });
    }

    const request = await Request.findById(id).populate('foodId').populate('ngoId');
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ success: false, message: "Only accepted requests can be picked up by volunteers" });
    }

    if (request.volunteerId) {
      return res.status(400).json({ success: false, message: "This request is already assigned to a volunteer" });
    }

    request.volunteerId = req.user._id;
    await request.save();

    // Notify donor and NGO
    const Notification = require('../models/Notification');
    const io = req.app.get("io");
    
    const notifs = [
      { recipientId: request.foodId.donor, message: `Volunteer ${req.user.name} has accepted to deliver your food!`, type: 'volunteer_assigned', relatedId: request._id },
      { recipientId: request.ngoId._id, message: `Volunteer ${req.user.name} is on the way to pick up the food from the donor.`, type: 'volunteer_assigned', relatedId: request._id }
    ];
    
    const createdNotifs = await Notification.insertMany(notifs);
    if (io) {
      createdNotifs.forEach(n => io.to(n.recipientId.toString()).emit("new_notification", n));
    }

    res.json({ success: true, message: "Volunteer assigned successfully", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createRequest, updateStatus, getRequests, assignVolunteer };