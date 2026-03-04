"use client";

import { Trophy } from "lucide-react";

interface PersonalRecord {
  _id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  achievedAt: number;
  recordType: string;
}

interface PRListProps {
  records: PersonalRecord[];
}

export function PRList({ records }: PRListProps) {
  if (records.length === 0) {
    return (
      <div
        className="text-center py-8"
        style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
      >
        No personal records yet — keep pushing!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record._id}
          className="rounded-xl p-4 border transition-colors duration-200"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
        >
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h4
                className="font-bold text-[14px] truncate"
                style={{ color: "var(--text-1)", fontFamily: "var(--font-brand)", letterSpacing: "0.03em" }}
              >
                {record.exerciseName}
              </h4>
              <p
                className="text-[12px] mt-0.5 font-medium"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                {record.weight} lbs × {record.reps} reps
              </p>
            </div>
            <div className="text-right shrink-0">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider"
                style={{
                  background: "var(--accent-muted)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Trophy className="w-3 h-3" />
                {record.recordType === "max_weight" ? "Max Weight" : "Volume PR"}
              </span>
              <p
                className="text-[10px] mt-1.5 font-medium"
                style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
              >
                {new Date(record.achievedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
