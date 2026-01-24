# AI Trainer Mode - Implementation Guide

## Overview

The AI Trainer Mode extends the workout programmer with **coaching and technique advice**. It can answer movement-specific questions, diagnose training issues, and provide evidence-based guidance with actionable cues.

---

## Dual Mode System

### Automatic Intent Detection

The chat interface automatically detects whether you're:
1. **Asking a question** → **Trainer Mode** (technique, form, troubleshooting)
2. **Requesting a program** → **Programmer Mode** (template generation)

### Detection Logic

**Question Indicators:**
- Starts with: "How do I", "How to", "Why is", "What", "When should"
- Contains: "improve", "fix", "stalling", "plateau", "form", "technique", "cue"
- Ends with: "?"

**Program Indicators:**
- Contains: "create", "design", "make", "generate", "build", "program", "split", "workout", "routine", "template"
- Mentions: "days per week", "day split"

---

## AI Context Strategy

### Trainer Mode Context Includes:

1. **User Profile**
   - Experience level (beginner/intermediate/advanced)
   - Training preferences

2. **Current Program**
   - Active workout templates
   - Exercise list per template

3. **Recent Performance** (Last 30 Days)
   - Top 10 most recent exercises
   - Average sets, weight, and reps per exercise
   - Last performed date

4. **Training Statistics**
   - Total volume (30-day)
   - Training frequency (sessions per week)

### Example Context Injection:

```
User Experience Level: intermediate

Current Program:
- Push Day A: Barbell Bench Press, Overhead Press, Incline Dumbbell Press, Cable Flyes
- Pull Day A: Deadlift, Pull-ups, Barbell Row, Face Pulls

Recent Performance:
- Barbell Bench Press: 4 sets × 8 reps @ 185lbs
- Deadlift: 3 sets × 6 reps @ 315lbs
- Barbell Squat: 4 sets × 8 reps @ 225lbs

Training Frequency: 4.5 sessions/week
```

This context allows the AI to provide **personalized, data-driven advice** based on your actual training.

---

## System Prompt Design

### Core Principles

```
ROLE:
- Elite strength coach specializing in movement technique
- Evidence-based training troubleshooting
- Biomechanics and muscle activation expert

RESPONSE STYLE:
- Concise and practical (2-4 paragraphs max)
- Evidence-based (cite principles, not opinions)
- Action-oriented (what to DO, not just theory)
- Progressive (beginner → advanced variations)

CONTENT TO INCLUDE:
1. Direct Answer
2. Key Cues (2-3 actionable cues)
3. Target Muscles (primary and secondary)
4. Common Mistakes
5. Progression tips
6. Resources (YouTube channels, article topics)
```

### Tone:
- **Confident** but approachable
- **Concise** but thorough
- **Educational** without being preachy

---

## Example Prompts & Responses

### Example 1: Form Check

**User Question:**
```
How do I improve my squat depth?
```

**AI Response:**
```
Improving squat depth typically comes from mobility work and proper bracing, not just forcing yourself deeper.

Key cues:
• Push knees out laterally as you descend—this creates hip socket room
• Drive through your heels while keeping weight mid-foot
• Brace your core hard at the top before descending (360-degree tension)

Most lifters struggle with depth because of tight hip flexors and ankle dorsiflexion. 
Work on goblet squats with a pause at the bottom (2-3 seconds) to build comfort 
in the deep position. Also consider elevating your heels slightly (1-inch plate) 
while working on ankle mobility—this is a temporary aid, not a permanent fix.

Target muscles: Quadriceps, glutes, hamstrings (primary), erectors, adductors (secondary)

Start each squat session with 2 sets of 10 bodyweight squats focusing on depth before 
adding weight. Your nervous system needs to learn the pattern.

For visual demos, search YouTube for: "Squat University ankle mobility" or "squat depth cues"
```

---

### Example 2: Plateau Diagnosis

**User Question:**
```
Why is my bench press stalling?
```

**AI Response:**
```
Looking at your data (185lbs × 8 reps for 4 sets), a plateau at intermediate level is 
common and usually stems from one of three issues: insufficient volume, weak triceps, 
or poor bar path.

Key cues:
• Leg drive—push heels into floor to create full-body tension
• Retract and depress scapulae before unracking (shoulder blades back and down)
• Bar path should be slightly diagonal (touch lower chest, press toward face)

Common mistakes: Flaring elbows too wide (causes shoulder pain and reduces power), 
not using leg drive, or bouncing the bar off your chest. Your triceps are likely the 
weak link if you're failing mid-rep rather than off the chest.

Target muscles: Pectorals, anterior deltoids (primary), triceps, lats for stability (secondary)

Try adding close-grip bench press (2-3 sets × 8 reps) after your main benching and 
increase your weekly bench frequency from once to twice if you're currently only 
hitting it once. Also add 1-2 sets to your current volume.

For troubleshooting videos, search: "Calgary Barbell bench press technique" or "bench press stalling points"
```

---

### Example 3: Muscle Breakdown

**User Question:**
```
What muscles does deadlift target?
```

