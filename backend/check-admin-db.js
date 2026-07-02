const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Check if admin exists
    const admin = await User.findOne({ email: "admin@mealbridge.com" }).select("+password");
    
    if (admin) {
      console.log("✅ Admin user found!");
      console.log("📧 Email:", admin.email);
      console.log("👤 Name:", admin.name);
      console.log("🔑 Role:", admin.role);
      console.log("🔐 Password hash exists:", admin.password ? "Yes" : "No");
    } else {
      console.log("❌ Admin user NOT found!");
    }

    // Show all users
    const allUsers = await User.find({}, { password: 0 });
    console.log("\n📋 Total users in database:", allUsers.length);
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkAdmin();