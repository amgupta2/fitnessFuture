"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Upload,
  Video,
  ChevronDown,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock,
  Dumbbell,
  RotateCcw,
  Save,
  History,
} from "lucide-react";

// Must match the keys in FORM_CHECK_EXERCISES in gemini.ts
const EXERCISES = [
  { id: "barbell_back_squat", label: "Barbell Back Squat" },
  { id: "barbell_bench_press", label: "Barbell Bench Press" },
  { id: "conventional_deadlift", label: "Conventional Deadlift" },
  { id: "barbell_row", label: "Barbell Bent-Over Row" },
  { id: "overhead_press", label: "Overhead Press (Barbell)" },
] as const;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_DURATION = 30;

type AnalysisState = "idle" | "uploading" | "analyzing" | "done" | "error";

interface PastAnalysis {
  _id: string;
  exerciseName: string;
  analysis: string;
  formScore?: number;
  videoFileName: string;
  createdAt: number;
}

function extractFormScore(text: string): number | undefined {
  const match = text.match(/Form Score:\s*(\d+)\s*\/\s*10/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractIssues(text: string): string[] {
  const issues: string[] = [];
  const pattern = /\*\*(.+?)\*\*\s*\(Timestamp/g;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    issues.push(m[1]);
  }
  return issues;
}

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-red-500/20 text-red-400 ring-red-500/30";
  if (score >= 8) color = "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30";
  else if (score >= 6) color = "bg-amber-500/20 text-amber-400 ring-amber-500/30";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ring-1 ${color}`}>
      {score}/10
    </span>
  );
}

function VideoPreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const videoUrl = useRef<string | null>(null);
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const u = URL.createObjectURL(file);
    videoUrl.current = u;
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black border border-zinc-800">
      <video
        src={url}
        controls
        className="w-full max-h-[360px] object-contain"
        playsInline
      />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-xs text-zinc-300">
        {(file.size / (1024 * 1024)).toFixed(1)} MB
      </div>
    </div>
  );
}

function HistoryCard({ item }: { item: PastAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const exerciseLabel =
    EXERCISES.find((e) => e.id === item.exerciseName)?.label ??
    item.exerciseName;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Dumbbell className="w-4 h-4 text-zinc-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{exerciseLabel}</p>
            <p className="text-xs text-zinc-500">
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.formScore != null && <ScoreBadge score={item.formScore} />}
          <ChevronDown
            className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800/60 pt-3">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {item.analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormCheckPage() {
  const user = useCurrentUser();

  const [selectedExercise, setSelectedExercise] = useState<string>(EXERCISES[0].id);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [analysisText, setAnalysisText] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const saveFormAnalysis = useMutation(api.formAnalysis.saveFormAnalysis);
  const pastAnalyses = useQuery(
    api.formAnalysis.getFormAnalyses,
    user ? { userId: user._id, limit: 20 } : "skip"
  ) as PastAnalysis[] | undefined;

  const trainingContext = useQuery(
    api.ai.getTrainingContextForAI,
    user ? { userId: user._id } : "skip"
  );

  const validateVideo = useCallback(
    (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
        if (file.size > MAX_FILE_SIZE) {
          resolve(`Video must be under ${MAX_FILE_SIZE / (1024 * 1024)} MB (yours is ${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
          return;
        }

        const allowed = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
        if (!allowed.includes(file.type)) {
          resolve("Unsupported format. Please use MP4, WebM, or MOV.");
          return;
        }

        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > MAX_DURATION) {
            resolve(`Video must be ${MAX_DURATION} seconds or shorter (yours is ${Math.round(video.duration)}s). Trim it and try again.`);
          } else {
            resolve(null);
          }
        };
        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          resolve("Could not read video metadata. Please try a different file.");
        };
        video.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setValidationError(null);
      const error = await validateVideo(file);
      if (error) {
        setValidationError(error);
        return;
      }
      setVideoFile(file);
      setAnalysisState("idle");
      setAnalysisText("");
      setSavedId(null);
    },
    [validateVideo]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleAnalyze = async () => {
    if (!videoFile || !user) return;

    setAnalysisState("uploading");
    setAnalysisText("");
    setSavedId(null);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("exercise", selectedExercise);
    if (trainingContext) {
      formData.append("userContext", JSON.stringify(trainingContext));
    }

    try {
      setAnalysisState("analyzing");

      const response = await fetch("/api/ai/form-check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulated += data.chunk;
                setAnalysisText(accumulated);
              }
              if (data.done && data.text) {
                accumulated = data.text;
                setAnalysisText(accumulated);
              }
              if (data.error) {
                throw new Error(data.text || data.error);
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }
      }

      setAnalysisState("done");

      // Auto-scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error("Form check error:", err);
      setAnalysisState("error");
      setAnalysisText(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const handleSave = async () => {
    if (!user || !analysisText || savedId) return;

    const score = extractFormScore(analysisText);
    const issues = extractIssues(analysisText);

    const id = await saveFormAnalysis({
      userId: user._id,
      exerciseName: selectedExercise,
      analysis: analysisText,
      formScore: score,
      issuesFound: issues.length > 0 ? issues : undefined,
      videoFileName: videoFile?.name ?? "video",
    });

    setSavedId(id);
  };

  const handleReset = () => {
    setVideoFile(null);
    setAnalysisState("idle");
    setAnalysisText("");
    setValidationError(null);
    setSavedId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Form Check</h1>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const formScore = analysisText ? extractFormScore(analysisText) : undefined;

  return (
    <div className="p-6 pb-24 lg:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Form Check</h1>
            <p className="text-zinc-400 text-sm">
              Upload a video of your lift and get AI-powered form analysis
            </p>
          </div>
          {pastAnalyses && pastAnalyses.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                showHistory
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          )}
        </div>

        {/* History panel */}
        {showHistory && pastAnalyses && pastAnalyses.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Past Analyses
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {pastAnalyses.map((item) => (
                <HistoryCard key={item._id} item={item as PastAnalysis} />
              ))}
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Exercise selector */}
          <div className="p-5 border-b border-zinc-800/60">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Exercise
            </label>
            <div className="relative">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                disabled={analysisState === "analyzing"}
                className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-lime-500/40 focus:border-lime-500/40 transition-colors disabled:opacity-50"
              >
                {EXERCISES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Video upload area */}
          <div className="p-5">
            {!videoFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-10 text-center cursor-pointer transition-colors group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-300">
                      Drop your video here or tap to browse
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      MP4, WebM, or MOV &middot; Max 20 MB &middot; Max 30 seconds
                    </p>
                  </div>
                  {/* Mobile camera capture */}
                  <p className="text-xs text-zinc-600 mt-1 sm:hidden">
                    Or record directly from your camera
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <VideoPreview
                  file={videoFile}
                  onRemove={handleReset}
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={
                      analysisState === "analyzing" ||
                      analysisState === "uploading"
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analysisState === "analyzing" ||
                    analysisState === "uploading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : analysisState === "done" ? (
                      <>
                        <RotateCcw className="w-5 h-5" />
                        Re-Analyze
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5" />
                        Analyze Form
                      </>
                    )}
                  </button>

                  {analysisState === "done" && !savedId && (
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  )}

                  {savedId && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Saved
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Validation error */}
            {validationError && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Analysis results */}
        {(analysisState === "analyzing" || analysisText) && (
          <div ref={resultRef} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/60">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Analysis</h2>
                {analysisState === "analyzing" && (
                  <span className="flex items-center gap-1.5 text-xs text-lime-400 bg-lime-500/10 px-2.5 py-1 rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing
                  </span>
                )}
              </div>
              {analysisState === "done" && formScore != null && (
                <ScoreBadge score={formScore} />
              )}
            </div>
            <div className="p-5">
              {analysisState === "error" ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{analysisText}</span>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-h2:text-xl prose-h3:text-base prose-strong:text-white prose-li:text-zinc-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisText || "Waiting for first response..."}
                  </ReactMarkdown>
                  {analysisState === "analyzing" && (
                    <span className="inline-block w-2 h-4 bg-lime-400 animate-pulse rounded-sm ml-0.5 align-text-bottom" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tips card */}
        {analysisState === "idle" && !videoFile && (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Tips for best results
            </h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-zinc-600" />
                Record 1-3 reps (10-20 seconds is ideal)
              </li>
              <li className="flex items-start gap-2">
                <Video className="w-4 h-4 shrink-0 mt-0.5 text-zinc-600" />
                Film from the side at hip height for squats and deadlifts
              </li>
              <li className="flex items-start gap-2">
                <Video className="w-4 h-4 shrink-0 mt-0.5 text-zinc-600" />
                Film from a 45-degree angle for bench press
              </li>
              <li className="flex items-start gap-2">
                <Dumbbell className="w-4 h-4 shrink-0 mt-0.5 text-zinc-600" />
                Use a working weight (not max effort) for clearer form assessment
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
