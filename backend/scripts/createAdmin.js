#!/usr/bin/env node

/**
 * Admin bootstrap script — delegates to shared ensureCanonicalAdmin().
 * Usage: node scripts/createAdmin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("./adminConfig");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

const createAdmin = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    const { admin, removedDuplicates } = await ensureCanonicalAdmin();

    console.log("\n✅ Admin account ready!\n");
    console.log("📧 Email:    " + ADMIN_EMAIL);
    console.log("🔐 Password: " + ADMIN_PASSWORD);
    console.log("👤 Role:     " + admin.role);
    if (removedDuplicates > 0) {
      console.log(`🗑️ Removed ${removedDuplicates} duplicate admin(s)`);
    }
    console.log("\n⚠️  Change this password after first login via Admin Settings.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
