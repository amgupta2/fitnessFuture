"use client";

import { useState, useRef } from "react";
import {
  X,
  Camera,
  ImageIcon,
  MessageSquare,
  PenLine,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";

interface NutritionItem {
  name: string;
  quantity?: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    mealType: string;
    items: NutritionItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    source: "photo" | "text" | "manual";
  }) => void;
  defaultMealType?: string;
}

type Tab = "photo" | "describe" | "quick";
type Step = "input" | "review";

const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
];

function guessMealType(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 20) return "dinner";
  return "snack";
}

export function LogMealModal({
  isOpen,
  onClose,
  onConfirm,
  defaultMealType,
}: LogMealModalProps) {
  const [tab, setTab] = useState<Tab>("describe");
  const [step, setStep] = useState<Step>("input");
  const [mealType, setMealType] = useState(defaultMealType || guessMealType());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [items, setItems] = useState<NutritionItem[]>([]);
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Quick-add manual state
  const [manualName, setManualName] = useState("");
  const [manualCals, setManualCals] = useState("");
  const [manualP, setManualP] = useState("");
  const [manualC, setManualC] = useState("");
  const [manualF, setManualF] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const reset = () => {
    setStep("input");
    setItems([]);
    setTextInput("");
    setError(null);
    setManualName("");
    setManualCals("");
    setManualP("");
    setManualC("");
    setManualF("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const analyzePhoto = async (file: File) => {
    setError(null);
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ai/nutrition-analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        throw new Error("No food items detected. Try a well-lit photo with the food clearly visible.");
      }
      setItems(data.items);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeText = async () => {
    if (!textInput.trim()) return;
    setError(null);
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/nutrition-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: textInput }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      if (!data.items || data.items.length === 0) {
        throw new Error("Could not parse food items. Try being more specific (e.g., '200g chicken breast, 1 cup rice').");
      }
      setItems(data.items);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addManualItem = () => {
    if (!manualName.trim()) return;
    const newItem: NutritionItem = {
      name: manualName.trim(),
      calories: parseInt(manualCals) || 0,
      proteinGrams: parseInt(manualP) || 0,
      carbsGrams: parseInt(manualC) || 0,
      fatGrams: parseInt(manualF) || 0,
    };
    setItems((prev) => [...prev, newItem]);
    setManualName("");
    setManualCals("");
    setManualP("");
    setManualC("");
    setManualF("");
    if (step === "input") setStep("review");
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    if (items.length === 0) return;
    const totals = items.reduce(
      (acc, it) => ({
        calories: acc.calories + it.calories,
        protein: acc.protein + it.proteinGrams,
        carbs: acc.carbs + it.carbsGrams,
        fat: acc.fat + it.fatGrams,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    onConfirm({
      mealType,
      items,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      source: tab === "photo" ? "photo" : tab === "describe" ? "text" : "manual",
    });
    handleClose();
  };

  const tabs: { id: Tab; label: string; icon: typeof Camera }[] = [
    { id: "photo", label: "Photo", icon: Camera },
    { id: "describe", label: "Describe", icon: MessageSquare },
    { id: "quick", label: "Quick Add", icon: PenLine },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Log Meal</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-2)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal type selector */}
        <div className="flex gap-1.5 p-4 pb-0">
          {MEAL_TYPES.map((mt) => (
            <button
              key={mt.id}
              onClick={() => setMealType(mt.id)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                mealType === mt.id
                  ? "bg-white text-black"
                  : "bg-[var(--surface-2)] text-[var(--text-2)] hover:bg-[var(--surface-3)]"
              }`}
            >
              {mt.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        {step === "input" && (
          <div className="flex border-b border-[var(--border)] mx-4 mt-3">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setError(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    tab === t.id
                      ? "border-[var(--accent)] text-white"
                      : "border-transparent text-[var(--text-2)] hover:text-[var(--text-1)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {step === "input" && tab === "photo" && (
            <>
              {isAnalyzing ? (
                <div className="w-full border-2 border-dashed border-[var(--border-2)] rounded-xl p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                    <p className="text-sm text-[var(--text-2)]">Analyzing your meal...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 border-2 border-dashed border-[var(--border-2)] hover:border-[rgba(245,166,35,0.35)] rounded-xl p-6 text-center transition-colors group"
                  >
                    <Camera className="w-7 h-7 text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors" />
                    <p className="text-sm font-medium text-[var(--text-1)]">Take Photo</p>
                    <p className="text-[10px] text-[var(--text-3)]">Open camera</p>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 border-2 border-dashed border-[var(--border-2)] hover:border-[rgba(245,166,35,0.35)] rounded-xl p-6 text-center transition-colors group"
                  >
                    <ImageIcon className="w-7 h-7 text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors" />
                    <p className="text-sm font-medium text-[var(--text-1)]">Choose Photo</p>
                    <p className="text-[10px] text-[var(--text-3)]">From camera roll</p>
                  </button>
                </div>
              )}
              <p className="text-xs text-[var(--text-3)] text-center">JPEG, PNG, WebP — max 10 MB</p>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) analyzePhoto(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) analyzePhoto(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </>
          )}

          {step === "input" && tab === "describe" && (
            <>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Describe what you ate, e.g.&#10;&#10;Grilled chicken breast 200g, cup of brown rice, steamed broccoli, tablespoon olive oil"
                rows={4}
                className="w-full bg-[var(--surface-2)] border border-[var(--border-2)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,166,35,0.3)] resize-none"
              />
              <button
                onClick={analyzeText}
                disabled={!textInput.trim() || isAnalyzing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)] text-black font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </button>
            </>
          )}

          {step === "input" && tab === "quick" && (
            <div className="space-y-3">
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Food name"
                className="w-full bg-[var(--surface-2)] border border-[var(--border-2)] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,166,35,0.3)]"
              />
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--text-2)] uppercase">Cals</label>
                  <input
                    type="number"
                    value={manualCals}
                    onChange={(e) => setManualCals(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-2)] rounded-lg px-2 py-2 text-sm text-white text-center placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,166,35,0.3)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-2)] uppercase">Protein</label>
                  <input
                    type="number"
                    value={manualP}
                    onChange={(e) => setManualP(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-2)] rounded-lg px-2 py-2 text-sm text-white text-center placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,166,35,0.3)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-2)] uppercase">Carbs</label>
                  <input
                    type="number"
                    value={manualC}
                    onChange={(e) => setManualC(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-2)] rounded-lg px-2 py-2 text-sm text-white text-center placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,166,35,0.3)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-2)] uppercase">Fat</label>
                  <input
                    type="number"
                    value={manualF}
                    onChange={(e) => setManualF(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-2)] rounded-lg px-2 py-2 text-sm text-white text-center placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,166,35,0.3)]"
                  />
                </div>
              </div>
              <button
                onClick={addManualItem}
                disabled={!manualName.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-white font-medium transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          )}

          {/* Review step */}
          {step === "review" && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-2)] uppercase tracking-wider font-medium">
                Review Items
              </p>
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[var(--surface-2)]/60 rounded-lg px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{item.name}</p>
                    {item.quantity && (
                      <p className="text-xs text-[var(--text-2)]">{item.quantity}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-1)] tabular-nums">{item.calories} kcal</p>
                      <p className="text-[10px] text-[var(--text-3)] tabular-nums">
                        P{item.proteinGrams} C{item.carbsGrams} F{item.fatGrams}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-3)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Totals */}
              {items.length > 0 && (
                <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between text-sm">
                  <span className="text-[var(--text-2)] font-medium">Total</span>
                  <span className="text-white tabular-nums font-semibold">
                    {items.reduce((s, i) => s + i.calories, 0)} kcal
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step === "review" && items.length > 0 && (
          <div className="p-4 border-t border-[var(--border)] flex gap-3">
            <button
              onClick={() => { reset(); setStep("input"); }}
              className="flex-1 py-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-white font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)] text-black font-semibold transition-colors"
            >
              Log Meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
