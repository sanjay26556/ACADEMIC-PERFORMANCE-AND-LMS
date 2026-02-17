import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: LucideIcon;
  level: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  earned?: boolean;
  progress?: number;
}

const AchievementBadge = ({
  name,
  description,
  icon: Icon,
  level,
  earned = true,
  progress,
}: AchievementBadgeProps) => {
  const levelColors = {
    bronze: "from-amber-700 to-amber-500 shadow-amber-500/30",
    silver: "from-slate-400 to-slate-300 shadow-slate-400/30",
    gold: "from-yellow-500 to-amber-400 shadow-yellow-500/30",
    platinum: "from-cyan-300 to-slate-300 shadow-cyan-300/30",
    diamond: "from-cyan-400 to-blue-400 shadow-cyan-400/30",
  };

  const bgColors = {
    bronze: "bg-level-bronze/20",
    silver: "bg-level-silver/20",
    gold: "bg-level-gold/20",
    platinum: "bg-level-platinum/20",
    diamond: "bg-level-diamond/20",
  };

  return (
    <div className={cn(
      "relative group",
      !earned && "opacity-50 grayscale"
    )}>
      <div className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center",
        earned && "animate-pulse-glow"
      )}>
        {/* Outer ring */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br p-1",
          levelColors[level]
        )}>
          <div className="w-full h-full rounded-full bg-card" />
        </div>
        
        {/* Inner circle with icon */}
        <div className={cn(
          "relative z-10 w-16 h-16 rounded-full flex items-center justify-center",
          bgColors[level]
        )}>
          <Icon className={cn(
            "h-8 w-8",
            `text-level-${level}`
          )} />
        </div>

        {/* Progress ring (for unearned badges) */}
        {!earned && progress !== undefined && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress * 2.89} 289`}
              className={`text-level-${level}`}
            />
          </svg>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-3 rounded-xl bg-popover border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
        <p className="font-semibold text-sm text-center mb-1">{name}</p>
        <p className="text-xs text-muted-foreground text-center">{description}</p>
        {!earned && progress !== undefined && (
          <p className="text-xs text-primary text-center mt-1">{progress}% complete</p>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;
