const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail, sendTwoFactorCodeEmail } = require("../services/emailService");

const pendingLoginAttempts = new Map();

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashOtp = (code) => crypto.createHash("sha256").update(code).digest("hex");

// ✅ REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, organization } = req.body;

    const trimmedEmail = email ? email.trim() : "";
    const trimmedName = name ? name.trim() : "";

    if (!trimmedName || !trimmedEmail || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "name, email and password are required",
        });
    }

    if (trimmedEmail.includes(" ")) {
      return res
        .status(400)
        .json({ success: false, message: "Email cannot contain spaces" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
    }
    if (!/[A-Z]/.test(password)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one uppercase letter",
        });
    }
    if (!/[a-z]/.test(password)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one lowercase letter",
        });
    }
    if (!/[0-9]/.test(password)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one number",
        });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one special character",
        });
    }

    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin registration is not allowed"
      });
    }

    const allowedRoles = ["donor", "ngo"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // check user exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const initialStatus = "pending";

    // generate verification code
    const verificationCode = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = crypto.createHash("sha256").update(verificationCode).digest("hex");
    const codeExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 mins

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: role || "donor",
      phone: phone ? phone.trim() : undefined,
      organization: organization ? organization.trim() : undefined,
      status: initialStatus,
      isEmailVerified: false,
      emailVerificationCode: hashedCode,
      emailVerificationExpires: codeExpires,
    });

    // Send verification email
    await require("../services/emailService").sendVerificationEmail(user.email, user.name, verificationCode);

    const token = user.status === "active" ? generateToken(user._id, user.role) : null;
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the verification code.",
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and verification code are required" });
    }

    const trimmedEmail = email.trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      return res.status(400).json({ success: false, message: "No pending verification found" });
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Verification code has expired. Please register again or request a new code." });
    }

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    if (hashedCode !== user.emailVerificationCode) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully. You can now login when admin approves." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password, otpCode } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "email and password are required" });
    }

    const trimmedEmail = email.trim();

    const user = await User.findOne({ email: trimmedEmail }).select(
      "+password",
    );
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: user.status === "pending"
          ? "Account pending approval. Please wait for admin activation."
          : "Account suspended. Contact support.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.twoFactorEnabled && user.role !== 'admin') {
      const pendingKey = trimmedEmail.toLowerCase();
      const pendingEntry = pendingLoginAttempts.get(pendingKey);

      if (!otpCode) {
        const otp = generateOtp();
        pendingLoginAttempts.set(pendingKey, {
          userId: user._id.toString(),
          password,
          codeHash: hashOtp(otp),
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
        await sendTwoFactorCodeEmail(user.email, user.name, otp);
        return res.json({
          success: true,
          requires2FA: true,
          message: "A verification code was sent to your email. Please enter it to continue.",
        });
      }

      if (!pendingEntry || pendingEntry.userId !== user._id.toString()) {
        return res.status(400).json({ success: false, message: "2FA verification session expired. Please try logging in again." });
      }

      if (pendingEntry.expiresAt < Date.now()) {
        pendingLoginAttempts.delete(pendingKey);
        return res.status(400).json({ success: false, message: "2FA verification code expired. Please try logging in again." });
      }

      if (hashOtp(otpCode) !== pendingEntry.codeHash) {
        return res.status(400).json({ success: false, message: "Invalid verification code" });
      }

      pendingLoginAttempts.delete(pendingKey);
    }

    const token = generateToken(user._id, user.role);
    const { password: _, ...userData } = user._doc;

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: {
        user: userData,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET CURRENT USER
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// ✅ DIRECT PASSWORD RESET (INSECURE / BYPASS)
const generateResetCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashResetCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const trimmedEmail = email.trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (user) {
      const resetCode = generateResetCode();
      user.passwordResetCode = hashResetCode(resetCode);
      user.passwordResetExpires = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
      await user.save();

      const { previewUrl } = await sendPasswordResetEmail(user.email, user.name, resetCode);
      if (previewUrl) {
        console.log(`[DEV ONLY] Password reset preview URL: ${previewUrl}`);
      }
    }

    res.json({
      success: true,
      message: "If that email exists, a password reset code has been sent to your email inbox.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword, confirmPassword } = req.body;

    if (!email || !resetCode || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code, new password, and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must include at least one uppercase letter" });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must include at least one lowercase letter" });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must include at least one number" });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must include at least one special character" });
    }

    const trimmedEmail = email.trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user || !user.passwordResetCode || !user.passwordResetExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
    }

    if (user.passwordResetExpires < new Date()) {
      user.passwordResetCode = null;
      user.passwordResetExpires = null;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
    }

    const hashedCode = hashResetCode(resetCode);
    if (hashedCode !== user.passwordResetCode) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ success: true, message: "Password has been successfully reset" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE DONATION SETTINGS (NGO)
exports.updateDonationSettings = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ success: false, message: "Only NGOs can update donation settings" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      bankName,
      accountNumber,
      branch,
      swift,
      officeAddress,
      whatsapp
    } = req.body;

    if (!user.donationSettings) user.donationSettings = {};

    if (bankName !== undefined) user.donationSettings.bankName = bankName;
    if (accountNumber !== undefined) user.donationSettings.accountNumber = accountNumber;
    if (branch !== undefined) user.donationSettings.branch = branch;
    if (swift !== undefined) user.donationSettings.swift = swift;
    if (officeAddress !== undefined) user.donationSettings.officeAddress = officeAddress;
    if (whatsapp !== undefined) user.donationSettings.whatsapp = whatsapp;

    if (req.file) {
      const { isCloudinaryConfigured } = require("../config/cloudinary");
      user.donationSettings.qrCodeImage = isCloudinaryConfigured
        ? req.file.path
        : `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: "Donation settings updated",
      data: user.donationSettings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, officeLat, officeLng, officeAddress } = req.body;
    let profileImage = req.body.profileImage;
    
    if (req.file) {
      const { isCloudinaryConfigured } = require('../config/cloudinary');
      if (isCloudinaryConfigured) {
        profileImage = req.file.path;
      } else {
        profileImage = `http://localhost:5000/uploads/${req.file.filename}`;
      }
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    // Persist office location if provided (NGO fallback)
    if (officeAddress !== undefined || officeLat !== undefined || officeLng !== undefined) {
      if (!user.officeLocation) user.officeLocation = {};
      if (officeAddress !== undefined) user.officeLocation.address = officeAddress;
      if (officeLat !== undefined && officeLat !== '') user.officeLocation.lat = Number(officeLat);
      if (officeLng !== undefined && officeLng !== '') user.officeLocation.lng = Number(officeLng);
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        organization: user.organization,
        officeLocation: user.officeLocation
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTwoFactorSetting = async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.twoFactorEnabled = Boolean(enabled);
    await user.save();

    res.json({
      success: true,
      message: user.twoFactorEnabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE PASSWORD
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new passwords are required" });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Leaderboard (top donors by points)
exports.getLeaderboard = async (req, res) => {
  try {
    const top = await User.find({ role: 'donor' }).select('name organization points badge profileImage totalDonations').sort({ points: -1 }).limit(10);
    res.json({ success: true, data: top });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
