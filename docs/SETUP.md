# Next-Gen Fitness Platform - Setup Guide

Complete setup instructions for the authentication-ready fitness platform.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- WorkOS account (free tier available)
- Convex account (free tier available)
- Google AI Studio account (for Gemini API)

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages:
- Next.js 15+ with App Router
- Convex (backend & database)
- WorkOS (authentication)
- Recharts (analytics charts - ready for future use)
- Lucide React (icons)
- Google Generative AI (Gemini API - ready for future use)

---

## Step 2: Set Up WorkOS Authentication

### Create WorkOS Account

1. Go to https://dashboard.workos.com
2. Create a new organization or use existing
3. Navigate to **API Keys** section

### Get Credentials

| Variable | Where to Find |
|----------|---------------|
| `WORKOS_API_KEY` | Dashboard → API Keys → Copy your secret key |
| `WORKOS_CLIENT_ID` | Dashboard → Configuration → Client ID |

### Configure Redirect URI

1. In WorkOS Dashboard, go to **Redirects**
2. Add the following URLs:
   - Development: `http://localhost:3000/api/auth/callback`
   - Production: `https://yourdomain.com/api/auth/callback` (add when deploying)

### Enable Authentication Methods

1. Go to **Authentication → Methods**
2. Enable at least one method:
   - **Email + Password** (simple, recommended for testing)
   - **Google OAuth** (production-ready)
   - **GitHub OAuth** (developer-friendly)

---

## Step 3: Set Up Convex Backend

### Create Convex Account

1. Go to https://dashboard.convex.dev
2. Sign in with GitHub or Google

### Initialize Convex

```bash
npx convex dev
```

This will:
- Prompt you to authenticate via browser
- Create a new Convex project (or link to existing)
- Generate `CONVEX_DEPLOYMENT` value
- Auto-create `convex/_generated` types
- Watch for schema changes

**Important:** Keep this terminal running during development.

### Get Deployment URL

1. Go to Convex Dashboard
2. Select your project
3. Go to **Settings**
4. Copy the **Deployment URL** (looks like `https://your-project.convex.cloud`)

---

## Step 4: Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Select a Google Cloud project or create new
4. Copy the generated API key

**Note:** This is for future AI features. Not required for authentication testing.

---

## Step 5: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# WorkOS Authentication
WORKOS_API_KEY=sk_test_your_key_here
WORKOS_CLIENT_ID=client_your_id_here
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Convex Backend
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Google Gemini AI (optional for now)
GEMINI_API_KEY=your_gemini_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Step 6: Run the Development Server

### Terminal 1: Convex Dev Server
```bash
npx convex dev
```

### Terminal 2: Next.js Dev Server
```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Step 7: Test Authentication Flow

1. Navigate to http://localhost:3000
2. Click **Sign in with WorkOS**
3. Complete authentication (email/password or OAuth)
4. You should be redirected to `/dashboard`
5. Check the onboarding flow (if first login)

### Expected Flow

```
/ → /login → WorkOS Auth → /api/auth/callback → /onboarding (first time) → /dashboard
```

---

## Project Structure

```
ycHereICome/
├── convex/                      # Convex backend
│   ├── schema.ts                # Database schema (10 tables)
│   ├── users.ts                 # User queries & mutations
│   ├── auth.config.ts           # Auth configuration
│   ├── types.ts                 # TypeScript types
│   ├── ARCHITECTURE.md          # Design documentation
│   ├── ERD.md                   # Entity relationship diagram
│   └── README.md                # Convex quick reference
│
├── src/
│   ├── app/
│   │   ├── (app)/               # Protected routes (requires auth)
│   │   │   ├── layout.tsx       # App shell (sidebar + header)
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── workouts/        # Workout management (placeholder)
│   │   │   ├── analytics/       # Progress tracking (placeholder)
│   │   │   ├── ai/              # AI coach (placeholder)
│   │   │   └── settings/        # User settings (placeholder)
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── login/       # WorkOS redirect
│   │   │       ├── callback/    # OAuth callback handler
│   │   │       └── logout/      # Session cleanup
│   │   │
│   │   ├── login/               # Public login page
│   │   ├── onboarding/          # First-time user setup
│   │   ├── layout.tsx           # Root layout (Convex provider)
│   │   └── page.tsx             # Home (redirects based on auth)
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx    # Login UI
│   │   ├── onboarding/
│   │   │   └── OnboardingForm.tsx  # Onboarding UI
│   │   └── layout/
│   │       ├── Sidebar.tsx      # App navigation
│   │       └── Header.tsx       # User menu
│   │
│   ├── lib/
│   │   ├── convex.ts            # Convex client setup
│   │   ├── workos.ts            # WorkOS client & helpers
│   │   └── session.ts           # Session management
│   │
│   └── middleware.ts            # Auth & route protection
│
├── .env.local                   # Environment variables (create this)
├── .env.example                 # Template for env vars
└── SETUP.md                     # This file
```

---

## Key Features Implemented

### Authentication ✅
- [x] WorkOS integration (email + OAuth)
- [x] Session management with secure cookies
- [x] Protected routes via middleware
- [x] Login/logout flow
- [x] User creation in Convex

### User Onboarding ✅
- [x] Experience level selection (beginner/intermediate/advanced)
- [x] Weight unit preference (kg/lbs)
- [x] Default preferences setup
- [x] Redirect logic for new users

### App Shell ✅
- [x] Sidebar navigation
- [x] Header with user menu
- [x] Dark mode athletic aesthetic
- [x] Responsive layout
- [x] Route placeholders for future features

### Database Schema ✅
- [x] 10 Convex tables designed
- [x] Users, templates, sessions, sets, exercises, PRs, analytics
- [x] 21 indexes for performance
- [x] TypeScript types generated

---

## Development Workflow

### Making Schema Changes

1. Edit `convex/schema.ts`
2. Convex dev server auto-detects changes
3. Types regenerate in `convex/_generated`
4. No manual migrations needed (Convex handles it)

### Adding New Routes

1. Create page in `src/app/(app)/your-route/page.tsx`
2. Add to sidebar navigation in `src/components/layout/Sidebar.tsx`
3. Route is automatically protected by middleware

### Testing Authentication

```bash
# Clear session and test fresh login
curl -X POST http://localhost:3000/api/auth/logout

