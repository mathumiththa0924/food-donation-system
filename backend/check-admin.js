const mongoose = require("mongoose");
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

// Check Admin User
const checkAdminUser = async () => {
  try {
    const adminUser = await User.findOne({ email: "admin@mealbridge.com" });

    if (adminUser) {
      console.log("✅ Admin user found!");
      console.log("📧 Email:", adminUser.email);
      console.log("👤 Name:", adminUser.name);
      console.log("🔑 Role:", adminUser.role);
      console.log("🆔 ID:", adminUser._id);
      console.log("📅 Created:", adminUser.createdAt);
    } else {
      console.log("❌ Admin user not found!");
    }

    // Show all users
    const allUsers = await User.find({}, { password: 0 }); // Exclude password
    console.log("\n📋 All users in database:");
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error("❌ Error checking admin user:", error.message);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await checkAdminUser();
  process.exit(0);
};

run();