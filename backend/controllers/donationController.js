const Food = require('../models/Food');
const mongoose = require('mongoose');

// CREATE DONATION
const createDonation = async (req, res) => {
  try {
    const { foodName, foodType, quantity, location } = req.body;
    const normalizedFoodName = foodName || foodType;
    const numericQuantity = Number(quantity);

    if (!normalizedFoodName || !location || Number.isNaN(numericQuantity) || numericQuantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "foodName/foodType, positive quantity and location are required" });
    }

    const food = await Food.create({
      donor: req.user._id,
      foodName: normalizedFoodName,
      quantity: numericQuantity,
      location: location.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: food,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET DONATIONS
const getDonations = async (req, res) => {
  try {
    const { location, foodName } = req.query;

    const filter = { status: "available" };

    if (location) filter.location = location;
    if (foodName) filter.foodName = { $regex: foodName, $options: "i" };

    if (req.user.role === "donor") {
      filter.donor = req.user._id;
    }

    const donations = await Food.find(filter).populate("donor", "name email");

    res.json({
      success: true,
      message: "Donations fetched successfully",
      data: donations,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL DONATIONS (admin)
const getAllDonations = async (req, res) => {
  try {
    const donations = await Food.find()
      .populate("donor", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Donations fetched successfully",
      data: donations,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE APPROVAL STATUS (admin)
const updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation id" });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: "Invalid approval status" });
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    food.approvalStatus = approvalStatus;
    await food.save();

    res.json({
      success: true,
      message: `Donation ${approvalStatus}`,
      data: food,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE DONATION (admin)
const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid donation id" });
    }

    const food = await Food.findByIdAndDelete(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    res.json({
      success: true,
      message: "Donation deleted successfully",
      data: food,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getAllDonations,
  updateApprovalStatus,
  deleteDonation
};