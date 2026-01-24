"use client";

import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

interface ProgressionBadgeProps {
  status: "improved" | "declined" | "maintained" | "no_data";
  improvement?: number;
  streak?: number;
}

export function ProgressionBadge({
  status,
  improvement = 0,
  streak,
}: ProgressionBadgeProps) {
  if (status === "no_data") {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case "improved":
        return {
          icon: TrendingUp,
          color: "text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          text: `+${Math.round(improvement)}%`,
        };
      case "declined":
        return {
          icon: TrendingDown,
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: `${Math.round(improvement)}%`,
        };
      case "maintained":
        return {
          icon: Minus,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "Maintained",
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded ${config.bg} ${config.border} border`}
      >
        <Icon className={`w-3 h-3 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
      {streak !== undefined && streak > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30">
          <Zap className="w-3 h-3 text-blue-400 fill-blue-400" />
          <span className="text-xs font-medium text-blue-400">
            {streak} streak
          </span>
        </div>
      )}
    </div>
  );
}

