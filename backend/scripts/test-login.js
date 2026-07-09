require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("./adminConfig");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

const testAdminLogin = async () => {
  try {
    console.log("🔍 Testing admin login...");
    console.log("📧 Email:", ADMIN_EMAIL);

    let user = await User.findOne({ email: ADMIN_EMAIL }).select("+password");
    if (!user) {
      console.log("⚠️ Admin missing — bootstrapping first...");
      await ensureCanonicalAdmin();
      user = await User.findOne({ email: ADMIN_EMAIL }).select("+password");
    }

    const isMatch = await bcrypt.compare(ADMIN_PASSWORD, user.password);
    if (isMatch) {
      console.log("✅ Password match — login will work");
    } else {
      console.log("❌ Password mismatch — re-running bootstrap...");
      await ensureCanonicalAdmin();
      user = await User.findOne({ email: ADMIN_EMAIL }).select("+password");
      const retry = await bcrypt.compare(ADMIN_PASSWORD, user.password);
      console.log(retry ? "✅ Fixed after bootstrap" : "❌ Still broken");
      if (!retry) process.exitCode = 1;
    }
  } catch (error) {
    console.error("❌ Error testing login:", error.message);
    process.exitCode = 1;
  }
};

const run = async () => {
  await connectDB();
  await testAdminLogin();
  await mongoose.disconnect().catch(() => {});
};

run();
