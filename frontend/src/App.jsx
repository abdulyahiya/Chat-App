import Navbar from "./components/Navbar";
import CallModal from "./components/CallModal";
import UpdateBanner from "./components/UpdateBanner";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useCallStore } from "./store/useCallStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { setupCallListeners } = useCallStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set up WebRTC call listeners whenever socket changes
  useEffect(() => {
    if (socket && authUser) {
      setupCallListeners(socket);
    }
  }, [socket, authUser, setupCallListeners]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div data-theme={theme} className="min-h-screen">
      <Navbar />

      {/* Global Server Update & Network Status Banner */}
      <UpdateBanner />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />} />
        <Route path="/reset-password/:token" element={!authUser ? <ResetPasswordPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* Real-Time WebRTC Call Modal */}
      {authUser && <CallModal />}

      <Toaster position="top-center" />
    </div>
  );
};
export default App;
