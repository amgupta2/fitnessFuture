# 🚀 Production Deployment Checklist

**Complete guide to deploying to Vercel with production Convex and WorkOS**

Follow these steps in order. Check off each item as you complete it.

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All code is committed to Git
- [ ] Development server works locally (`npm run dev`)
- [ ] Convex dev is running and working (`npx convex dev`)
- [ ] You can log in with WorkOS locally
- [ ] You have admin access to:
  - WorkOS Dashboard
  - Convex Dashboard
  - Vercel Account
  - Your domain registrar (if using custom domain)

---

## Step 1: Create Production Convex Deployment

### 1.1 Deploy Convex to Production

```bash
cd /Users/amangupta/Desktop/ycHereICome
npx convex deploy --cmd 'npm run build'
```

**What this does:**
- Creates a new production Convex deployment
- Runs database migrations
- Generates production API URLs

**Expected output:**
```
✔ Deployed Convex functions to https://your-production-name.convex.cloud
  Deployment name: your-production-name
  
  Add these to your .env.local:
  CONVEX_DEPLOYMENT=prod:your-production-name-123456
  NEXT_PUBLIC_CONVEX_URL=https://your-production-name.convex.cloud
```

### 1.2 Save Production Convex URLs

**Copy these values** (you'll need them for Vercel):
- `CONVEX_DEPLOYMENT=prod:_______________`
- `NEXT_PUBLIC_CONVEX_URL=https://_______________`

### 1.3 Seed Exercise Library (Production)

```bash
npx convex run exercises:seedExercises --prod
```

**What this does:**
- Populates the production `exerciseLibrary` table
- Imports all 471 exercises
- Required for exercise search to work

**Expected output:**
```
✔ Successfully seeded 471 exercises
```

---

## Step 2: Set Up Production WorkOS

### 2.1 Log in to WorkOS Dashboard

Go to: https://dashboard.workos.com

### 2.2 Create Production Environment (if needed)

**If you're currently in Test/Staging:**
1. Click environment dropdown (top left)
2. Select "Production" or create new environment
3. Note the production API keys

### 2.3 Get Production API Credentials

**Navigate to:** API Keys

**Copy these values:**
- `WORKOS_API_KEY` (starts with `sk_live_...` or `sk_prod_...`)
- `WORKOS_CLIENT_ID` (starts with `client_...`)

⚠️ **Important:** Production keys are different from development keys!

### 2.4 Configure Production Redirect URIs

**Navigate to:** Configuration → Redirects

**Add your production callback URL:**
```
https://your-app-name.vercel.app/api/auth/callback
```

**Also add staging URL (optional but recommended):**
```
https://your-app-name-git-main-your-username.vercel.app/api/auth/callback
```

**Keep localhost for local testing:**
```
http://localhost:3000/api/auth/callback
```

---

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

Follow the email verification prompt.

### 3.3 Link Project to Vercel

```bash
cd /Users/amangupta/Desktop/ycHereICome
vercel link
```

**Prompts:**
- Set up and deploy? **Y**
- Which scope? **Select your account**
- Link to existing project? **N** (if first deploy) or **Y** (if updating)
- Project name? **yc-here-i-come** (or your preferred name)
- Directory? **./** (press Enter)

### 3.4 Set Environment Variables in Vercel

**Option A: Via CLI (Recommended)**

```bash
# WorkOS Production
vercel env add WORKOS_API_KEY production
# Paste your production WorkOS API key (sk_live_... or sk_prod_...)

vercel env add WORKOS_CLIENT_ID production
# Paste your production WorkOS Client ID (client_...)

vercel env add NEXT_PUBLIC_WORKOS_REDIRECT_URI production
# Enter: https://your-app-name.vercel.app/api/auth/callback

# Convex Production
vercel env add CONVEX_DEPLOYMENT production
# Paste: prod:your-production-name-123456

vercel env add NEXT_PUBLIC_CONVEX_URL production
# Paste: https://your-production-name.convex.cloud

# Gemini API
vercel env add GEMINI_API_KEY production
# Paste your Gemini API key (from Google AI Studio)
```

**Option B: Via Dashboard**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: Settings → Environment Variables
4. Add each variable:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `WORKOS_API_KEY` | `sk_live_...` | Production |
| `WORKOS_CLIENT_ID` | `client_...` | Production |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | `https://your-app.vercel.app/api/auth/callback` | Production |
| `CONVEX_DEPLOYMENT` | `prod:your-name-123456` | Production |
| `NEXT_PUBLIC_CONVEX_URL` | `https://your-name.convex.cloud` | Production |
| `GEMINI_API_KEY` | Your Gemini key | Production |

⚠️ **Important:** Set all to "Production" environment, not "Preview" or "Development"

### 3.5 Deploy to Production

```bash
vercel --prod
```

**What this does:**
- Builds your Next.js app
- Deploys to Vercel production
- Assigns your production URL

**Expected output:**
```
✔ Production: https://your-app-name.vercel.app [1m 30s]
```

**Copy your production URL!**

---

## Step 4: Update WorkOS with Production URL

### 4.1 Add Production URL to WorkOS

**Go to:** WorkOS Dashboard → Configuration → Redirects

**Verify this URL exists:**
```
https://your-actual-production-url.vercel.app/api/auth/callback
```

If your URL changed from what you entered in Step 2.4, add the new one.

### 4.2 Update Vercel Environment Variable (if needed)

**If your Vercel URL is different than expected:**

```bash
vercel env rm NEXT_PUBLIC_WORKOS_REDIRECT_URI production
vercel env add NEXT_PUBLIC_WORKOS_REDIRECT_URI production
# Enter your ACTUAL production URL/api/auth/callback
```

Then redeploy:
```bash
vercel --prod
```

---

## Step 5: Test Production Deployment

### 5.1 Basic Functionality Test

**Go to your production URL:** `https://your-app.vercel.app`

**Test checklist:**
- [ ] Landing page loads
- [ ] Click "Sign In" → WorkOS auth screen appears
- [ ] Sign in with email → redirects back to app
- [ ] Dashboard page loads
- [ ] Create a workout template
- [ ] Add an exercise (search works)
- [ ] Start a workout
- [ ] Log a set
- [ ] Complete the workout
- [ ] Check Analytics page
- [ ] Check Settings page
- [ ] Check AI Coach page

### 5.2 AI Features Test

**Test AI Coach:**
- [ ] Ask a question (Trainer mode)
- [ ] Request a workout program (Programmer mode)
- [ ] Verify streaming works
- [ ] Check that templates are created

### 5.3 Advanced Features Test (After 2-3 Workouts)

**Complete 2-3 workouts, then test:**
- [ ] Auto-progression suggestions appear
- [ ] Progression badges show up
- [ ] Recovery score calculates
- [ ] Analytics charts populate
- [ ] Plateau detection works

### 5.4 Authentication Flow Test

**Open incognito/private window:**
- [ ] Visit production URL
- [ ] Not logged in by default
- [ ] Click "Sign In"
- [ ] Sign in successfully
- [ ] Redirected to dashboard
- [ ] Refresh page → still logged in
- [ ] Sign out → redirected to landing page

---

## Troubleshooting Common Issues

### "Environment variable not found"

**Problem:** Missing env vars in Vercel

**Fix:**
```bash
vercel env pull .env.production.local
# Review what's missing
vercel env add MISSING_VAR_NAME production
vercel --prod
```

### "WorkOS redirect URI mismatch"

**Problem:** Redirect URL doesn't match WorkOS config

**Check:**
1. Vercel URL in browser address bar
2. WorkOS Dashboard → Redirects → Must match EXACTLY
3. `NEXT_PUBLIC_WORKOS_REDIRECT_URI` in Vercel env vars

**Fix:**
- Add the correct URL to WorkOS
- Update Vercel env var
- Redeploy

### "Convex is not defined"

**Problem:** Convex URLs are wrong

**Fix:**
```bash
# Check your production deployment name
npx convex deployments

# Update Vercel env vars with correct URLs
vercel env rm CONVEX_DEPLOYMENT production
vercel env add CONVEX_DEPLOYMENT production
vercel --prod
```

### "Exercise search returns nothing"

**Problem:** Exercise library not seeded in production

**Fix:**
```bash
npx convex run exercises:seedExercises --prod
```

### Build fails on Vercel

**Check build logs in Vercel Dashboard**

**Common causes:**
- TypeScript errors (fix and push)
- Missing dependencies (check `package.json`)
- Environment variable used at build time (should use `NEXT_PUBLIC_` prefix)

**Fix:**
```bash
# Test build locally first
npm run build

# If it works locally, redeploy
git push
vercel --prod
```

---

## Quick Command Reference

```bash
# Step 1: Deploy Convex
npx convex deploy --cmd 'npm run build'
npx convex run exercises:seedExercises --prod

# Step 3: Deploy to Vercel
vercel login
vercel link
vercel --prod

# Step 3.4: Add env vars (repeat for each variable)
vercel env add WORKOS_API_KEY production
vercel env add WORKOS_CLIENT_ID production
vercel env add NEXT_PUBLIC_WORKOS_REDIRECT_URI production
vercel env add CONVEX_DEPLOYMENT production
vercel env add NEXT_PUBLIC_CONVEX_URL production
vercel env add GEMINI_API_KEY production

# If you need to update and redeploy
vercel --prod
```

---

## Success Criteria

Your deployment is successful when:

✅ Users can sign up and log in  
✅ All pages load correctly  
✅ Workouts can be created and logged  
✅ AI Coach responds to queries  
✅ Analytics display properly  
✅ No console errors  
✅ Mobile experience is smooth  
✅ Page load time < 3 seconds  

---

## Next Steps After Deployment

1. **Share with beta users** - Get feedback
2. **Monitor usage** - Watch Vercel analytics
3. **Iterate quickly** - Fix issues as they arise
4. **Gather testimonials** - For your YC application
5. **Scale infrastructure** - As users grow

---

**Deployment Date:** _______________  
**Production URL:** _______________  
**Status:** _______________

**Congratulations on shipping! 🚀**

