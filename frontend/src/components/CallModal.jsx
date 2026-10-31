import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Video,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CallModal = () => {
  const {
    callState,
    callType,
    peerUser,
    localStream,
    remoteStream,
    isMicMuted,
    isCameraOff,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, callState, callType]);

  // Attach remote stream to video & audio elements
  useEffect(() => {
    if (remoteStream) {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch((err) => {
          console.warn("Remote video autoPlay interrupted:", err);
        });
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch((err) => {
          console.warn("Remote audio autoPlay interrupted:", err);
        });
      }
    }
  }, [remoteStream, callState, callType]);

  // Call duration counter
  useEffect(() => {
    let interval;
    if (callState === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => {
          const next = prev + 1;
          useCallStore.getState().setCallDuration(next);
          return next;
        });
      }, 1000);
    } else {
      setCallDuration(0);
      useCallStore.getState().setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (callState === "idle") return null;

  return (
    <AnimatePresence>
      {/* ======================================================== */}
      {/* 1. INCOMING CALL MODAL                                   */}
      {/* ======================================================== */}
      {callState === "incoming" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <div className="w-full max-w-sm rounded-3xl bg-base-100 border border-base-300/80 p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Ambient animated glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            {/* Caller Avatar with pulsing ring */}
            <div className="relative mx-auto size-24">
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              <div className="relative size-24 rounded-full overflow-hidden border-4 border-primary shadow-xl bg-base-300">
                <img
                  src={peerUser?.profilePic || "/avatar.png"}
                  alt={peerUser?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display">{peerUser?.name || "Incoming Caller"}</h3>
              <p className="text-xs text-primary font-medium flex items-center justify-center gap-1.5 animate-pulse">
                {callType === "video" ? <Video className="size-4" /> : <Phone className="size-4" />}
                Incoming {callType === "video" ? "Video" : "Voice"} Call...
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 pt-2">
              {/* Reject */}
              <button
                onClick={rejectCall}
                className="btn btn-circle btn-error size-14 shadow-lg hover:scale-110 active:scale-95 transition-all"
                title="Decline Call"
              >
                <PhoneOff className="size-6 text-white" />
              </button>

              {/* Accept */}
              <button
                onClick={acceptCall}
                className="btn btn-circle btn-success size-14 shadow-lg hover:scale-110 active:scale-95 transition-all"
                title="Accept Call"
              >
                <PhoneIncoming className="size-6 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ======================================================== */}
      {/* 2. OUTGOING CALLING / CONNECTED MODAL                   */}
      {/* ======================================================== */}
      {(callState === "calling" || callState === "connected") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-2 sm:p-6"
        >
          <div className="relative w-full max-w-4xl h-[85vh] max-h-[640px] bg-base-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between bg-neutral">
            {/* Top Bar */}
            <div className="p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center gap-3 text-white">
                <div className="size-10 rounded-2xl overflow-hidden border-2 border-white/20 bg-base-800">
                  <img
                    src={peerUser?.profilePic || "/avatar.png"}
                    alt={peerUser?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight text-white">{peerUser?.name}</h4>
                  <p className="text-[11px] text-white/70">
                    {callState === "calling"
                      ? "Calling..."
                      : `Connected • ${formatTime(callDuration)}`}
                  </p>
                </div>
              </div>

              <div className="badge badge-primary badge-sm gap-1 font-semibold text-white">
                {callType === "video" ? <Video className="size-3" /> : <Phone className="size-3" />}
                {callType.toUpperCase()}
              </div>
            </div>

            {/* Middle Video / Audio Visualizer Area */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black/90">
              {callType === "video" ? (
                <>
                  {/* Remote Video */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* If no remote stream yet (still calling) */}
                  {callState === "calling" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-base-900/90 text-white z-10">
                      <div className="relative size-24">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative size-24 rounded-full overflow-hidden border-4 border-primary shadow-xl">
                          <img
                            src={peerUser?.profilePic || "/avatar.png"}
                            alt={peerUser?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-sm font-semibold animate-pulse text-white/80">
                        Waiting for {peerUser?.name} to answer...
                      </p>
                    </div>
                  )}

                  {/* Local Video Picture-in-Picture */}
                  <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black z-20">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isCameraOff ? "hidden" : ""}`}
                    />
                    {isCameraOff && (
                      <div className="w-full h-full flex items-center justify-center bg-base-800 text-white text-xs">
                        <CameraOff className="size-5 text-white/50" />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Voice Call Visualizer */
                <div className="flex flex-col items-center justify-center gap-6 text-white p-6">
                  <div className="relative size-28">
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <div className="relative size-28 rounded-full overflow-hidden border-4 border-primary/50 shadow-2xl">
                      <img
                        src={peerUser?.profilePic || "/avatar.png"}
                        alt={peerUser?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-white">{peerUser?.name}</h3>
                    <p className="text-xs text-white/60">
                      {callState === "calling" ? "Ringing..." : `In Call • ${formatTime(callDuration)}`}
                    </p>
                  </div>

                  {/* Audio wave animation */}
                  {callState === "connected" && (
                    <div className="flex items-center gap-1.5 h-8">
                      {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                        <div
                          key={bar}
                          className="w-1.5 bg-primary rounded-full animate-pulse"
                          style={{
                            height: `${Math.sin(bar) * 20 + 20}px`,
                            animationDuration: `${0.4 + bar * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dedicated audio element for voice calls (muted in video mode to prevent doubling) */}
            <audio
              ref={remoteAudioRef}
              autoPlay
              playsInline
              muted={callType === "video"}
              className="hidden"
            />

            {/* Bottom Control Bar */}
            <div className="p-4 z-20 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
              {/* Mic Toggle */}
              <button
                onClick={toggleMic}
                className={`btn btn-circle btn-md border-0 transition-all ${
                  isMicMuted ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-white/20 text-white hover:bg-white/30"
                }`}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </button>

              {/* Camera Toggle (Video Call only) */}
              {callType === "video" && (
                <button
                  onClick={toggleCamera}
                  className={`btn btn-circle btn-md border-0 transition-all ${
                    isCameraOff ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                  title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isCameraOff ? <CameraOff className="size-5" /> : <Camera className="size-5" />}
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="btn btn-circle btn-error size-12 shadow-xl hover:scale-105 active:scale-95 transition-all"
                title="End Call"
              >
                <PhoneOff className="size-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallModal;