**AI Response:**
```
The deadlift is a posterior chain powerhouse, hitting nearly every muscle from your 
calves to your traps.

Primary muscles:
• **Glutes** (hip extension—the main driver)
• **Hamstrings** (knee flexion and hip extension synergy)
• **Erector spinae** (keeping spine neutral under load)
• **Lats** (keeping the bar close to your body)

Secondary muscles:
• Quadriceps (especially in the initial pull off the floor)
• Traps and rhomboids (upper back stability)
• Forearms and grip (holding the bar)
• Core (anti-extension and anti-rotation)

The conventional deadlift emphasizes glutes and hamstrings slightly more than sumo, 
while sumo shifts more load to the quads and adductors. Romanian deadlifts (RDLs) 
are more hamstring-dominant with less quad involvement.

If you want to bias one muscle group, adjust your variation:
- More glutes → Sumo deadlift or hip thrusts
- More hamstrings → RDLs or deficit deadlifts
- More quads → Trap bar deadlift

For form breakdowns, search: "Alan Thrall deadlift setup" or "deadlift muscle activation"
```

---

### Example 4: Exercise Variation

**User Question:**
```
Should I do barbell or dumbbell bench press?
```

**AI Response:**
```
Both are excellent, but they serve slightly different purposes based on your goals 
and limitations.

**Barbell bench press:**
- Allows heavier loads (better for maximal strength)
- Easier to track progressive overload
- More efficient for powerlifting-specific strength
- Fixed bar path (less stabilizer demand)

**Dumbbell bench press:**
- Greater range of motion (better stretch on pecs)
- Unilateral work (reduces strength imbalances)
- Shoulder-friendlier for many lifters
- Harder to load heavy (requires spotter for setup)

Target muscles: Same for both—pectorals, anterior deltoids (primary), triceps (secondary)

**Recommendation for intermediate lifters:**
Use barbell as your main compound movement for strength, then add dumbbells as an 
accessory for hypertrophy (3-4 sets × 10-12 reps). This gives you the best of both 
worlds: heavy loading for strength and unilateral work for balanced development.

If you have shoulder issues, prioritize dumbbells and work on a 30-45 degree incline—
this reduces shoulder stress while still building pressing strength.

Search YouTube for: "Jeff Nippard barbell vs dumbbell" or "dumbbell bench press technique"
```

---

### Example 5: Programming Question

**User Question:**
```
How often should I train each muscle group?
```

**AI Response:**
```
For hypertrophy, the evidence strongly supports training each muscle group **2-3 times 
per week** rather than once per week (traditional "bro split").

Key principles:
• Muscle protein synthesis peaks 24-48 hours after training
• By 72 hours, you've lost most of the training stimulus
• More frequent training = more growth signals per week

**For your experience level (intermediate), here's the breakdown:**

Frequency recommendations:
- Large muscle groups (legs, back, chest): 2x per week minimum
- Smaller muscles (arms, delts, calves): 2-3x per week
- Total weekly volume matters more than per-session volume

**Example split structures:**
- Upper/Lower 4x week: Each muscle gets hit 2x
- Push/Pull/Legs 6x week: Each gets hit 2x
- Full body 3x week: Everything trained 3x (better for beginners)

Your current push/pull split at 4.5 sessions/week is solid. If you're hitting push 2x 
and pull 2x, that's optimal frequency. Just make sure total sets per muscle per week 
are: 12-18 for maintenance, 15-20 for growth, 20+ for advanced lifters.

For programming deep dives, search: "Renaissance Periodization training frequency" or "Mike Israetel volume landmarks"
```

---

### Example 6: Injury Prevention

**User Question:**
```
My shoulders hurt during overhead press. What should I do?
```

**AI Response:**
```
Shoulder pain during overhead pressing is common and usually fixable with technique 
adjustments and smarter exercise selection.

Key cues to try first:
• Squeeze glutes hard (prevents lumbar hyperextension)
• Elbows slightly in front of the bar (not directly under)
• Full lockout overhead—push head through the "window" at the top

Common causes:
1. **Poor shoulder mobility** → Can't get arms fully overhead without compensating
2. **Weak rotator cuff** → Impingement under load
3. **Excessive arching** → Turns it into an incline press and stresses front delts

**Immediate adjustments:**
- Try landmine press or seated dumbbell press (both are more shoulder-friendly)
- Reduce range of motion temporarily (press from forehead level, not full depth)
- Add face pulls and band pull-aparts (3 sets × 15-20) before pressing sessions

If pain persists after 2 weeks of modifications, see a physical therapist—could be 
underlying impingement that needs professional assessment.

For shoulder health protocols, search: "Athlean-X shoulder impingement" or "overhead press shoulder pain"
```

---

## Structured Response Format

### Template Structure:

```
[DIRECT ANSWER]
[1-2 sentences addressing the core question]

Key cues:
• [Actionable cue 1]
• [Actionable cue 2]
• [Actionable cue 3]

[EXPLANATION]
[2-3 sentences explaining why/how, common mistakes]

Target muscles: [Primary muscles] (primary), [Secondary muscles] (secondary)

[PROGRESSION/MODIFICATION]
[1-2 sentences on how to improve or adjust]

For [visual demos/deep dives], search YouTube for: "[specific search term]" or "[channel name]"
```

