import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquareCode, Palette, Sparkles, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-base-100/75 backdrop-blur-xl border-b border-base-300/60 shadow-sm transition-all duration-200">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform active:scale-95"
          >
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <div className="w-full h-full bg-base-100 rounded-[14px] flex items-center justify-center">
                <MessageSquareCode className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-base-content to-base-content/80 bg-clip-text">
                  Chit-Chat
                </span>
                <span className="badge badge-primary badge-xs font-semibold py-1">PRO</span>
              </div>
              <span className="text-[10px] text-base-content/50 font-medium -mt-1 hidden sm:block">
                Real-time messaging
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/settings"
              className={`btn btn-sm rounded-xl gap-2 font-medium transition-all ${
                location.pathname === "/settings"
                  ? "btn-primary shadow-sm shadow-primary/20"
                  : "btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-200"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Theme</span>
            </Link>

            {authUser ? (
              <>
                <Link
                  to="/profile"
                  className={`btn btn-sm rounded-xl gap-2 font-medium transition-all ${
                    location.pathname === "/profile"
                      ? "btn-primary shadow-sm shadow-primary/20"
                      : "btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  <div className="size-5 rounded-full overflow-hidden border border-base-content/20">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden sm:inline truncate max-w-[100px]">
                    {authUser.fullName?.split(" ")[0]}
                  </span>
                </Link>

                <button
                  className="btn btn-sm btn-ghost hover:btn-error/10 hover:text-error rounded-xl gap-1.5 text-base-content/70 transition-colors"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-sm btn-primary rounded-xl font-medium shadow-sm shadow-primary/25"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
