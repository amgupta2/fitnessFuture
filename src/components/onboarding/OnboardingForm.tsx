"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Target,
  Dumbbell,
  Calendar,
  Activity,
  User,
  ChevronRight,
  ChevronLeft,
  Zap,
  TrendingUp,
  Heart,
  Award,
  Globe,
  Shield,
} from "lucide-react";
import { MuscleSelector } from "./MuscleSelector";

interface OnboardingFormProps {
  workosId: string;
}

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
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

const TOTAL_STEPS = 7;

export function OnboardingForm({ workosId }: OnboardingFormProps) {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  // Navigation
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 0 — Name
  const [name, setName] = useState("");

  // Step 1 — Experience
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);

  // Step 2 — Goal
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);

  // Step 3 — Schedule
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number | null>(null);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number | null>(null);

  // Step 4 — Equipment
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  // Step 5 — Muscles
  const [targetMuscleGroups, setTargetMuscleGroups] = useState<string[]>([]);

  // Step 6 — Profile + Lifestyle
  const [age, setAge] = useState<string>("");
  const [bodyWeight, setBodyWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [gender, setGender] = useState<"male" | "female" | "prefer_not_to_say" | null>(null);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [injuryInput, setInjuryInput] = useState("");
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [stressLevel, setStressLevel] = useState<StressLevel | null>(null);
  const [occupationType, setOccupationType] = useState<OccupationType | null>(null);

  // Step 7 — Weight unit (final)
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("lbs");

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return experienceLevel !== null;
      case 2: return primaryGoal !== null;
      case 3: return trainingDaysPerWeek !== null && sessionDurationMinutes !== null;
      case 4: return equipment.length > 0;
      case 5: return true; // skippable
      case 6: return true; // skippable
      case 7: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        workosId,
        experienceLevel: experienceLevel ?? "beginner",
        weightUnit,
        name: name.trim() || undefined,
        primaryGoal: primaryGoal ?? undefined,
        targetMuscleGroups: targetMuscleGroups.length > 0 ? targetMuscleGroups : undefined,
        availableEquipment: equipment.length > 0 ? equipment : undefined,
        trainingDaysPerWeek: trainingDaysPerWeek ?? undefined,
        sessionDurationMinutes: sessionDurationMinutes ?? undefined,
        age: age ? parseInt(age, 10) : undefined,
        bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
        height: height ? parseFloat(height) : undefined,
        gender: gender ?? undefined,
        injuries: injuries.length > 0 ? injuries : undefined,
        sleepQuality: sleepQuality ?? undefined,
        stressLevel: stressLevel ?? undefined,
        occupationType: occupationType ?? undefined,
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding error:", error);
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / (TOTAL_STEPS + 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-[var(--text-2)] athletic-body uppercase">
          <span>Step {step + 1} of {TOTAL_STEPS + 1}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-[var(--surface-2)] w-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[320px]">
        {step === 0 && <StepName name={name} onChange={setName} />}
        {step === 1 && (
          <StepExperience selected={experienceLevel} onChange={setExperienceLevel} />
        )}
        {step === 2 && (
          <StepGoal selected={primaryGoal} onChange={setPrimaryGoal} />
        )}
        {step === 3 && (
          <StepSchedule
            days={trainingDaysPerWeek}
            duration={sessionDurationMinutes}
            onDaysChange={setTrainingDaysPerWeek}
            onDurationChange={setSessionDurationMinutes}
          />
        )}
        {step === 4 && (
          <StepEquipment selected={equipment} onToggle={toggleEquipment} />
        )}
        {step === 5 && (
          <StepMuscles
            selected={targetMuscleGroups}
            onChange={setTargetMuscleGroups}
          />
        )}
        {step === 6 && (
          <StepLifestyle
            age={age}
            bodyWeight={bodyWeight}
            height={height}
            gender={gender}
            injuries={injuries}
            injuryInput={injuryInput}
            sleepQuality={sleepQuality}
            stressLevel={stressLevel}
            occupationType={occupationType}
            onAge={setAge}
            onBodyWeight={setBodyWeight}
            onHeight={setHeight}
            onGender={setGender}
            onInjuryPreset={toggleInjuryPreset}
            onInjuryInput={setInjuryInput}
            onAddInjury={addCustomInjury}
            onRemoveInjury={(i) => setInjuries((prev) => prev.filter((x) => x !== i))}
            onSleep={setSleepQuality}
            onStress={setStressLevel}
            onOccupation={setOccupationType}
          />
        )}
        {step === 7 && (
          <StepWeightUnit selected={weightUnit} onChange={setWeightUnit} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--surface-2)] text-[var(--text-1)] hover:text-white hover:bg-[var(--surface-3)] transition-colors athletic-body uppercase text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--accent)] text-black font-bold athletic-body uppercase text-sm hover:bg-[var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--accent)] text-black font-bold athletic-body uppercase text-sm hover:bg-[var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Setting up..." : "Complete Setup →"}
          </button>
        )}
      </div>

      {/* Skip link for optional steps */}
      {(step === 5 || step === 6) && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full text-center text-[var(--text-2)] text-sm hover:text-[var(--text-2)] transition-colors py-1"
        >
          Skip this step
        </button>
      )}
    </div>
  );
}

