"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Check, User, Settings as SettingsIcon, Trophy, Save } from "lucide-react";

export default function SettingsPage() {
  const user = useCurrentUser();
  const updateProfile = useMutation(api.users.updateUserProfile);

  const [name, setName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("lbs");
  const [defaultRestSeconds, setDefaultRestSeconds] = useState(120);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form when user data loads
  const initialized = user && name === "";
  if (initialized && user) {
    setName(user.name || "");
    setExperienceLevel(user.experienceLevel);
    setWeightUnit(user.preferences.weightUnit);
    setDefaultRestSeconds(user.preferences.defaultRestSeconds);
  }

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
          darkMode: true, // Always dark mode for now
        },
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
            <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              <div className="h-40 bg-gray-700 rounded"></div>
              <div className="h-40 bg-gray-700 rounded"></div>
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
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">Please log in to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your profile and preferences</p>
        </div>

        {/* Save Button - Top */}
        <div className="mb-6">
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              saveSuccess
                ? "bg-green-500 text-white"
                : isSaving
                ? "bg-gray-600 text-gray-400"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </div>

          {/* Training Profile */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Training Profile</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Experience Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    value: "beginner" as const,
                    label: "Beginner",
                    desc: "< 1 year",
                  },
                  {
                    value: "intermediate" as const,
                    label: "Intermediate",
                    desc: "1-3 years",
                  },
                  {
                    value: "advanced" as const,
                    label: "Advanced",
                    desc: "3+ years",
                  },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setExperienceLevel(level.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      experienceLevel === level.value
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-600 bg-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="font-semibold text-white">
                      {level.label}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {level.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold">Preferences</h2>
            </div>

            <div className="space-y-6">
              {/* Weight Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
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
                      className={`p-4 rounded-lg border-2 transition-all ${
                        weightUnit === unit.value
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Rest Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Default Rest Time
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[60, 90, 120, 180].map((seconds) => (
                    <button
                      key={seconds}
                      onClick={() => setDefaultRestSeconds(seconds)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        defaultRestSeconds === seconds
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <div className="font-semibold">
                        {Math.floor(seconds / 60)}:
                        {String(seconds % 60).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {seconds}s
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Member Since</span>
                <span className="text-white">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Updated</span>
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
          </div>
        </div>

        {/* Save Button - Bottom (Mobile) */}
        <div className="mt-6 md:hidden">
          <button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              saveSuccess
                ? "bg-green-500 text-white"
                : isSaving
                ? "bg-gray-600 text-gray-400"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
