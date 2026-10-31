import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isSendingResetLink } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    const result = await forgotPassword(email);
    if (result.success) {
      setIsSubmitted(true);
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
                  <KeyRound className="size-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight mt-2">Reset Password</h1>
              <p className="text-sm text-base-content/60">
                Enter your email address and we&apos;ll dispatch a secure recovery link.
              </p>
            </div>
          </div>

          {!isSubmitted ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                    Your Registered Email
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-11 rounded-xl focus:border-primary transition-all text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
                disabled={isSendingResetLink}
              >
                {isSendingResetLink ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 rounded-3xl bg-base-200/80 border border-base-300 space-y-5 text-center shadow-lg"
            >
              <div className="size-16 rounded-2xl bg-success/15 text-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="size-9" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display">Check Your Inbox</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">
                  We have sent a secure password reset link to:
                </p>
                <div className="p-2.5 rounded-xl bg-base-100 font-semibold text-sm border border-base-300 text-primary truncate">
                  {email}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-base-100 border border-base-300/80 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-warning">
                  <ShieldAlert className="size-4" />
                  Important Security Notes:
                </div>
                <ul className="list-disc list-inside space-y-1 text-base-content/70 text-[11px] leading-relaxed">
                  <li>The reset link inside the email is valid for <strong>15 minutes</strong>.</li>
                  <li>Click the <strong>Reset Password</strong> button in your email to choose a new password.</li>
                  <li>If you don&apos;t see the email, please check your <strong>Spam / Junk</strong> folder.</li>
                </ul>
              </div>

              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-ghost btn-sm text-xs font-semibold w-full text-base-content/60 hover:text-base-content"
              >
                Try a different email address
              </button>
            </motion.div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-base-content/70 hover:text-primary transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image Pattern */}
      <AuthImagePattern
        title="Account Recovery"
        subtitle="End-to-end encrypted password recovery with strict email verification."
      />
    </div>
  );
};

export default ForgotPasswordPage;
