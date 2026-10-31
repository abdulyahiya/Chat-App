import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquareCode, User } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 pt-16 bg-base-100">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-7">
          {/* Logo & Headline */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2.5 group">
              <div className="size-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shadow-primary/25">
                <div className="w-full h-full bg-base-100 rounded-[14px] flex items-center justify-center">
                  <MessageSquareCode className="size-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <h1 className="text-3xl font-display font-bold tracking-tight mt-2">Create Account</h1>
              <p className="text-sm text-base-content/60">Join thousands of users communicating in real time</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                  Full Name
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-11 rounded-xl focus:border-primary transition-all text-sm"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                  Email Address
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider text-base-content/70">
                  Password
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share media instantly, and customize your experience with 30+ themes."
      />
    </div>
  );
};
export default SignUpPage;
