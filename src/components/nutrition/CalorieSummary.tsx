"use client";

interface CalorieSummaryProps {
  consumed: number;
  target: number;
}

export function CalorieSummary({ consumed, target }: CalorieSummaryProps) {
  const remaining = Math.max(target - consumed, 0);
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  const overBudget = consumed > target;

  return (
    <div className="flex items-center gap-6">
      {/* Ring */}
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-zinc-800"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={overBudget ? "text-red-400" : "text-lime-400"}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums">{consumed}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">kcal</span>
        </div>
      </div>

      {/* Numbers */}
      <div className="space-y-1.5">
        <div>
          <p className="text-xs text-zinc-500">Target</p>
          <p className="text-lg font-semibold tabular-nums">{target.toLocaleString()} kcal</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{overBudget ? "Over by" : "Remaining"}</p>
          <p className={`text-lg font-semibold tabular-nums ${overBudget ? "text-red-400" : "text-lime-400"}`}>
            {overBudget ? `+${(consumed - target).toLocaleString()}` : remaining.toLocaleString()} kcal
          </p>
        </div>
      </div>
    </div>
  );
}
