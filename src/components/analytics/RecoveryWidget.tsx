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

const statusConfig = {
  excellent: { color: "#10B981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", icon: CheckCircle },
  good:      { color: "var(--accent-2)", bg: "var(--accent-2-muted)", border: "rgba(107,142,232,0.3)", icon: Battery },
  moderate:  { color: "#FBBF24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", icon: AlertTriangle },
  poor:      { color: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)", icon: AlertTriangle },
  critical:  { color: "var(--danger)", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.3)", icon: XCircle },
};

const fatigueColors = {
  low:      "#10B981",
  moderate: "#FBBF24",
  high:     "#F97316",
  critical: "#F43F5E",
};

export function RecoveryWidget({ score, status, fatigueLevel, recommendations, metrics }: RecoveryWidgetProps) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <Battery className="w-5 h-5" style={{ color: "var(--accent-2)" }} />
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-brand)", letterSpacing: "0.04em" }}
        >
          Recovery Status
        </h2>
      </div>

      {/* Score Display */}
      <div
        className="rounded-xl border p-5 mb-4"
        style={{ background: cfg.bg, borderColor: cfg.border }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: cfg.color, fontFamily: "var(--font-body)" }}
            >
              {status}
            </span>
          </div>
          <div className="text-right">
            <div
              className="text-4xl font-bold leading-none"
              style={{ color: cfg.color, fontFamily: "var(--font-brand)" }}
            >
              {score}
            </div>
            <div
              className="text-[10px] font-medium mt-0.5"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              Readiness
            </div>
          </div>
        </div>
        <div
          className="w-full rounded-full h-2.5"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: cfg.color }}
          />
        </div>
      </div>

      {/* Fatigue Level */}
      <div className="mb-4">
        <div
          className="text-[11px] font-bold uppercase tracking-wider mb-2"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
        >
          Fatigue Level
        </div>
        <div className="flex gap-1.5">
          {(["low", "moderate", "high", "critical"] as const).map((level) => (
            <div
              key={level}
              className="flex-1 h-2 rounded-full transition-all duration-300"
              style={{
                background: level === fatigueLevel ? fatigueColors[level] : "var(--surface-3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-4">
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-1)", fontFamily: "var(--font-body)" }}
          >
            Recommendations
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-[12px] flex gap-2 items-start leading-relaxed"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                <span style={{ color: "var(--accent-2)" }} className="shrink-0 mt-0.5">›</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Workouts (7d)", value: metrics.currentWorkouts },
          { label: "Volume Δ", value: `${metrics.volumeChange > 0 ? "+" : ""}${metrics.volumeChange}%`, accent: metrics.volumeChange > 10 },
          { label: "Days Since Last", value: metrics.daysSinceLastWorkout },
          { label: "PRs This Week", value: metrics.prsThisWeek, accent: metrics.prsThisWeek > 0 },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ background: "var(--surface-3)" }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              {label}
            </div>
            <div
              className="text-[14px] font-bold"
              style={{
                color: accent ? "var(--accent)" : "var(--text-1)",
                fontFamily: "var(--font-brand)",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