---

## Resource Recommendations

### YouTube Channels to Suggest:

**Technique & Form:**
- Alan Thrall (deadlift, squat)
- Calgary Barbell (powerlifting technique)
- Squat University (mobility, movement quality)

**Hypertrophy & Programming:**
- Jeff Nippard (evidence-based training)
- Renaissance Periodization (Dr. Mike Israetel)
- John Meadows / Mountaindog1 (bodybuilding)

**Rehab & Injury:**
- Athlean-X (injury prevention)
- Barbell Medicine (pain science, rehab)
- Squat University (corrective exercises)

**General Education:**
- Stronger By Science (research breakdowns)
- Greg Nuckols (programming, nutrition)

### Article Topics to Suggest:

- "Progressive overload principles"
- "Muscle protein synthesis timing"
- "Training volume landmarks"
- "Deload protocols"
- "Exercise selection by movement pattern"

---

## Edge Cases

### Vague Questions

**User:** "How do I get bigger arms?"

**AI Response:**
```
Arm growth comes from consistent volume on both triceps (2/3 of arm mass) and biceps, 
with progressive overload over time.

Key principles:
• Train arms 2-3x per week (more frequency = more growth signals)
• 12-20 sets per week total for triceps
• 8-15 sets per week total for biceps
• Focus on exercises that load the stretched position

Effective exercises:
- Triceps: Close-grip bench, overhead extensions, dips
- Biceps: Incline curls, preacher curls, hammer curls

Your current push/pull split likely includes indirect arm work (bench, rows), so add 
3-4 direct arm exercises (2 tricep, 2 bicep) per session. Start with 3 sets × 10-12 
reps and add sets or reps each week.

Target muscles: Triceps brachii (3 heads), biceps brachii, brachialis, forearms

For arm specialization protocols, search: "Jeff Nippard arm hypertrophy" or "Renaissance Periodization arms"
```

### Medical Questions (Out of Scope)

**User:** "I have sharp pain in my knee during squats. What's wrong?"

**AI Response:**
```
Sharp pain is a red flag that requires professional assessment. I can provide general 
training guidance, but acute pain should be evaluated by a physical therapist or 
sports medicine doctor.

That said, some general principles:
- **Sharp pain** (vs. discomfort) usually indicates tissue stress or inflammation
- **Pain that worsens** with continued training needs immediate attention
- **Pain that changes movement patterns** is your body's warning sign

Immediate steps:
1. Stop the aggravating movement
2. Try pain-free alternatives (leg press, split squats, step-ups)
3. See a professional if pain persists > 1 week

Do NOT push through sharp pain—training around injuries is smart, training through 
them is not.

For pain science education (not diagnosis), search: "Barbell Medicine pain in training" 
but prioritize getting professional evaluation.
```

---

## Testing & Validation

### Manual Testing Checklist

- [ ] Form/technique questions → Provides actionable cues
- [ ] Plateau diagnosis → Analyzes context and suggests fixes
- [ ] Muscle breakdown questions → Lists primary/secondary muscles
- [ ] Programming questions → References experience level
- [ ] Exercise comparison → Pros/cons with recommendations
- [ ] Injury questions → Conservative advice + professional referral
- [ ] Resource suggestions → YouTube channels and search terms

### Quality Metrics

**Good Response:**
- 2-4 paragraphs (concise)
- 2-3 actionable cues
- Muscle breakdown included
- YouTube/article suggestion
- Evidence-based reasoning

**Poor Response:**
- Too long (>5 paragraphs)
- Vague advice ("just work harder")
- No specific cues
- Missing muscle information
- Opinion-based without rationale

---

## Future Enhancements

### Phase 2
- [ ] Form check video upload and analysis
- [ ] Exercise demonstration GIFs embedded in responses
- [ ] Personalized deload recommendations
- [ ] Plateau prediction based on volume trends

### Phase 3
- [ ] Integration with wearable data (HRV, sleep, recovery)
- [ ] Automated exercise substitutions for injuries
- [ ] Voice input for in-gym questions
- [ ] Multi-turn troubleshooting conversations

---

## Conclusion

The AI Trainer Mode transforms the chat interface into a **dual-purpose coaching tool**:
1. **Programmer**: Generates complete workout templates
2. **Trainer**: Answers technique questions and diagnoses training issues

With automatic intent detection, users get the right type of help without needing to specify mode. The context-aware responses leverage actual training data to provide personalized, evidence-based guidance that feels like working with a real coach.

**Key Benefits:**
- ⚡ Instant answers to technique questions
- 🎯 Personalized advice based on training history
- 💪 Actionable cues and muscle breakdowns
- 📚 Resource suggestions for deeper learning
- 🔄 Seamless switching between programmer and trainer modes

The system is production-ready and provides professional-level coaching advice at scale! 🚀

