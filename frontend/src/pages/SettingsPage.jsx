import { useState } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Check, Eye, EyeOff, KeyRound, Loader2, Lock, Palette, Send, Shield, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How does this new theme look?", isSent: false },
  { id: 2, content: "It looks super clean and modern! 🔥", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser, updatePassword, isUpdatingPassword } = useAuthStore();

  const [activeTab, setActiveTab] = useState("theme"); // 'theme' | 'security'

  // Security Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(passwordData.newPassword);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-error", "bg-warning", "bg-info", "bg-success"];

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    const success = await updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (success) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20 pb-16 max-w-5xl">
      <div className="space-y-8">
        {/* Top Header & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-base-100 border border-base-300/80 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Preferences & Security</h1>
            <p className="text-sm text-base-content/60">Manage your workspace themes, styling, and credentials</p>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-base-200/80 rounded-2xl border border-base-300">
            <button
              onClick={() => setActiveTab("theme")}
              className={`btn btn-sm rounded-xl px-4 font-semibold transition-all ${
                activeTab === "theme" ? "btn-primary shadow-md" : "btn-ghost text-base-content/70"
              }`}
            >
              <Palette className="size-4 mr-1.5" />
              Theme & Style
            </button>
            {authUser && (
              <button
                onClick={() => setActiveTab("security")}
                className={`btn btn-sm rounded-xl px-4 font-semibold transition-all ${
                  activeTab === "security" ? "btn-primary shadow-md" : "btn-ghost text-base-content/70"
                }`}
              >
                <Shield className="size-4 mr-1.5" />
                Security
              </button>
            )}
          </div>
        </div>

        {/* ================= TAB 1: THEMES ================= */}
        {activeTab === "theme" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Themes Grid */}
            <div className="p-6 rounded-3xl bg-base-100 border border-base-300/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-base-content/80 uppercase text-xs">
                    Select Color Palette
                  </h2>
                  <p className="text-xs text-base-content/50">Pick from 30+ curated modern DaisyUI color themes</p>
                </div>
                <div className="badge badge-primary badge-sm py-2 px-3 font-semibold gap-1 shadow-sm">
                  <Sparkles className="size-3" />
                  Active: {theme.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 pt-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    className={`
                      group flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all border
                      ${
                        theme === t
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md scale-105"
                          : "border-base-200 hover:border-base-300 hover:bg-base-200/50"
                      }
                    `}
                    onClick={() => setTheme(t)}
                  >
                    <div className="relative h-9 w-full rounded-xl overflow-hidden shadow-inner" data-theme={t}>
                      <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                        <div className="rounded-md bg-primary"></div>
                        <div className="rounded-md bg-secondary"></div>
                        <div className="rounded-md bg-accent"></div>
                        <div className="rounded-md bg-neutral"></div>
                      </div>
                      {theme === t && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="size-4 text-white drop-shadow" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold truncate w-full text-center mt-0.5">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Theme Preview Section */}
            <div className="space-y-3">
              <h3 className="text-base font-bold tracking-tight text-base-content/80 uppercase text-xs px-2">
                Live Theme Preview
              </h3>
              <div className="rounded-3xl border border-base-300/80 overflow-hidden bg-base-100 shadow-xl">
                <div className="p-4 sm:p-6 bg-base-200/50">
                  <div className="max-w-lg mx-auto">
                    {/* Mock Chat UI */}
                    <div className="bg-base-100 rounded-2xl shadow-md border border-base-300/80 overflow-hidden">
                      {/* Chat Header */}
                      <div className="px-4 py-3 border-b border-base-300/80 bg-base-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-content font-bold text-sm shadow-sm">
                            JD
                          </div>
                          <div>
                            <h3 className="font-bold text-sm leading-none">John Doe</h3>
                            <p className="text-[11px] text-green-500 font-medium mt-0.5">Online</p>
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="p-4 space-y-3 min-h-[160px] max-h-[160px] overflow-y-auto bg-base-100/60">
                        {PREVIEW_MESSAGES.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`
                                max-w-[80%] rounded-2xl p-3 shadow-sm text-sm
                                ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}
                              `}
                            >
                              <p className="leading-snug">{message.content}</p>
                              <p
                                className={`
                                  text-[10px] mt-1 text-right
                                  ${message.isSent ? "text-primary-content/70" : "text-base-content/50"}
                                `}
                              >
                                12:00 PM
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <div className="p-3 border-t border-base-300/80 bg-base-100">
                        <div className="flex items-center gap-2 bg-base-200 rounded-xl px-3 py-1">
                          <input
                            type="text"
                            className="bg-transparent flex-1 text-xs py-2 outline-none"
                            placeholder="Type a message..."
                            value="This is a live theme preview!"
                            readOnly
                          />
                          <button className="btn btn-primary btn-circle btn-xs shadow-sm">
                            <Send size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SECURITY & PASSWORD ================= */}
        {activeTab === "security" && authUser && (
          <div className="grid md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left Column: Tips & Info */}
            <div className="p-6 rounded-3xl bg-base-100 border border-base-300/80 shadow-sm space-y-4 md:col-span-1">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="size-6" />
              </div>
              <h2 className="text-lg font-bold">Password Security</h2>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Ensure your account is protected with a strong, unique password. We recommend combining upper and lowercase letters, numbers, and symbols.
              </p>
              <div className="p-3.5 rounded-2xl bg-base-200/60 border border-base-300 text-xs space-y-2">
                <p className="font-semibold text-base-content">Password Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-base-content/70 text-[11px]">
                  <li>Minimum 6 characters</li>
                  <li>Different from current password</li>
                  <li>Avoid common dictionary phrases</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Update Password Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-base-100 border border-base-300/80 shadow-sm md:col-span-2">
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Change Password</h3>
                  <p className="text-xs text-base-content/60">
                    Update your account credentials to keep your account safe
                  </p>
                </div>

                {/* Current Password */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                      Current Password
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="size-4 text-base-content/40" />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="input input-bordered w-full pl-10 pr-11 rounded-xl focus:border-primary transition-all text-sm"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                      New Password
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <KeyRound className="size-4 text-base-content/40" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="input input-bordered w-full pl-10 pr-11 rounded-xl focus:border-primary transition-all text-sm"
                      placeholder="Enter new password (min 6 chars)"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {passwordData.newPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 transition-all duration-300 ${
                              strength >= step ? strengthColors[strength - 1] : "opacity-0"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-base-content/60">
                        <span>Strength: {strengthLabels[strength - 1] || "Too short"}</span>
                        <span>Min 6 chars</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                      Confirm New Password
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <KeyRound className="size-4 text-base-content/40" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="input input-bordered w-full pl-10 pr-11 rounded-xl focus:border-primary transition-all text-sm"
                      placeholder="Confirm new password"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Updating Password...</span>
                      </div>
                    ) : (
                      "Save New Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SettingsPage;
