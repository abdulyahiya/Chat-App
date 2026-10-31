import { MessageSquare, Sparkles, Users, Zap, Shield, Heart } from "lucide-react";

const ICONS = [MessageSquare, Sparkles, Users, Zap, Shield, Heart, MessageSquare, Sparkles, Users];

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-base-200/80 via-base-200 to-base-300/60 p-12 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md text-center relative z-10">
        <div className="grid grid-cols-3 gap-3.5 mb-10">
          {ICONS.map((Icon, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-base-100/60 backdrop-blur-md border border-base-content/10 flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-105 ${
                i % 2 === 0 ? "animate-pulse" : "hover:border-primary/50"
              }`}
            >
              <Icon className={`size-7 ${i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-secondary" : "text-accent"}`} />
            </div>
          ))}
        </div>
        <h2 className="text-3xl font-display font-bold tracking-tight mb-3 bg-gradient-to-r from-base-content to-base-content/80 bg-clip-text">
          {title}
        </h2>
        <p className="text-sm text-base-content/60 leading-relaxed max-w-sm mx-auto">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
