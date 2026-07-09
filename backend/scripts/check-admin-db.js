require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ADMIN_EMAIL } = require("./adminConfig");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

const checkAdmin = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    let admin = await User.findOne({ email: ADMIN_EMAIL }).select("+password");

    if (!admin) {
      console.log("❌ Admin user NOT found — bootstrapping...");
      const result = await ensureCanonicalAdmin();
      admin = result.admin;
    }

    console.log("✅ Admin user ready!");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);
    console.log("🔑 Role:", admin.role);
    console.log("🔐 Password hash exists:", admin.password ? "Yes" : "No");

    const admins = await User.find({ role: "admin" }, { password: 0 });
    console.log(`\n📋 Admin accounts: ${admins.length} (expected: 1)`);
    admins.forEach((user) => {
      console.log(`- ${user.name} (${user.email})`);
    });

    const allUsers = await User.find({}, { password: 0 });
    console.log("\n📋 Total users in database:", allUsers.length);

    await mongoose.disconnect();
    process.exit(admins.length === 1 ? 0 : 1);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkAdmin();
