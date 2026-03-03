"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

interface MealItem {
  name: string;
  quantity?: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

interface MealLog {
  _id: string;
  mealType: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  source: string;
}

interface MealSectionProps {
  title: string;
  mealType: string;
  meals: MealLog[];
  onAddMeal: (mealType: string) => void;
  onDeleteMeal: (id: string) => void;
}

export function MealSection({ title, mealType, meals, onAddMeal, onDeleteMeal }: MealSectionProps) {
  const [expanded, setExpanded] = useState(meals.length > 0);
  const totalCals = meals.reduce((s, m) => s + m.totalCalories, 0);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">{title}</span>
          {totalCals > 0 && (
            <span className="text-xs text-zinc-500 tabular-nums">{totalCals} kcal</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddMeal(mealType);
            }}
            className="p-1.5 rounded-md hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-lime-400"
          >
            <Plus className="w-4 h-4" />
          </button>
          <ChevronDown
            className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/60">
          {meals.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-zinc-600">Nothing logged yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {meals.map((meal) =>
                meal.items.map((item, idx) => (
                  <div key={`${meal._id}-${idx}`} className="flex items-center justify-between px-4 py-2.5 group">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200 truncate">{item.name}</p>
                      {item.quantity && (
                        <p className="text-xs text-zinc-600">{item.quantity}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-zinc-400 tabular-nums">{item.calories} kcal</p>
                        <p className="text-[10px] text-zinc-600 tabular-nums">
                          P{item.proteinGrams} C{item.carbsGrams} F{item.fatGrams}
                        </p>
                      </div>
                      {idx === 0 && (
                        <button
                          onClick={() => onDeleteMeal(meal._id)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-600 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
