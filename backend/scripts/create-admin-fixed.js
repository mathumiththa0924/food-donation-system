require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("./adminConfig");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

const run = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    const { admin, removedDuplicates } = await ensureCanonicalAdmin();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", ADMIN_PASSWORD);
    console.log("👤 Role:", admin.role);
    if (removedDuplicates > 0) {
      console.log(`🗑️ Removed ${removedDuplicates} duplicate admin(s)`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

run();
