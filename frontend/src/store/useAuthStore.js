import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import confetti from "canvas-confetti";
import { soundFx } from "../lib/sound.js";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isUpdatingPassword: false,
  isSendingResetLink: false,
  isResettingPassword: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  serverStatus: "connected", // "connected" | "updating" | "reconnected" | "offline"
  reconnectAttempts: 0,

  setServerStatus: (status) => set({ serverStatus: status }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully!");
      soundFx.playReceive();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully!");
      soundFx.playReceive();
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      soundFx.playPop();
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
      soundFx.playReceive();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    set({ isUpdatingPassword: true });
    try {
      const res = await axiosInstance.put("/auth/update-password", {
        currentPassword,
        newPassword,
      });
      toast.success(res.data?.message || "Password updated successfully!");
      soundFx.playReceive();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
      return false;
    } finally {
      set({ isUpdatingPassword: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isSendingResetLink: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data?.message || "Reset link sent to your email!");
      soundFx.playReceive();
      return { success: true, previewUrl: res.data?.previewUrl, resetToken: res.data?.resetToken };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
      return { success: false };
    } finally {
      set({ isSendingResetLink: false });
    }
  },

  resetPassword: async (token, password) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      toast.success(res.data?.message || "Password reset successful!");
      soundFx.playReceive();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return false;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser) return;
    if (get().socket?.connected) return;

    // Disconnect old instance if any
    if (get().socket) {
      get().socket.disconnect();
    }

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 4000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      const prevStatus = get().serverStatus;
      if (prevStatus === "updating" || prevStatus === "offline") {
        set({ serverStatus: "reconnected", reconnectAttempts: 0 });
        soundFx.playReceive();
        setTimeout(() => {
          if (get().serverStatus === "reconnected") {
            set({ serverStatus: "connected" });
          }
        }, 3500);
      } else {
        set({ serverStatus: "connected", reconnectAttempts: 0 });
      }
    });

    socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        set({ serverStatus: "updating" });
      }
    });

    socket.on("connect_error", () => {
      const attempts = get().reconnectAttempts + 1;
      set({ serverStatus: "updating", reconnectAttempts: attempts });
    });

    socket.io?.on("reconnect_attempt", (attempt) => {
      set({ serverStatus: "updating", reconnectAttempts: attempt });
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket });
  },

  manualReconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.connect();
    } else {
      get().connectSocket();
    }
  },

  disconnectSocket: () => {
    if (get().socket) {
      get().socket.disconnect();
      set({ socket: null, serverStatus: "connected" });
    }
  },
}));
