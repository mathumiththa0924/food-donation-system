const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// ================= ENV =================
dotenv.config();

// ================= DB =================
const connectDB = require("./config/db");

// connect DB BEFORE starting server
connectDB();

const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Food Donation Backend Running" });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});