"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Plus } from "lucide-react";

import { CalorieSummary } from "@/components/nutrition/CalorieSummary";
import { MacroBars } from "@/components/nutrition/MacroBars";
import { DateStrip } from "@/components/nutrition/DateStrip";
import { MealSection } from "@/components/nutrition/MealSection";
import { LogMealModal } from "@/components/nutrition/LogMealModal";
import { NutritionTargetsSetup } from "@/components/nutrition/NutritionTargetsSetup";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NutritionPage() {
  const user = useCurrentUser();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState<string | undefined>();

  const targets = useQuery(
    api.nutrition.getNutritionTargets,
    user ? { userId: user._id } : "skip"
  );
  const meals = useQuery(
    api.nutrition.getMealsByDate,
    user ? { userId: user._id, date: selectedDate } : "skip"
  );

  const logMeal = useMutation(api.nutrition.logMeal);
  const deleteMeal = useMutation(api.nutrition.deleteMealLog);
  const setTargets = useMutation(api.nutrition.setNutritionTargets);

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Nutrition</h1>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-12 text-center">
            <p className="text-[var(--text-2)]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const mealsByType = {
    breakfast: (meals ?? []).filter((m) => m.mealType === "breakfast"),
    lunch: (meals ?? []).filter((m) => m.mealType === "lunch"),
    dinner: (meals ?? []).filter((m) => m.mealType === "dinner"),
    snack: (meals ?? []).filter((m) => m.mealType === "snack"),
  };

  const dayTotals = (meals ?? []).reduce(
    (acc, m) => ({
      calories: acc.calories + m.totalCalories,
      protein: acc.protein + m.totalProtein,
      carbs: acc.carbs + m.totalCarbs,
      fat: acc.fat + m.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleOpenModal = (mealType?: string) => {
    setModalMealType(mealType);
    setModalOpen(true);
  };

  const handleLogMeal = async (data: {
    mealType: string;
    items: Array<{
      name: string;
      quantity?: string;
      calories: number;
      proteinGrams: number;
      carbsGrams: number;
      fatGrams: number;
    }>;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    source: "photo" | "text" | "manual";
  }) => {
    await logMeal({
      userId: user._id,
      date: selectedDate,
      mealType: data.mealType as "breakfast" | "lunch" | "dinner" | "snack",
      items: data.items,
      totalCalories: data.totalCalories,
      totalProtein: data.totalProtein,
      totalCarbs: data.totalCarbs,
      totalFat: data.totalFat,
      source: data.source,
    });
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal({ id: id as any });
  };

  const handleSaveTargets = async (data: {
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    method: "ai_suggested" | "manual";
  }) => {
    await setTargets({
      userId: user._id,
      ...data,
    });
  };

  const hasTargets = targets && targets.dailyCalories > 0;

  return (
    <div className="p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Nutrition</h1>
          <p className="text-[var(--text-2)] text-sm">Track your meals and hit your macro targets</p>
        </div>

        {/* Targets setup (first-time) */}
        {!hasTargets && (
          <NutritionTargetsSetup
            userProfile={{
              bodyWeight: user.bodyWeight,
              age: user.age,
              height: user.height,
              gender: user.gender,
              primaryGoal: user.primaryGoal,
              experienceLevel: user.experienceLevel,
              trainingDaysPerWeek: user.trainingDaysPerWeek,
              occupationType: user.occupationType,
              weightUnit: user.preferences?.weightUnit,
            }}
            onSave={handleSaveTargets}
          />
        )}

        {/* Daily view (shown when targets are set) */}
        {hasTargets && (
          <>
            {/* Date navigation */}
            <div className="bg-[var(--surface)]/60 border border-[var(--border)] rounded-xl px-4 py-2">
              <DateStrip selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>

            {/* Summary card */}
            <div className="bg-[var(--surface)]/60 border border-[var(--border)] rounded-2xl p-5 space-y-5">
              <CalorieSummary
                consumed={dayTotals.calories}
                target={targets.dailyCalories}
              />
              <MacroBars
                protein={{ consumed: dayTotals.protein, target: targets.proteinGrams }}
                carbs={{ consumed: dayTotals.carbs, target: targets.carbsGrams }}
                fat={{ consumed: dayTotals.fat, target: targets.fatGrams }}
              />
            </div>

            {/* Meal sections */}
            <div className="space-y-2">
              <MealSection
                title="Breakfast"
                mealType="breakfast"
                meals={mealsByType.breakfast as any}
                onAddMeal={handleOpenModal}
                onDeleteMeal={handleDeleteMeal}
              />
              <MealSection
                title="Lunch"
                mealType="lunch"
                meals={mealsByType.lunch as any}
                onAddMeal={handleOpenModal}
                onDeleteMeal={handleDeleteMeal}
              />
              <MealSection
                title="Dinner"
                mealType="dinner"
                meals={mealsByType.dinner as any}
                onAddMeal={handleOpenModal}
                onDeleteMeal={handleDeleteMeal}
              />
              <MealSection
                title="Snacks"
                mealType="snack"
                meals={mealsByType.snack as any}
                onAddMeal={handleOpenModal}
                onDeleteMeal={handleDeleteMeal}
              />
            </div>

            {/* FAB */}
            <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30">
              <button
                onClick={() => handleOpenModal()}
                className="w-14 h-14 rounded-full bg-[var(--accent)] hover:bg-[var(--accent)] text-black shadow-lg shadow-[rgba(245,166,35,0.2)] flex items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </>
        )}

        {/* Log meal modal */}
        <LogMealModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleLogMeal}
          defaultMealType={modalMealType}
        />
      </div>
    </div>
  );
}
