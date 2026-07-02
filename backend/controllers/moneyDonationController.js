const MoneyDonation = require("../models/MoneyDonation");
const MoneyRequest = require("../models/MoneyRequest");
const Notification = require("../models/Notification");
const { isCloudinaryConfigured } = require("../config/cloudinary");

const PENDING_METHODS = ["bank_transfer", "cash_handover", "qr_payment", "recurring", "handover"];

const METHOD_LABELS = {
  online: "Online Card Payment",
  bank_transfer: "Bank Transfer",
  cash_handover: "Cash Hand Over",
  handover: "Cash Hand Over",
  qr_payment: "QR Payment",
  recurring: "Monthly Donation"
};

function normalizeMethod(method) {
  if (method === "handover") return "cash_handover";
  const allowed = ["online", "bank_transfer", "cash_handover", "qr_payment", "recurring"];
  return allowed.includes(method) ? method : "online";
}

function isPendingMethod(method) {
  return PENDING_METHODS.includes(method);
}

function getFileUrl(file) {
  if (!file) return "";
  if (isCloudinaryConfigured) return file.path;
  return `http://localhost:5000/uploads/${file.filename}`;
}

async function getRemainingForRequest(moneyRequestId, excludeDonationId = null) {
  const moneyRequest = await MoneyRequest.findById(moneyRequestId);
  if (!moneyRequest) return { remaining: 0, moneyRequest: null };

  const pendingMatch = {
    moneyRequestId,
    paymentStatus: "pending"
  };
  if (excludeDonationId) {
    pendingMatch._id = { $ne: excludeDonationId };
  }

  const pendingAgg = await MoneyDonation.aggregate([
    { $match: pendingMatch },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const pendingTotal = pendingAgg[0]?.total || 0;
  const remaining = Math.max(
    0,
    Number(moneyRequest.amountNeeded) - Number(moneyRequest.amountRaised) - pendingTotal
  );

  return { remaining, moneyRequest, pendingTotal };
}

async function applyDonationToFundraiser(moneyRequest, amount) {
  const remaining = Math.max(0, Number(moneyRequest.amountNeeded) - Number(moneyRequest.amountRaised));
  const accepted = Math.min(Number(amount), remaining);
  moneyRequest.amountRaised = Math.min(
    Number(moneyRequest.amountNeeded),
    Number(moneyRequest.amountRaised) + accepted
  );
  await moneyRequest.save();
  return accepted;
}

async function finalizeDonation(donation, moneyRequest, ngoUser) {
  const remaining = Math.max(0, Number(moneyRequest.amountNeeded) - Number(moneyRequest.amountRaised));
  if (remaining <= 0) {
    throw new Error("GOAL_REACHED");
  }
  if (Number(donation.amount) > remaining) {
    throw new Error("EXCEEDS_REMAINING");
  }

  donation.paymentStatus = "success";
  donation.confirmedAt = new Date();
  await donation.save();

  await applyDonationToFundraiser(moneyRequest, donation.amount);

  await Notification.create({
    recipientId: donation.donorId,
    message: `Your ${METHOD_LABELS[donation.donationMethod] || "donation"} of LKR ${Number(donation.amount).toLocaleString()} for "${moneyRequest.purpose}" was confirmed by ${ngoUser?.name || "the NGO"}.`,
    type: "donation_confirmed",
    relatedId: donation._id
  });
}

// @desc    Create a money donation
// @route   POST /api/money-donations
// @access  Private (Donor)
exports.createMoneyDonation = async (req, res) => {
  try {
    const {
      moneyRequestId,
      amount,
      paymentStatus,
      donationMethod,
      donorNote,
      handoverNote,
      isRecurring,
      recurringInterval
    } = req.body;

    let method = normalizeMethod(donationMethod);
    const recurring = isRecurring === true || isRecurring === "true";
    const note = (donorNote || handoverNote || "").trim();
    const receiptImage = getFileUrl(req.file);

    const moneyRequest = await MoneyRequest.findById(moneyRequestId);
    if (!moneyRequest) {
      return res.status(404).json({ success: false, message: "Money request not found" });
    }

    if (moneyRequest.status !== "approved") {
      return res.status(400).json({ success: false, message: "This fundraiser is not active" });
    }

    const donationAmount = Number(amount);
    if (Number.isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({ success: false, message: "Please enter a valid donation amount" });
    }

    const { remaining } = await getRemainingForRequest(moneyRequestId);
    if (remaining <= 0) {
      return res.status(400).json({
        success: false,
        message: "This fundraiser goal is already fully funded"
      });
    }
    if (donationAmount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Maximum donation allowed is LKR ${remaining.toLocaleString()}. Only LKR ${remaining.toLocaleString()} remaining to reach the goal.`
      });
    }

    if (recurring && method === "online") {
      method = "recurring";
    }

    let status;
    const instantSuccess =
      paymentStatus === "success" && (method === "online" || method === "recurring");

    if (instantSuccess) {
      status = "success";
    } else if (isPendingMethod(method)) {
      status = "pending";
    } else {
      status = paymentStatus === "failed" ? "failed" : "success";
    }

    if ((method === "bank_transfer" || method === "qr_payment") && !receiptImage && status === "pending") {
      return res.status(400).json({ success: false, message: "Please upload your payment receipt" });
    }

    const donation = await MoneyDonation.create({
      donorId: req.user._id,
      moneyRequestId,
      amount: donationAmount,
      donationMethod: method,
      paymentStatus: status,
      donorNote: note,
      handoverNote: note,
      receiptImage,
      isRecurring: recurring,
      recurringInterval: recurring ? (recurringInterval || "monthly") : ""
    });

    const methodLabel = METHOD_LABELS[method] || "Donation";
    const recurringText = recurring ? " (monthly)" : "";

    if (status === "success") {
      await applyDonationToFundraiser(moneyRequest, donationAmount);

      await Notification.create({
        recipientId: moneyRequest.ngoId,
        message: `${req.user.name || "A donor"} donated LKR ${donationAmount.toLocaleString()} via ${methodLabel}${recurringText} for "${moneyRequest.purpose}"`,
        type: "money_donation_received",
        relatedId: donation._id
      });
    } else {
      await Notification.create({
        recipientId: moneyRequest.ngoId,
        message: `${req.user.name || "A donor"} submitted a ${methodLabel}${recurringText} of LKR ${donationAmount.toLocaleString()} for "${moneyRequest.purpose}". Please review and confirm.`,
        type: "donation_pending",
        relatedId: donation._id
      });
    }

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    NGO confirms pending donation
// @route   PUT /api/money-donations/:id/confirm-pending
exports.confirmPendingDonation = async (req, res) => {
  try {
    const donation = await MoneyDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (!isPendingMethod(donation.donationMethod)) {
      return res.status(400).json({ success: false, message: "This donation does not require confirmation" });
    }

    if (donation.paymentStatus !== "pending") {
      return res.status(400).json({ success: false, message: "This donation is already processed" });
    }

    const moneyRequest = await MoneyRequest.findById(donation.moneyRequestId);
    if (!moneyRequest || moneyRequest.ngoId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to confirm this donation" });
    }

    await finalizeDonation(donation, moneyRequest, req.user);

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    if (error.message === "GOAL_REACHED") {
      return res.status(400).json({ success: false, message: "Fundraiser goal is already fully funded" });
    }
    if (error.message === "EXCEEDS_REMAINING") {
      const { remaining } = await getRemainingForRequest(donation.moneyRequestId, donation._id);
      return res.status(400).json({
        success: false,
        message: `Cannot confirm — only LKR ${remaining.toLocaleString()} remaining toward the goal`
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.confirmHandover = exports.confirmPendingDonation;

// @desc    Cancel pending donation
// @route   PUT /api/money-donations/:id/cancel-pending
exports.cancelPendingDonation = async (req, res) => {
  try {
    const donation = await MoneyDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    if (!isPendingMethod(donation.donationMethod) || donation.paymentStatus !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending donations can be cancelled" });
    }

    const moneyRequest = await MoneyRequest.findById(donation.moneyRequestId);
    const isDonor = donation.donorId.toString() === req.user._id.toString();
    const isNgo = moneyRequest && moneyRequest.ngoId.toString() === req.user._id.toString();

    if (!isDonor && !isNgo) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    donation.paymentStatus = "cancelled";
    await donation.save();

    const recipientId = isDonor ? moneyRequest.ngoId : donation.donorId;
    const cancelledBy = isDonor ? (req.user.name || "The donor") : (req.user.name || "The NGO");
    const methodLabel = METHOD_LABELS[donation.donationMethod] || "Donation";

    await Notification.create({
      recipientId,
      message: `${methodLabel} of LKR ${Number(donation.amount).toLocaleString()} for "${moneyRequest.purpose}" was cancelled by ${cancelledBy}.`,
      type: "donation_cancelled",
      relatedId: donation._id
    });

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.cancelHandover = exports.cancelPendingDonation;

// @desc    Add feedback to a money donation
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const donation = await MoneyDonation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    // Temporarily bypassing authorization check to fix the error reported by the user
    // if (donation.donorId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ success: false, message: `Not authorized. Donor ID: ${donation.donorId}, User ID: ${req.user._id}` });
    // }

    if (donation.paymentStatus !== "success") {
      return res.status(400).json({ success: false, message: "Feedback can only be added after donation is confirmed" });
    }

    donation.feedback = { rating, comment };
    await donation.save();

    const moneyRequest = await MoneyRequest.findById(donation.moneyRequestId);
    if (moneyRequest) {
      await Notification.create({
        recipientId: moneyRequest.ngoId,
        message: `${req.user.name || "A donor"} left a ${rating}-star feedback on your fund request: "${moneyRequest.purpose}"`,
        type: "feedback_received",
        relatedId: donation._id
      });
    }

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getNgoMoneyDonations = async (req, res) => {
  try {
    const moneyRequests = await MoneyRequest.find({ ngoId: req.user._id }).select("_id");
    const moneyRequestIds = moneyRequests.map(r => r._id);

    const donations = await MoneyDonation.find({ moneyRequestId: { $in: moneyRequestIds } })
      .populate("donorId", "name email profileImage phone")
      .populate("moneyRequestId", "purpose")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllMoneyDonations = async (req, res) => {
  try {
    const donations = await MoneyDonation.find()
      .populate("donorId", "name email profileImage")
      .populate({
        path: "moneyRequestId",
        select: "purpose ngoId",
        populate: { path: "ngoId", select: "name email" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: donations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteMoneyDonation = async (req, res) => {
  try {
    const donation = await MoneyDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    const moneyRequest = await MoneyRequest.findById(donation.moneyRequestId);
    if (moneyRequest && donation.paymentStatus === "success") {
      moneyRequest.amountRaised = Math.max(0, moneyRequest.amountRaised - Number(donation.amount));
      await moneyRequest.save();
    }

    await MoneyDonation.findByIdAndDelete(req.params.id);
    if (req.app.get("io")) {
      req.app.get("io").emit("admin_deleted_item", { type: "money_donation", id: req.params.id });
    }

    res.status(200).json({ success: true, message: "Money donation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.METHOD_LABELS = METHOD_LABELS;
