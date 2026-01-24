"use client";

import { ArrowUp, TrendingUp, AlertTriangle, Info } from "lucide-react";

interface ProgressionSuggestionProps {
  suggestion: {
    type: "increase_weight" | "increase_reps" | "maintain" | "deload";
    weight: number;
    reps: { min: number; max: number };
  };
  confidence: number;
  reasoning: string;
  lastSession?: {
    date: number;
    avgWeight: number;
    avgReps: number;
    avgEstimated1RM: number;
  };
}

export function ProgressionSuggestion({
  suggestion,
  confidence,
  reasoning,
  lastSession,
}: ProgressionSuggestionProps) {
  const getTypeConfig = () => {
    switch (suggestion.type) {
      case "increase_weight":
        return {
          icon: ArrowUp,
          color: "text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500",
          title: "Ready to Progress!",
        };
      case "increase_reps":
        return {
          icon: TrendingUp,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500",
          title: "Build Volume",
        };
      case "deload":
        return {
          icon: AlertTriangle,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500",
          title: "Deload Recommended",
        };
      case "maintain":
      default:
        return {
          icon: Info,
          color: "text-gray-400",
          bg: "bg-gray-500/10",
          border: "border-gray-500",
          title: "Maintain Current Load",
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${config.border} ${config.bg} mb-4`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.color} mb-1`}>
            {config.title}
          </h3>
          <p className="text-sm text-white mb-3">{reasoning}</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {suggestion.type === "increase_weight" ||
            suggestion.type === "deload" ? (
              <div className="bg-black/30 rounded p-2">
                <div className="text-xs text-gray-400">Suggested Weight</div>
                <div className="text-lg font-bold text-white">
                  {suggestion.weight} lbs
                </div>
              </div>
            ) : null}
            <div className="bg-black/30 rounded p-2">
              <div className="text-xs text-gray-400">Target Reps</div>
              <div className="text-lg font-bold text-white">
                {suggestion.reps.min}-{suggestion.reps.max}
              </div>
            </div>
          </div>

          {lastSession && (
            <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
              Last session: {lastSession.avgWeight} lbs × {lastSession.avgReps}{" "}
              reps (Est. 1RM: {lastSession.avgEstimated1RM} lbs)
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  confidence >= 80
                    ? "bg-green-500"
                    : confidence >= 60
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {confidence}% confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

