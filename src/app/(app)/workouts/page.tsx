"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Plus, Dumbbell, ChevronRight, Trash2, GripVertical, X, Play, Edit2, Search, Copy, Info } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import type { Doc } from "convex/_generated/dataModel";

export default function WorkoutsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  
  // State declarations must come before they're used
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Id<"workoutTemplates"> | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Doc<"templateExercises"> | null>(null);
  const [draggedExercise, setDraggedExercise] = useState<number | null>(null);
  
  // Exercise search states
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<Id<"exerciseLibrary"> | null>(null);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [recentExercises, setRecentExercises] = useState<string[]>([]);
  const [showExerciseDetails, setShowExerciseDetails] = useState<Id<"exerciseLibrary"> | null>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowExerciseDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Reset exercise search when opening/closing add exercise modal
  useEffect(() => {
    if (showAddExercise) {
      setExerciseSearchQuery("");
      setSelectedExerciseId(null);
      setShowExerciseDropdown(false);
      setSelectedDropdownIndex(-1);
    }
  }, [showAddExercise]);
  
  // Load recent exercises from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentExercises");
    if (stored) {
      setRecentExercises(JSON.parse(stored));
    }
  }, []);
  
  // Show toast notification
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Add to recent exercises
  const addToRecent = (exerciseName: string) => {
    const updated = [exerciseName, ...recentExercises.filter(e => e !== exerciseName)].slice(0, 8);
    setRecentExercises(updated);
    localStorage.setItem("recentExercises", JSON.stringify(updated));
  };
  
  const templates = useQuery(api.templates.getUserTemplates,
    user ? { userId: user._id } : "skip"
  );
  const createTemplate = useMutation(api.templates.createTemplate);
  const addExercise = useMutation(api.templates.addExerciseToTemplate);
  const updateExercise = useMutation(api.templates.updateTemplateExercise);
  const removeExercise = useMutation(api.templates.removeExerciseFromTemplate);
  const reorderExercises = useMutation(api.templates.reorderTemplateExercises);
  const deleteTemplate = useMutation(api.templates.deleteTemplate);
  const duplicateTemplate = useMutation(api.templates.duplicateTemplate);
  const startSession = useMutation(api.sessions.startSession);
  const getTemplateDetail = useQuery(
    api.templates.getTemplateWithExercises,
    selectedTemplate ? { templateId: selectedTemplate } : "skip"
  );
  
  // Exercise library search
  const exerciseSearchResults = useQuery(
    api.exercises.searchExercises,
    exerciseSearchQuery.length > 0 ? { query: exerciseSearchQuery, limit: 10 } : "skip"
  );
  
  // Popular exercises for empty state
  const popularExercises = useQuery(api.exercises.getPopularExercises, { limit: 8 });
  
  // Exercise details for modal
  const exerciseDetails = useQuery(
    api.exercises.getExercise,
    showExerciseDetails ? { exerciseId: showExerciseDetails } : "skip"
  );

  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const category = formData.get("category") as any;

    const templateId = await createTemplate({
      userId: user._id,
      name,
      category: category || undefined,
    });

    setShowCreateModal(false);
    setSelectedTemplate(templateId);
  };

  const handleStartWorkout = async (templateId: Id<"workoutTemplates">, templateName: string) => {
    if (!user) return;

    await startSession({
      userId: user._id,
      templateId,
      templateName,
    });

    router.push("/workout-active");
  };

  const handleAddExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTemplate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const exerciseName = formData.get("exerciseName") as string;
      const targetSets = parseInt(formData.get("targetSets") as string);
      const targetRepsMin = parseInt(formData.get("targetRepsMin") as string);
      const targetRepsMax = parseInt(formData.get("targetRepsMax") as string);
      const restSeconds = parseInt(formData.get("restSeconds") as string);

      const exercises = getTemplateDetail?.exercises || [];

      await addExercise({
        templateId: selectedTemplate,
        exerciseName,
        standardizedExerciseId: selectedExerciseId || undefined,
        orderIndex: exercises.length,
        targetSets: targetSets || undefined,
        targetRepsMin: targetRepsMin || undefined,
        targetRepsMax: targetRepsMax || undefined,
        restSeconds: restSeconds || undefined,
      });

      addToRecent(exerciseName);
      showToast(`Added ${exerciseName} to template`, "success");
      setShowAddExercise(false);
      
      // Reset search state
      setExerciseSearchQuery("");
      setSelectedExerciseId(null);
      setShowExerciseDropdown(false);
    } catch (error) {
      showToast("Failed to add exercise", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExercise || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const exerciseName = formData.get("exerciseName") as string;
      const targetSets = parseInt(formData.get("targetSets") as string);
      const targetRepsMin = parseInt(formData.get("targetRepsMin") as string);
      const targetRepsMax = parseInt(formData.get("targetRepsMax") as string);
      const restSeconds = parseInt(formData.get("restSeconds") as string);

      await updateExercise({
        exerciseId: editingExercise._id,
        exerciseName,
        targetSets: targetSets || undefined,
        targetRepsMin: targetRepsMin || undefined,
        targetRepsMax: targetRepsMax || undefined,
        restSeconds: restSeconds || undefined,
      });

      showToast("Exercise updated", "success");
      setEditingExercise(null);
    } catch (error) {
      showToast("Failed to update exercise", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: Id<"templateExercises">) => {
    if (confirm("Delete this exercise?")) {
      try {
        await removeExercise({ exerciseId });
        showToast("Exercise removed", "success");
      } catch (error) {
        showToast("Failed to remove exercise", "error");
      }
    }
  };

  const handleDeleteTemplate = async (templateId: Id<"workoutTemplates">) => {
    if (confirm("Delete this template? This cannot be undone.")) {
      try {
        await deleteTemplate({ templateId });
        showToast("Template deleted", "success");
        setSelectedTemplate(null);
      } catch (error) {
        showToast("Failed to delete template", "error");
      }
    }
  };
  
  const handleDuplicateTemplate = async (templateId: Id<"workoutTemplates">) => {
    if (!user) return;
    try {
      const newTemplateId = await duplicateTemplate({ templateId, userId: user._id });
      showToast("Template duplicated", "success");
      setSelectedTemplate(newTemplateId);
    } catch (error) {
      showToast("Failed to duplicate template", "error");
    }
  };
  
  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showExerciseDropdown || !exerciseSearchResults || exerciseSearchResults.length === 0) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedDropdownIndex(prev => 
          prev < exerciseSearchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedDropdownIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        if (selectedDropdownIndex >= 0) {
          e.preventDefault();
          const selected = exerciseSearchResults[selectedDropdownIndex];
          setExerciseSearchQuery(selected.name);
          setSelectedExerciseId(selected._id);
          setShowExerciseDropdown(false);
          setSelectedDropdownIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowExerciseDropdown(false);
        setSelectedDropdownIndex(-1);
        break;
    }
  };
  
  // Get smart defaults based on selected exercise
  const getExerciseDefaults = () => {
    if (!selectedExerciseId) return { sets: 3, repsMin: 8, repsMax: 12, rest: 90 };
    
    const exercise = exerciseSearchResults?.find(ex => ex._id === selectedExerciseId) ||
                     popularExercises?.find(ex => ex._id === selectedExerciseId);
    
    if (!exercise) return { sets: 3, repsMin: 8, repsMax: 12, rest: 90 };
    
    // Compound exercises: heavier weight, lower reps, more rest
    if (exercise.category === "compound") {
      return { sets: 4, repsMin: 5, repsMax: 8, rest: 180 };
    }
    
    // Isolation exercises: moderate weight, higher reps, less rest
    return { sets: 3, repsMin: 8, repsMax: 12, rest: 90 };
  };

  const handleDragStart = (index: number) => {
    setDraggedExercise(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedExercise === null || !getTemplateDetail) return;

    const exercises = [...getTemplateDetail.exercises];
    const draggedItem = exercises[draggedExercise];
    
    // Remove dragged item
    exercises.splice(draggedExercise, 1);
    // Insert at new position
    exercises.splice(dropIndex, 0, draggedItem);

    // Update order in backend
    await reorderExercises({
      exerciseIds: exercises.map(ex => ex._id),
    });

    setDraggedExercise(null);
  };

  if (selectedTemplate && getTemplateDetail) {
    return (
      <div className="min-h-screen bg-black text-white">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:wght@400;700&display=swap');

          .athletic-title {
            font-family: 'Bebas Neue', sans-serif;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .athletic-body {
            font-family: 'Roboto Condensed', sans-serif;
          }

          .clip-corner {
            clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
          }

          .clip-corner-bottom {
            clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slide-in {
            animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .exercise-item {
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .exercise-item:active {
            transform: scale(0.98);
          }
        `}</style>

        {/* Header */}
        <div className="border-b-2 border-lime-400 bg-zinc-950">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-lime-400 hover:text-lime-300 athletic-body font-bold uppercase text-sm"
              >
                ← Templates
              </button>
              <h1 className="athletic-title text-2xl">{getTemplateDetail.name}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicateTemplate(getTemplateDetail._id)}
                  className="text-zinc-500 hover:text-lime-400 transition-colors p-2"
                  title="Duplicate template"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(getTemplateDetail._id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-2"
                  title="Delete template"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => handleStartWorkout(getTemplateDetail._id, getTemplateDetail.name)}
              className="w-full clip-corner bg-lime-400 text-black py-4 athletic-title text-xl hover:bg-lime-300 active:scale-98 transition-transform flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              Start Workout
            </button>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-4 space-y-3">
          {getTemplateDetail.exercises.map((exercise, idx) => (
            <div
              key={exercise._id}
              draggable={false}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`exercise-item clip-corner bg-zinc-900 border-l-4 border-lime-400 relative group ${
                draggedExercise === idx ? 'opacity-50' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    className="mt-1 text-zinc-600 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="athletic-body font-bold text-lg text-white">
                        {exercise.exerciseName}
                      </h3>
                      {exercise.standardizedExerciseId && (
                        <span className="px-2 py-0.5 text-xs bg-lime-400/20 text-lime-400 athletic-body uppercase border border-lime-400/30 rounded">
                          Verified
                        </span>
                      )}
                      {getTemplateDetail.exercises.filter(e => e.exerciseName.toLowerCase() === exercise.exerciseName.toLowerCase()).length > 1 && (
                        <span className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 athletic-body rounded">
                          In template {getTemplateDetail.exercises.filter(e => e.exerciseName.toLowerCase() === exercise.exerciseName.toLowerCase()).length}x
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm athletic-body text-zinc-400">
                      {exercise.targetSets && (
                        <span>{exercise.targetSets} sets</span>
                      )}
                      {exercise.targetRepsMin && exercise.targetRepsMax && (
                        <span>{exercise.targetRepsMin}-{exercise.targetRepsMax} reps</span>
                      )}
                      {exercise.restSeconds && (
                        <span>{exercise.restSeconds}s rest</span>
                      )}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                    {exercise.standardizedExerciseId && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowExerciseDetails(exercise.standardizedExerciseId!);
                        }}
                        className="p-3 sm:p-2 text-zinc-500 hover:text-blue-400 transition-colors touch-manipulation"
                        title="View exercise details"
                        type="button"
                      >
                        <Info className="w-5 h-5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingExercise(exercise);
                      }}
                      className="p-3 sm:p-2 text-zinc-500 hover:text-lime-400 transition-colors touch-manipulation"
                      title="Edit exercise"
                    >
                      <Edit2 className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExercise(exercise._id);
                      }}
                      className="p-3 sm:p-2 text-zinc-500 hover:text-red-400 transition-colors touch-manipulation"
                      title="Remove exercise"
                    >
                      <X className="w-6 h-6 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {getTemplateDetail.exercises.length === 0 && (
            <div className="text-center py-16 text-zinc-600">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="athletic-body uppercase text-sm">No exercises yet</p>
            </div>
          )}
        </div>

        {/* Add Exercise Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowAddExercise(true)}
            className="clip-corner-bottom bg-lime-400 text-black px-8 py-4 athletic-title text-xl hover:bg-lime-300 active:scale-95 transition-transform shadow-2xl"
          >
            <Plus className="w-6 h-6 inline mr-2" />
            Add Exercise
          </button>
        </div>

        {/* Add Exercise Modal */}
        {showAddExercise && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-end sm:items-center justify-center p-4">
            <div className="animate-slide-in w-full max-w-lg bg-zinc-900 clip-corner border-2 border-lime-400">
              <div className="border-b-2 border-lime-400 bg-zinc-950 p-4 flex items-center justify-between">
                <h2 className="athletic-title text-xl">Add Exercise</h2>
                <button
                  onClick={() => setShowAddExercise(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddExercise} className="p-6 space-y-4" key={selectedExerciseId || "new"}>
                <div className="relative" ref={searchContainerRef}>
                  <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                    Exercise Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="exerciseName"
                      required
                      value={exerciseSearchQuery}
                      onChange={(e) => {
                        setExerciseSearchQuery(e.target.value);
                        setShowExerciseDropdown(true);
                        setSelectedDropdownIndex(-1);
                      }}
                      onFocus={() => setShowExerciseDropdown(true)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 pr-10 athletic-body text-lg outline-none transition-colors"
                      placeholder="Search exercises... (e.g., bench, squat)"
                      autoComplete="off"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  </div>
                  
                  {/* Exercise Search Dropdown */}
                  {showExerciseDropdown && exerciseSearchQuery.length > 0 && exerciseSearchResults && exerciseSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-zinc-900 border-2 border-lime-400 clip-corner max-h-64 overflow-y-auto">
                      {exerciseSearchResults.map((exercise, idx) => (
                        <button
                          key={exercise._id}
                          type="button"
                          onClick={() => {
                            setExerciseSearchQuery(exercise.name);
                            setSelectedExerciseId(exercise._id);
                            setShowExerciseDropdown(false);
                            setSelectedDropdownIndex(-1);
                          }}
                          className={`w-full text-left px-4 py-3 transition-colors border-b border-zinc-800 last:border-b-0 ${
                            selectedDropdownIndex === idx ? 'bg-lime-400/20' : 'hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex gap-3 items-start">
                            {exercise.imageUrl && (
                              <img 
                                src={exercise.imageUrl} 
                                alt={exercise.name}
                                className="w-12 h-12 object-cover clip-corner"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="athletic-body text-white">{exercise.name}</div>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-lime-400 uppercase athletic-body">
                                  {exercise.equipmentType}
                                </span>
                                {exercise.muscleGroups.map((mg: string) => (
                                  <span key={mg} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 athletic-body">
                                    {mg}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Recent & Popular Exercises */}
                  {showExerciseDropdown && exerciseSearchQuery.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-zinc-900 border-2 border-lime-400 clip-corner max-h-64 overflow-y-auto">
                      {/* Recent Exercises */}
                      {recentExercises.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-zinc-950 athletic-body uppercase text-xs text-lime-400">
                            Recent
                          </div>
                          {recentExercises.slice(0, 5).map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setExerciseSearchQuery(name);
                                setShowExerciseDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800"
                            >
                              <div className="athletic-body text-white">{name}</div>
                            </button>
                          ))}
                        </>
                      )}
                      
                      {/* Popular Exercises */}
                      {popularExercises && popularExercises.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-zinc-950 athletic-body uppercase text-xs text-lime-400">
                            Popular
                          </div>
                          {popularExercises.slice(0, 6).map((exercise) => (
                            <button
                              key={exercise._id}
                              type="button"
                              onClick={() => {
                                setExerciseSearchQuery(exercise.name);
                                setSelectedExerciseId(exercise._id);
                                setShowExerciseDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
                            >
                              <div className="flex gap-3 items-start">
                                {exercise.imageUrl && (
                                  <img 
                                    src={exercise.imageUrl} 
                                    alt={exercise.name}
                                    className="w-12 h-12 object-cover clip-corner"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="athletic-body text-white">{exercise.name}</div>
                                  <div className="flex gap-2 mt-1 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 bg-zinc-800 text-lime-400 uppercase athletic-body">
                                      {exercise.equipmentType}
                                    </span>
                                    {exercise.muscleGroups.map((mg: string) => (
                                      <span key={mg} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 athletic-body">
                                        {mg}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* No results message */}
                  {showExerciseDropdown && exerciseSearchQuery.length > 2 && exerciseSearchResults && exerciseSearchResults.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-zinc-900 border-2 border-zinc-700 clip-corner px-4 py-3">
                      <div className="athletic-body text-zinc-500 text-sm">
                        No exercises found. You can still add "{exerciseSearchQuery}" as a custom exercise.
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Sets
                    </label>
                    <input
                      type="number"
                      name="targetSets"
                      min="1"
                      defaultValue={getExerciseDefaults().sets}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Rest (sec)
                    </label>
                    <input
                      type="number"
                      name="restSeconds"
                      min="0"
                      step="15"
                      defaultValue={getExerciseDefaults().rest}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Min Reps
                    </label>
                    <input
                      type="number"
                      name="targetRepsMin"
                      min="1"
                      defaultValue={getExerciseDefaults().repsMin}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Max Reps
                    </label>
                    <input
                      type="number"
                      name="targetRepsMax"
                      min="1"
                      defaultValue={getExerciseDefaults().repsMax}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full clip-corner-bottom bg-lime-400 text-black px-6 py-4 athletic-title text-xl hover:bg-lime-300 active:scale-98 transition-transform mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add to Template"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Exercise Modal */}
        {editingExercise && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-end sm:items-center justify-center p-4">
            <div className="animate-slide-in w-full max-w-lg bg-zinc-900 clip-corner border-2 border-lime-400">
              <div className="border-b-2 border-lime-400 bg-zinc-950 p-4 flex items-center justify-between">
                <h2 className="athletic-title text-xl">Edit Exercise</h2>
                <button
                  onClick={() => setEditingExercise(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditExercise} className="p-6 space-y-4">
                <div>
                  <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    name="exerciseName"
                    required
                    defaultValue={editingExercise.exerciseName}
                    className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                    placeholder="Bench Press"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Sets
                    </label>
                    <input
                      type="number"
                      name="targetSets"
                      min="1"
                      defaultValue={editingExercise.targetSets}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Rest (sec)
                    </label>
                    <input
                      type="number"
                      name="restSeconds"
                      min="0"
                      step="15"
                      defaultValue={editingExercise.restSeconds}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                      placeholder="90"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Min Reps
                    </label>
                    <input
                      type="number"
                      name="targetRepsMin"
                      min="1"
                      defaultValue={editingExercise.targetRepsMin}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                      Max Reps
                    </label>
                    <input
                      type="number"
                      name="targetRepsMax"
                      min="1"
                      defaultValue={editingExercise.targetRepsMax}
                      className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                      placeholder="12"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full clip-corner-bottom bg-lime-400 text-black px-6 py-4 athletic-title text-xl hover:bg-lime-300 active:scale-98 transition-transform mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Exercise Details Modal */}
        {showExerciseDetails && (
          <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4" onClick={() => setShowExerciseDetails(null)}>
            <div className="w-full max-w-2xl bg-zinc-900 clip-corner border-2 border-lime-400" onClick={(e) => e.stopPropagation()}>
              <div className="border-b-2 border-lime-400 bg-zinc-950 p-4 flex items-center justify-between">
                <h2 className="athletic-title text-2xl">{exerciseDetails ? exerciseDetails.name : "Loading..."}</h2>
                <button
                  onClick={() => setShowExerciseDetails(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {!exerciseDetails ? (
                <div className="p-6 text-center athletic-body text-zinc-400">
                  Loading exercise details...
                </div>
              ) : (
              <div className="p-6 space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-lime-400/20 text-lime-400 athletic-body uppercase text-xs border border-lime-400/30">
                    {exerciseDetails.category}
                  </span>
                  <span className="px-3 py-1 bg-zinc-800 text-lime-400 athletic-body uppercase text-xs">
                    {exerciseDetails.equipmentType}
                  </span>
                  <span className="px-3 py-1 bg-zinc-800 text-blue-400 athletic-body uppercase text-xs">
                    {exerciseDetails.movementPattern.replace(/_/g, ' ')}
                  </span>
                </div>
                
                {/* Muscle Groups */}
                <div>
                  <h3 className="athletic-body uppercase text-xs text-lime-400 mb-2">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {exerciseDetails.muscleGroups.map((mg: string) => (
                      <span key={mg} className="px-3 py-1 bg-zinc-800 text-white athletic-body text-sm">
                        {mg}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Aliases */}
                {exerciseDetails.aliases.length > 1 && (
                  <div>
                    <h3 className="athletic-body uppercase text-xs text-lime-400 mb-2">Also known as</h3>
                    <div className="athletic-body text-zinc-400 text-sm">
                      {exerciseDetails.aliases.slice(1).join(", ")}
                    </div>
                  </div>
                )}
                
                {/* 1RM Tracking */}
                <div>
                  <h3 className="athletic-body uppercase text-xs text-lime-400 mb-2">Tracking</h3>
                  <div className="athletic-body text-sm text-zinc-300">
                    {exerciseDetails.is1RMTracked ? (
                      <span className="text-lime-400">✓ 1RM tracking enabled</span>
                    ) : (
                      <span className="text-zinc-500">1RM tracking not recommended for this exercise</span>
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:wght@400;700&display=swap');

        .athletic-title {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .athletic-body {
          font-family: 'Roboto Condensed', sans-serif;
        }

        .clip-corner {
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
        }

        .clip-corner-bottom {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%);
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(163, 230, 53, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(163, 230, 53, 0.6);
          }
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .template-card {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .template-card:hover {
          transform: translateY(-4px);
          border-color: rgb(163, 230, 53);
        }

        .template-card:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <h1 className="athletic-title text-5xl mb-2 text-lime-400">Templates</h1>
        <p className="athletic-body text-zinc-500 uppercase text-sm">
          Your training blueprints
        </p>
      </div>

      {/* Create Template CTA */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full clip-corner bg-gradient-to-br from-lime-400 to-lime-500 text-black p-6 mb-8 hover:from-lime-300 hover:to-lime-400 active:scale-98 transition-all pulse-glow"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="athletic-title text-2xl mb-1">Create Template</div>
            <div className="athletic-body text-sm opacity-80">Build a new workout plan</div>
          </div>
          <Plus className="w-8 h-8" />
        </div>
      </button>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template, idx) => (
          <button
            key={template._id}
            onClick={() => setSelectedTemplate(template._id)}
            className="template-card fade-in clip-corner bg-zinc-900 border-2 border-zinc-800 p-6 text-left"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 clip-corner bg-lime-400/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-lime-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600" />
            </div>

            <h3 className="athletic-title text-2xl mb-2">{template.name}</h3>

            {template.category && (
              <div className="inline-block px-3 py-1 bg-black border border-zinc-800 athletic-body text-xs uppercase text-lime-400 mb-3">
                {template.category}
              </div>
            )}

            <div className="athletic-body text-sm text-zinc-500 mt-4">
              Tap to edit
            </div>
          </button>
        ))}
      </div>

      {templates && templates.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 clip-corner bg-zinc-900 mx-auto mb-6 flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-zinc-700" />
          </div>
          <p className="athletic-title text-3xl text-zinc-700 mb-2">
            No Templates Yet
          </p>
          <p className="athletic-body text-zinc-600">
            Create your first workout template to get started
          </p>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 clip-corner border-2 border-lime-400">
            <div className="border-b-2 border-lime-400 bg-zinc-950 p-4 flex items-center justify-between">
              <h2 className="athletic-title text-xl">New Template</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-6">
              <div>
                <label className="athletic-body uppercase text-xs text-lime-400 block mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  autoFocus
                  className="w-full bg-black border-2 border-zinc-800 focus:border-lime-400 px-4 py-3 athletic-body text-lg outline-none transition-colors"
                  placeholder="Push Day A"
                />
              </div>

              <div>
                <label className="athletic-body uppercase text-xs text-lime-400 block mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["push", "pull", "legs", "upper", "lower", "full_body"].map((cat) => (
                    <label key={cat} className="relative">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        className="peer sr-only"
                      />
                      <div className="clip-corner bg-zinc-950 border-2 border-zinc-800 px-4 py-3 cursor-pointer peer-checked:border-lime-400 peer-checked:bg-lime-400/10 transition-all athletic-body text-sm uppercase text-center">
                        {cat.replace("_", " ")}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full clip-corner-bottom bg-lime-400 text-black px-6 py-4 athletic-title text-xl hover:bg-lime-300 active:scale-98 transition-transform"
              >
                Create Template
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Exercise Details Modal */}
      {showExerciseDetails && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4" onClick={() => setShowExerciseDetails(null)}>
          <div className="w-full max-w-2xl bg-zinc-900 clip-corner border-2 border-lime-400" onClick={(e) => e.stopPropagation()}>
            <div className="border-b-2 border-lime-400 bg-zinc-950 p-4 flex items-center justify-between">
              <h2 className="athletic-title text-2xl">{exerciseDetails ? exerciseDetails.name : "Loading..."}</h2>
              <button
                onClick={() => setShowExerciseDetails(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {!exerciseDetails ? (
              <div className="p-6 text-center athletic-body text-zinc-400">
                Loading exercise details...
              </div>
            ) : (
            <div className="p-6 space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-lime-400/20 text-lime-400 athletic-body uppercase text-xs border border-lime-400/30">
                  {exerciseDetails.category}
                </span>
                <span className="px-3 py-1 bg-zinc-800 text-lime-400 athletic-body uppercase text-xs">
                  {exerciseDetails.equipmentType}
                </span>
                <span className="px-3 py-1 bg-zinc-800 text-blue-400 athletic-body uppercase text-xs">
                  {exerciseDetails.movementPattern.replace(/_/g, ' ')}
                </span>
              </div>
              
              {/* Muscle Groups */}
              <div>
                <h3 className="athletic-body uppercase text-xs text-lime-400 mb-2">Target Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  {exerciseDetails.muscleGroups.map((mg: string) => (
                    <span key={mg} className="px-3 py-1 bg-zinc-800 text-white athletic-body text-sm">
                      {mg}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Aliases */}
              {exerciseDetails.aliases.length > 1 && (
                <div>
                  <h3 className="athletic-body uppercase text-xs text-lime-400 mb-2">Also known as</h3>
                  <div className="athletic-body text-zinc-400 text-sm">
                    {exerciseDetails.aliases.slice(1).join(", ")}
                  </div>
                </div>
              )}
              
              {/* 1RM Tracking */}
              <div>
                <h3 className="athletic-body uppercase text-xs text-lime-400 mb-2">Tracking</h3>
                <div className="athletic-body text-sm text-zinc-300">
                  {exerciseDetails.is1RMTracked ? (
                    <span className="text-lime-400">✓ 1RM tracking enabled</span>
                  ) : (
                    <span className="text-zinc-500">1RM tracking not recommended for this exercise</span>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] animate-slide-in">
          <div className={`clip-corner px-6 py-4 athletic-body ${
            toast.type === "success" ? "bg-lime-400 text-black" : "bg-red-500 text-white"
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
