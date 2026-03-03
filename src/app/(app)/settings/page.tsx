"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import {
  Check,
  User,
  Settings as SettingsIcon,
  Trophy,
  Save,
  Target,
  Shield,
  Moon,
} from "lucide-react";
import { MuscleSelector } from "@/components/onboarding/MuscleSelector";

type PrimaryGoal =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "weight_loss"
  | "general_fitness"
  | "sport_performance";
type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "bands"
  | "kettlebell"
  | "other";
type SleepQuality = "poor" | "average" | "good";
type StressLevel = "low" | "moderate" | "high";
type OccupationType = "sedentary" | "lightly_active" | "physically_demanding";

const INJURY_PRESETS = [
  "Lower Back",
  "Knee",
  "Shoulder",
  "Wrist",
  "Hip",
  "Neck",
  "Elbow",
];

export default function SettingsPage() {
  const user = useCurrentUser();
  const updateProfile = useMutation(api.users.updateUserProfile);

  const [name, setName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("lbs");
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(120);

  // New fields
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [targetMuscleGroups, setTargetMuscleGroups] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [age, setAge] = useState<string>("");
  const [bodyWeight, setBodyWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female" | "prefer_not_to_say" | null>(null);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [injuryInput, setInjuryInput] = useState("");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [stressLevel, setStressLevel] = useState<StressLevel | null>(null);
  const [occupationType, setOccupationType] = useState<OccupationType | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form when user data loads
  useEffect(() => {
    if (user && !initialized) {
      setInitialized(true);
      setName(user.name || "");
      setExperienceLevel(user.experienceLevel);
      setWeightUnit(user.preferences.weightUnit);
      setDefaultRestSeconds(user.preferences.defaultRestSeconds);
      if (user.primaryGoal) setPrimaryGoal(user.primaryGoal as PrimaryGoal);
      if (user.targetMuscleGroups) setTargetMuscleGroups(user.targetMuscleGroups);
      if (user.availableEquipment) setEquipment(user.availableEquipment as Equipment[]);
      if (user.age) setAge(String(user.age));
      if (user.bodyWeight) setBodyWeight(String(user.bodyWeight));
      if (user.height) setHeight(String(user.height));
      if (user.gender) setGender(user.gender as "male" | "female" | "prefer_not_to_say");
      if (user.injuries) setInjuries(user.injuries);
      if (user.sleepQuality) setSleepQuality(user.sleepQuality as SleepQuality);
      if (user.stressLevel) setStressLevel(user.stressLevel as StressLevel);
      if (user.occupationType) setOccupationType(user.occupationType as OccupationType);
    }
  }, [user, initialized]);

  const toggleEquipment = (item: Equipment) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const toggleInjuryPreset = (injury: string) => {
    setInjuries((prev) =>
      prev.includes(injury) ? prev.filter((i) => i !== injury) : [...prev, injury]
    );
  };

  const addCustomInjury = () => {
    const val = injuryInput.trim();
    if (val && !injuries.includes(val)) {
      setInjuries((prev) => [...prev, val]);
      setInjuryInput("");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        userId: user._id,
        name: name || undefined,
        experienceLevel,
        preferences: {
          weightUnit,
          defaultRestSeconds,
          darkMode: true,
        },
        primaryGoal: primaryGoal ?? undefined,
        targetMuscleGroups: targetMuscleGroups.length > 0 ? targetMuscleGroups : undefined,
        availableEquipment: equipment.length > 0 ? equipment : undefined,
        age: age ? parseInt(age, 10) : undefined,
        bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
        height: height ? parseFloat(height) : undefined,
        gender: gender ?? undefined,
        injuries: injuries.length > 0 ? injuries : undefined,
        sleepQuality: sleepQuality ?? undefined,
        stressLevel: stressLevel ?? undefined,
        occupationType: occupationType ?? undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              <div className="h-40 bg-zinc-800 rounded"></div>
              <div className="h-40 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-400">Please log in to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  const SaveButton = ({ className }: { className?: string }) => (
    <button
      onClick={handleSave}
      disabled={isSaving || saveSuccess}
      className={`px-6 py-3 font-medium flex items-center justify-center gap-2 transition-all athletic-body uppercase text-sm ${
        saveSuccess
          ? "bg-lime-400 text-black"
          : isSaving
          ? "bg-zinc-700 text-zinc-400"
          : "bg-lime-400 text-black hover:bg-lime-300"
      } ${className ?? ""}`}
    >
      {saveSuccess ? (
        <>
          <Check className="w-4 h-4" />
          Saved!
        </>
      ) : isSaving ? (
        "Saving..."
      ) : (
        <>
          <Save className="w-4 h-4" />
          Save Changes
        </>
      )}
    </button>
  );

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="athletic-title text-4xl text-white tracking-wide">SETTINGS</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your profile and preferences</p>
        </div>

        {/* Save Button - Top */}
        <div className="mb-6">
          <SaveButton className="w-full md:w-auto" />
        </div>

        <div className="space-y-6">
          {/* ── Profile ──────────────────────────────── */}
          <SectionCard icon={<User className="w-4 h-4 text-lime-400" />} title="Profile">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 text-zinc-500 cursor-not-allowed"
                />
                <p className="text-xs text-zinc-600 mt-1">Managed by WorkOS — cannot be changed here</p>
              </div>
            </div>
          </SectionCard>

          {/* ── Training Profile ─────────────────────── */}
          <SectionCard icon={<Trophy className="w-4 h-4 text-lime-400" />} title="Training Profile">
            <div className="space-y-5">
              {/* Experience level */}
              <div>
                <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-3">
                  Experience Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: "beginner" as const, label: "Beginner", desc: "< 1 year" },
                    { value: "intermediate" as const, label: "Intermediate", desc: "1-3 years" },
                    { value: "advanced" as const, label: "Advanced", desc: "3+ years" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setExperienceLevel(level.value)}
                      className={`p-4 border-2 transition-all text-left ${
                        experienceLevel === level.value
                          ? "border-lime-400 bg-lime-400/10"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-bold text-white athletic-body text-sm uppercase tracking-wider">
                        {level.label}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Goal */}
              <div>
                <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-3">
                  Primary Goal
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: "strength" as PrimaryGoal, label: "Strength" },
                    { value: "hypertrophy" as PrimaryGoal, label: "Hypertrophy" },
                    { value: "endurance" as PrimaryGoal, label: "Endurance" },
                    { value: "weight_loss" as PrimaryGoal, label: "Weight Loss" },
                    { value: "general_fitness" as PrimaryGoal, label: "General Fitness" },
                    { value: "sport_performance" as PrimaryGoal, label: "Sport Performance" },
                  ].map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setPrimaryGoal(g.value)}
                      className={`py-3 px-4 border-2 text-sm transition-all athletic-body text-center ${
                        primaryGoal === g.value
                          ? "border-lime-400 bg-lime-400/10 text-white"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Equipment ────────────────────────────── */}
          <SectionCard icon={<Target className="w-4 h-4 text-lime-400" />} title="Available Equipment">
            <p className="text-xs text-zinc-500 mb-3">AI will only prescribe exercises you can do.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(
                [
                  { value: "barbell", label: "Barbell" },
                  { value: "dumbbell", label: "Dumbbell" },
                  { value: "machine", label: "Machine" },
                  { value: "cable", label: "Cable" },
                  { value: "bodyweight", label: "Bodyweight" },
                  { value: "bands", label: "Resistance Bands" },
                  { value: "kettlebell", label: "Kettlebell" },
                  { value: "other", label: "Other" },
                ] as { value: Equipment; label: string }[]
              ).map((o) => (
                <button
                  key={o.value}
                  onClick={() => toggleEquipment(o.value)}
                  className={`py-3 px-3 border-2 text-xs transition-all athletic-body text-center ${
                    equipment.includes(o.value)
                      ? "border-lime-400 bg-lime-400/10 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* ── Target Muscles ───────────────────────── */}
          <SectionCard icon={<Target className="w-4 h-4 text-lime-400" />} title="Target Muscle Groups">
            <p className="text-xs text-zinc-500 mb-4">AI will prioritize these muscles in program design.</p>
            <MuscleSelector selected={targetMuscleGroups} onChange={setTargetMuscleGroups} />
          </SectionCard>

          {/* ── Physical Profile ─────────────────────── */}
          <SectionCard icon={<User className="w-4 h-4 text-lime-400" />} title="Physical Profile">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-3">
                  Gender
                </label>
                <p className="text-[10px] text-zinc-600 -mt-2 mb-2">
                  Used for accurate BMR &amp; nutrition calculations
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "male" as const, label: "Male" },
                    { value: "female" as const, label: "Female" },
                    { value: "prefer_not_to_say" as const, label: "Prefer not to say" },
                  ]).map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setGender(o.value)}
                      className={`py-3 px-3 border-2 text-xs transition-all athletic-body text-center ${
                        gender === o.value
                          ? "border-lime-400 bg-lime-400/10 text-white"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-2">
                    Body Weight
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="400"
                    value={bodyWeight}
                    onChange={(e) => setBodyWeight(e.target.value)}
                    placeholder="lbs / kg"
                    className="w-full bg-zinc-950 border border-zinc-700 px-3 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Injuries ─────────────────────────────── */}
          <SectionCard icon={<Shield className="w-4 h-4 text-lime-400" />} title="Injuries & Limitations">
            <p className="text-xs text-zinc-500 mb-3">AI will avoid exercises that aggravate these areas.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {INJURY_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggleInjuryPreset(p)}
                  className={`px-3 py-1 text-xs border transition-all athletic-body ${
                    injuries.includes(p)
                      ? "border-red-400 bg-red-400/10 text-red-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={injuryInput}
                onChange={(e) => setInjuryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomInjury()}
                placeholder="Add custom limitation..."
                className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400 text-xs"
              />
              <button
                onClick={addCustomInjury}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
              >
                Add
              </button>
            </div>
            {injuries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {injuries.map((i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-1 bg-red-400/10 text-red-400 text-xs border border-red-400/30"
                  >
                    {i}
                    <button
                      onClick={() => setInjuries((prev) => prev.filter((x) => x !== i))}
                      className="ml-1 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Lifestyle ────────────────────────────── */}
          <SectionCard icon={<Moon className="w-4 h-4 text-lime-400" />} title="Lifestyle">
            <p className="text-xs text-zinc-500 mb-4">Helps the AI calibrate recovery volume.</p>
            <div className="space-y-4">
              <PillRow
                label="Sleep quality"
                options={[
                  { value: "poor", label: "Poor" },
                  { value: "average", label: "Average" },
                  { value: "good", label: "Good" },
                ]}
                selected={sleepQuality}
                onChange={(v) => setSleepQuality(v as SleepQuality)}
              />
              <PillRow
                label="Stress level"
                options={[
                  { value: "low", label: "Low" },
                  { value: "moderate", label: "Moderate" },
                  { value: "high", label: "High" },
                ]}
                selected={stressLevel}
                onChange={(v) => setStressLevel(v as StressLevel)}
              />
              <PillRow
                label="Occupation"
                options={[
                  { value: "sedentary", label: "Sedentary" },
                  { value: "lightly_active", label: "Active job" },
                  { value: "physically_demanding", label: "Physical labor" },
                ]}
                selected={occupationType}
                onChange={(v) => setOccupationType(v as OccupationType)}
              />
            </div>
          </SectionCard>

          {/* ── Preferences ──────────────────────────── */}
          <SectionCard icon={<SettingsIcon className="w-4 h-4 text-lime-400" />} title="Preferences">
            <div className="space-y-6">
              <div>
                <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-3">
                  Weight Unit
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "lbs" as const, label: "Pounds (lbs)" },
                    { value: "kg" as const, label: "Kilograms (kg)" },
                  ].map((unit) => (
                    <button
                      key={unit.value}
                      onClick={() => setWeightUnit(unit.value)}
                      className={`p-4 border-2 transition-all ${
                        weightUnit === unit.value
                          ? "border-lime-400 bg-lime-400/10 text-white"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 athletic-body uppercase tracking-wider mb-3">
                  Default Rest Time
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[60, 90, 120, 180].map((seconds) => (
                    <button
                      key={seconds}
                      onClick={() => setDefaultRestSeconds(seconds)}
                      className={`p-4 border-2 transition-all ${
                        defaultRestSeconds === seconds
                          ? "border-lime-400 bg-lime-400/10 text-white"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-bold">
                        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">{seconds}s</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Account ──────────────────────────────── */}
          <SectionCard icon={<User className="w-4 h-4 text-zinc-500" />} title="Account Information">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Member Since</span>
                <span className="text-white">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Last Updated</span>
                <span className="text-white">
                  {user.updatedAt > 0
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not yet updated"}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Save Button - Bottom */}
        <div className="mt-6">
          <SaveButton className="w-full" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-5">
        {icon}
        <h2 className="athletic-title text-xl text-white tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PillRow({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-zinc-500 athletic-body uppercase tracking-wider">
        {label}
      </span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 py-2 text-xs font-medium border-2 transition-all athletic-body ${
              selected === o.value
                ? "border-lime-400 bg-lime-400/10 text-lime-400"
                : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
