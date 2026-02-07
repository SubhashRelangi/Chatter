import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";

const emitMessageToUser = (io, onlineUsers, userId, eventName, payload) => {
    const socketIds = onlineUsers?.get(userId?.toString());
    if (!socketIds) {
        return;
    }

    for (const socketId of socketIds) {
        io.to(socketId).emit(eventName, payload);
    }
};

// 📨 Get messages between logged-in user and another user
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
            .sort({ createdAt: 1 })
            .lean();

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 👥 Get all users except the logged-in user (for sidebar)
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedUserId = req.user._id;

        const users = await User.find({ _id: { $ne: loggedUserId } }).select("-password").lean();

        const usersWithLastMessage = await Promise.all(
            users.map(async (user) => {
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderId: loggedUserId, receiverId: user._id },
                        { senderId: user._id, receiverId: loggedUserId },
                    ],
                })
                .sort({ createdAt: -1 })
                .lean();

                return {
                    ...user,
                    lastMessage,
                };
            })
        );

        res.status(200).json(usersWithLastMessage);
    } catch (error) {
        console.error("Error in getAllUsers controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📤 Send a message (text or image)
export const sendMessage = async (req, res) => {
    try {
        const { text, image, isEncrypted = false, encryptionIv = "", senderPublicKey = "" } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        const trimmedText = typeof text === "string" ? text.trim() : "";
        const normalizedIv = typeof encryptionIv === "string" ? encryptionIv.trim() : "";
        const normalizedSenderPublicKey = typeof senderPublicKey === "string" ? senderPublicKey.trim() : "";

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid receiver ID" });
        }

        if (!trimmedText && !image) {
            return res.status(400).json({ message: "Message text or image is required" });
        }

        if (isEncrypted && trimmedText && !normalizedIv) {
            return res.status(400).json({ message: "Encrypted messages require an IV" });
        }

        if (isEncrypted && trimmedText && !normalizedSenderPublicKey) {
            return res.status(400).json({ message: "Encrypted messages require sender public key" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: trimmedText,
            image: imageUrl || "",
            isEncrypted: Boolean(isEncrypted),
            encryptionIv: normalizedIv,
            senderPublicKey: normalizedSenderPublicKey,
        });

        await newMessage.save();
        const messagePayload = newMessage.toObject();
        messagePayload.senderId = messagePayload.senderId.toString();
        messagePayload.receiverId = messagePayload.receiverId.toString();

        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        emitMessageToUser(io, onlineUsers, receiverId, "newMessage", messagePayload);

        res.status(201).json(messagePayload);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
