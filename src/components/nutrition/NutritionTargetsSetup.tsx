"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface NutritionTargetsSetupProps {
  userProfile: {
    bodyWeight?: number;
    age?: number;
    primaryGoal?: string;
    experienceLevel: string;
    trainingDaysPerWeek?: number;
    weightUnit?: string;
  };
  onSave: (targets: {
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    method: "ai_suggested" | "manual";
  }) => void;
}

export function NutritionTargetsSetup({ userProfile, onSave }: NutritionTargetsSetupProps) {
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState(false);

  const handleAISuggest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/nutrition-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest_targets", profile: userProfile }),
      });
      const data = await res.json();
      if (data.dailyCalories) {
        setCalories(String(data.dailyCalories));
        setProtein(String(data.proteinGrams));
        setCarbs(String(data.carbsGrams));
        setFat(String(data.fatGrams));
        setSuggested(true);
      }
    } catch (err) {
      console.error("Failed to get AI suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const c = parseInt(calories) || 0;
    const p = parseInt(protein) || 0;
    const ca = parseInt(carbs) || 0;
    const f = parseInt(fat) || 0;
    if (c <= 0) return;
    onSave({
      dailyCalories: c,
      proteinGrams: p,
      carbsGrams: ca,
      fatGrams: f,
      method: suggested ? "ai_suggested" : "manual",
    });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Set Your Nutrition Targets</h2>
        <p className="text-sm text-zinc-400">
          Daily calorie and macro goals to fuel your training. You can adjust these anytime.
        </p>
      </div>

      <button
        onClick={handleAISuggest}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-lime-400" />
            AI-Suggested Targets
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Daily Calories</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => { setCalories(e.target.value); setSuggested(false); }}
            placeholder="e.g. 2400"
            className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Protein (g)</label>
          <input
            type="number"
            value={protein}
            onChange={(e) => { setProtein(e.target.value); setSuggested(false); }}
            placeholder="160"
            className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Carbs (g)</label>
          <input
            type="number"
            value={carbs}
            onChange={(e) => { setCarbs(e.target.value); setSuggested(false); }}
            placeholder="270"
            className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Fat (g)</label>
          <input
            type="number"
            value={fat}
            onChange={(e) => { setFat(e.target.value); setSuggested(false); }}
            placeholder="75"
            className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-500/40"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!calories || parseInt(calories) <= 0}
        className="w-full py-3 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Save Targets
      </button>
    </div>
  );
}
