"use client";

import { useState } from "react";
import { Loader2, Sparkles, Target, AlertCircle } from "lucide-react";

interface UserProfile {
  bodyWeight?: number;
  age?: number;
  height?: number;
  gender?: string;
  primaryGoal?: string;
  experienceLevel: string;
  trainingDaysPerWeek?: number;
  occupationType?: string;
  weightUnit?: string;
}

interface NutritionTargetsSetupProps {
  userProfile: UserProfile;
  onSave: (targets: {
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    method: "ai_suggested" | "manual";
  }) => void;
}

const GOAL_LABELS: Record<string, { label: string; desc: string; emoji: string }> = {
  strength: { label: "Strength", desc: "Moderate caloric surplus with high protein to fuel heavy compound lifts.", emoji: "⚡" },
  hypertrophy: { label: "Hypertrophy", desc: "Surplus calories with high protein and carbs to maximize muscle growth.", emoji: "💪" },
  endurance: { label: "Endurance", desc: "Maintenance calories with higher carbs for sustained energy output.", emoji: "🏃" },
  weight_loss: { label: "Weight Loss", desc: "Caloric deficit with very high protein to preserve lean muscle mass.", emoji: "🔥" },
  general_fitness: { label: "General Fitness", desc: "Balanced maintenance calories with moderate, well-rounded macros.", emoji: "🎯" },
  sport_performance: { label: "Sport Performance", desc: "Slight surplus with high protein and carbs for explosive power.", emoji: "🏆" },
};

function ProfileCompleteness({ profile }: { profile: UserProfile }) {
  const fields = [
    { key: "bodyWeight", label: "Body weight" },
    { key: "height", label: "Height" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "primaryGoal", label: "Fitness goal" },
    { key: "trainingDaysPerWeek", label: "Training frequency" },
    { key: "occupationType", label: "Activity level" },
  ];

  const missing = fields.filter((f) => {
    const val = profile[f.key as keyof UserProfile];
    return val === undefined || val === null || val === "";
  });

  if (missing.length === 0) return null;

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium mb-1">Fill in your profile for more accurate targets</p>
        <p className="text-amber-500/70">
          Missing: {missing.map((m) => m.label).join(", ")}. 
          Update in <a href="/settings" className="underline hover:text-amber-300">Settings</a>.
        </p>
      </div>
    </div>
  );
}

export function NutritionTargetsSetup({ userProfile, onSave }: NutritionTargetsSetupProps) {
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState(false);

  const goal = GOAL_LABELS[userProfile.primaryGoal ?? ""] ?? GOAL_LABELS.general_fitness;

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
          Daily calorie and macro goals personalized to your training. Adjust anytime.
        </p>
      </div>

      {/* Goal context card */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Target className="w-4 h-4 text-lime-400" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Your Goal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{goal.emoji}</span>
          <span className="font-semibold text-white">{goal.label}</span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">{goal.desc}</p>
        {!userProfile.primaryGoal && (
          <p className="text-[10px] text-zinc-600 mt-2">
            No goal set — <a href="/settings" className="underline hover:text-zinc-400">update in Settings</a> for better recommendations.
          </p>
        )}
      </div>

      <ProfileCompleteness profile={userProfile} />

      <button
        onClick={handleAISuggest}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Calculating targets for {goal.label.toLowerCase()}...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-lime-400" />
            AI-Suggested Targets
          </>
        )}
      </button>

      {suggested && (
        <p className="text-xs text-lime-400/70 text-center -mt-2">
          Tailored for your {goal.label.toLowerCase()} goal
          {userProfile.bodyWeight ? ` at ${userProfile.bodyWeight} ${userProfile.weightUnit ?? "lbs"}` : ""}
          {userProfile.height ? `, ${userProfile.height} cm` : ""}
        </p>
      )}

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
