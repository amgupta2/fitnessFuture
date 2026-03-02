/**
 * AI Chat Interface Component
 * Handles workout generation conversations with Gemini
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import type { WorkoutProgramResponse } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  clarifyingQuestions?: string[];
  templatesGenerated?: number;
}

interface ChatInterfaceProps {
  userId: Id<"users">;
}

export default function ChatInterface({ userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI coach. I can help you with:\n\n**Training Questions:**\n- Form and technique advice\n- Plateau diagnosis and fixes\n- Exercise breakdowns\n- Program troubleshooting\n\n**Workout Creation:**\n- Personalized workout templates\n- Exercise selection\n- Sets, reps, and rest periods\n- Progressive overload plans\n\nJust ask me a question or describe what you need!",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRawStream, setShowRawStream] = useState(false); // Debug mode
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convex queries and mutations
  const userContext = useQuery(api.ai.getUserContextForAI, { userId });
  const trainingContext = useQuery(api.ai.getTrainingContextForAI, { userId });
  const saveInteraction = useMutation(api.ai.saveInteraction);
  const createTemplates = useMutation(api.ai.createTemplatesFromAI);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Detect if user is asking a question (trainer mode) vs requesting a program (programmer mode)
   */
  const detectIntentType = (text: string): "question" | "program" => {
    const lowerText = text.toLowerCase();
    
    // Question indicators
    const questionIndicators = [
      "how do i",
      "how to",
      "how can i",
      "why is",
      "why am i",
      "what",
      "when should",
      "should i",
      "can i",
      "is it",
      "are",
      "does",
      "help",
      "improve",
      "fix",
      "stalling",
      "stall",
      "plateau",
      "stuck",
      "form",
      "technique",
      "cue",
      "advice",
      "recommend",
      "better",
      "difference between",
      "vs",
      "muscle",
      "target",
      "?", // Contains question mark
    ];

    // Program request indicators
    const programIndicators = [
      "create",
      "design",
      "make",
      "generate",
      "build",
      "program",
      "split",
      "workout",
      "routine",
      "template",
      "days per week",
      "day split",
    ];

    // Check for question indicators
    const hasQuestionIndicator = questionIndicators.some((indicator) =>
      lowerText.includes(indicator)
    );

    // Check for program indicators
    const hasProgramIndicator = programIndicators.some((indicator) =>
      lowerText.includes(indicator)
    );

    // If has program indicators, it's a program request
    if (hasProgramIndicator && !hasQuestionIndicator) {
      return "program";
    }

    // If has question indicators or ends with ?, it's a question
    if (hasQuestionIndicator || lowerText.trim().endsWith("?")) {
      return "question";
    }

    // Default to question for ambiguous cases
    return "question";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !userContext || !trainingContext) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Detect intent: question or program request
    const intentType = detectIntentType(userMessage.content);
    console.log("Intent detected:", intentType, "for message:", userMessage.content);

    // Create streaming message placeholder
    const streamingMessageId = `assistant-${Date.now()}`;
    const streamingMessage: Message = {
      id: streamingMessageId,
      role: "assistant",
      content:
        intentType === "question"
          ? "🤔 Analyzing your question..."
          : "💭 Generating your workout program...",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, streamingMessage]);

    try {
      // Route to appropriate API based on intent
      const endpoint =
        intentType === "question"
          ? "/api/ai/advice-stream"
          : "/api/ai/generate-stream";
      
      const requestBody =
        intentType === "question"
          ? { question: userMessage.content, trainingContext }
          : { userPrompt: userMessage.content, userContext };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let chunkCount = 0;

      if (!reader) {
        throw new Error("No response body");
      }

      // Read stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.chunk) {
              accumulated += data.chunk;
              chunkCount++;

              // For questions (trainer mode), show streaming text
              if (intentType === "question") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: accumulated }
                      : msg
                  )
                );
              }
              // For programs (programmer mode), show thinking indicator
              else {
                if (showRawStream) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === streamingMessageId
                        ? { ...msg, content: accumulated }
                        : msg
                    )
                  );
                } else {
                  const dots = ".".repeat((chunkCount % 3) + 1);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === streamingMessageId
                        ? {
                            ...msg,
                            content: `💭 Generating your workout program${dots}`,
                          }
                        : msg
                    )
                  );
                }
              }
            }

            // Handle completion
            if (data.done) {
              // Training advice (plain text)
              if (data.text) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: data.text }
                      : msg
                  )
                );

                // Save interaction
                await saveInteraction({
                  userId,
                  type: "trainer",
                  prompt: userMessage.content,
                  response: data.text,
                  contextData: {
                    experienceLevel: trainingContext.experienceLevel,
                  },
                });

                break;
              }

              // Workout program (JSON)
              if (data.result) {
                const result: WorkoutProgramResponse = data.result;

                // Handle clarifying questions
                if (result.needsMoreInfo && result.clarifyingQuestions) {
                const finalContent = result.clarifyingQuestions.join("\n\n");

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? {
                          ...msg,
                          content: finalContent,
                          clarifyingQuestions: result.clarifyingQuestions,
                        }
                      : msg
                  )
                );

                // Save interaction
                await saveInteraction({
                  userId,
                  type: "programmer",
                  prompt: userMessage.content,
                  response: finalContent,
                  contextData: {
                    experienceLevel: userContext.experienceLevel,
                  },
                });
              }
              // Handle template generation
              else if (result.templates && result.templates.length > 0) {
                // Create templates in Convex
                const templateIds = await createTemplates({
                  userId,
                  templates: result.templates,
                });

                const summaryContent = `✅ **Templates Created!**\n\nI've created ${result.templates?.length ?? 0} workout template(s) for you:\n\n${result.templates
                  .map(
                    (t, idx) =>
                      `**${idx + 1}. ${t.name}**\n${t.description || ""}\n- ${t.exercises.length} exercises\n- ${t.category} workout`
                  )
                  .join("\n\n")}\n\nYou can find them in your **Workouts** page and start using them immediately!`;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === streamingMessageId
                      ? {
                          ...msg,
                          content: summaryContent,
                          templatesGenerated: result.templates?.length ?? 0,
                        }
                      : msg
                  )
                );

                // Save interaction with context
                await saveInteraction({
                  userId,
                  type: "programmer",
                  prompt: userMessage.content,
                  response: summaryContent,
                  contextData: {
                    templateIds: templateIds.map(
                      (id) => id as Id<"workoutTemplates">
                    ),
                    experienceLevel: userContext.experienceLevel,
                  },
                });
                }
                break;
              }
            }
          }
        }
      }

      // If we accumulated data but didn't get done signal
      if (accumulated && chunkCount > 0) {
        // For questions, accumulated is the final text
        if (intentType === "question") {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, content: accumulated }
                : msg
            )
          );

          // Save interaction
          await saveInteraction({
            userId,
            type: "trainer",
            prompt: userMessage.content,
            response: accumulated,
            contextData: {
              experienceLevel: trainingContext.experienceLevel,
            },
          });
        }
        // For programs, parse JSON manually
        else {
          try {
            const result: WorkoutProgramResponse = JSON.parse(accumulated);

          // Handle clarifying questions
          if (result.needsMoreInfo && result.clarifyingQuestions) {
            const finalContent = result.clarifyingQuestions.join("\n\n");

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? {
                      ...msg,
                      content: finalContent,
                      clarifyingQuestions: result.clarifyingQuestions,
                    }
                  : msg
              )
            );

            // Save interaction
            await saveInteraction({
              userId,
              type: "programmer",
              prompt: userMessage.content,
              response: finalContent,
              contextData: {
                experienceLevel: userContext.experienceLevel,
              },
            });
          }
          // Handle template generation
          else if (result.templates && result.templates.length > 0) {
            // Create templates in Convex
            const templateIds = await createTemplates({
              userId,
              templates: result.templates,
            });

            const summaryContent = `✅ **Templates Created!**\n\nI've created ${result.templates?.length ?? 0} workout template(s) for you:\n\n${result.templates
              .map(
                (t, idx) =>
                  `**${idx + 1}. ${t.name}**\n${t.description || ""}\n- ${t.exercises.length} exercises\n- ${t.category} workout`
              )
              .join("\n\n")}\n\nYou can find them in your **Workouts** page and start using them immediately!`;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? {
                      ...msg,
                      content: summaryContent,
                      templatesGenerated: result.templates?.length ?? 0,
                    }
                  : msg
              )
            );

            // Save interaction with context
            await saveInteraction({
              userId,
              type: "programmer",
              prompt: userMessage.content,
              response: summaryContent,
              contextData: {
                templateIds: templateIds.map(
                  (id) => id as Id<"workoutTemplates">
                ),
                experienceLevel: userContext.experienceLevel,
              },
            });
          }
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Accumulated JSON:", accumulated);

            // Show parsing error
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === streamingMessageId
                  ? {
                      ...msg,
                      content:
                        "⚠️ I generated a response but had trouble formatting it. Please try rephrasing your request.",
                    }
                  : msg
              )
            );
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);

      // Update streaming message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content:
                  "⚠️ Sorry, I encountered an error. Please try rephrasing your request or check your internet connection.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto" style={{ height: "calc(100dvh - 12rem)" }}>
      {/* Debug Toggle */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={() => setShowRawStream(!showRawStream)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Toggle raw JSON stream view (for debugging)"
        >
          {showRawStream ? "🐛 Debug: ON" : "🐛 Debug: OFF"}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-zinc-950 border border-zinc-800 rounded-t-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              {/* Message content with markdown rendering */}
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for markdown elements
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-2 mt-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mb-2 mt-3">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold mb-1 mt-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-2 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="ml-2">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-white">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="bg-zinc-700 px-1.5 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-zinc-700 p-3 rounded mb-2 overflow-x-auto">
                        {children}
                      </pre>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-zinc-600 pl-4 italic mb-2">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Metadata */}
              {message.templatesGenerated && (
                <div className="mt-2 pt-2 border-t border-zinc-700 text-sm text-zinc-400">
                  🎉 {message.templatesGenerated} template(s) added to your
                  account
                </div>
              )}

              <div className="text-xs text-zinc-500 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 text-zinc-100 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">💭</div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="border-x border-b border-zinc-800 bg-zinc-900 p-4 rounded-b-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or describe your workout goals..."
            disabled={isLoading || !userContext || !trainingContext}
            className="flex-1 bg-zinc-800 text-white border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !userContext || !trainingContext}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-zinc-500">Program Generation:</p>
            <div className="flex flex-wrap gap-2 max-w-full">
              <button
                type="button"
                onClick={() =>
                  setInput(
                    "Create a 4-day Push/Pull/Legs split for intermediate lifter focusing on hypertrophy"
                  )
                }
                className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors shrink-0"
              >
                💪 4-day PPL split
              </button>
              <button
                type="button"
                onClick={() =>
                  setInput(
                    "I'm a beginner, create a 3-day full body program for strength"
                  )
                }
                className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors shrink-0"
              >
                🏋️ Beginner full-body
              </button>
              <button
                type="button"
                onClick={() =>
                  setInput(
                    "Design a 5-day bodybuilding split for advanced lifter"
                  )
                }
                className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors shrink-0"
              >
                🔥 Advanced bodybuilding
              </button>
            </div>

            <p className="text-xs text-zinc-500 mt-3">Training Questions:</p>
            <div className="flex flex-wrap gap-2 max-w-full">
              <button
                type="button"
                onClick={() => setInput("How do I improve my squat depth?")}
                className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors shrink-0"
              >
                🤔 Improve squat depth
              </button>
              <button
                type="button"
                onClick={() => setInput("Why is my bench press stalling?")}
                className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors shrink-0"
              >
                📊 Diagnose plateau
              </button>
              <button
                type="button"
                onClick={() => setInput("What muscles does deadlift target?")}
                className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition-colors shrink-0"
              >
                💪 Muscle breakdown
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

