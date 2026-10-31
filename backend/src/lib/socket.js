import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const socketAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
if (process.env.CLIENT_URL && !socketAllowedOrigins.includes(process.env.CLIENT_URL)) {
  socketAllowedOrigins.push(process.env.CLIENT_URL);
}

const io = new Server(server, {
  cors: {
    origin: socketAllowedOrigins,
    credentials: true,
  },
});

// used to store online users: { [userId: string]: Set<string> }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  const sockets = userSocketMap[userId];
  if (!sockets) return [];
  return Array.from(sockets);
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing status events
  socket.on("typing", ({ receiverId, senderId }) => {
    const receiverSockets = getReceiverSocketId(receiverId);
    receiverSockets.forEach((sockId) => {
      io.to(sockId).emit("userTyping", { senderId });
    });
  });

  socket.on("stopTyping", ({ receiverId, senderId }) => {
    const receiverSockets = getReceiverSocketId(receiverId);
    receiverSockets.forEach((sockId) => {
      io.to(sockId).emit("userStoppedTyping", { senderId });
    });
  });

  // ==========================================
  // WebRTC Real-Time Audio & Video Call Signaling
  // ==========================================
  socket.on("callUser", ({ userToCall, signalData, from, name, profilePic, callType }) => {
    const receiverSockets = getReceiverSocketId(userToCall);
    receiverSockets.forEach((sockId) => {
      io.to(sockId).emit("incomingCall", {
        signal: signalData,
        from,
        name,
        profilePic,
        callType, // 'video' | 'voice'
      });
    });
  });

  socket.on("answerCall", ({ to, signal }) => {
    const callerSockets = getReceiverSocketId(to);
    callerSockets.forEach((sockId) => {
      io.to(sockId).emit("callAccepted", { signal });
    });
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const peerSockets = getReceiverSocketId(to);
    peerSockets.forEach((sockId) => {
      io.to(sockId).emit("iceCandidate", { candidate });
    });
  });

  socket.on("endCall", ({ to }) => {
    if (to) {
      const peerSockets = getReceiverSocketId(to);
      peerSockets.forEach((sockId) => {
        io.to(sockId).emit("callEnded");
      });
    }
  });

  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