# Check session endpoint
curl http://localhost:3000/api/auth/me
```

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Auth scaffold"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click **Import Project**
3. Select your GitHub repository
4. Vercel auto-detects Next.js

### 3. Set Environment Variables

In Vercel dashboard:

1. Go to **Settings → Environment Variables**
2. Add all variables from `.env.local`:
   - `WORKOS_API_KEY`
   - `WORKOS_CLIENT_ID`
   - `NEXT_PUBLIC_WORKOS_REDIRECT_URI` (update to production URL)
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `GEMINI_API_KEY`

### 4. Update WorkOS Redirect URI

1. In WorkOS Dashboard → Redirects
2. Add your Vercel URL: `https://your-app.vercel.app/api/auth/callback`

### 5. Deploy Convex to Production

```bash
npx convex deploy
```

This creates a production Convex deployment. Update `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in Vercel with production values.

---

## Troubleshooting

### "WORKOS_API_KEY is not set"
- Check `.env.local` exists in project root
- Verify variable names match exactly (case-sensitive)
- Restart Next.js dev server after adding env vars

### "Unauthorized" or redirect loop
- Clear browser cookies for localhost:3000
- Check WorkOS redirect URI matches exactly
- Verify WORKOS_CLIENT_ID is correct

### Convex types not found
- Ensure `npx convex dev` is running
- Check `convex/_generated` folder exists
- Restart VS Code TypeScript server

### WorkOS callback fails
- Check NEXT_PUBLIC_WORKOS_REDIRECT_URI matches WorkOS dashboard
- Ensure callback route exists at `/api/auth/callback/route.ts`
- Check WorkOS API key has correct permissions

### Session not persisting
- Check browser allows cookies
- Verify `SESSION_COOKIE_NAME` is consistent
- Ensure session cookie is httpOnly and secure in production

---

## Next Steps (After Auth Setup)

Once authentication is working:

1. **Seed Exercise Library** - Populate `exerciseLibrary` table with standard exercises
2. **Build Workout Templates** - UI for creating/managing templates
3. **Implement Workout Logging** - Active session tracking with set logging
4. **Add Analytics Dashboard** - Volume charts, PR tracking, progression graphs
5. **Integrate Gemini AI** - Workout programmer and training coach
6. **Polish UX** - Loading states, error handling, animations

---

## Support & Documentation

- **Convex Docs:** https://docs.convex.dev
- **WorkOS Docs:** https://workos.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Gemini API Docs:** https://ai.google.dev/docs

For project-specific architecture, see `convex/ARCHITECTURE.md`.

---

## Security Checklist

- [x] Environment variables in `.gitignore`
- [x] Session cookies are httpOnly
- [x] Session cookies are secure in production
- [x] WorkOS handles password security
- [x] API routes validate authentication
- [x] Middleware protects app routes
- [ ] Add CSRF protection (future)
- [ ] Implement rate limiting (future)
- [ ] Add API key rotation strategy (future)

---

## License

Private project. All rights reserved.
