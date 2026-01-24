"use client";

import { Calendar, Dumbbell, Clock, TrendingUp } from "lucide-react";
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
      className="w-full text-left clip-corner bg-zinc-900 border border-zinc-800 hover:border-lime-400 p-4 transition-all active:scale-98"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="athletic-title text-xl mb-1">{session.templateName}</h3>
          <div className="athletic-body text-sm text-zinc-500">
            {formattedDate} · {formattedTime}
          </div>
        </div>
        <div className="w-10 h-10 clip-corner bg-lime-400/10 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-lime-400" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 athletic-body text-sm">
        <div className="bg-black/50 p-2 rounded">
          <div className="text-zinc-500 text-xs mb-1">Volume</div>
          <div className="text-lime-400 font-bold">
            {session.totalVolume?.toLocaleString()} lbs
          </div>
        </div>
        <div className="bg-black/50 p-2 rounded">
          <div className="text-zinc-500 text-xs mb-1">Sets</div>
          <div className="text-white font-bold">{session.totalSets}</div>
        </div>
        <div className="bg-black/50 p-2 rounded">
          <div className="text-zinc-500 text-xs mb-1">Time</div>
          <div className="text-white font-bold">{session.durationMinutes}m</div>
        </div>
      </div>
    </button>
  );
}
