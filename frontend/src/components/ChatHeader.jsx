import { useState } from "react";
import { ArrowLeft, Phone, Video, Volume2, VolumeX, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { soundFx } from "../lib/sound";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, isTyping } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore();
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());
  const isOnline = onlineUsers.includes(selectedUser._id);

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    toast.success(muted ? "Chat sounds muted" : "Chat sounds enabled", {
      icon: muted ? "🔇" : "🔔",
      duration: 1500,
    });
  };

  const handleCall = (type) => {
    if (!isOnline) {
      toast.error(`${selectedUser.fullName} is currently offline`);
      return;
    }
    startCall(selectedUser, type);
  };

  return (
    <div className="p-3 sm:px-5 sm:py-3.5 border-b border-base-300/80 bg-base-100/80 backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-circle btn-sm md:hidden hover:bg-base-200"
            title="Back to contacts"
          >
            <ArrowLeft className="size-5" />
          </button>

          {/* Avatar with status indicator */}
          <div className="relative">
            <div className="size-10 sm:size-11 rounded-2xl overflow-hidden border-2 border-primary/20 ring-1 ring-base-300 shadow-sm bg-base-200">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-green-500 rounded-full ring-2 ring-base-100 animate-pulse" />
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-tight font-display">
              {selectedUser.fullName}
            </h3>
            <p className="text-xs flex items-center gap-1.5 mt-0.5">
              {isTyping ? (
                <span className="text-primary font-semibold animate-pulse flex items-center gap-1">
                  <span className="size-1.5 bg-primary rounded-full animate-ping" />
                  typing...
                </span>
              ) : isOnline ? (
                <span className="text-green-500 font-medium flex items-center gap-1">
                  <span className="size-1.5 bg-green-500 rounded-full" />
                  Online
                </span>
              ) : (
                <span className="text-base-content/50">Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Call */}
          <button
            onClick={() => handleCall("voice")}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary hover:bg-primary/10 transition-colors inline-flex"
            title="Voice Call"
          >
            <Phone className="size-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => handleCall("video")}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-secondary hover:bg-secondary/10 transition-colors inline-flex"
            title="Video Call"
          >
            <Video className="size-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`btn btn-ghost btn-circle btn-sm transition-colors ${
              isMuted ? "text-base-content/40 hover:text-base-content" : "text-primary hover:bg-primary/10"
            }`}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          {/* Close Chat */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-circle btn-sm hover:bg-base-200 text-base-content/70 hover:text-base-content"
            title="Close chat"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
