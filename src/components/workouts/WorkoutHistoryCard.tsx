"use client";

import { Dumbbell } from "lucide-react";
import { Doc } from "convex/_generated/dataModel";

interface WorkoutHistoryCardProps {
  session: Doc<"workoutSessions">;
  onClick: () => void;
}

export function WorkoutHistoryCard({ session, onClick }: WorkoutHistoryCardProps) {
  const date = new Date(session.completedAt!);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border p-4 transition-all duration-200 cursor-pointer group"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--accent)";
        el.style.transform = "translateY(-1px)";
        el.style.boxShadow = "0 8px 24px rgba(245,166,35,0.1)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3
            className="text-[17px] font-bold uppercase mb-1 leading-tight"
            style={{ fontFamily: "var(--font-brand)", letterSpacing: "0.04em", color: "var(--text-1)" }}
          >
            {session.templateName}
          </h3>
          <div
            className="text-[12px] font-medium"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
          >
            {formattedDate} · {formattedTime}
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-200"
          style={{
            background: "var(--accent-muted)",
            borderColor: "rgba(245,166,35,0.15)",
          }}
        >
          <Dumbbell className="w-5 h-5" style={{ color: "var(--accent)" }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Volume", value: `${session.totalVolume?.toLocaleString()} lbs`, accent: true },
          { label: "Sets",   value: String(session.totalSets), accent: false },
          { label: "Time",   value: `${session.durationMinutes}m`, accent: false },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="p-2.5 rounded-xl border"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.12em] mb-1"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              {label}
            </div>
            <div
              className="text-[13px] font-bold"
              style={{
                color: accent ? "var(--accent)" : "var(--text-1)",
                fontFamily: "var(--font-brand)",
                letterSpacing: "0.02em",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </button>
  );
}
