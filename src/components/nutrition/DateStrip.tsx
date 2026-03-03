"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateStripProps {
  selectedDate: string; // "YYYY-MM-DD"
  onDateChange: (date: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DateStrip({ selectedDate, onDateChange }: DateStripProps) {
  const isToday = selectedDate === getToday();

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onDateChange(shiftDate(selectedDate, -1))}
        className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => onDateChange(getToday())}
        className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
      >
        {formatDate(selectedDate)}
      </button>

      <button
        onClick={() => onDateChange(shiftDate(selectedDate, 1))}
        disabled={isToday}
        className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
