"use client";

import { TrendingUp, AlertTriangle } from "lucide-react";

interface Plateau {
  exerciseName: string;
  sessionsCount: number;
  firstDate: number;
  lastDate: number;
  first1RM: number;
  last1RM: number;
  improvement: number;
}

interface PlateauDetectorProps {
  plateaus: Plateau[];
}

export function PlateauDetector({ plateaus }: PlateauDetectorProps) {
  if (plateaus.length === 0) {
    return (
      <div className="text-center py-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <TrendingUp className="w-6 h-6" style={{ color: "var(--success)" }} />
        </div>
        <p
          className="font-bold text-[15px] mb-1"
          style={{ color: "var(--text-1)", fontFamily: "var(--font-brand)" }}
        >
          No Plateaus Detected
        </p>
        <p
          className="text-[12px]"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
        >
          You're making consistent progress across all exercises
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p
        className="text-[12px] leading-relaxed mb-4"
        style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
      >
        Exercises with less than 2.5% improvement over recent sessions may need a change in programming.
      </p>
      {plateaus.map((plateau) => (
        <div
          key={plateau.exerciseName}
          className="rounded-xl p-4 border"
          style={{
            background: "var(--surface-2)",
            borderColor: "rgba(251,191,36,0.25)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <h4
              className="font-bold text-[14px]"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-brand)", letterSpacing: "0.03em" }}
            >
              {plateau.exerciseName}
            </h4>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider"
              style={{
                background: "rgba(251,191,36,0.12)",
                color: "#FBBF24",
                fontFamily: "var(--font-body)",
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              Plateau
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Sessions", value: plateau.sessionsCount },
              { label: "Improvement", value: `${plateau.improvement}%` },
              { label: "First 1RM", value: `${plateau.first1RM} lbs` },
              { label: "Last 1RM", value: `${plateau.last1RM} lbs` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg p-2.5"
                style={{ background: "var(--surface-3)" }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
                >
                  {label}
                </p>
                <p
                  className="text-[13px] font-bold"
                  style={{ color: "var(--text-1)", fontFamily: "var(--font-brand)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div
            className="mt-3 pt-3 border-t text-[10px] font-medium"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-2)",
              fontFamily: "var(--font-body)",
            }}
          >
            {new Date(plateau.firstDate).toLocaleDateString()} — {new Date(plateau.lastDate).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
