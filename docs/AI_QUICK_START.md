# AI Workout Programmer - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

### 2. Add to Environment Variables

Create or update `.env.local` in project root:

```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart Development Server

```bash
npm run dev
```

That's it! The AI Workout Programmer is now active.

---

## 💬 Using the AI

### Access the Feature

1. Navigate to **AI Coach** in the sidebar
2. You'll see a chat interface with a welcome message

### Example Conversations

#### Beginner Request

**You:**
```
I'm new to lifting and want to build strength. I can train 3 days 
per week for about 45 minutes. I have access to a basic gym.
```

**AI:**
```
Creates 2 full-body templates (A and B) with:
- Compound movements (Squat, Bench, Deadlift, Row)
- 3 sets × 8-10 reps
- Appropriate rest periods
- Form cues in notes
```

#### Intermediate Request

**You:**
```
Create a 4-day upper/lower split for hypertrophy. I'm intermediate 
with 2 years of training. Full gym access.
```

**AI:**
```
Creates 4 templates:
- Upper Body A (horizontal emphasis)
- Lower Body A (quad-dominant)
- Upper Body B (vertical emphasis)
- Lower Body B (hip-dominant)

Each with 6-8 exercises, progressive overload notes
```

#### Advanced Request

**You:**
```
Design a 6-day Push/Pull/Legs split for advanced bodybuilder. 
High volume, focusing on weak points (shoulders and arms).
```

**AI:**
```
Creates 6 templates with:
- Extra shoulder volume on push days
- Extra arm volume on pull days
- 16-20 sets per session
- Advanced techniques in notes
```

---

## 🤔 What If AI Asks Questions?

If your request is incomplete, the AI will ask clarifying questions:

**You:**
```
I want to build muscle
```

**AI:**
```
Great goal! To design the perfect program, I need to know:
• How many days per week can you train?
• What's your training experience? (beginner/intermediate/advanced)
• Do you have access to a full gym or limited equipment?
• How much time do you have per session?
```

**You:**
```
I can train 4 days per week, I'm intermediate, full gym, 60 minutes per session
```

**AI:**
```
[Generates 4-day upper/lower split]
```

---

## ✅ What Happens After Generation?

1. **Templates Created**: AI generates workout templates
2. **Saved Automatically**: Templates saved to your account
3. **Confirmation Shown**: Chat shows summary of created templates
4. **Ready to Use**: Find templates in **Workouts** page
5. **Start Training**: Click "Start Workout" to begin logging

---

## 💡 Tips for Best Results

### Be Specific

✅ **Good:**
```
Create a 4-day upper/lower split for intermediate lifter focusing 
on hypertrophy. I have access to barbells, dumbbells, cables, and 
machines. 60-75 minutes per session.
```

❌ **Too Vague:**
```
Make me a workout
```

### Include Key Info

Always mention:
- **Goal**: Strength, hypertrophy, endurance
- **Experience**: Beginner, intermediate, advanced
- **Frequency**: Days per week
- **Equipment**: Full gym, home gym, limited
- **Time**: Minutes per session
- **Limitations**: Injuries, restrictions

### Use Natural Language

The AI understands conversational requests:
- "Create a program for..."
- "I need help designing..."
- "Can you make a workout split..."
- "I'm looking for a routine that..."

---

## 🎯 Quick Suggestion Buttons

The chat interface includes quick suggestion buttons:

- **💪 4-day PPL split**: "Create a 4-day Push/Pull/Legs split for intermediate lifter focusing on hypertrophy"
- **🏋️ Beginner full-body**: "I'm a beginner, create a 3-day full body program for strength"
- **🔥 Advanced bodybuilding**: "Design a 5-day bodybuilding split for advanced lifter"

Click any button to auto-fill the prompt.

---

## 🔍 What the AI Knows About You

The AI has access to:
- **Your experience level** (from profile)
- **Your current templates** (to avoid duplication)
- **Your recent workouts** (last 30 days)

This allows it to:
- Match programming to your level
- Complement existing templates
- Consider your training frequency

---

## 🛠️ Troubleshooting

### "I encountered an error"

**Possible causes:**
- API key not set or invalid
- Network connection issue
- Gemini API rate limit

**Solutions:**
1. Check `.env.local` has correct API key
2. Restart dev server
3. Try rephrasing your request
4. Wait a moment and try again

### Templates Not Appearing

**Check:**
1. Look for success message in chat
2. Navigate to **Workouts** page
3. Refresh the page
4. Check browser console for errors

### AI Asks Too Many Questions

**Solution:** Provide more details upfront:
```
I'm [experience level], want to train [X] days per week for 
[goal], have access to [equipment], [time] per session
```

---

## 📚 More Resources

- **Full Documentation**: `docs/AI_WORKOUT_PROGRAMMER.md`
- **Example Prompts**: `docs/AI_EXAMPLE_PROMPTS.md`
- **Implementation Details**: `docs/AI_IMPLEMENTATION_SUMMARY.md`
- **Component Docs**: `src/components/ai/README.md`

---

## 🎉 You're Ready!

The AI Workout Programmer is a powerful tool that combines:
- Evidence-based training principles
- Personalized programming
- Conversational interface
- Automatic template creation

Start chatting and let the AI design your perfect workout program!

---

**Need Help?** Check the example prompts in `docs/AI_EXAMPLE_PROMPTS.md` for inspiration.

