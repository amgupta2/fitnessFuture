"use client";

import { Battery, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface RecoveryWidgetProps {
  score: number;
  status: "excellent" | "good" | "moderate" | "poor" | "critical";
  fatigueLevel: "low" | "moderate" | "high" | "critical";
  recommendations: string[];
  metrics: {
    currentVolume: number;
    previousVolume: number;
    volumeChange: number;
    currentWorkouts: number;
    daysSinceLastWorkout: number;
    prsThisWeek: number;
  };
}

export function RecoveryWidget({
  score,
  status,
  fatigueLevel,
  recommendations,
  metrics,
}: RecoveryWidgetProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "excellent":
        return {
          color: "text-green-400",
          bg: "bg-green-500/20",
          border: "border-green-500",
          icon: CheckCircle,
        };
      case "good":
        return {
          color: "text-blue-400",
          bg: "bg-blue-500/20",
          border: "border-blue-500",
          icon: Battery,
        };
      case "moderate":
        return {
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
          border: "border-yellow-500",
          icon: AlertTriangle,
        };
      case "poor":
        return {
          color: "text-orange-400",
          bg: "bg-orange-500/20",
          border: "border-orange-500",
          icon: AlertTriangle,
        };
      case "critical":
        return {
          color: "text-red-400",
          bg: "bg-red-500/20",
          border: "border-red-500",
          icon: XCircle,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Battery className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-semibold">Recovery Status</h2>
      </div>

      {/* Score Display */}
      <div className={`rounded-lg border-2 ${config.border} ${config.bg} p-6 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-6 h-6 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color} uppercase`}>
              {status}
            </span>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${config.color}`}>{score}</div>
            <div className="text-xs text-gray-400">Readiness Score</div>
          </div>
        </div>
        
        {/* Score Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mt-4">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              score >= 85
                ? "bg-green-500"
                : score >= 70
                ? "bg-blue-500"
                : score >= 50
                ? "bg-yellow-500"
                : score >= 30
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Fatigue Level */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Fatigue Level</div>
        <div className="flex gap-2">
          {["low", "moderate", "high", "critical"].map((level) => (
            <div
              key={level}
              className={`flex-1 h-2 rounded ${
                level === fatigueLevel
                  ? level === "low"
                    ? "bg-green-500"
                    : level === "moderate"
                    ? "bg-yellow-500"
                    : level === "high"
                    ? "bg-orange-500"
                    : "bg-red-500"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-300 mb-2">
            Recommendations
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-400 flex gap-2">
                <span className="text-blue-400">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-900 rounded p-3">
          <div className="text-gray-400 text-xs">Workouts (7d)</div>
          <div className="text-white font-semibold">{metrics.currentWorkouts}</div>
        </div>
        <div className="bg-gray-900 rounded p-3">
          <div className="text-gray-400 text-xs">Volume Change</div>
          <div className={`font-semibold ${
            metrics.volumeChange > 0 ? "text-orange-400" : "text-green-400"
          }`}>
            {metrics.volumeChange > 0 ? "+" : ""}{metrics.volumeChange}%
          </div>
        </div>
        <div className="bg-gray-900 rounded p-3">
          <div className="text-gray-400 text-xs">Days Since Last</div>
          <div className="text-white font-semibold">
            {metrics.daysSinceLastWorkout}
          </div>
        </div>
        <div className="bg-gray-900 rounded p-3">
          <div className="text-gray-400 text-xs">PRs This Week</div>
          <div className="text-white font-semibold">{metrics.prsThisWeek}</div>
        </div>
      </div>
    </div>
  );
}

