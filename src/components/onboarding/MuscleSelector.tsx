"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { IExerciseData, IMuscleStats } from "react-body-highlighter";

// Dynamic import to avoid SSR issues
const Model = dynamic(() => import("react-body-highlighter"), { ssr: false });

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Chest",
  biceps: "Biceps",
  triceps: "Triceps",
  "front-deltoids": "Front Delts",
  "back-deltoids": "Rear Delts",
  abs: "Abs",
  obliques: "Obliques",
  quadriceps: "Quads",
  hamstring: "Hamstrings",
  calves: "Calves",
  trapezius: "Traps",
  "upper-back": "Upper Back",
  "lower-back": "Lower Back",
  gluteal: "Glutes",
  adductor: "Adductors",
  abductors: "Abductors",
  forearm: "Forearms",
};

interface MuscleSelectorProps {
  selected: string[];
  onChange: (muscles: string[]) => void;
}

export function MuscleSelector({ selected, onChange }: MuscleSelectorProps) {
  const [view, setView] = useState<"anterior" | "posterior">("anterior");

  // Build data array: each selected muscle gets highlighted
  const exerciseData: IExerciseData[] = selected.map((muscle) => ({
    name: muscle,
    muscles: [muscle as any],
    frequency: 2,
  }));

  const handleClick = ({ muscle }: IMuscleStats) => {
    const slug = muscle as string;
    onChange(
      selected.includes(slug)
        ? selected.filter((m) => m !== slug)
        : [...selected, slug]
    );
  };

  return (
    <div>
      {/* Front/Back toggle */}
      <div className="flex gap-2 justify-center mb-4">
        <button
          type="button"
          onClick={() => setView("anterior")}
          className={`px-6 py-2 athletic-body uppercase text-sm font-medium transition-colors ${
            view === "anterior"
              ? "bg-lime-400 text-black"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-300"
          }`}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => setView("posterior")}
          className={`px-6 py-2 athletic-body uppercase text-sm font-medium transition-colors ${
            view === "posterior"
              ? "bg-lime-400 text-black"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-300"
          }`}
        >
          Back
        </button>
      </div>

      {/* Body diagram */}
      <div className="flex justify-center">
        <Model
          data={exerciseData}
          type={view}
          onClick={handleClick}
          style={{ width: "16rem", maxWidth: "100%" }}
          svgStyle={{ fill: "#27272a", stroke: "#52525b" }}
          highlightedColors={["#a3e635", "#84cc16"]}
        />
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {selected.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange(selected.filter((s) => s !== m))}
              className="px-3 py-1 bg-lime-400/20 text-lime-400 text-sm athletic-body border border-lime-400/50 hover:bg-lime-400/30 transition-colors"
            >
              {MUSCLE_LABELS[m] ?? m} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
