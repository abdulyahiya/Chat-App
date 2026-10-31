import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, isResettingPassword } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-error", "bg-warning", "bg-info", "bg-success"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const success = await resetPassword(token, password);
    if (success) {
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 pt-16 bg-base-100">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-7">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2.5 group">
              <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shadow-primary/25">
                <div className="w-full h-full bg-base-100 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="size-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight mt-2">Create New Password</h1>
              <p className="text-sm text-base-content/60">
                Choose a strong password with at least 6 characters.
              </p>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* New Password */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                  New Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-11 pr-11 rounded-xl focus:border-primary transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
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

            {/* Confirm Password */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                  Confirm New Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-11 pr-11 rounded-xl focus:border-primary transition-all text-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold mt-2"
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Resetting Password...</span>
                </div>
              ) : (
                "Update Password & Sign In"
              )}
            </button>
          </motion.form>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-sm font-semibold text-base-content/70 hover:text-primary transition-colors"
            >
              Cancel and Return to Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Pattern */}
      <AuthImagePattern
        title="Secure Credentials"
        subtitle="Keep your account safe by setting unique, high-entropy passwords."
      />
    </div>
  );
};

export default ResetPasswordPage;
