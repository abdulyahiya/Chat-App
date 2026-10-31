import { MessageSquareCode, ShieldCheck, Sparkles, Zap, Image as ImageIcon } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-gradient-to-b from-base-100/50 via-base-100/30 to-base-200/40 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md text-center space-y-6 relative z-10">
        {/* Animated Brand Icon */}
        <div className="flex justify-center mb-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative size-20 rounded-3xl bg-base-100 border border-base-content/10 flex items-center justify-center shadow-xl">
              <MessageSquareCode className="size-10 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Welcome Headline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="size-3.5" />
            Ready for conversation
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
            Welcome to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Chit-Chat</span>
          </h2>
          <p className="text-sm text-base-content/65 max-w-sm mx-auto leading-relaxed">
            Select a contact from the sidebar or search for someone to start sharing instant messages and media.
          </p>
        </div>

        {/* Feature highlight badges */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 text-left">
          <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Zap className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Instant Real-Time</p>
              <p className="text-[10px] text-base-content/50 mt-0.5">WebSocket powered</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-base-200/50 border border-base-300/60 flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <ImageIcon className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Media Attachments</p>
              <p className="text-[10px] text-base-content/50 mt-0.5">Cloudinary storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
