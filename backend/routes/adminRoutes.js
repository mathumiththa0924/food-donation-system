const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Food = require("../models/Food");
const Request = require("../models/Request");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");
const MoneyDonation = require("../models/MoneyDonation");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

// 🔐 ADMIN ONLY MIDDLEWARE
const adminOnly = authorizeRoles("admin");

// 🔧 SETUP / REPAIR CANONICAL ADMIN (no auth — optional secret in production)
router.post("/setup-admin", async (req, res) => {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (setupSecret && req.body?.secret !== setupSecret) {
      return res.status(403).json({ success: false, message: "Invalid setup secret" });
    }

    const { admin, removedDuplicates } = await ensureCanonicalAdmin();

    res.json({
      success: true,
      message: "Canonical admin account is ready",
      data: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        removedDuplicates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  GET ALL USERS (Admin Dashboard)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 100 } = req.query; // limit 100 default to prevent immediate breakage if frontend doesn't pass it yet
    let query = { role: { $ne: "admin" } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role && role !== "all") query.role = role;
    if (status && status !== "all") query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📦 GET ALL DONATIONS (Admin View)
router.get("/donations", protect, adminOnly, async (req, res) => {
  try {
    const donations = await Food.find()
      .populate("donor", "name email phone organization role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📋 GET ALL REQUESTS (Admin View)
router.get("/requests", protect, adminOnly, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("foodId", "foodName quantity location")
      .populate("ngoId", "name email organization role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ⭐ GET ALL FEEDBACKS (Admin View)
router.get("/feedbacks", protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("donorId", "name email phone organization role")
      .populate("ngoId", "name email phone organization role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📈 GET ADMIN STATS
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalDonations = await Food.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalFeedbacks = await Feedback.countDocuments();

    const donors = await User.countDocuments({ role: "donor" });
    const ngos = await User.countDocuments({ role: "ngo" });
    const admins = await User.countDocuments({ role: "admin" });

    // Calculate total food saved (sum of all donation quantities)
    const donations = await Food.find();
    const totalFoodSaved = donations.reduce((sum, donation) => {
      const qty = parseFloat(donation.quantity) || 0;
      return sum + qty;
    }, 0);

    // Calculate total funds donated
    const moneyDonations = await MoneyDonation.find({ paymentStatus: 'success' });
    const totalFundsDonated = moneyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Time-based Analytics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const weeklyDonationsCount = await Food.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const monthlyDonationsCount = await Food.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    // Weekly and Monthly Funds
    const weeklyMoneyDonations = await MoneyDonation.find({ createdAt: { $gte: oneWeekAgo }, paymentStatus: 'success' });
    const weeklyFunds = weeklyMoneyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    const monthlyMoneyDonations = await MoneyDonation.find({ createdAt: { $gte: oneMonthAgo }, paymentStatus: 'success' });
    const monthlyFunds = monthlyMoneyDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    // Monthly distribution for the current year (Food)
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const allDonationsThisYear = await Food.find({ createdAt: { $gte: startOfYear } }, 'createdAt');
    const monthlyDistribution = new Array(12).fill(0);
    allDonationsThisYear.forEach(d => {
       const month = new Date(d.createdAt).getMonth();
       monthlyDistribution[month]++;
    });

    // Monthly distribution for the current year (Funds)
    const allMoneyDonationsThisYear = await MoneyDonation.find({ createdAt: { $gte: startOfYear }, paymentStatus: 'success' }, 'amount createdAt');
    const monthlyFundsDistribution = new Array(12).fill(0);
    allMoneyDonationsThisYear.forEach(d => {
       const month = new Date(d.createdAt).getMonth();
       monthlyFundsDistribution[month] += (d.amount || 0);
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDonations,
        totalRequests,
        totalFeedbacks,
        donors,
        ngos,
        admins,
        totalFoodSaved: Math.round(totalFoodSaved * 100) / 100, // Round to 2 decimal places
        totalFundsDonated,
        weeklyDonationsCount,
        monthlyDonationsCount,
        weeklyFunds,
        monthlyFunds,
        monthlyDistribution,
        monthlyFundsDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// TEMP DELETE DONATIONS
router.get("/temp_delete_donations", async (req, res) => {
  try {
    const MoneyDonation = require("../models/MoneyDonation");
    
    // Find donations to delete (amount 2000 or 5000)
    const donationsToDelete = await MoneyDonation.find({ amount: { $in: [2000, 5000] } });
    
    // Delete them
    const deleteResult = await MoneyDonation.deleteMany({ amount: { $in: [2000, 5000] } });
    
    res.json({ success: true, deletedCount: deleteResult.deletedCount, donations: donationsToDelete });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🚫 SUSPEND USER (Admin Action)
router.put("/users/:id/suspend", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "suspended" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User suspended successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ ACTIVATE USER (Admin Action)
router.put("/users/:id/activate", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send approval email
    await require("../services/emailService").sendApprovalEmail(user.email, user.name);

    res.json({
      success: true,
      message: "User activated successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🗑️ DELETE USER (Admin Action)
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Prevent deleting other admins
    if (user.role === "admin") {
       return res.status(403).json({ success: false, message: "Cannot delete an admin user" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🗑️ DELETE FEEDBACK (Admin Action)
router.delete("/feedbacks/:id", protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    
    await Feedback.findByIdAndDelete(req.params.id);

    req.app.get("io").emit("admin_deleted_item", { type: "feedback", id: req.params.id });

    res.json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🗑️ DELETE MONEY DONATION FEEDBACK (Admin Action)
router.delete("/money-feedbacks/:id", protect, adminOnly, async (req, res) => {
  try {
    const donation = await MoneyDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Money donation not found" });
    }
    
    // Unset the feedback field
    donation.feedback = undefined;
    await donation.save();

    res.json({
      success: true,
      message: "Fund donation feedback deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// 🗑️ DELETE DONATION (Admin Action)
router.delete("/donations/:id", protect, adminOnly, async (req, res) => {
  try {
    const donation = await Food.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    
    // Delete associated requests
    await Request.deleteMany({ foodId: req.params.id });

    await Food.findByIdAndDelete(req.params.id);

    req.app.get("io").emit("admin_deleted_item", { type: "donation", id: req.params.id });

    res.json({
      success: true,
      message: "Donation deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔄 UPDATE DONATION ADMIN STATUS (Admin Action)
router.put("/donations/:id/admin-status", protect, adminOnly, async (req, res) => {
  try {
    const { adminStatus } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(adminStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const donation = await Food.findByIdAndUpdate(
      req.params.id,
      { adminStatus },
      { new: true }
    ).populate('donor', 'name');

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // If approved, notify all NGOs and the Donor
    if (adminStatus === 'approved') {
      const io = req.app.get("io");
      const ngos = await User.find({ role: 'ngo' });
      const notifications = ngos.map(ngo => ({
        recipientId: ngo._id,
        message: `New food donation available: ${donation.foodName} from ${donation.donor?.name || 'a donor'}`,
        type: 'general'
      }));
      
      // Add notification for donor
      if (donation.donor) {
        notifications.push({
          recipientId: donation.donor._id || donation.donor,
          message: `Your food donation "${donation.foodName}" has been approved by the admin.`,
          type: 'status_change'
        });
      }

      if (notifications.length > 0) {
        const createdNotifs = await Notification.insertMany(notifications);
        if (io) {
          createdNotifs.forEach(notif => {
            io.to(notif.recipientId.toString()).emit("new_notification", notif);
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Donation admin status updated to ${adminStatus}`,
      data: donation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔄 UPDATE REQUEST STATUS (Admin Action)
router.put("/requests/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'picked_up', 'completed'];
    
    if (!validStatuses.includes(status)) {
       return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🗑️ DELETE REQUEST (Admin Action)
router.delete("/requests/:id", protect, adminOnly, async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    
    req.app.get("io").emit("admin_deleted_item", { type: "request", id: req.params.id });
    
    res.json({ success: true, message: "Food request deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔔 SEND NOTIFICATION (Admin Action)
router.post("/notifications", protect, adminOnly, async (req, res) => {
  try {
    const { message, targetRole } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    let query = {};
    if (targetRole && targetRole !== "all") {
       query.role = targetRole;
    }
    
    const users = await User.find(query);
    
    const notifications = users.map(user => ({
      recipientId: user._id,
      message: message,
      type: "general"
    }));

    const createdNotifs = await Notification.insertMany(notifications);
    const io = req.app.get("io");
    if (io) {
      createdNotifs.forEach((notif) => io.to(notif.recipientId.toString()).emit("new_notification", notif));
    }

    res.json({
      success: true,
      message: `Notification sent to ${users.length} users`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🔔 GET ALL NOTIFICATIONS (Admin Monitor)
router.get("/notifications", protect, adminOnly, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("recipientId", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🗑️ DELETE NOTIFICATION (Admin Action)
router.delete("/notifications/:id", protect, adminOnly, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    await Notification.findByIdAndDelete(req.params.id);

    req.app.get("io").emit("admin_deleted_item", { type: "notification", id: req.params.id });

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ⚙️ GET PLATFORM SETTINGS (Admin Only)
router.get("/settings", protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Create default settings if none exist
    }
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ⚙️ UPDATE PLATFORM SETTINGS (Admin Only)
router.put("/settings", protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (!settings) {
      settings = new Settings(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    await settings.save();
    
    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;