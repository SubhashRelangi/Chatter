import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios.js";
import { decryptTextFromPeer, encryptTextForPeer } from "../lib/e2ee.js";
import { useAuthStore } from "./useAuthStore.js";

const ENCRYPTED_PLACEHOLDER = "[Encrypted message]";
const DECRYPTION_FAILED_PLACEHOLDER = "[Unable to decrypt]";

const normalizeMessageForDisplay = async (message, authUserId, peerPublicKey) => {
  if (!message?.isEncrypted) {
    return { ...message, decryptedText: message?.text || "" };
  }

  if (!message?.text) {
    return { ...message, decryptedText: "" };
  }

  const decryptionPeerKey =
    message.senderId === authUserId ? peerPublicKey : message.senderPublicKey || peerPublicKey;

  if (!authUserId || !decryptionPeerKey || !message.encryptionIv) {
    return { ...message, decryptedText: ENCRYPTED_PLACEHOLDER };
  }

  try {
    const decryptedText = await decryptTextFromPeer({
      userId: authUserId,
      peerPublicKey: decryptionPeerKey,
      cipherText: message.text,
      iv: message.encryptionIv,
    });

    return { ...message, decryptedText };
  } catch (error) {
    console.error("Failed to decrypt message:", error);
    return { ...message, decryptedText: DECRYPTION_FAILED_PLACEHOLDER };
  }
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const authUser = useAuthStore.getState().authUser;
      const selectedUser = get().selectedUser;
      const peerPublicKey = selectedUser?.encryptionPublicKey;

      const messages = await Promise.all(
        res.data.map((message) =>
          normalizeMessageForDisplay(message, authUser?._id, peerPublicKey)
        )
      );

      set({ messages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

    if (!selectedUser?._id) return;

    const trimmedText = typeof messageData.text === "string" ? messageData.text.trim() : "";
    const payload = {
      image: messageData.image || "",
    };

    try {
      if (trimmedText) {
        if (!selectedUser.encryptionPublicKey) {
          toast.error("Recipient encryption key unavailable. Ask them to sign in again.");
          return;
        }

        if (!authUser?._id) {
          toast.error("Authentication state is invalid. Please sign in again.");
          return;
        }

      const encryptedPayload = await encryptTextForPeer({
        userId: authUser._id,
        peerPublicKey: selectedUser.encryptionPublicKey,
        plainText: trimmedText,
      });

      payload.text = encryptedPayload.cipherText;
      payload.encryptionIv = encryptedPayload.iv;
      payload.isEncrypted = true;
      payload.senderPublicKey = encryptedPayload.senderPublicKey;
    }

      if (!payload.text && !payload.image) return;

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      const preparedMessage = await normalizeMessageForDisplay(
        res.data,
        authUser?._id,
        selectedUser.encryptionPublicKey
      );

      set({ messages: [...messages, preparedMessage] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("WebSocket is not initialized. Cannot subscribe to messages.");
      return;
    }

    socket.off("newMessage");
    socket.on("newMessage", async (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      if (!currentSelectedUser) return;

      const isMessageFromSelectedUser = newMessage.senderId === currentSelectedUser._id;
      if (!isMessageFromSelectedUser) return;

      const authUser = useAuthStore.getState().authUser;
      const preparedMessage = await normalizeMessageForDisplay(
        newMessage,
        authUser?._id,
        currentSelectedUser.encryptionPublicKey
      );

      set({
        messages: [...get().messages, preparedMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, messages: [] }),
}));
