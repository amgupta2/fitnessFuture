"use client";

interface MacroBarsProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
}

function Bar({
  label,
  consumed,
  target,
  color,
}: {
  label: string;
  consumed: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-2)]">{label}</span>
        <span className="tabular-nums text-[var(--text-1)]">
          {consumed}g <span className="text-[var(--text-3)]">/ {target}g</span>
        </span>
      </div>
      <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MacroBars({ protein, carbs, fat }: MacroBarsProps) {
  return (
    <div className="space-y-3">
      <Bar label="Protein" consumed={protein.consumed} target={protein.target} color="bg-blue-400" />
      <Bar label="Carbs" consumed={carbs.consumed} target={carbs.target} color="bg-amber-400" />
      <Bar label="Fat" consumed={fat.consumed} target={fat.target} color="bg-rose-400" />
    </div>
  );
}
