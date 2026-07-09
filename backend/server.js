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

const app = express();

const frontendOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:4174"
];

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
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

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ================= SERVER START & SOCKET.IO =================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || frontendOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
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
        receiverId: data.receiverId || undefined,
        requestId: data.requestId || undefined,
        moneyRequestId: data.moneyRequestId || undefined,
        text: data.text
      });
      await newMessage.populate('senderId', 'name');

      const sender = await User.findById(data.senderId);
      const senderName = sender ? sender.name : "Someone";

      let recipients = [];
      if (data.requestId) {
        const Request = require("./models/Request");
        const reqDoc = await Request.findById(data.requestId).populate('foodId');
        if (reqDoc) {
          const ngoIdStr = reqDoc.ngoId?.toString();
          const donorIdStr = reqDoc.foodId?.donor?.toString();
          const volIdStr = reqDoc.volunteerId?.toString();

          if (ngoIdStr && ngoIdStr !== data.senderId) recipients.push(ngoIdStr);
          if (donorIdStr && donorIdStr !== data.senderId) recipients.push(donorIdStr);
          if (volIdStr && volIdStr !== data.senderId) recipients.push(volIdStr);
        }
      } else if (data.receiverId) {
        recipients.push(data.receiverId);
      }

      // Unique recipients
      recipients = [...new Set(recipients)];

      for (const recId of recipients) {
        const notif = await Notification.create({
          recipientId: recId,
          message: `New chat message from ${senderName}: "${data.text}"`,
          type: 'new_message',
          relatedId: data.moneyRequestId || data.requestId
        });
        io.to(recId).emit("new_notification", notif);
      }

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

// Background job: expire food donations past expiryTime
const Food = require('./models/Food');
const Notification = require('./models/Notification');
const User = require('./models/User');

const expireStaleDonations = async () => {
  try {
    const now = new Date();
    const expired = await Food.find({ status: 'pending', expiryTime: { $lt: now } });
    if (expired.length === 0) return;

    for (const food of expired) {
      food.status = 'expired';
      food.statusHistory = [
        ...food.statusHistory,
        { status: 'expired', note: 'Automatically expired due to expiryTime', changedBy: null, changedAt: new Date() }
      ];
      await food.save();

      // notify donor
      try {
        const notif = await Notification.create({
          recipientId: food.donor,
          message: `Your donation '${food.foodName}' has expired and is now hidden from NGOs.`,
          type: 'donation_expired',
          relatedId: food._id
        });
        const ioInst = app.get('io');
        if (ioInst) ioInst.to(String(food.donor)).emit('new_notification', notif);
      } catch (e) {
        console.error('Error creating expiry notification:', e);
      }
    }
    console.log(`Auto-expired ${expired.length} donations`);
  } catch (err) {
    console.error('Error running expireStaleDonations:', err);
  }
};

// Run every 5 minutes
setInterval(expireStaleDonations, 1000 * 60 * 5);

const { ensureCanonicalAdmin } = require("./services/adminBootstrap");

const startServer = async () => {
  await connectDB();

  try {
    const { email, removedDuplicates } = await ensureCanonicalAdmin();
    if (removedDuplicates > 0) {
      console.log(`🔧 Admin bootstrap: removed ${removedDuplicates} duplicate admin(s)`);
    }
    console.log(`✅ Canonical admin ready: ${email}`);
  } catch (err) {
    console.error("❌ Admin bootstrap failed:", err.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server & Socket running on port ${PORT}`);
  });
};

startServer();