require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("./adminConfig");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

const setupAdmin = async () => {
  try {
    console.log("🔧 Setting up admin user...");
    await connectDB();

    const { admin, removedDuplicates } = await ensureCanonicalAdmin();

    console.log("✅ Admin setup successful!");
    if (removedDuplicates > 0) {
      console.log(`🗑️ Removed ${removedDuplicates} duplicate admin account(s)`);
    }
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", ADMIN_PASSWORD);
  } catch (error) {
    console.log("❌ Admin setup failed!");
    console.log("📧 Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

setupAdmin();