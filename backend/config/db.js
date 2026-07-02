// backend/config/db.js
const mongoose = require("mongoose");
const dns = require("dns");

// Force Google DNS to resolve MongoDB SRV records
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`,
    );
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
