const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://mathumiththa0924_db_user:mathu0924@cluster0.1ktuhiw.mongodb.net/foodDonationDB?retryWrites=true&w=majority&appName=Cluster0");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Test Admin Login
const testAdminLogin = async () => {
  try {
    const email = "admin@mealbridge.com";
    const password = "Admin@123";

    console.log("🔍 Testing admin login...");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("✅ User found:", user.name);
    console.log("🔑 Stored hash:", user.password.substring(0, 20) + "...");

    // Test password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", isMatch);

    if (isMatch) {
      console.log("✅ Login successful!");
    } else {
      console.log("❌ Password does not match");

      // Let's try hashing the password again to see if there's an issue
      const newHash = await bcrypt.hash(password, 10);
      console.log("🔄 New hash for comparison:", newHash.substring(0, 20) + "...");

      const newMatch = await bcrypt.compare(password, newHash);
      console.log("🔍 New hash match:", newMatch);
    }

  } catch (error) {
    console.error("❌ Error testing login:", error.message);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await testAdminLogin();
  process.exit(0);
};

run();