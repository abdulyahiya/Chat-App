import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";
import { soundFx } from "../lib/sound";
import toast from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

let pendingIceCandidates = [];

const flushPendingIceCandidates = async (pc) => {
  if (!pc || !pc.remoteDescription) return;
  while (pendingIceCandidates.length > 0) {
    const cand = pendingIceCandidates.shift();
    try {
      await pc.addIceCandidate(new RTCIceCandidate(cand));
    } catch (err) {
      console.warn("Error adding buffered ice candidate:", err);
    }
  }
};

export const useCallStore = create((set, get) => ({
  callState: "idle", // 'idle' | 'calling' | 'incoming' | 'connected'
  callType: "video", // 'video' | 'voice'
  peerUser: null, // { id, name, profilePic, signal }
  localStream: null,
  remoteStream: null,
  peerConnection: null,
  isMicMuted: false,
  isCameraOff: false,
  callDuration: 0,

  // Call Logs History
  callLogs: [],
  isFetchingCalls: false,

  getCallLogs: async () => {
    set({ isFetchingCalls: true });
    try {
      const res = await axiosInstance.get("/calls");
      set({ callLogs: res.data });
    } catch (error) {
      console.error("Error fetching call logs:", error);
    } finally {
      set({ isFetchingCalls: false });
    }
  },

  deleteCallLog: async (callId) => {
    try {
      await axiosInstance.delete(`/calls/${callId}`);
      set((state) => ({
        callLogs: state.callLogs.filter((c) => c._id !== callId),
      }));
      toast.success("Call log removed");
    } catch (error) {
      toast.error("Failed to delete call log");
    }
  },

  clearCallHistory: async () => {
    try {
      await axiosInstance.delete("/calls/clear");
      set({ callLogs: [] });
      toast.success("Call history cleared");
    } catch (error) {
      toast.error("Failed to clear call history");
    }
  },

  saveCallLog: async ({ receiverId, callType, status, duration }) => {
    try {
      const res = await axiosInstance.post("/calls", {
        receiverId,
        callType,
        status,
        duration,
      });
      set((state) => ({
        callLogs: [res.data, ...state.callLogs],
      }));
    } catch (error) {
      console.error("Error saving call log:", error);
    }
  },

  setupCallListeners: (socket) => {
    if (!socket) return;

    socket.off("incomingCall");
    socket.off("callAccepted");
    socket.off("iceCandidate");
    socket.off("callEnded");

    // When someone calls us
    socket.on("incomingCall", ({ signal, from, name, profilePic, callType }) => {
      // If already on a call, reject
      if (get().callState !== "idle") {
        socket.emit("endCall", { to: from });
        return;
      }

      set({
        callState: "incoming",
        callType: callType || "video",
        peerUser: { id: from, name, profilePic, signal },
      });
      soundFx.playReceive();
    });

    // When peer accepts our outgoing call
    socket.on("callAccepted", async ({ signal }) => {
      const { peerConnection } = get();
      if (peerConnection && signal) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
          await flushPendingIceCandidates(peerConnection);
          set({ callState: "connected" });
          soundFx.playPop();
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    });

    // When remote ICE candidate arrives
    socket.on("iceCandidate", async ({ candidate }) => {
      if (!candidate) return;
      const { peerConnection } = get();
      if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate:", err);
        }
      } else {
        // Buffer candidate until remote description is set
        pendingIceCandidates.push(candidate);
      }
    });

    // When peer hangs up or rejects
    socket.on("callEnded", () => {
      toast("Call ended", { icon: "📴", duration: 2000 });
      get().cleanupCall();
    });
  },

  startCall: async (targetUser, type = "video") => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    if (!socket || !authUser) {
      toast.error("Socket not connected");
      return;
    }

    try {
      pendingIceCandidates = [];
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video" ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const remoteStream = new MediaStream();

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Listen for remote tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          set({ remoteStream: event.streams[0] });
        } else if (event.track) {
          const current = get().remoteStream ? new MediaStream(get().remoteStream.getTracks()) : new MediaStream();
          current.addTrack(event.track);
          set({ remoteStream: current });
        }
      };

      // Listen for ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: targetUser._id,
            candidate: event.candidate,
          });
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      set({
        callState: "calling",
        callType: type,
        peerUser: { id: targetUser._id, name: targetUser.fullName, profilePic: targetUser.profilePic },
        localStream: stream,
        remoteStream: remoteStream,
        peerConnection: pc,
        isMicMuted: false,
        isCameraOff: false,
        callDuration: 0,
      });

      // Signal offer to target user
      socket.emit("callUser", {
        userToCall: targetUser._id,
        signalData: offer,
        from: authUser._id,
        name: authUser.fullName,
        profilePic: authUser.profilePic,
        callType: type,
      });

      soundFx.playSend();
    } catch (error) {
      console.error("Media devices access error:", error);
      toast.error("Unable to access camera or microphone. Please grant browser permissions.");
    }
  },

  acceptCall: async () => {
    const socket = useAuthStore.getState().socket;
    const { peerUser, callType } = get();

    if (!socket || !peerUser?.signal) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video" ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const pc = new RTCPeerConnection(ICE_SERVERS);
      const remoteStream = new MediaStream();

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          set({ remoteStream: event.streams[0] });
        } else if (event.track) {
          const current = get().remoteStream ? new MediaStream(get().remoteStream.getTracks()) : new MediaStream();
          current.addTrack(event.track);
          set({ remoteStream: current });
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            to: peerUser.id,
            candidate: event.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(peerUser.signal));
      await flushPendingIceCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      set({
        callState: "connected",
        localStream: stream,
        remoteStream: remoteStream,
        peerConnection: pc,
        isMicMuted: false,
        isCameraOff: false,
        callDuration: 0,
      });

      socket.emit("answerCall", {
        to: peerUser.id,
        signal: answer,
      });

      soundFx.playPop();
    } catch (error) {
      console.error("Accept call error:", error);
      toast.error("Unable to access media devices to answer call.");
      get().rejectCall();
    }
  },

  rejectCall: () => {
    const socket = useAuthStore.getState().socket;
    const { peerUser, callType } = get();

    if (socket && peerUser?.id) {
      socket.emit("endCall", { to: peerUser.id });
      get().saveCallLog({
        receiverId: peerUser.id,
        callType,
        status: "rejected",
        duration: 0,
      });
    }

    get().cleanupCall();
  },

  endCall: () => {
    const socket = useAuthStore.getState().socket;
    const { peerUser, callType, callDuration, callState } = get();

    if (socket && peerUser?.id) {
      socket.emit("endCall", { to: peerUser.id });

      const status = callState === "connected" ? "completed" : "missed";
      get().saveCallLog({
        receiverId: peerUser.id,
        callType,
        status,
        duration: callDuration,
      });
    }

    get().cleanupCall();
  },

  cleanupCall: () => {
    pendingIceCandidates = [];
    const { localStream, peerConnection } = get();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      peerConnection.close();
    }

    set({
      callState: "idle",
      peerUser: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isMicMuted: false,
      isCameraOff: false,
      callDuration: 0,
    });
  },

  setCallDuration: (fn) => {
    set((state) => ({
      callDuration: typeof fn === "function" ? fn(state.callDuration) : fn,
    }));
  },

  toggleMic: () => {
    const { localStream, isMicMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
      set({ isMicMuted: !isMicMuted });
      toast(isMicMuted ? "Microphone Unmuted" : "Microphone Muted", {
        icon: isMicMuted ? "🎙️" : "🔇",
        duration: 1500,
      });
    }
  },

  toggleCamera: () => {
    const { localStream, isCameraOff, callType } = get();
    if (localStream && callType === "video") {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOff;
      });
      set({ isCameraOff: !isCameraOff });
      toast(isCameraOff ? "Camera On" : "Camera Off", {
        icon: isCameraOff ? "📹" : "📷",
        duration: 1500,
      });
    }
  },
}));
