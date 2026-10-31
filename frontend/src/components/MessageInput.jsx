import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import {
  FileText,
  Image,
  Loader2,
  MapPin,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const QUICK_EMOJIS = ["😊", "😂", "❤️", "🔥", "👍", "🎉", "✨", "🚀", "👏", "🙏", "💯", "😍"];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [fileAttachment, setFileAttachment] = useState(null); // { data, name, size, fileType }
  const [locationData, setLocationData] = useState(null); // { latitude, longitude, address }
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileImageRef = useRef(null);
  const fileDocRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, sendTyping, sendStopTyping } = useChatStore();

  const handleTextChange = (e) => {
    setText(e.target.value);
    sendTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping();
    }, 1500);
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    sendTyping();
  };

  // 1. Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image size must be less than 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFileAttachment(null);
      setLocationData(null);
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  // 2. Handle Document Selection
  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Document size must be less than 15MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileAttachment({
        data: reader.result,
        name: file.name,
        size: file.size,
        fileType: file.type || "application/octet-stream",
      });
      setImagePreview(null);
      setLocationData(null);
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  // 3. Handle Live GPS Location
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setShowAttachMenu(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationData({
          latitude,
          longitude,
          address: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        });
        setImagePreview(null);
        setFileAttachment(null);
        setIsGettingLocation(false);
        toast.success("Live location captured!");
      },
      (error) => {
        console.error("Location error:", error);
        toast.error("Unable to retrieve your location. Please check browser permissions.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imagePreview && !fileAttachment && !locationData) || isSending) return;

    setIsSending(true);
    sendStopTyping();
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        file: fileAttachment,
        location: locationData,
      });

      // Clear all previews
      setText("");
      setImagePreview(null);
      setFileAttachment(null);
      setLocationData(null);
      if (fileImageRef.current) fileImageRef.current.value = "";
      if (fileDocRef.current) fileDocRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="p-3 sm:p-4 w-full border-t border-base-300 relative bg-base-100/60 backdrop-blur-sm">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 bg-base-200/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-base-300 z-30 flex flex-wrap gap-2 max-w-xs animate-in fade-in zoom-in duration-150">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1.5 rounded-lg hover:bg-base-300"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Options Popover */}
      {showAttachMenu && (
        <div className="absolute bottom-20 left-12 bg-base-100/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-base-300 z-30 flex flex-col gap-1 w-52 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Photos/Images */}
          <button
            type="button"
            onClick={() => fileImageRef.current?.click()}
            className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors text-left"
          >
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Image className="size-4" />
            </div>
            <div>
              <p className="font-bold">Photos & Images</p>
              <p className="text-[10px] text-base-content/50">PNG, JPG, GIF, WebP</p>
            </div>
          </button>

          {/* Documents */}
          <button
            type="button"
            onClick={() => fileDocRef.current?.click()}
            className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold hover:bg-secondary/10 hover:text-secondary transition-colors text-left"
          >
            <div className="size-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <FileText className="size-4" />
            </div>
            <div>
              <p className="font-bold">Document / File</p>
              <p className="text-[10px] text-base-content/50">PDF, Word, Excel, ZIP</p>
            </div>
          </button>

          {/* Live Location */}
          <button
            type="button"
            onClick={handleShareLocation}
            className="flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold hover:bg-accent/10 hover:text-accent transition-colors text-left"
          >
            <div className="size-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <MapPin className="size-4" />
            </div>
            <div>
              <p className="font-bold">Share Live Location</p>
              <p className="text-[10px] text-base-content/50">Current GPS Coordinates</p>
            </div>
          </button>
        </div>
      )}

      {/* Image Preview Card */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl border-2 border-primary/40 shadow-md"
            />
            <button
              onClick={() => {
                setImagePreview(null);
                if (fileImageRef.current) fileImageRef.current.value = "";
              }}
              className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-error text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Document Preview Card */}
      {fileAttachment && (
        <div className="mb-3 flex items-center gap-2 p-2.5 rounded-2xl bg-base-200 border border-base-300 max-w-sm">
          <div className="size-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold truncate">{fileAttachment.name}</p>
            <p className="text-[10px] text-base-content/50">{formatFileSize(fileAttachment.size)}</p>
          </div>
          <button
            onClick={() => {
              setFileAttachment(null);
              if (fileDocRef.current) fileDocRef.current.value = "";
            }}
            className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-error"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Location Preview Card */}
      {locationData && (
        <div className="mb-3 flex items-center gap-2.5 p-2.5 rounded-2xl bg-accent/10 border border-accent/30 max-w-sm">
          <div className="size-10 rounded-xl bg-accent text-accent-content flex items-center justify-center shrink-0 shadow-sm">
            <MapPin className="size-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold text-base-content">📍 Ready to Share Location</p>
            <p className="text-[10px] text-base-content/60">{locationData.address}</p>
          </div>
          <button
            onClick={() => setLocationData(null)}
            className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-error"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileImageRef}
        onChange={handleImageChange}
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv"
        className="hidden"
        ref={fileDocRef}
        onChange={handleDocChange}
      />

      {/* Main Input Bar */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1.5 bg-base-200/80 rounded-2xl px-3 py-1.5 border border-base-300 focus-within:border-primary transition-colors">
          {/* Emoji Toggle */}
          <button
            type="button"
            className={`btn btn-ghost btn-circle btn-xs hover:bg-base-300 ${
              showEmojiPicker ? "text-primary" : "text-base-content/50"
            }`}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            title="Add Emoji"
          >
            <Smile size={18} />
          </button>

          {/* Attachment Menu Toggle */}
          <button
            type="button"
            className={`btn btn-ghost btn-circle btn-xs hover:bg-base-300 ${
              showAttachMenu || imagePreview || fileAttachment || locationData
                ? "text-primary font-bold"
                : "text-base-content/50"
            }`}
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiPicker(false);
            }}
            title="Attach Document, Photo, or Location"
          >
            {isGettingLocation ? <Loader2 size={18} className="animate-spin text-primary" /> : <Paperclip size={18} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            className="w-full bg-transparent text-sm sm:text-base outline-none py-1 px-1 placeholder:text-base-content/40"
            placeholder={
              locationData
                ? "Add an optional note with location..."
                : fileAttachment
                ? "Add an optional caption for document..."
                : "Type a message..."
            }
            value={text}
            onChange={handleTextChange}
            onFocus={() => sendTyping()}
            onBlur={() => sendStopTyping()}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-primary btn-circle btn-sm sm:btn-md shadow-md hover:scale-105 transition-transform"
          disabled={
            (!text.trim() && !imagePreview && !fileAttachment && !locationData) || isSending
          }
        >
          <Send size={18} className={isSending ? "animate-pulse" : ""} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
