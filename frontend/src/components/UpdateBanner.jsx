import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { AlertTriangle, CheckCircle2, RefreshCw, WifiOff, Zap } from "lucide-react";

const UpdateBanner = () => {
  const { serverStatus, reconnectAttempts, manualReconnect } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isManuallyReconnecting, setIsManuallyReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsManuallyReconnecting(true);
    manualReconnect();
    setTimeout(() => {
      setIsManuallyReconnecting(false);
    }, 1200);
  };

  // Determine what to display
  const showUpdating = serverStatus === "updating" || !isOnline;
  const showReconnected = serverStatus === "reconnected" && isOnline;

  return (
    <div className="fixed top-16 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        {/* 1. Server Update / Reconnecting Banner */}
        {showUpdating && (
          <motion.div
            key="updating-banner"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto max-w-xl w-full shadow-2xl rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 backdrop-blur-xl border border-amber-500/40 p-3.5 sm:p-4 text-amber-950 dark:text-amber-100 flex items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="relative shrink-0 mt-0.5 sm:mt-0">
                <div className="size-9 sm:size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  {!isOnline ? (
                    <WifiOff className="size-5" />
                  ) : (
                    <RefreshCw className="size-5 animate-spin" />
                  )}
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
                    {!isOnline ? "⚠️ You are offline" : "⚡ System Update in Progress"}
                  </span>
                  <span className="badge badge-warning badge-xs sm:badge-sm font-semibold text-[10px]">
                    Auto-reconnecting...
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-900/80 dark:text-amber-200/80 mt-0.5 leading-snug">
                  {!isOnline
                    ? "Please check your internet connection. Reconnecting automatically when online."
                    : "The server is receiving an update or restarting. Messages & calls will resume automatically in a few seconds."}
                </p>
              </div>
            </div>

            <button
              onClick={handleRetry}
              disabled={isManuallyReconnecting}
              className="shrink-0 btn btn-xs sm:btn-sm btn-warning text-black font-bold shadow-sm hover:scale-105 active:scale-95 transition-transform"
            >
              <RefreshCw
                className={`size-3.5 ${isManuallyReconnecting ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isManuallyReconnecting ? "Reconnecting..." : "Retry Now"}
              </span>
            </button>
          </motion.div>
        )}

        {/* 2. Reconnected Success Toast */}
        {showReconnected && (
          <motion.div
            key="reconnected-banner"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto max-w-md w-full shadow-2xl rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/40 p-3 sm:p-3.5 text-emerald-950 dark:text-emerald-100 flex items-center gap-3"
          >
            <div className="size-8 sm:size-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-300 flex items-center gap-1.5">
                <span>✨ Connected & Up-to-Date!</span>
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-tight">
                Live sync and all services are active.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateBanner;
