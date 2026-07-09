const Food = require('../models/Food');
const mongoose = require('mongoose');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const { sendFoodAlertEmail } = require('../services/emailService');
const { generateTaxReceipt } = require('../services/pdfService');
const { findBestMatches } = require('../services/smartMatchService');

// CREATE DONATION
const createDonation = async (req, res) => {
  try {
    const { foodName, description, foodType, quantity, unit, location, pickupTime, expiryTime, peopleServed, isEmergency } = req.body;
    const numericQuantity = Number(quantity);
    const numericPeopleServed = Number(peopleServed);
    const emergencyFlag = isEmergency === 'true' || isEmergency === true;

    if (!foodName || !description || !foodType || !location || !expiryTime || Number.isNaN(numericQuantity) || numericQuantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all required fields correctly" });
    }

    if (Number.isNaN(numericPeopleServed) || numericPeopleServed <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter how many people this donation can feed" });
    }

    let imageUrl = null;
    if (req.file) {
      if (isCloudinaryConfigured) {
        imageUrl = req.file.path; // Cloudinary URL
      } else {
        // Local URL using the static uploads folder
        imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    }

    let parsedLocation = location;
    try {
      if (typeof location === 'string') {
        const parsed = JSON.parse(location);
        if (parsed.address) {
          parsedLocation = parsed;
        } else {
          parsedLocation = { address: location.trim() };
        }
      }
    } catch (e) {
      parsedLocation = { address: location.trim() };
    }

    const food = await Food.create({
      donor: req.user._id,
      foodName: foodName,
      description: description,
      foodType: foodType,
      quantity: numericQuantity,
      originalQuantity: numericQuantity,
      unit: unit || 'kg',
      peopleServed: numericPeopleServed,
      location: parsedLocation,
      pickupTime: pickupTime ? new Date(pickupTime) : undefined,
      expiryTime: new Date(expiryTime),
      image: imageUrl,
      isEmergency: emergencyFlag,
      statusHistory: [
        {
          status: 'pending',
          note: 'Donation created',
          changedBy: req.user._id,
          changedAt: new Date(),
        },
      ],
    });

    // Notify logic: Smart Match or Emergency Broadcast
    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const ngos = await User.find({ role: 'ngo', status: 'active' });
    const volunteers = await User.find({ role: 'volunteer', status: 'active' });
    
    const peopleThreshold = Number(process.env.LARGE_DONATION_THRESHOLD_PEOPLE || 20);
    const qtyThreshold = Number(process.env.LARGE_DONATION_THRESHOLD_QTY || 10);
    const isLarge = (numericPeopleServed >= peopleThreshold) || (numericQuantity >= qtyThreshold);

    const isUrgent = emergencyFlag || isLarge;

    let targetNgos = ngos;
    let notifMessage = "";
    
    if (isUrgent) {
      notifMessage = `🚨 URGENT: New food donation available in ${parsedLocation.address.split(',')[0]}: ${quantity} ${unit || 'kg'} of ${foodName}`;
    } else {
      targetNgos = findBestMatches(parsedLocation, ngos, 5);
      notifMessage = `✨ Smart Match: A donor nearby has ${quantity} ${unit || 'kg'} of ${foodName} available.`;
    }
    
    const notifications = targetNgos.map(ngo => ({
      recipientId: ngo._id,
      message: notifMessage,
      type: 'new_donation',
      relatedId: food._id
    }));

    // If urgent, notify volunteers too
    if (isUrgent) {
      volunteers.forEach(vol => {
        notifications.push({
          recipientId: vol._id,
          message: `🚨 URGENT EMERGENCY PICKUP: ${quantity} ${unit || 'kg'} of ${foodName} in ${parsedLocation.address.split(',')[0]}. Needs immediate attention!`,
          type: 'new_donation',
          relatedId: food._id
        });
      });
    }
    
    if (notifications.length > 0) {
      const createdNotifs = await Notification.insertMany(notifications);
      const io = req.app.get("io");
      if (io) {
        createdNotifs.forEach(notif => {
          io.to(notif.recipientId.toString()).emit("new_notification", notif);
        });
      }
      // If urgent, send immediate email alerts to NGOs
      try {
        if (isUrgent) {
          const foodDetails = {
            foodName: food.foodName,
            quantity: food.quantity,
            unit: food.unit,
            location: (food.location && food.location.address) ? food.location.address : (parsedLocation.address || ''),
            expiryTime: food.expiryTime
          };

          targetNgos.forEach(ngo => {
            if (ngo.email) {
              sendFoodAlertEmail(ngo.email, ngo.name || ngo.organization || 'Partner NGO', foodDetails);
            }
          });
        }
      } catch (e) {
        console.error('Error sending large-donation emails:', e);
      }
    }

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: food,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE DONATION
const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation ID" });
    }

    const donation = await Food.findById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own donations" });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Only pending donations can be updated" });
    }

    const updates = { ...req.body };
    if (updates.location && typeof updates.location === 'string') {
      try {
        const parsed = JSON.parse(updates.location);
        updates.location = parsed.address ? parsed : { address: updates.location.trim() };
      } catch (e) {
        updates.location = { address: updates.location.trim() };
      }
    }
    
    if (req.file) {
      if (isCloudinaryConfigured) {
        updates.image = req.file.path;
      } else {
        updates.image = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    }

    const updatedFood = await Food.findByIdAndUpdate(id, updates, { new: true });
    
    res.json({
      success: true,
      message: "Donation updated successfully",
      data: updatedFood,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE DONATION
const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation ID" });
    }

    const donation = await Food.findById(id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this donation" });
    }

    if (donation.donor.toString() === req.user._id.toString() && donation.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Donors can only delete pending donations" });
    }

    // Cascading Delete: Delete all Requests linked to this Food
    const requests = await Request.find({ foodId: id });
    const requestIds = requests.map(r => r._id);
    
    // Delete Requests
    await Request.deleteMany({ foodId: id });
    
    // Delete Messages associated with those requests
    if (requestIds.length > 0) {
      const Message = require('../models/Message');
      await Message.deleteMany({ requestId: { $in: requestIds } });
      
      // Delete Notifications linked to these requests or food
      const Notification = require('../models/Notification');
      await Notification.deleteMany({ relatedId: { $in: [...requestIds, id] } });
      
      // Delete Feedbacks
      const Feedback = require('../models/Feedback');
      await Feedback.deleteMany({ requestId: { $in: requestIds } });
    }

    await Food.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET DONATIONS
const getDonations = async (req, res) => {
  try {
    const { location, foodName, foodType, postedFrom, postedTo } = req.query;

    const filter = { status: "pending" };

    if (location) filter.location = location;
    if (foodName) filter.foodName = { $regex: foodName, $options: "i" };
    if (foodType) filter.foodType = foodType;
    if (postedFrom || postedTo) {
      filter.createdAt = {};
      if (postedFrom) filter.createdAt.$gte = new Date(postedFrom);
      if (postedTo) filter.createdAt.$lte = new Date(postedTo);
    }

    if (req.user.role === "donor") {
      filter.donor = req.user._id;
    } else if (req.user.role === "ngo") {
      filter.adminStatus = "approved";
      filter.quantity = { $gt: 0 };
      filter.expiryTime = { $gt: new Date() }; // Hide expired food from NGOs
    }

    const donations = await Food.find(filter).populate("donor", "name email phone organization role");

    const Request = require('../models/Request');
    const foodIds = donations.map(d => d._id);
    const claims = await Request.find({ 
      foodId: { $in: foodIds },
      status: { $in: ['pending', 'accepted', 'picked_up', 'completed'] }
    }).populate('ngoId', 'name');

    const data = donations.map(d => {
      const doc = d.toObject();
      doc.claims = claims.filter(c => c.foodId.toString() === d._id.toString());
      return doc;
    });

    res.json({
      success: true,
      message: "Donations fetched successfully",
      data: data,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET MY DONATIONS (All statuses)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Food.find({ donor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET MY STATS
const getMyStats = async (req, res) => {
  try {
    const totalDonated = await Food.countDocuments({ donor: req.user._id });
    const completed = await Food.countDocuments({ donor: req.user._id, status: 'delivered' });
    
    // calculate sum of quantity safely
    const allDonations = await Food.find({ donor: req.user._id });
    const peopleHelped = allDonations.reduce((sum, item) => sum + (item.peopleServed || 0), 0);

    res.json({
      success: true,
      stats: {
        totalDonated,
        peopleHelped,
        completed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET DONATION BY ID
const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation ID" });
    }

    const donation = await Food.findById(id).populate("donor", "name email phone organization role");
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DOWNLOAD RECEIPT
const downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation ID" });
    }

    const donation = await Food.findById(id).populate("donor", "name email organization");
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (donation.donor._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (donation.status !== 'delivered') {
      return res.status(400).json({ success: false, message: "Receipts are only available for fully delivered donations" });
    }

    const donorName = donation.donor.name || donation.donor.organization || "Donor";
    
    // Use the existing pdfService
    const receiptUrl = await generateTaxReceipt(donorName, {
      type: 'food',
      foodName: donation.foodName,
      quantity: donation.quantity,
      unit: donation.unit || 'kg',
      peopleServed: donation.peopleServed || 0
    });

    // Send absolute URL back
    res.json({
      success: true,
      data: {
        receiptUrl: `http://localhost:5000${receiptUrl}`
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDonation,
  updateDonation,
  deleteDonation,
  getDonations,
  getMyDonations,
  getMyStats,
  getDonationById,
  downloadReceipt,
};