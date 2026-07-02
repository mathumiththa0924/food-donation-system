const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });

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

    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      role: role || "donor",
      phone: phone ? phone.trim() : undefined,
      organization: organization ? organization.trim() : undefined,
      status: initialStatus,
    });

    const token = user.status === "active" ? generateToken(user._id, user.role) : null;
    res.status(201).json({
      success: true,
      message: user.status === "active"
        ? "User registered successfully"
        : "Registration successful. Your account is pending admin approval.",
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "email and password are required" });
    }

    const trimmedEmail = email.trim();

    // find user and explicitly select password since it has select: false in Schema
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

    // check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // create token
    const token = generateToken(user._id, user.role);

    // remove password
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
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Email, new password, and confirm password are required",
        });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one uppercase letter",
        });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one lowercase letter",
        });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one number",
        });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must include at least one special character",
        });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found with this email" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    res.json({
      success: true,
      message: "Password has been successfully reset",
    });
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
    const { name, email, phone } = req.body;
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
        organization: user.organization
      }
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
