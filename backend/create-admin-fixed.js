const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();
const dns = require("dns");

// Force Google DNS to resolve MongoDB SRV records
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Create Admin User
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@mealbridge.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Role:", existingAdmin.role);
      return;
    }

    // Hash password properly
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create admin user
    const adminUser = await User.create({
      name: "System Admin",
      email: "admin@mealbridge.com",
      password: hashedPassword,
      role: "admin",
      phone: "+1-234-567-8900",
      organization: "MealBridge Platform"
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminUser.email);
    console.log("🔑 Password: Admin@123 (hashed)");
    console.log("👤 Role:", adminUser.role);
    console.log("🆔 ID:", adminUser._id);

  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createAdminUser();
  process.exit(0);
};

run();