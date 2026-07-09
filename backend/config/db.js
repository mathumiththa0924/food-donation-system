const mongoose = require("mongoose");
const dns = require("dns");

// Force Google DNS so Node.js can resolve MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);


// Use the system DNS resolver so MongoDB Atlas SRV records resolve in the
// current network instead of forcing public DNS servers that may be blocked.

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    const localMongoUri = "mongodb://127.0.0.1:27017/foodDonationDB";

    const isPlaceholder = (value) =>
      !value ||
      value.includes("<username>") ||
      value.includes("<password>") ||
      value.includes("cluster0.example.mongodb.net") ||
      value.includes("example.mongodb.net");

    if (!mongoUri) {
      mongoUri = localMongoUri;
    }

    if (isPlaceholder(mongoUri)) {
      mongoUri = localMongoUri;
    }

    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (primaryError) {
      console.warn("⚠️ Primary MongoDB connection failed:", primaryError.message);

      if (mongoUri !== localMongoUri) {
        console.warn("⚠️ Trying local MongoDB fallback...");
        const fallbackConn = await mongoose.connect(localMongoUri);
        console.log(`✅ MongoDB Connected: ${fallbackConn.connection.host}/${fallbackConn.connection.name}`);
        return fallbackConn;
      }

      throw primaryError;
    }
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
