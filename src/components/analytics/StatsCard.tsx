"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
            style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
          >
            {title}
          </p>
          <p
            className="text-2xl font-bold leading-none"
            style={{ color: "var(--text-1)", fontFamily: "var(--font-brand)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className="text-[11px] mt-1.5 font-medium"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
