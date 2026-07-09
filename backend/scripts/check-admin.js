require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ADMIN_EMAIL } = require("./adminConfig");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

const checkAdminUser = async () => {
  try {
    const adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (adminUser) {
      console.log("✅ Admin user found!");
      console.log("📧 Email:", adminUser.email);
      console.log("👤 Name:", adminUser.name);
      console.log("🔑 Role:", adminUser.role);
      console.log("🆔 ID:", adminUser._id);
      console.log("📅 Created:", adminUser.createdAt);
    } else {
      console.log("❌ Admin user not found! Running bootstrap...");
      const { admin } = await ensureCanonicalAdmin();
      console.log("✅ Admin created:", admin.email);
    }

    const admins = await User.find({ role: "admin" }, { password: 0 });
    console.log(`\n📋 Admin accounts in database: ${admins.length}`);
    admins.forEach((user) => {
      console.log(`- ${user.name} (${user.email})`);
    });

    const allUsers = await User.find({}, { password: 0 });
    console.log(`\n📋 Total users: ${allUsers.length}`);
  } catch (error) {
    console.error("❌ Error checking admin user:", error.message);
    process.exitCode = 1;
  }
};

const run = async () => {
  await connectDB();
  await checkAdminUser();
  await mongoose.disconnect().catch(() => {});
};

run();
