import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, updatePassword, isUpdatingPassword } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  // Password Change State
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

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
    <div className="min-h-screen pt-20 pb-16 bg-base-200/50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Main Profile Card */}
        <div className="bg-base-100 rounded-3xl shadow-xl border border-base-300/80 overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-primary via-secondary to-accent relative flex items-end justify-between p-6">
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 shadow-md">
              <ShieldCheck className="size-4" />
              Verified Account
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8 -mt-16 sm:-mt-20">
            {/* Avatar upload section */}
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-8">
              <div className="relative group">
                <div className="size-28 sm:size-36 rounded-3xl overflow-hidden border-4 border-base-100 shadow-2xl ring-2 ring-primary/20 bg-base-200">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute -bottom-2 -right-2 
                    btn btn-primary btn-circle btn-sm shadow-xl
                    hover:scale-110 active:scale-95 transition-all
                    ${isUpdatingProfile ? "animate-spin pointer-events-none" : ""}
                  `}
                  title="Change profile photo"
                >
                  <Camera className="size-4" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>

              <div className="text-center sm:text-left mt-2 sm:mt-16 flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold">{authUser?.fullName}</h1>
                <p className="text-sm text-base-content/60 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="size-4 text-primary" />
                  {authUser?.email}
                </p>
                <p className="text-xs text-primary font-medium mt-1.5">
                  {isUpdatingProfile ? "Uploading new avatar..." : "Click the camera button to change avatar"}
                </p>
              </div>
            </div>

            {/* Profile Info Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/80 space-y-1">
                <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" />
                  Full Name
                </div>
                <p className="font-semibold text-sm text-base-content">{authUser?.fullName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/80 space-y-1">
                <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" />
                  Email Address
                </div>
                <p className="font-semibold text-sm text-base-content truncate">{authUser?.email}</p>
              </div>
            </div>

            {/* Account Information Card */}
            <div className="mt-6 p-5 rounded-2xl bg-base-200/40 border border-base-300/80 space-y-3">
              <h2 className="text-xs font-bold tracking-wider uppercase text-base-content/70">Account Summary</h2>
              <div className="divide-y divide-base-300/60 text-sm">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-base-content/60">Member Since</span>
                  <span className="font-medium">{authUser?.createdAt?.split("T")[0] || "Active"}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-base-content/60">Account Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-xs bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="size-3.5" />
                    Active & Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card directly in Profile */}
        <div className="bg-base-100 rounded-3xl shadow-xl border border-base-300/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Update Password</h2>
              <p className="text-xs text-base-content/60">
                Change your account password to keep your profile secure
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                  placeholder="Enter your current password"
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

            {/* New Password & Confirm Password Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
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
                    placeholder="Min 6 characters"
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
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary rounded-xl px-6 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
