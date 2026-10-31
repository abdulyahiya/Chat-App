import { useChatStore } from "../store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen bg-base-200/60 relative overflow-hidden flex flex-col justify-center">
      {/* Animated Ambient Glow Spheres in background */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:2s]" />

      <div className="container mx-auto px-2 sm:px-4 pt-16 sm:pt-20 pb-4 h-screen max-h-[1000px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bg-base-100/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-base-300/70 w-full max-w-6xl h-[calc(100vh-5.5rem)] sm:h-[calc(100vh-7rem)] overflow-hidden flex flex-col"
        >
          <div className="flex h-full rounded-3xl overflow-hidden relative">
            {/* Sidebar Column */}
            <div className={`h-full ${selectedUser ? "hidden md:flex" : "flex w-full md:w-auto"}`}>
              <Sidebar />
            </div>

            {/* Chat Area Column */}
            <div className={`h-full flex-1 ${!selectedUser ? "hidden md:flex" : "flex"} relative`}>
              <AnimatePresence mode="wait">
                {!selectedUser ? (
                  <motion.div
                    key="no-chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex"
                  >
                    <NoChatSelected />
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedUser._id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex flex-col flex-1"
                  >
                    <ChatContainer />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default HomePage;
