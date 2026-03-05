import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import Room from "./models/Room.js";
import { verifyAccessToken } from "./utils/jwt.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🚀 CodeCollab API is running!" });
});

// Track active users in each room
const roomUsers = {};

const getRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Socket.io Auth Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    const decoded = verifyAccessToken(token);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Socket.io Connection
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // JOIN ROOM
  socket.on("join-room", async ({ roomId, username }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      socket.join(roomId);
      socket.currentRoom = roomId;
      socket.username = username;

      if (!roomUsers[roomId]) roomUsers[roomId] = [];

      const userColor = getRandomColor();
      const userInfo = {
        socketId: socket.id,
        userId: socket.userId,
        username,
        color: userColor,
      };

      roomUsers[roomId].push(userInfo);

      socket.emit("room-joined", {
        room: {
          roomId: room.roomId,
          name: room.name,
          language: room.language,
          code: room.code,
        },
        users: roomUsers[roomId],
        yourColor: userColor,
      });

      socket.to(roomId).emit("user-joined", {
        userInfo,
        users: roomUsers[roomId],
      });

      console.log(`👤 ${username} joined room ${roomId}`);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  // CODE CHANGE
  socket.on("code-change", async ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", { code });
    try {
      await Room.findOneAndUpdate({ roomId }, { code }, { new: true });
    } catch (err) {
      console.error("Error saving code:", err.message);
    }
  });

  // LANGUAGE CHANGE
  socket.on("language-change", ({ roomId, language }) => {
    socket.to(roomId).emit("language-update", { language });
  });

  // CURSOR MOVE
  socket.on("cursor-move", ({ roomId, cursor }) => {
    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      username: socket.username,
      cursor,
    });
  });

  // LEAVE ROOM
  socket.on("leave-room", ({ roomId }) => {
    handleLeaveRoom(socket, roomId);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    if (socket.currentRoom) {
      handleLeaveRoom(socket, socket.currentRoom);
    }
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const handleLeaveRoom = (socket, roomId) => {
  socket.leave(roomId);
  if (roomUsers[roomId]) {
    roomUsers[roomId] = roomUsers[roomId].filter(
      (u) => u.socketId !== socket.id,
    );
    socket.to(roomId).emit("user-left", {
      socketId: socket.id,
      username: socket.username,
      users: roomUsers[roomId],
    });
    if (roomUsers[roomId].length === 0) {
      delete roomUsers[roomId];
    }
  }
};

// Connect MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected!");
    httpServer.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
