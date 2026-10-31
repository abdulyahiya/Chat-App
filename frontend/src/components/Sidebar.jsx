import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Search,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { soundFx } from "../lib/sound";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const { callLogs, getCallLogs, deleteCallLog, clearCallHistory, startCall, isFetchingCalls } = useCallStore();

  const [mainTab, setMainTab] = useState("chats"); // 'chats' | 'calls'
  const [activeContactFilter, setActiveContactFilter] = useState("all"); // 'all' | 'online'
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (mainTab === "calls") {
      getCallLogs();
    }
  }, [mainTab, getCallLogs]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline = activeContactFilter === "online" ? onlineUsers.includes(user._id) : true;
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOnline && matchesSearch;
  });

  const onlineCount = users.filter((u) => onlineUsers.includes(u._id)).length;

  const formatCallTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `Today, ${time}`;
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full md:w-64 lg:w-80 border-r border-base-300/80 bg-base-100/60 backdrop-blur-xl flex flex-col transition-all duration-200 select-none">
      {/* Top Main Navigation (Chats vs Calls) */}
      <div className="p-3 pb-2 border-b border-base-300/80 space-y-3">
        <div className="flex p-1 bg-base-200/80 rounded-2xl gap-1">
          <button
            onClick={() => {
              setMainTab("chats");
              soundFx.playPop();
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mainTab === "chats"
                ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200"
            }`}
          >
            <MessageSquare className="size-3.5" />
            <span>Chats</span>
          </button>

          <button
            onClick={() => {
              setMainTab("calls");
              soundFx.playPop();
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mainTab === "calls"
                ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200"
            }`}
          >
            <PhoneCall className="size-3.5" />
            <span>Calls</span>
            {callLogs.length > 0 && (
              <span className="badge badge-xs bg-white/20 text-current border-0">
                {callLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* ================= CHATS TAB CONTROLS ================= */}
        {mainTab === "chats" && (
          <div className="space-y-2">
            {/* Search Input */}
            <div className="block md:hidden lg:block relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm input-bordered w-full pl-8 pr-7 text-xs rounded-xl bg-base-200/60 focus:bg-base-100 transition-colors"
              />
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex p-0.5 bg-base-200/50 rounded-xl gap-1 block md:hidden lg:flex">
              <button
                onClick={() => {
                  setActiveContactFilter("all");
                  soundFx.playPop();
                }}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeContactFilter === "all"
                    ? "bg-base-100 text-base-content shadow-sm"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => {
                  setActiveContactFilter("online");
                  soundFx.playPop();
                }}
                className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeContactFilter === "online"
                    ? "bg-base-100 text-primary shadow-sm"
                    : "text-base-content/60 hover:text-base-content"
                }`}
              >
                Online ({onlineCount})
              </button>
            </div>
          </div>
        )}

        {/* ================= CALLS TAB HEADER CONTROLS ================= */}
        {mainTab === "calls" && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Recent Call Logs
            </span>
            {callLogs.length > 0 && (
              <button
                onClick={clearCallHistory}
                className="text-[11px] text-error hover:underline flex items-center gap-1 font-semibold"
                title="Clear all calls"
              >
                <Trash2 className="size-3" />
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= VIEW 1: CONTACTS / CHATS LIST ================= */}
      {mainTab === "chats" && (
        <div className="overflow-y-auto w-full p-2 space-y-1">
          {filteredUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const isOnline = onlineUsers.includes(user._id);

            return (
              <motion.button
                key={user._id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedUser(user);
                  soundFx.playPop();
                }}
                className={`
                  w-full p-2.5 sm:p-3 flex items-center gap-3 rounded-2xl transition-all duration-200
                  ${
                    isSelected
                      ? "bg-primary text-primary-content shadow-md shadow-primary/25"
                      : "hover:bg-base-200/80 text-base-content"
                  }
                `}
              >
                <div className="relative mx-0 md:mx-auto lg:mx-0 shrink-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className={`size-11 sm:size-12 object-cover rounded-2xl border-2 transition-transform ${
                      isSelected ? "border-white/40" : "border-base-300"
                    }`}
                  />
                  {isOnline && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ${
                        isSelected ? "bg-white ring-primary" : "bg-green-500 ring-base-100"
                      }`}
                    />
                  )}
                </div>

                {/* User text details */}
                <div className="block md:hidden lg:block text-left min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm truncate font-display">{user.fullName}</span>
                  </div>
                  <div
                    className={`text-xs truncate mt-0.5 ${
                      isSelected ? "text-primary-content/80" : isOnline ? "text-green-500 font-medium" : "text-base-content/50"
                    }`}
                  >
                    {isOnline ? "Active now" : "Offline"}
                  </div>
                </div>
              </motion.button>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center text-base-content/50 py-8 text-xs font-medium">
              {activeContactFilter === "online" ? "No contacts online" : "No contacts found"}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: CALL HISTORY / LOGS ================= */}
      {mainTab === "calls" && (
        <div className="overflow-y-auto w-full p-2 space-y-1.5">
          {callLogs.map((call) => {
            const isOutgoing = call.callerId?._id === authUser?._id;
            const peer = isOutgoing ? call.receiverId : call.callerId;
            const isVideo = call.callType === "video";
            const isMissed = call.status === "missed";
            const isRejected = call.status === "rejected";

            if (!peer) return null;

            return (
              <motion.div
                key={call._id}
                whileHover={{ scale: 1.01 }}
                className="w-full p-2.5 rounded-2xl bg-base-200/50 hover:bg-base-200 border border-base-300/60 flex items-center justify-between gap-2.5 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={peer.profilePic || "/avatar.png"}
                      alt={peer.fullName}
                      className="size-10 sm:size-11 object-cover rounded-2xl border border-base-300"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ring-2 ring-base-100 ${
                        isMissed || isRejected
                          ? "bg-error text-white"
                          : isOutgoing
                          ? "bg-primary text-white"
                          : "bg-success text-white"
                      }`}
                    >
                      {isMissed || isRejected ? (
                        <PhoneMissed className="size-2.5" />
                      ) : isOutgoing ? (
                        <PhoneOutgoing className="size-2.5" />
                      ) : (
                        <PhoneIncoming className="size-2.5" />
                      )}
                    </span>
                  </div>

                  {/* Call Info */}
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-bold text-xs sm:text-sm truncate font-display text-base-content">
                      {peer.fullName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-base-content/60 mt-0.5">
                      <span className="capitalize">
                        {isMissed ? "Missed" : isRejected ? "Declined" : formatDuration(call.duration) || "Completed"}
                      </span>
                      <span>•</span>
                      <span>{formatCallTime(call.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* 1-Click Call Back Button */}
                  <button
                    onClick={() => {
                      setSelectedUser(peer);
                      startCall(peer, isVideo ? "video" : "voice");
                    }}
                    className={`btn btn-circle btn-xs ${
                      isVideo ? "btn-secondary" : "btn-primary"
                    } shadow-sm`}
                    title={`Call back with ${isVideo ? "video" : "voice"}`}
                  >
                    {isVideo ? <Video className="size-3" /> : <Phone className="size-3" />}
                  </button>

                  {/* Delete log entry */}
                  <button
                    onClick={() => deleteCallLog(call._id)}
                    className="btn btn-ghost btn-circle btn-xs text-base-content/30 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete log"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {callLogs.length === 0 && !isFetchingCalls && (
            <div className="text-center text-base-content/50 py-12 px-4 space-y-2">
              <div className="size-12 rounded-2xl bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
                <PhoneOff className="size-6" />
              </div>
              <p className="text-xs font-semibold text-base-content/70">No call history yet</p>
              <p className="text-[11px] text-base-content/50">
                Calls you make or receive will automatically appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
