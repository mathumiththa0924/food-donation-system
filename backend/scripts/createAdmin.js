#!/usr/bin/env node

/**
 * Admin Creation Script
 * Usage: node scripts/createAdmin.js
 * 
 * This script creates a system admin account manually.
 * No user registration form allows admin role selection.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin credentials
    const adminEmail = "admin@mealbridge.com";
    const adminPassword = "Admin@123456";

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists by role
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      existingAdmin.email = adminEmail;
      existingAdmin.name = "MealBridge Admin";
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();

      console.log("✅ Existing admin updated with fixed email and hashed password:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      phone: "+94-70-000-0000",
      organization: "MealBridge Platform",
      role: "admin",
      location: "Colombo",
      status: "active"
    });

    console.log("\n✅ Admin account created successfully!\n");
    console.log("📧 Email:    " + adminEmail);
    console.log("🔐 Password: " + adminPassword);
    console.log("👤 Role:     admin");
    console.log("\n⚠️  IMPORTANT: Change this password after first login!");
    console.log("   Go to /admin-dashboard → Settings → Change Password\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
