import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import {
  CheckCheck,
  Copy,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  X,
} from "lucide-react";
import { soundFx } from "../lib/sound";
import toast from "react-hot-toast";

const REACTIONS = ["❤️", "👍", "🔥", "😂", "🎉", "😮"];

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    previewImage,
    setPreviewImage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [localReactions, setLocalReactions] = useState({});

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && (messages || isTyping)) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    soundFx.playPop();
    toast.success("Copied to clipboard", { duration: 1500 });
  };

  const handleAddReaction = (messageId, emoji) => {
    soundFx.playPop();
    setLocalReactions((prev) => ({
      ...prev,
      [messageId]: emoji,
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleDownloadDoc = async (e, url, filename) => {
    e.stopPropagation();
    try {
      toast.loading("Downloading document...", { id: "doc-dl", duration: 1500 });
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Downloaded successfully!", { id: "doc-dl" });
    } catch (err) {
      window.open(url, "_blank");
      toast.dismiss("doc-dl");
    }
  };

  const handleOpenDoc = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-base-100/40">
      <ChatHeader />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn btn-circle btn-sm bg-black/60 text-white hover:bg-black/90 border-0"
                  title="Open original"
                >
                  <Download className="size-4" />
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="btn btn-circle btn-sm bg-black/60 text-white hover:bg-black/90 border-0"
                >
                  <X className="size-4" />
                </button>
              </div>
              <img
                src={previewImage}
                alt="Expanded view"
                className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((message, index) => {
          const isSender = message.senderId === authUser._id;
          const reaction = localReactions[message._id];

          return (
            <motion.div
              key={message._id || index}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`chat group ${isSender ? "chat-end" : "chat-start"} relative`}
            >
              <div className="chat-image avatar">
                <div className="size-9 rounded-full border ring-1 ring-base-300 overflow-hidden shadow-sm">
                  <img
                    src={
                      isSender
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className="chat-header mb-1 flex items-center gap-1.5 opacity-60 text-[11px]">
                <span>{isSender ? "You" : selectedUser.fullName?.split(" ")[0]}</span>
                <time>{formatMessageTime(message.createdAt)}</time>
              </div>

              <div className="relative">
                {/* Floating Quick Reaction Pill on hover */}
                <div
                  className={`absolute -top-7 ${
                    isSender ? "right-0" : "left-0"
                  } hidden group-hover:flex items-center gap-1 bg-base-200/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg border border-base-300/80 z-20 text-xs`}
                >
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(message._id, emoji)}
                      className="hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                  {message.text && (
                    <button
                      onClick={() => handleCopyText(message.text)}
                      className="text-base-content/60 hover:text-base-content ml-1 pl-1 border-l border-base-content/20"
                      title="Copy"
                    >
                      <Copy className="size-3" />
                    </button>
                  )}
                </div>

                {/* Bubble Container */}
                <div
                  className={`chat-bubble flex flex-col rounded-2xl relative shadow-md p-3.5 ${
                    isSender
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-content"
                      : "bg-base-200/90 text-base-content border border-base-300/60"
                  }`}
                >
                  {/* 1. Image Attachment */}
                  {message.image && (
                    <div className="relative group cursor-pointer overflow-hidden rounded-xl mb-2 shadow-sm">
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="sm:max-w-[280px] max-h-64 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onClick={() => setPreviewImage(message.image)}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-[2px]">
                        Click to view full image
                      </div>
                    </div>
                  )}

                  {/* 2. Document Attachment */}
                  {message.file && (
                    <div
                      onClick={() => handleOpenDoc(message.file.url)}
                      className={`flex items-center gap-3 p-3 rounded-2xl mb-2 border transition-all cursor-pointer group/doc shadow-sm hover:shadow-md ${
                        isSender
                          ? "bg-black/20 hover:bg-black/30 border-white/20 text-primary-content"
                          : "bg-base-100 hover:bg-base-200/90 border-base-300 text-base-content"
                      }`}
                    >
                      <div className="size-11 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0 group-hover/doc:scale-105 transition-transform">
                        <FileText className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-bold truncate group-hover/doc:underline">
                          {message.file.name}
                        </p>
                        <p className="text-[10px] opacity-70 mt-0.5">
                          {formatFileSize(message.file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Open / View Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDoc(message.file.url);
                          }}
                          className={`btn btn-circle btn-xs ${
                            isSender ? "btn-neutral text-white" : "btn-ghost text-base-content/70 hover:text-primary"
                          }`}
                          title="Open in new tab"
                        >
                          <ExternalLink className="size-3.5" />
                        </button>
                        {/* Direct Download Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadDoc(e, message.file.url, message.file.name)}
                          className={`btn btn-circle btn-xs ${
                            isSender ? "btn-neutral text-white" : "btn-primary text-primary-content"
                          } shadow-sm`}
                          title="Download Document"
                        >
                          <Download className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Live Location Card */}
                  {message.location && (
                    <div
                      className={`rounded-xl overflow-hidden mb-2 border shadow-sm ${
                        isSender
                          ? "bg-black/15 border-white/20 text-primary-content"
                          : "bg-base-100 border-base-300 text-base-content"
                      }`}
                    >
                      <div className="p-3 flex items-start gap-2.5">
                        <div className="size-9 rounded-xl bg-accent text-accent-content flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <MapPin className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold leading-tight">📍 Live GPS Location</p>
                          <p className="text-[11px] opacity-80 mt-0.5">
                            {message.location.address ||
                              `Lat: ${message.location.latitude?.toFixed(4)}, Lng: ${message.location.longitude?.toFixed(4)}`}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`https://www.google.com/maps?q=${message.location.latitude},${message.location.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold border-t transition-colors ${
                          isSender
                            ? "bg-black/20 hover:bg-black/30 border-white/10 text-white"
                            : "bg-base-200 hover:bg-base-300 border-base-300 text-primary"
                        }`}
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  )}

                  {/* 4. Text Message */}
                  {message.text && <p className="leading-relaxed text-sm sm:text-base">{message.text}</p>}

                  {/* Delivery Status & Reaction Badge */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70 self-end">
                    {isSender && <CheckCheck className="size-3.5 text-current" />}
                  </div>
                </div>

                {/* Render Selected Emoji Reaction on Bubble */}
                {reaction && (
                  <div
                    className={`absolute -bottom-2 ${
                      isSender ? "left-2" : "right-2"
                    } bg-base-100 px-1.5 py-0.5 rounded-full text-xs shadow-md border border-base-300 animate-in zoom-in`}
                  >
                    {reaction}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Live Typing Wave Bubble */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="chat chat-start"
          >
            <div className="chat-image avatar">
              <div className="size-9 rounded-full border ring-1 ring-base-300 overflow-hidden shadow-sm">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
            <div className="chat-bubble bg-base-200/90 text-base-content border border-base-300/60 flex items-center gap-1.5 py-3 px-4 rounded-2xl shadow-sm">
              <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="size-2 bg-primary rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
