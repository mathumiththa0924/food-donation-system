const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

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
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// ================= ROUTES =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/feedbacks", require("./routes/feedbackRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/money-requests", require("./routes/moneyRequestRoutes"));
app.use("/api/money-donations", require("./routes/moneyDonationRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Food Donation Backend Running" });
});

// ================= DEBUG ROUTE (TEMPORARY) =================
app.get("/debug/users", async (req, res) => {
  try {
    const User = require("./models/User");
    const users = await User.find({}, { password: 0 });
    res.json({
      success: true,
      message: `Found ${users.length} users`,
      users: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ================= SERVER START & SOCKET.IO =================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  }
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
  });

  socket.on("join_user_room", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined personal room: ${userId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const Message = require("./models/Message");
      const Notification = require("./models/Notification");
      const User = require("./models/User");

      const roomId = data.moneyRequestId ? `fund-${data.moneyRequestId}` : data.requestId;

      const newMessage = await Message.create({
        senderId: data.senderId,
        receiverId: data.receiverId,
        requestId: data.requestId || undefined,
        moneyRequestId: data.moneyRequestId || undefined,
        text: data.text
      });

      const sender = await User.findById(data.senderId);
      const senderName = sender ? sender.name : "Someone";

      const notif = await Notification.create({
        recipientId: data.receiverId,
        message: `New chat message from ${senderName}: "${data.text}"`,
        type: 'new_message',
        relatedId: data.moneyRequestId || data.requestId
      });

      io.to(data.receiverId).emit("new_notification", notif);
      io.to(roomId).emit("receive_message", newMessage);
    } catch (error) {
      console.error("Error saving message via socket:", error);
    }
  });

  // Location Tracking Events
  socket.on("send_location", (data) => {
    // data should contain { roomId, lat, lng, role, heading }
    // Broadcast the location update to the specific room (so Donor can see NGO moving)
    if (data.roomId) {
      socket.broadcast.to(data.roomId).emit("receive_location", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server & Socket running on port ${PORT}`);
});