// ─── Individual step components ───────────────────────────────────────────────

function StepName({
  name,
  onChange,
}: {
  name: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          LET'S BUILD YOUR PROFILE
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          Personalized programming starts here.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-[var(--text-2)] text-sm athletic-body uppercase tracking-wider">
          What should we call you?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name"
          autoFocus
          className="w-full bg-[var(--surface)] border border-[var(--border-2)] px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent)] transition-colors text-lg"
        />
      </div>
    </div>
  );
}

function StepExperience({
  selected,
  onChange,
}: {
  selected: ExperienceLevel | null;
  onChange: (v: ExperienceLevel) => void;
}) {
  const options = [
    {
      value: "beginner" as const,
      label: "Beginner",
      desc: "Less than 1 year of consistent training",
      icon: "🌱",
    },
    {
      value: "intermediate" as const,
      label: "Intermediate",
      desc: "1–3 years with structured programming",
      icon: "⚡",
    },
    {
      value: "advanced" as const,
      label: "Advanced",
      desc: "3+ years, familiar with periodization",
      icon: "🏆",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          EXPERIENCE LEVEL
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          This shapes your programming volume and intensity.
        </p>
      </div>
      <div className="space-y-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`w-full text-left p-4 border-2 transition-all ${
              selected === o.value
                ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] hover:border-[var(--border-2)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{o.icon}</span>
              <div>
                <div className="font-bold text-white athletic-body uppercase text-sm tracking-wider">
                  {o.label}
                </div>
                <div className="text-xs text-[var(--text-2)] mt-0.5">{o.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGoal({
  selected,
  onChange,
}: {
  selected: PrimaryGoal | null;
  onChange: (v: PrimaryGoal) => void;
}) {
  const options: {
    value: PrimaryGoal;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      value: "strength",
      label: "Strength",
      desc: "Maximize 1RM on compound lifts",
      icon: <Zap className="w-5 h-5" />,
    },
    {
      value: "hypertrophy",
      label: "Hypertrophy",
      desc: "Build muscle size and definition",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      value: "endurance",
      label: "Endurance",
      desc: "Improve stamina and work capacity",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      value: "weight_loss",
      label: "Weight Loss",
      desc: "Burn fat while preserving muscle",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      value: "general_fitness",
      label: "General Fitness",
      desc: "Balanced health and wellness",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      value: "sport_performance",
      label: "Sport Performance",
      desc: "Athletic power and conditioning",
      icon: <Award className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          PRIMARY GOAL
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          Your AI coach will tailor programs to this objective.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`text-left p-4 border-2 transition-all ${
              selected === o.value
                ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] hover:border-[var(--border-2)]"
            }`}
          >
            <div
              className={`mb-2 ${selected === o.value ? "text-[var(--accent)]" : "text-[var(--text-2)]"}`}
            >
              {o.icon}
            </div>
            <div className="font-bold text-white text-sm athletic-body uppercase tracking-wide">
              {o.label}
            </div>
            <div className="text-xs text-[var(--text-2)] mt-0.5">{o.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepSchedule({
  days,
  duration,
  onDaysChange,
  onDurationChange,
}: {
  days: number | null;
  duration: number | null;
  onDaysChange: (v: number) => void;
  onDurationChange: (v: number) => void;
}) {
  const dayOptions = [2, 3, 4, 5, 6];
  const durationOptions = [
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "60 min" },
    { value: 75, label: "75 min" },
    { value: 90, label: "90 min+" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          TRAINING SCHEDULE
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          Helps the AI design the right split for your availability.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[var(--text-2)]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm athletic-body uppercase tracking-wider">
            Days per week
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {dayOptions.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDaysChange(d)}
              className={`px-5 py-2 text-sm font-bold athletic-body border-2 transition-all ${
                days === d
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                  : "border-[var(--border-2)] text-[var(--text-2)] hover:border-zinc-600"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[var(--text-2)]">
          <Activity className="w-4 h-4" />
          <span className="text-sm athletic-body uppercase tracking-wider">
            Session duration
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {durationOptions.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onDurationChange(d.value)}
              className={`px-4 py-2 text-sm font-bold athletic-body border-2 transition-all ${
                duration === d.value
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                  : "border-[var(--border-2)] text-[var(--text-2)] hover:border-zinc-600"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepEquipment({
  selected,
  onToggle,
}: {
  selected: Equipment[];
  onToggle: (e: Equipment) => void;
}) {
  const options: { value: Equipment; label: string; icon: string }[] = [
    { value: "barbell", label: "Barbell", icon: "🏋️" },
    { value: "dumbbell", label: "Dumbbell", icon: "💪" },
    { value: "machine", label: "Machine", icon: "⚙️" },
    { value: "cable", label: "Cable", icon: "🔗" },
    { value: "bodyweight", label: "Bodyweight", icon: "🤸" },
    { value: "bands", label: "Resistance Bands", icon: "〰️" },
    { value: "kettlebell", label: "Kettlebell", icon: "🫙" },
    { value: "other", label: "Other", icon: "➕" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          AVAILABLE EQUIPMENT
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          Select all that you have access to. AI will only prescribe what you can use.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={`flex items-center gap-3 p-3 border-2 text-left transition-all ${
              selected.includes(o.value)
                ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] hover:border-[var(--border-2)]"
            }`}
          >
            <span className="text-lg">{o.icon}</span>
            <span
              className={`text-sm font-medium athletic-body ${
                selected.includes(o.value) ? "text-white" : "text-[var(--text-2)]"
              }`}
            >
              {o.label}
            </span>
          </button>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-red-400 text-center">
          Select at least one piece of equipment
        </p>
      )}
    </div>
  );
}

function StepMuscles({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (muscles: string[]) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          MUSCLE FOCUS
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          Tap muscle groups on the diagram — front and back.
        </p>
      </div>
      <MuscleSelector selected={selected} onChange={onChange} />
    </div>
  );
}

function StepLifestyle({
  age,
  bodyWeight,
  height,
  gender,
  injuries,
  injuryInput,
  sleepQuality,
  stressLevel,
  occupationType,
  onAge,
  onBodyWeight,
  onHeight,
  onGender,
  onInjuryPreset,
  onInjuryInput,
  onAddInjury,
  onRemoveInjury,
  onSleep,
  onStress,
  onOccupation,
}: {
  age: string;
  bodyWeight: string;
  height: string;
  gender: "male" | "female" | "prefer_not_to_say" | null;
  injuries: string[];
  injuryInput: string;
  sleepQuality: SleepQuality | null;
  stressLevel: StressLevel | null;
  occupationType: OccupationType | null;
  onAge: (v: string) => void;
  onBodyWeight: (v: string) => void;
  onHeight: (v: string) => void;
  onGender: (v: "male" | "female" | "prefer_not_to_say") => void;
  onInjuryPreset: (v: string) => void;
  onInjuryInput: (v: string) => void;
  onAddInjury: () => void;
  onRemoveInjury: (v: string) => void;
  onSleep: (v: SleepQuality) => void;
  onStress: (v: StressLevel) => void;
  onOccupation: (v: OccupationType) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          PROFILE & LIFESTYLE
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          Optional — helps calibrate recovery, volume, and nutrition recommendations.
        </p>
      </div>

      {/* Gender */}
      <div className="space-y-1">
        <span className="text-xs text-[var(--text-2)] athletic-body uppercase tracking-wider">
          Gender
        </span>
        <p className="text-[10px] text-[var(--text-3)] mb-1">
          Used for accurate BMR &amp; nutrition calculations
        </p>
        <div className="flex gap-2">
          {([
            { value: "male" as const, label: "Male" },
            { value: "female" as const, label: "Female" },
            { value: "prefer_not_to_say" as const, label: "Prefer not to say" },
          ]).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onGender(o.value)}
              className={`flex-1 py-2 text-xs font-medium border-2 transition-all athletic-body ${
                gender === o.value
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-2)]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age + Body weight + Height */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-2)] athletic-body uppercase tracking-wider">
            Age
          </label>
          <input
            type="number"
            min="13"
            max="100"
            value={age}
            onChange={(e) => onAge(e.target.value)}
            placeholder="e.g. 28"
            className="w-full bg-[var(--surface)] border border-[var(--border-2)] px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-2)] athletic-body uppercase tracking-wider">
            Height (cm)
          </label>
          <input
            type="number"
            min="100"
            max="250"
            value={height}
            onChange={(e) => onHeight(e.target.value)}
            placeholder="e.g. 175"
            className="w-full bg-[var(--surface)] border border-[var(--border-2)] px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--text-2)] athletic-body uppercase tracking-wider">
            Body Weight
          </label>
          <input
            type="number"
            min="30"
            max="400"
            value={bodyWeight}
            onChange={(e) => onBodyWeight(e.target.value)}
            placeholder="lbs / kg"
            className="w-full bg-[var(--surface)] border border-[var(--border-2)] px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Injuries */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[var(--text-2)]">
          <Shield className="w-4 h-4" />
          <span className="text-xs athletic-body uppercase tracking-wider">
            Injuries / Limitations
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {INJURY_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onInjuryPreset(p)}
              className={`px-3 py-1 text-xs border transition-all athletic-body ${
                injuries.includes(p)
                  ? "border-red-400 bg-red-400/10 text-red-400"
                  : "border-[var(--border-2)] text-[var(--text-2)] hover:border-zinc-600"
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
            onChange={(e) => onInjuryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddInjury()}
            placeholder="Add custom limitation..."
            className="flex-1 bg-[var(--surface)] border border-[var(--border-2)] px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[var(--accent)] text-xs"
          />
          <button
            type="button"
            onClick={onAddInjury}
            className="px-3 py-2 bg-[var(--surface-2)] text-[var(--text-1)] text-xs hover:bg-[var(--surface-3)] transition-colors"
          >
            Add
          </button>
        </div>
        {injuries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {injuries.map((i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2 py-1 bg-red-400/10 text-red-400 text-xs border border-red-400/30"
              >
                {i}
                <button
                  type="button"
                  onClick={() => onRemoveInjury(i)}
                  className="ml-1 hover:text-red-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Lifestyle pills */}
      <div className="space-y-3">
        <PillRow
          label="Sleep quality"
          options={[
            { value: "poor", label: "Poor" },
            { value: "average", label: "Average" },
            { value: "good", label: "Good" },
          ]}
          selected={sleepQuality}
          onChange={onSleep as (v: string) => void}
        />
        <PillRow
          label="Stress level"
          options={[
            { value: "low", label: "Low" },
            { value: "moderate", label: "Moderate" },
            { value: "high", label: "High" },
          ]}
          selected={stressLevel}
          onChange={onStress as (v: string) => void}
        />
        <PillRow
          label="Occupation"
          options={[
            { value: "sedentary", label: "Sedentary" },
            { value: "lightly_active", label: "Active job" },
            { value: "physically_demanding", label: "Physical labor" },
          ]}
          selected={occupationType}
          onChange={onOccupation as (v: string) => void}
        />
      </div>
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
      <span className="text-xs text-[var(--text-2)] athletic-body uppercase tracking-wider">
        {label}
      </span>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 py-2 text-xs font-medium border-2 transition-all athletic-body ${
              selected === o.value
                ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-2)] hover:border-[var(--border-2)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepWeightUnit({
  selected,
  onChange,
}: {
  selected: "kg" | "lbs";
  onChange: (v: "kg" | "lbs") => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="athletic-title text-3xl text-white tracking-wide">
          WEIGHT UNIT
        </h2>
        <p className="text-[var(--text-2)] text-sm mt-1">
          All weights in the app will use this unit.
        </p>
      </div>
      <div className="flex gap-3">
        {[
          { value: "lbs" as const, label: "Pounds", sub: "lbs" },
          { value: "kg" as const, label: "Kilograms", sub: "kg" },
        ].map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 p-6 border-2 transition-all text-center ${
              selected === o.value
                ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] hover:border-[var(--border-2)]"
            }`}
          >
            <div className="text-2xl font-bold athletic-title text-white">
              {o.sub}
            </div>
            <div className="text-sm text-[var(--text-2)] mt-1">{o.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-4 mt-4">
        <p className="text-sm text-[var(--text-2)] text-center">
          You&apos;re all set! Your AI coach will use everything you&apos;ve shared to
          design programs specifically for you.
        </p>
      </div>
    </div>
  );
}
