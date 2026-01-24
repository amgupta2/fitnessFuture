# CLAUDE.md — Next-Gen Fitness Platform Spec

> **📍 NEW:** For current app status, features, and implementation details, see [CURRENT_STATE.md](./CURRENT_STATE.md)

## 1. Role & Vision
**Role:** Principal Full-Stack Engineer & Product Designer.
**Vision:** "The future of the fitness industry — where training data, intelligence, and coaching merge."
**Philosophy:** Every technical and UX decision must prioritize **consistency**, **progress**, **intelligence**, and **long-term athletic development**. It should feel like an active partner in training, not just a passive log.

---

## 2. Tech Stack (Strict)
| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router, TypeScript) |
| **Deployment** | Vercel |
| **Auth** | WorkOS (Email + OAuth) |
| **Database & Backend** | Convex |
| **LLM** | Gemini API |
| **UI/UX** | "Frontend Design Skill" (Claude-Code Marketplace) |
| **Charts** | Lightweight React charting library |
| **Styling** | Modern, clean, mobile-first, dark-mode athletic aesthetic |

---

## 3. Domain Context (Real-World Standards)
The platform must adhere to professional fitness programming standards:
* **Progressive Overload:** Systematic increases in stress.
* **Metrics:** Volume tracking, 1RM estimation, and RPE/RIR.
* **Programming:** Hypertrophy vs. strength differentiation.
* **Progression:** Intelligent detection of plateaus and deload requirements.
* **Lifter Tiers:** Logic for Beginner → Intermediate → Advanced athletes.

---

## 4. Core Features (MVP)

### **Authentication & Security** ✅ IMPLEMENTED
* WorkOS integration for secure sign-on.
* Strict user isolation; users own their templates, logs, and analytics.

### **Workout Management** ✅ IMPLEMENTED
* **Templates:** Create unlimited "Push Day," "Upper A," etc., with ordered exercises.
  - ✅ Create, edit, duplicate, delete templates
  - ✅ Drag-to-reorder exercises (grip handle)
  - ✅ Edit exercise parameters (sets, reps, rest)
  - ✅ Exercise search with 471 standardized exercises
  - ✅ Smart defaults based on exercise type
* **Exercises:** Support for free-text names, standardized mapping, multiple sets, weight/reps, rest timers, and per-exercise notes.
  - ✅ Exercise library (Kaggle dataset)
  - ✅ Autocomplete search with keyboard navigation
  - ✅ Popular & recent exercises suggestions
  - ✅ Exercise details modal with images
* **Logging:** Historical performance tracking, session-over-session comparisons, and automatic PR highlighting.
  - ✅ Active workout session tracking
  - ✅ Rest timer with skip option
  - ✅ Warmup mode (excluded from progress)
  - ✅ Automatic PR detection with fireworks
  - ✅ Dashboard with recent workouts

### **Gemini AI Integration** ✅ FULLY IMPLEMENTED
* **Programmer:** Generate complete workout splits (e.g., "4-day hypertrophy") based on experience level.
  - ✅ Chat interface with conversational UI
  - ✅ Context-aware responses (experience, templates, workouts)
  - ✅ Clarifying questions when info incomplete
  - ✅ Full template generation with exercises, sets, reps, rest
  - ✅ Automatic template creation saved to account
  - ✅ Exercise matching to standardized library
  - ✅ Structured output validation with fallbacks
  - ✅ Streaming responses with visual indicators
* **Trainer:** Answer technical questions (e.g., "Why is my bench stalling?") with cues and muscle focus.
  - ✅ Automatic intent detection (question vs program request)
  - ✅ Enhanced context (workout history, recent performance, training stats)
  - ✅ Actionable cues and technique advice
  - ✅ Target muscle breakdowns
  - ✅ Common mistakes and progressions
  - ✅ YouTube and article recommendations
  - ✅ Evidence-based, concise responses
  - ✅ Streaming text responses
* **Context:** AI reads user templates and logs to provide personalized, evidence-based guidance.
  - ✅ User context injection (experience, current templates, recent workouts)
  - ✅ Training context (recent exercises, avg performance, frequency, total volume)
  - ✅ Conversation history stored in `aiInteractions` table

### **Analytics Dashboard** ✅ IMPLEMENTED
* **Progress Tracking:** Volume over time and weight progression trends.
  - ✅ Volume over time chart with daily tracking
  - ✅ Exercise-specific progression tracking
  - ✅ Estimated 1RM calculations (Epley formula)
  - ✅ PR tracking with recent records list
* **Filters:** Configurable time ranges (7d, 30d, 90d, 1y).
  - ✅ Time range selector with instant updates
  - ✅ Exercise selector for progression tracking
* **Plateau Detection:** Automatically identifies exercises with less than 2.5% improvement.
  - ✅ Multi-session analysis
  - ✅ Visual plateau alerts with recommendations
* **Stats Cards:** Quick overview metrics for total volume, workouts, sets, and PRs.
* **Mobile-First:** Clean, responsive design optimized for all screen sizes.

---

## 5. Architecture & Design Requirements



### **Clean Engineering**
* **Schema:** Clean Convex schema with strong TypeScript typing.
* **Separation of Concerns:** Clear boundaries between UI, Data, and AI logic.
* **Folder Structure:** Production-ready organization with robust error handling.

### **UX Direction**
* **Athletic Aesthetic:** Clean, confident, and mobile-first.
* **Fast Interaction:** Designed for use in the heat of a workout—zero clutter.
* **Visualizations:** Use charts that highlight progress at a glance.

---

## 6. Required Credentials & Secrets (Pause Protocol)
The build process **must pause** and report back to the user before proceeding with any feature requiring the following:

* **WorkOS:** Client ID, API Key, and Redirect URIs.
* **Convex:** Deployment URL and Project Name.
* **Gemini:** Google AI Studio API Key.
* **Vercel:** Deployment tokens or environment variable sync.

**Process:** If a secret or login is missing, the AI will provide the specific `.env` key required and wait for user confirmation/input before continuing implementation.

---

## 7. Output Expectation
Deliver a working MVP scaffolded in Next.js, featuring Convex schemas/mutations, WorkOS auth, and a clean Gemini integration, ready for Vercel deployment.