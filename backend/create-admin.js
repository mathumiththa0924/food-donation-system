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

// Create Admin User
const createAdminUser = async () => {
  try {
    const adminData = {
      name: "System Admin",
      email: "admin@mealbridge.com",
      password: "Admin@123", // This will be hashed
      role: "admin",
      phone: "+1-234-567-8900",
      organization: "MealBridge Platform"
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const adminUser = await User.create({
      ...adminData,
      password: hashedPassword
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminUser.email);
    console.log("🔑 Password:", adminData.password);
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