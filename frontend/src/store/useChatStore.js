import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { soundFx } from "../lib/sound";

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
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      soundFx.playSend();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  isTyping: false,
  previewImage: null,
  setPreviewImage: (previewImage) => set({ previewImage }),

  sendTyping: () => {
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !authUser || !socket) return;
    socket.emit("typing", { receiverId: selectedUser._id, senderId: authUser._id });
  },

  sendStopTyping: () => {
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !authUser || !socket) return;
    socket.emit("stopTyping", { receiverId: selectedUser._id, senderId: authUser._id });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Clean up any existing listeners to prevent duplicates
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStoppedTyping");

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
        isTyping: false,
      });
      soundFx.playReceive();
    });

    socket.on("userTyping", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        set({ isTyping: true });
      }
    });

    socket.on("userStoppedTyping", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        set({ isTyping: false });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    }
    set({ isTyping: false });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, isTyping: false }),
}));
