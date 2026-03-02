import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js'; 
import messageRoutes from './routes/message.route.js';
import http from 'http';
import { Server } from 'socket.io';
import jwt from "jsonwebtoken";
import User from "./models/auth.model.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGODB_URL;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
    res.send("Server is up and running!");
});

const onlineUsers = new Map();
app.set("io", io);
app.set("onlineUsers", onlineUsers);

const parseTokenFromCookie = (cookieHeader = "") => {
    const token = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("jwt="))
        ?.slice(4);

    return token ? decodeURIComponent(token) : null;
};

const emitOnlineUsers = () => {
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
};

io.use(async (socket, next) => {
    try {
        const token = parseTokenFromCookie(socket.handshake.headers.cookie);
        if (!token) {
            return next(new Error("Unauthorized"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userId) {
            return next(new Error("Unauthorized"));
        }

        const userExists = await User.exists({ _id: decoded.userId });
        if (!userExists) {
            return next(new Error("Unauthorized"));
        }

        socket.userId = decoded.userId.toString();
        next();
    } catch (error) {
        next(new Error("Unauthorized"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.userId;
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    emitOnlineUsers();

    socket.on("disconnect", () => {
        const userSocketSet = onlineUsers.get(userId);
        if (!userSocketSet) {
            return;
        }

        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
            onlineUsers.delete(userId);
        }

        emitOnlineUsers();
    });
});

// routes
app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);


// Connect to MongoDB
mongoose.connect(MONGO_URI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

httpServer.listen(PORT, () => {
    console.log(`App and Socket.IO server are running at http://localhost:${PORT}`);
});
