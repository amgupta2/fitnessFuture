"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, useEffect } from "react";
import { Check, Timer, Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import { ProgressionSuggestion } from "@/components/workout/ProgressionSuggestion";
import { ProgressionBadge } from "@/components/workout/ProgressionBadge";

export default function WorkoutActivePage() {
  const user = useCurrentUser();
  const router = useRouter();
  const activeSession = useQuery(
    api.sessions.getActiveSession,
    user ? { userId: user._id } : "skip"
  );
  const logSet = useMutation(api.sessions.logSet);
  const completeSession = useMutation(api.sessions.completeSession);

  const [currentExerciseId, setCurrentExerciseId] = useState<Id<"sessionExercises"> | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isWarmup, setIsWarmup] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [restTimerTotal, setRestTimerTotal] = useState(90); // Track total rest time for progress bar
  const [isResting, setIsResting] = useState(false);
  const [prCelebration, setPrCelebration] = useState(false);

  // Auto-select first exercise
  useEffect(() => {
    if (activeSession?.exercises && activeSession.exercises.length > 0 && !currentExerciseId) {
      setCurrentExerciseId(activeSession.exercises[0]._id);
    }
  }, [activeSession, currentExerciseId]);

  // Rest timer countdown
  useEffect(() => {
    if (!isResting || restTimer <= 0) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const currentExercise = activeSession?.exercises.find(
    (ex) => ex._id === currentExerciseId
  );

  // Get progression suggestion for current exercise
  const progressionSuggestion = useQuery(
    api.progression.getProgressionSuggestion,
    currentExercise && user && currentExercise.targetSets !== undefined
      ? {
          userId: user._id,
          exerciseName: currentExercise.exerciseName,
          targetSets: currentExercise.targetSets,
          targetRepsMin: currentExercise.targetRepsMin ?? 8,
          targetRepsMax: currentExercise.targetRepsMax ?? 12,
        }
      : "skip"
  );

  // Get progression streak for current exercise
  const progressionStreak = useQuery(
    api.progression.getProgressionStreak,
    currentExercise && user
      ? {
          userId: user._id,
          exerciseName: currentExercise.exerciseName,
        }
      : "skip"
  );

  const handleLogSet = async () => {
    if (!currentExerciseId || !weight || !reps) return;

    const setNumber = (currentExercise?.sets.length || 0) + 1;

    const result = await logSet({
      sessionExerciseId: currentExerciseId,
      setNumber,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      isWarmup,
    });

    // Trigger PR celebration if it's a PR
    if (result.isPR) {
      setPrCelebration(true);
      setTimeout(() => setPrCelebration(false), 3000);
    }

    // Start rest timer (get from template or default)
    const restSeconds = currentExercise?.restSeconds || 90;
    setRestTimer(restSeconds);
    setRestTimerTotal(restSeconds);
    setIsResting(true);

    // Clear inputs
    setWeight("");
    setReps("");
    setIsWarmup(false);
  };

  const handleFinishWorkout = async () => {
    if (!activeSession) return;

    await completeSession({ sessionId: activeSession._id });
    router.push("/workouts");
  };

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:wght@400;700&display=swap');
        `}</style>
        <div className="text-center">
          <p className="text-2xl" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            No Active Workout
          </p>
          <button
            onClick={() => router.push("/workouts")}
            className="mt-4 px-6 py-3 bg-lime-400 text-black"
            style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
          >
            Start a Workout
          </button>
        </div>
      </div>
    );
  }

  // Only count working sets (non-warmup) for progress
  const progress = currentExercise?.sets.filter(s => !s.isWarmup).length || 0;
  const targetSets = currentExercise?.targetSets || 3;

  return (
    <div className="min-h-screen bg-black text-white pb-32">
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
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
        }

        @keyframes prPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          25% {
            transform: scale(1.05) rotate(-2deg);
            filter: brightness(1.2);
          }
          75% {
            transform: scale(1.05) rotate(2deg);
            filter: brightness(1.2);
          }
        }

        .pr-celebration {
          animation: prPulse 0.6s ease-in-out 3;
        }

        @keyframes timerPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .timer-active {
          animation: timerPulse 1s ease-in-out infinite;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
          height: 60px;
        }

        .mega-input {
          font-size: 48px;
          text-align: center;
          -moz-appearance: textfield;
        }

        .mega-input::-webkit-inner-spin-button,
        .mega-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
        }

        @keyframes firework {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y));
            opacity: 0;
          }
        }

        .firework {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: firework 1s ease-out forwards;
        }

        .firework-container {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        @keyframes burst {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .firework-burst {
          position: absolute;
          animation: burst 0.8s ease-out;
        }
      `}</style>

      {/* PR Celebration Overlay */}
      {prCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Fireworks */}
          <div className="firework-container">
            {/* Multiple firework bursts */}
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const distance = 150 + Math.random() * 100;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              const delay = Math.random() * 0.5;
              const color = ['#a3e635', '#ffffff', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 4)];
              
              return (
                <div
                  key={`fw1-${i}`}
                  className="firework"
                  style={{
                    left: '30%',
                    top: '30%',
                    backgroundColor: color,
                    animationDelay: `${delay}s`,
                    '--x': `${x}px`,
                    '--y': `${y}px`,
                  } as React.CSSProperties}
                />
              );
            })}
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const distance = 150 + Math.random() * 100;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              const delay = Math.random() * 0.5 + 0.3;
              const color = ['#a3e635', '#ffffff', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 4)];
              
              return (
                <div
                  key={`fw2-${i}`}
                  className="firework"
                  style={{
                    left: '70%',
                    top: '30%',
                    backgroundColor: color,
                    animationDelay: `${delay}s`,
                    '--x': `${x}px`,
                    '--y': `${y}px`,
                  } as React.CSSProperties}
                />
              );
            })}
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const distance = 150 + Math.random() * 100;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              const delay = Math.random() * 0.5 + 0.6;
              const color = ['#a3e635', '#ffffff', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 4)];
              
              return (
                <div
                  key={`fw3-${i}`}
                  className="firework"
                  style={{
                    left: '50%',
                    top: '70%',
                    backgroundColor: color,
                    animationDelay: `${delay}s`,
                    '--x': `${x}px`,
                    '--y': `${y}px`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>

          {/* Main celebration card */}
          <div className="pr-celebration bg-lime-400 text-black px-12 py-8 clip-corner relative z-10">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <p className="athletic-title text-5xl">NEW PR!</p>
          </div>
        </div>
      )}

      {/* Rest Timer */}
      {isResting && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-lime-400 text-black">
          <div className="p-6 text-center timer-active relative">
            <button
              onClick={() => {
                setIsResting(false);
                setRestTimer(0);
              }}
              className="absolute top-4 right-4 athletic-body uppercase text-xs px-3 py-2 bg-black text-lime-400 hover:bg-zinc-900 active:scale-95 transition-all"
            >
              Skip
            </button>
            <div className="athletic-title text-6xl mb-2">{restTimer}</div>
            <div className="athletic-body uppercase text-sm">Rest</div>
          </div>
          <div
            className="h-1 bg-black transition-all duration-1000"
            style={{
              width: `${((restTimerTotal - restTimer) / restTimerTotal) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className={`border-b-2 border-lime-400 bg-zinc-950 sticky top-0 z-30 ${isResting ? 'mt-24' : ''}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="athletic-title text-xl">{activeSession.templateName}</h1>
            <button
              onClick={handleFinishWorkout}
              className="athletic-body uppercase text-xs text-lime-400 px-4 py-2 border border-lime-400 hover:bg-lime-400 hover:text-black transition-colors"
            >
              Finish
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {activeSession.exercises.map((exercise) => (
              <button
                key={exercise._id}
                onClick={() => setCurrentExerciseId(exercise._id)}
                className={`athletic-body text-sm px-4 py-2 whitespace-nowrap transition-colors ${
                  currentExerciseId === exercise._id
                    ? 'bg-lime-400 text-black'
                    : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {exercise.exerciseName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <div className="p-4">
          {/* Exercise Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="athletic-title text-4xl">
                {currentExercise.exerciseName}
              </h2>
              {progressionStreak && progressionStreak.streak > 0 && (
                <ProgressionBadge
                  status="improved"
                  streak={progressionStreak.streak}
                />
              )}
            </div>
            <div className="flex gap-4 athletic-body text-zinc-500">
              <span>Set {progress + 1} of {targetSets}</span>
            </div>
          </div>

          {/* Progression Suggestion */}
          {progressionSuggestion?.hasHistory && progressionSuggestion.suggestion && progress === 0 && (
            <ProgressionSuggestion
              suggestion={progressionSuggestion.suggestion}
              confidence={progressionSuggestion.confidence}
              reasoning={progressionSuggestion.reasoning}
              lastSession={progressionSuggestion.lastSession}
            />
          )}

          {/* Previous Sets */}
          {currentExercise.sets.length > 0 && (
            <div className="mb-6 space-y-2">
              {currentExercise.sets.map((set, idx) => {
                // Calculate working set number (excluding warmups)
                const workingSets = currentExercise.sets.slice(0, idx).filter(s => !s.isWarmup);
                const setLabel = set.isWarmup 
                  ? '🔥 Warmup' 
                  : `Set ${workingSets.length + 1}`;
                
                return (
                  <div
                    key={set._id}
                    className={`clip-corner bg-zinc-900 p-4 flex items-center justify-between ${
                      set.isPR ? 'border-2 border-lime-400' : ''
                    } ${set.isWarmup ? 'opacity-75' : ''}`}
                  >
                    <div className="athletic-body text-zinc-500">{setLabel}</div>
                    <div className="flex gap-6 athletic-title text-xl">
                      <span>{set.weight} lbs</span>
                      <span>×</span>
                      <span>{set.reps} reps</span>
                    </div>
                    {set.isPR && (
                      <Trophy className="w-5 h-5 text-lime-400" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Input Area */}
          <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-lime-400 p-6">
            {/* Warmup Toggle */}
            <button
              onClick={() => setIsWarmup(!isWarmup)}
              className={`w-full mb-4 px-4 py-2 athletic-body text-sm uppercase transition-colors ${
                isWarmup
                  ? 'bg-zinc-800 text-lime-400 border-2 border-lime-400'
                  : 'bg-zinc-900 text-zinc-500 border-2 border-zinc-800'
              }`}
            >
              {isWarmup ? '🔥 Warmup Set' : 'Working Set'}
            </button>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="athletic-body uppercase text-xs text-lime-400 block mb-2 text-center">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mega-input w-full bg-zinc-900 border-2 border-zinc-800 focus:border-lime-400 py-4 athletic-title text-lime-400 outline-none"
                  placeholder="135"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="athletic-body uppercase text-xs text-lime-400 block mb-2 text-center">
                  Reps
                </label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="mega-input w-full bg-zinc-900 border-2 border-zinc-800 focus:border-lime-400 py-4 athletic-title text-lime-400 outline-none"
                  placeholder="10"
                  inputMode="numeric"
                />
              </div>
            </div>

            <button
              onClick={handleLogSet}
              disabled={!weight || !reps}
              className="w-full clip-corner bg-lime-400 text-black py-6 athletic-title text-3xl hover:bg-lime-300 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-8 h-8 inline mr-3 mb-1" />
              Log Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
