require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ADMIN_EMAIL } = require("./adminConfig");
const { ensureCanonicalAdmin } = require("../services/adminBootstrap");

const run = async () => {
  await connectDB();

  const { admin, removedDuplicates } = await ensureCanonicalAdmin();

  console.log("✅ Canonical admin ensured");
  console.log("📧 Email:", admin.email);
  console.log("👤 Role:", admin.role);
  if (removedDuplicates > 0) {
    console.log(`🗑️ Removed ${removedDuplicates} duplicate admin(s)`);
  }

  const admins = await User.find({ role: "admin" });
  console.log(`\n📋 Remaining admin accounts: ${admins.length}`);
  admins.forEach((a) => console.log(`- ${a.email}`));

  await mongoose.disconnect();
  process.exit(admins.length === 1 ? 0 : 1);
};

run();
