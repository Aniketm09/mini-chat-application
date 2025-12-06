const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// HTTP server (required for Socket.IO)
const server = http.createServer(app);

// Socket.IO setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Load User model
const User = require("./models/User");

// -------------------------------------------------------------
// ONLINE USERS
// Structure: onlineUsers.set(userId, { count: n, name: "Aniket" })
// -------------------------------------------------------------
const onlineUsers = new Map();

// -------------------------------------------------------------
// SOCKET.IO EVENTS
// -------------------------------------------------------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // -----------------------------
  // USER TYPING START
  // -----------------------------
  socket.on("typing", ({ channelId, name }) => {
    socket.to(channelId).emit("typing", name);
  });

  // -----------------------------
  // USER TYPING STOP
  // -----------------------------
  socket.on("stop-typing", ({ channelId, name }) => {
    socket.to(channelId).emit("stop-typing", name);
  });

  // -----------------------------
  // IDENTIFY USER (presence)
  // -----------------------------
  socket.on("identify", async (userId) => {
    socket.userId = userId;

    // Fetch username from DB
    const user = await User.findById(userId).select("name");
    if (!user) return;

    const existing = onlineUsers.get(userId);

    if (existing) {
      onlineUsers.set(userId, {
        count: existing.count + 1,
        name: user.name,
      });
    } else {
      onlineUsers.set(userId, {
        count: 1,
        name: user.name,
      });
    }

    // Broadcast current online users: [{ userId, name }]
    io.emit(
      "online-users",
      Array.from(onlineUsers.entries()).map(([userId, data]) => ({
        userId,
        name: data.name,
      }))
    );
  });

  // -----------------------------
  // JOIN CHANNEL
  // -----------------------------
  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
  });

  // -----------------------------
  // SEND MESSAGE TO CHANNEL
  // -----------------------------
  socket.on("send-message", ({ channelId, message }) => {
    io.to(channelId).emit("new-message", message);
  });

  // -----------------------------
  // DISCONNECT
  // -----------------------------
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.userId) {
      const existing = onlineUsers.get(socket.userId);

      if (existing) {
        if (existing.count <= 1) {
          onlineUsers.delete(socket.userId);
        } else {
          onlineUsers.set(socket.userId, {
            ...existing,
            count: existing.count - 1,
          });
        }
      }

      // Broadcast updated list
      io.emit(
        "online-users",
        Array.from(onlineUsers.entries()).map(([userId, data]) => ({
          userId,
          name: data.name,
        }))
      );
    }
  });
});

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------
const authRoutes = require("./routes/authRoutes");
const channelRoutes = require("./routes/channelRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authMiddleware = require("./middleware/authMiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/channels", authMiddleware, channelRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
