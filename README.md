# Next-Gen Fitness Platform

> Where training data, intelligence, and coaching merge.

A modern fitness tracking platform built with Next.js, Convex, and AI-powered coaching.

**🤖 For Claude Code:** Start with [CURRENT_STATE.md](./docs/CURRENT_STATE.md) for complete app status & implementation details.

---

## 🎯 Vision

The future of the fitness industry — where training data, intelligence, and coaching merge into an active partner in your athletic development, not just a passive log.

---

## ✨ Features

### ✅ Currently Implemented

- **WorkOS Authentication** - Secure email + OAuth sign-in
- **User Onboarding** - Experience level and preference setup
- **Protected Routes** - Middleware-based auth checks
- **App Shell** - Sidebar navigation with dark athletic aesthetic
- **Convex Backend** - Real-time database with 10 tables
- **Type-Safe** - Full TypeScript throughout
- **Workout Templates** - Create, edit, duplicate, and delete reusable workout plans
- **Exercise Library** - 471 standardized exercises with images, muscle groups, equipment types
- **Smart Search** - Autocomplete with keyboard navigation, popular/recent suggestions
- **Session Logging** - Track sets, reps, weight with warmup mode
- **Personal Records** - Automatic PR detection with fireworks celebration
- **Progress Tracking** - Estimated 1RM calculation (Brzycki formula)
- **Dashboard** - Recent workouts with PR indicators and volume metrics
- **Rest Timer** - Automatic timer with skip option based on template settings

### 🚧 Coming Soon

- **Analytics Dashboard** - Volume trends, progression charts, plateau detection
- **AI Coach (Gemini)** - Workout programming and form advice
- **Exercise Videos** - Embedded video playback in details modal
- **Social Features** - Share templates, follow friends
- **Advanced Filtering** - Filter exercises by muscle group, equipment, movement pattern

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router) + TypeScript |
| **Backend** | Convex (real-time database) |
| **Auth** | WorkOS (Email + OAuth) |
| **AI** | Google Gemini API |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- WorkOS account ([sign up free](https://workos.com))
- Convex account ([sign up free](https://convex.dev))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see SETUP.md)

# Start Convex dev server (Terminal 1)
npm run convex:dev

# Start Next.js dev server (Terminal 2)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

**📖 Full setup guide:** See [SETUP.md](./docs/SETUP.md) for detailed instructions.

---

## 📂 Project Structure

```
ycHereICome/
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema (10 tables)
│   ├── users.ts             # User queries & mutations
│   ├── ARCHITECTURE.md      # Design documentation
│   └── ERD.md               # Entity relationship diagram
│
├── src/
│   ├── app/
│   │   ├── (app)/           # Protected routes
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── workouts/    # Workout management
│   │   │   ├── analytics/   # Progress tracking
│   │   │   ├── ai/          # AI coach
│   │   │   └── settings/    # User settings
│   │   ├── api/auth/        # Auth endpoints
│   │   ├── login/           # Login page
│   │   └── onboarding/      # First-time setup
│   │
│   ├── components/
│   │   ├── auth/            # Auth components
│   │   ├── layout/          # Sidebar, Header
│   │   └── onboarding/      # Onboarding flow
│   │
│   ├── lib/
│   │   ├── convex.ts        # Convex client
│   │   ├── workos.ts        # WorkOS helpers
│   │   └── session.ts       # Session management
│   │
│   └── middleware.ts        # Route protection
│
├── SETUP.md                 # Setup instructions
├── CLAUDE.md                # AI development guidelines
└── README.md                # This file
```

---

## 📊 Database Schema

10 Convex tables with 21 indexes optimized for fitness tracking:

```
users               → User profiles and preferences
workoutTemplates    → Reusable workout plans
templateExercises   → Exercises within templates (ordered)
workoutSessions     → Immutable workout logs
sessionExercises    → Exercises performed in a session
sets                → Individual set data (weight × reps)
exerciseLibrary     → Standardized exercise definitions
personalRecords     → PR tracking (1RM, max volume, etc.)
volumeMetrics       → Pre-computed analytics data
aiInteractions      → AI conversation history
```

**Design highlights:**
- Immutable workout logs for accurate historical tracking
- Denormalization for query performance
- Optional exercise standardization (flexible input)
- Pre-computed metrics for instant dashboard loads

**Full documentation:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 🔐 Authentication Flow

```
User visits /
  → Redirects to /login
    → WorkOS authentication
      → Callback to /api/auth/callback
        → Session created
          → First-time user: /onboarding
          → Returning user: /dashboard
```

All routes under `(app)` are protected by middleware. Session stored in secure httpOnly cookies.

---

## 🎨 Design Philosophy

### Athletic Aesthetic
- Dark mode with zinc/black palette
- Clean, confident typography
- Mobile-first responsive design
- Zero clutter for in-gym use

### User Experience
- Fast interactions (no loading spinners where possible)
- Progressive disclosure (show relevant info only)
- Immediate feedback (optimistic updates via Convex)
- Intelligent defaults (reduce configuration burden)

### Data Integrity
- Append-only workout logs (history never changes)
- Automatic PR detection (motivational)
- Plateau alerts (proactive coaching)
- Evidence-based programming (no bro science)

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Deploy to Vercel (auto-detects Next.js)
vercel

# Deploy Convex to production
npm run convex:deploy
```

**Environment variables:** Add all `.env.local` vars to Vercel dashboard.

**Full guide:** [SETUP.md#deployment-to-vercel](./SETUP.md#deployment-to-vercel)

---

## 📝 Development Workflow

### Adding Features

1. **Update Convex schema** → `convex/schema.ts`
2. **Create mutations/queries** → `convex/[feature].ts`
3. **Build UI components** → `src/components/[feature]/`
4. **Add routes** → `src/app/(app)/[feature]/`
5. **Test locally** → `npm run dev`

### Making Schema Changes

Convex dev server watches for changes:
1. Edit `convex/schema.ts`
2. Save file
3. Types auto-regenerate in `convex/_generated`
4. No manual migrations needed

---

## 📚 Documentation

All documentation is now organized in the [`/docs`](./docs) folder:

| Document | Purpose |
|----------|---------|
| [**CURRENT_STATE.md**](./docs/CURRENT_STATE.md) | **📍 Current app status & features** |
| [SETUP.md](./docs/SETUP.md) | Complete setup instructions |
| [CLAUDE.md](./docs/CLAUDE.md) | AI development guidelines |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Database design rationale |
| [ERD.md](./docs/ERD.md) | Visual schema diagrams |
| [README.md](./docs/README.md) | Convex quick reference |
| [EXERCISE_LIBRARY_INTEGRATION.md](./docs/EXERCISE_LIBRARY_INTEGRATION.md) | Exercise library setup guide |
| [FIXES_APPLIED.md](./docs/FIXES_APPLIED.md) | Historical bug fixes |

---

## 🛠️ Troubleshooting

### Common Issues

**"WORKOS_API_KEY is not set"**
- Create `.env.local` from `.env.example`
- Restart Next.js dev server

**Types not found**
- Ensure `npx convex dev` is running
- Restart VS Code TypeScript server

**Auth redirect loop**
- Clear browser cookies for localhost:3000
- Check WorkOS redirect URI matches exactly

**Full troubleshooting guide:** [SETUP.md#troubleshooting](./docs/SETUP.md#troubleshooting)

---

**Questions?** See [SETUP.md](./docs/SETUP.md) or check the [documentation](./docs).
