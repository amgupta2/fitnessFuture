# Documentation Index

Welcome to the YC Here I Come Fitness App documentation! All project documentation is organized here.

---

## 📍 **Start Here**

### For Developers
1. **[README.md](../README.md)** (in root) - Project overview & quick start
2. **[SETUP.md](./SETUP.md)** - Complete setup & deployment instructions
3. **[CURRENT_STATE.md](./CURRENT_STATE.md)** - Current app status & features

### For AI (Claude Code)
1. **[CURRENT_STATE.md](./CURRENT_STATE.md)** - Complete app status, features & implementation
2. **[CLAUDE.md](./CLAUDE.md)** - AI development guidelines & project spec
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Database design rationale

---

## 📚 **Documentation Files**

### **Core Documentation**

#### [CURRENT_STATE.md](./CURRENT_STATE.md)
**Purpose:** Single source of truth for current app status  
**Contains:**
- Complete feature list with implementation details
- Code structure & key files
- Data models & schemas
- Recent enhancements & bug fixes
- Known limitations & future considerations
- Recommended reading order for Claude Code

#### [SETUP.md](./SETUP.md)
**Purpose:** Complete setup & deployment guide  
**Contains:**
- Prerequisites & installation steps
- Environment variable configuration
- Local development instructions
- Deployment to Vercel
- Troubleshooting common issues

#### [CLAUDE.md](./CLAUDE.md)
**Purpose:** AI development guidelines & project vision  
**Contains:**
- Project vision & philosophy
- Tech stack (strict)
- Domain context (fitness programming standards)
- Core features overview
- Architecture requirements
- Output expectations

---

### **Technical Documentation**

#### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Purpose:** Database design rationale & patterns  
**Contains:**
- Schema design decisions
- Table relationships
- Index optimization
- Query patterns
- Immutability strategy
- Denormalization approach

#### [ERD.md](./ERD.md)
**Purpose:** Visual schema diagrams  
**Contains:**
- Entity relationship diagrams
- Table structure visualizations
- Index mappings
- Foreign key relationships

#### [README.md](./README.md)
**Purpose:** Convex quick reference  
**Contains:**
- Convex-specific commands
- Schema update workflow
- Mutation/query patterns
- Type generation

---

### **Feature Documentation**

#### [EXERCISE_LIBRARY_INTEGRATION.md](./EXERCISE_LIBRARY_INTEGRATION.md)
**Purpose:** Exercise library integration guide  
**Contains:**
- Kaggle dataset details (471 exercises)
- Import process & conversion script
- Schema mapping
- Search implementation
- UX enhancements

#### [FIXES_APPLIED.md](./FIXES_APPLIED.md)
**Purpose:** Historical bug fixes & troubleshooting  
**Contains:**
- Chronological list of bugs fixed
- Error messages & resolutions
- PR tracking implementation
- Rest timer fixes
- Template editing features
- Modal z-index fixes

#### [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)
**Purpose:** Repository cleanup documentation  
**Contains:**
- Documentation reorganization details
- Files removed and why
- Space saved
- Repository structure before/after
- Verification checklist

---

## 🗂️ **Project Structure**

```
ycHereICome/
├── README.md              # Project overview (kept in root for GitHub)
├── docs/                  # All documentation (you are here)
│   ├── INDEX.md           # This file
│   ├── CURRENT_STATE.md   # Current app status
│   ├── SETUP.md           # Setup instructions
│   ├── CLAUDE.md          # AI guidelines
│   ├── ARCHITECTURE.md    # Database design
│   ├── ERD.md             # Schema diagrams
│   ├── README.md          # Convex reference
│   ├── EXERCISE_LIBRARY_INTEGRATION.md
│   └── FIXES_APPLIED.md
├── convex/                # Backend (Convex)
│   ├── schema.ts          # Database schema
│   ├── exercises.ts       # Exercise library
│   ├── templates.ts       # Template CRUD
│   ├── sessions.ts        # Workout logging
│   └── data/              # Exercise dataset
└── src/                   # Frontend (Next.js)
    ├── app/               # App Router pages
    ├── components/        # React components
    └── lib/               # Utilities
```

---

## 🔄 **Keeping Documentation Updated**

When making significant changes:

1. **Update CURRENT_STATE.md** - Add new features to the feature list
2. **Update FIXES_APPLIED.md** - Document any bugs fixed
3. **Update ARCHITECTURE.md** - If schema or patterns change
4. **Update this INDEX.md** - If new docs are added

---

**Last Updated:** January 24, 2026

