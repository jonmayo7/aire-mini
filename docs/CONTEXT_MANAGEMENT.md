# Context Window Management Strategy

## The Challenge
As we build out the AIRE PWA, our conversation history and codebase will grow. LLM context windows have limits, so we need a strategy to maintain continuity.

## Solution: Mission-Based Documentation

### Strategy Overview
**Core Principle:** Minimize documentation, maximize effectiveness. Only document what prevents relapsing on issues or is critical for continuity.

**After each mission completion:**
1. **Update `docs/SPRINT_LOG.md`** - Mark mission complete, add implementation notes
2. **Update `docs/BREACH_NET.md`** - **ONLY if a vortex was solved** (see strict rules below)
3. **Commit & Push** - Save all work
4. **Start Fresh** - Next mission references documentation only

### Documentation File Structure

**File Organization:**
- **`docs/`** - All documentation files (critical)
  - `BREACH_NET.md` - Problems/solutions log (critical)
  - `SPRINT_LOG.md` - Mission completion tracking (critical)
  - `WAYMAKER.md` - Master project plan (critical)
  - `CONTEXT_MANAGEMENT.md` - This file (context strategy, critical)
  - `RESUME_HERE.md` - Current blocker and next steps (critical when blocked)
  - `sql/` - Database schema SQL files (reference)

**Note:** All critical documentation files are in `docs/` root for easy @ mention referencing in Cursor. Temporary troubleshooting guides are deleted after resolution. `RESUME_HERE.md` is created when work is paused and should be checked first when resuming.

### Key Documentation Files

**`docs/SPRINT_LOG.md`** - Mission Tracking & Implementation
- **Purpose:** What was built, how it was implemented, mission status
- **Contains:**
  - Current mission checklist
  - Completed missions with implementation notes
  - Test results (brief summaries)
  - User actions required
  - Backlog of future missions
  - Known issues (brief, resolved items moved to BREACH_NET if vortex)
- **Does NOT contain:** Problem-solving details, troubleshooting steps, vortex solutions
- **Update frequency:** After EVERY mission completion

**`docs/BREACH_NET.md`** - Vortex Solutions Only
- **Purpose:** **ONLY confirmed, solved vortices that took significant troubleshooting**
- **STRICT RULES:**
  - ✅ **ONLY add:** Vortices that were FULLY RESOLVED and VERIFIED in production
  - ✅ **ONLY add:** Problems that caused significant time loss or confusion
  - ✅ **ONLY add:** Solutions that prevent relapsing on the same issue
  - ❌ **NEVER add:** Mission completion status, implementation details, feature descriptions
  - ❌ **NEVER add:** Ongoing issues, attempts, or partial solutions
  - ❌ **NEVER add:** Simple fixes or expected behaviors
- **Contains:**
  - Critical configuration (stack, file paths, API endpoints)
  - Vortex problems → Root causes → Verified solutions → Key learnings
  - Critical rules that prevent future mistakes
- **Update frequency:** ONLY when a vortex is solved and verified

**`docs/WAYMAKER.md`**
- Master project plan and architecture
- Mission roadmap and priorities
- Long-term vision and strategy

**`docs/CONTEXT_MANAGEMENT.md`**
- This file - Context window management strategy
- Documentation structure and workflow

**`docs/RESUME_HERE.md`** - Quick-Start Resume Document
- **Purpose:** Single document to reference when starting new chat
- **Contains:** Current state, last mission, next steps, references to full context docs
- **Protocol:**
  - ✅ **When pausing work:** Update with current state, next steps, any blockers
  - ✅ **When resuming work:** AI reads this first, then reads referenced docs, then clears/updates it
  - ✅ **During active work:** Keep minimal or clear it (don't accumulate notes)
  - ✅ **When mission complete:** Clear it or update for next mission
- **Structure:** Current state → References to full docs → Notes for next session

**`docs/sql/`**
- All database schema SQL files
- Table creation scripts
- Migration scripts (if any)

**Note:** Temporary troubleshooting guides (e.g., `VORTEX_X_BREACH_PLAN.md`, `TESTING_GUIDE.md`) are created during problem resolution and deleted after issues are resolved. Only permanent reference documents are kept.

### Starting a New Chat Session

**Option 1: Quick Resume (Recommended)**
**User says:**
```
"Reference @RESUME_HERE.md"
```

**AI automatically:**
1. Reads `docs/RESUME_HERE.md` (gets current state and next steps)
2. Reads documents referenced in RESUME_HERE.md (CONTEXT_MANAGEMENT, SPRINT_LOG, BREACH_NET, WAYMAKER if needed)
3. Reviews recent git commits (last 5-10)
4. Proposes plan or asks for clarification
5. **Does NOT update RESUME_HERE.md** (only update when pausing work to save compute)

**Option 2: Direct Mission Start**
**User says:**
```
"Reference @CONTEXT_MANAGEMENT.md. Starting Mission X."
```

**AI automatically:**
1. Reads `docs/CONTEXT_MANAGEMENT.md` (this file)
2. Reads `docs/SPRINT_LOG.md` (current mission status)
3. Reads `docs/BREACH_NET.md` (critical vortex solutions)
4. Reviews recent git commits (last 5-10)
5. Proposes plan for Mission X or asks for clarification
6. **Does NOT update RESUME_HERE.md** (only update when pausing work to save compute)

**No need to:**
- List all documentation files
- Explain project context
- Review conversation history
- Manually check git status

### Documentation Rules (Critical)

**SPRINT_LOG.md:**
- ✅ Mission checklists and completion status
- ✅ Implementation notes (what was built, how)
- ✅ Brief test results
- ✅ User actions required
- ❌ Problem-solving details (goes to BREACH_NET if vortex)
- ❌ Troubleshooting steps (only if vortex, then move to BREACH_NET)

**BREACH_NET.md:**
- ✅ **ONLY** confirmed solved vortices
- ✅ Root cause → Solution → Key learning
- ✅ Critical configuration that prevents mistakes
- ❌ Mission status (SPRINT_LOG handles this)
- ❌ Implementation details (SPRINT_LOG handles this)
- ❌ Ongoing issues (wait until solved)

**Redundancy Prevention:**
- If information exists in BREACH_NET, don't repeat in SPRINT_LOG
- If information exists in SPRINT_LOG, don't repeat in BREACH_NET
- Reference, don't duplicate

**Dark Mode Text Visibility:**
- Always use semantic Tailwind color classes (`text-foreground`, `text-muted-foreground`) instead of relying on inheritance
- Components rendering text must have explicit color classes - never assume inheritance will work
- Buttons should use variants that include text colors, or explicitly add `text-foreground`
- Headings, labels, and custom text elements need `text-foreground` for dark mode compatibility
- Test all new components in both light and dark modes before considering complete

### Emergency Context Recovery

If we lose context mid-mission:

1. **Check Git Status:**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Review Documentation:**
   - Read `docs/SPRINT_LOG.md` for current mission status
   - Check `docs/BREACH_NET.md` for recent solutions
   - Review any TODO comments in code

3. **Ask for Status:**
   ```
   "What's the current state? What mission are we on? 
   What was the last thing completed?"
   ```

### Post-Mission Documentation Update (Standardized)

**After EVERY mission completion (automatic, no user request needed):**

1. **Update `docs/SPRINT_LOG.md` (ALWAYS):**
   - ✅ Mark mission complete with checkboxes
   - ✅ Move to "Completed Missions" section
   - ✅ Add brief implementation notes (what was built, how)
   - ✅ Add test results summary (if applicable)
   - ✅ Update "Current Mission" to next mission
   - ✅ Add backlog items if new missions identified
   - ❌ Do NOT add problem-solving details (only if vortex, then also update BREACH_NET)

2. **Update `docs/BREACH_NET.md` (ONLY IF VORTEX SOLVED):**
   - ✅ **ONLY if:** A vortex was encountered and fully resolved
   - ✅ Add new Issue #X with: Problem → Root Cause → Solution → Key Learning
   - ✅ Update "Critical Configuration" if stack/dependencies changed
   - ✅ Update "Critical Rules" if new rule prevents future mistakes
   - ❌ Do NOT add: Mission status, implementation details, feature descriptions
   - ❌ Do NOT add: Simple fixes, expected behaviors, or ongoing issues

3. **Update `docs/RESUME_HERE.md` (if pausing work):**
   - ✅ Update with current mission status
   - ✅ Add next steps
   - ✅ Note any blockers
   - ✅ Reference full context docs
   - ❌ Do NOT accumulate notes during active work (keep minimal or clear)

4. **Update `README.md` (if tech stack or dependencies changed):**
   - ✅ Update Tech Stack section if new libraries/dependencies added
   - ✅ Update Documentation section if new docs added or file names changed
   - ✅ Keep README.md as quick-start guide (no redundancy with detailed docs)
   - ❌ Do NOT add detailed implementation notes (SPRINT_LOG handles this)

5. **Commit, Push, and Deploy:**
   - ✅ Delete temporary troubleshooting files (if created)
   - ✅ Stage all changes: `git add -A`
   - ✅ Commit with descriptive message: `git commit -m "type: description"`
   - ✅ **Push ONCE per working iteration before testing** (not multiple times - saves compute)
   - ✅ Push to remote: `git push origin main`
   - ✅ Vercel automatically redeploys on push to main branch
   - ✅ User tests after deployment is live

**Key Principle:** SPRINT_LOG = What/How. BREACH_NET = Why Problems Occurred & How We Solved Them. RESUME_HERE = Quick-start pointer to full context.

**⚠️ Critical Project Context:**
- **Homepage URL:** `https://aire-mini.vercel.app` (will update to `https://waymaker.ai` in Mission 12)
- **Vercel:** Framework Preset = "Other", `builds` array in `vercel.json` (see `BREACH_NET.md` for details)
- **Vercel Plan:** Pro plan (required for 5-minute cron jobs)
- **GitHub:** `https://github.com/jonmayo7/aire-mini`

---

## Quick Reference: Starting New Chat

**Preferred Method:**
**User says:** `"Reference @RESUME_HERE.md"`

**AI does:**
1. Reads `docs/RESUME_HERE.md` (gets current state)
2. Reads documents referenced in RESUME_HERE.md
3. Reviews git log (last 5-10 commits)
4. Proposes plan or asks for clarification
5. **Does NOT update RESUME_HERE.md** (only update when pausing work)

**Alternative Method:**
**User says:** `"Reference @CONTEXT_MANAGEMENT.md. Starting Mission X."`

**AI does:**
1. Reads this file (understands documentation structure)
2. Reads `docs/SPRINT_LOG.md` (sees current mission, what's been built)
3. Reads `docs/BREACH_NET.md` (knows solved vortices, critical rules)
4. Reviews git log (last 5-10 commits)
5. Proposes plan for Mission X
6. **Does NOT update RESUME_HERE.md** (only update when pausing work)

**RESUME_HERE.md Protocol:**
- **When pausing:** Update with current state, next steps, blockers
- **When resuming:** AI reads it first, then reads referenced docs, then **leaves it unchanged** (saves compute)
- **During active work:** Do NOT update (only update when pausing)
- **Purpose:** Single document to reference for quick context, points to full docs
- **Key Rule:** Only update when pausing work, never during active sessions

**That's it.** No conversation history needed. No manual context gathering. Documentation provides all necessary context.

