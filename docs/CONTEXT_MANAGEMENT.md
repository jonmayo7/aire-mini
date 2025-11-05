# Context Window Management Strategy

## The Challenge
As we build out the AIRE PWA, our conversation history and codebase will grow. LLM context windows have limits, so we need a strategy to maintain continuity.

## Solution: Mission-Based Documentation

### Strategy Overview
After each mission completion, we'll:
1. **Update Documentation** - Capture all learnings in `docs/SPRINT_LOG.md` and `docs/BREACH_NET.md`
2. **Commit & Push** - Ensure all work is saved and pushed to git
3. **Create Mission Summary** - Document what was built, how, and why
4. **Start Fresh** - Begin next mission with reference to documentation only

### Documentation File Structure

**File Organization:**
- **`docs/`** - All documentation files (critical and short-term)
  - `BREACH_NET.md` - Problems/solutions log
  - `SPRINT_LOG.md` - Mission completion tracking
  - `PROJECT_AIRE.md` - Master project plan
  - `CONTEXT_MANAGEMENT.md` - This file (context strategy)

**Note:** All critical documentation files are in `docs/` root for easy @ mention referencing in Cursor.

### Key Documentation Files

**`docs/SPRINT_LOG.md`**
- **Purpose:** Mission completion tracking and implementation details
- Current mission status
- Completed missions with detailed implementation notes
- Important technical decisions per mission
- User actions required per mission
- Backlog of future missions
- Active blockers

**`docs/BREACH_NET.md`**
- **Purpose:** Critical learnings, problems encountered, and solutions
- **NOT for mission completion tracking** - see `SPRINT_LOG.md` for that
- Critical facts & configuration (stack, dependencies, file paths, API endpoints)
- Problems, vortices, and solutions (issues we ran into and how we solved them)
- Lessons learned that improve future development
- **Focus:** Problems encountered → Root causes → Solutions → Key learnings

**`docs/PROJECT_AIRE.md`**
- Master project plan and architecture
- Mission roadmap and priorities
- Long-term vision and strategy

**`docs/CONTEXT_MANAGEMENT.md`**
- This file - Context window management strategy
- Documentation structure and workflow

**`docs/sql/`**
- All database schema SQL files
- Table creation scripts
- Migration scripts (if any)

**`docs/MISSION_VERIFICATION.md`**
- Verification checklist for all missions
- Infrastructure verification steps
- Mission-by-mission verification criteria

**`docs/VERIFICATION_GUIDE.md`**
- Step-by-step verification guide
- Troubleshooting tips
- Pre-verification checklist

**`docs/TEST_ENDPOINTS.md`**
- API endpoint testing procedures
- curl commands for testing
- Expected responses

**`docs/RESUME_HERE.md`**
- Quick reference for current state
- Recent fixes and known issues
- Next steps

**`docs/MISSION_X_PLAN.md`** (if exists)
- Detailed implementation plan for specific missions
- User actions required
- Success criteria
- Testing procedures

### Workflow for New Sessions

When starting a new chat session:

1. **Read Core Documentation:**
   ```
   - docs/SPRINT_LOG.md (current status)
   - docs/BREACH_NET.md (critical learnings)
   - docs/PROJECT_AIRE.md (master plan)
   - docs/RESUME_HERE.md (quick current state)
   ```

2. **Review Recent Commits:**
   ```bash
   git log --oneline -10
   git diff HEAD~1 HEAD  # See last mission's changes
   ```

3. **Check Current State:**
   - Review `docs/SPRINT_LOG.md` for current mission
   - Check `docs/BREACH_NET.md` for any blockers or warnings
   - Review `docs/RESUME_HERE.md` for quick status
   - Review any mission-specific plan documents

4. **Resume Work:**
   - Reference documentation, not conversation history
   - Ask for clarification on any unclear points
   - Build upon documented learnings

### Best Practices

**Do:**
- ✅ Update documentation after each mission
- ✅ Commit and push frequently
- ✅ Document user actions required
- ✅ Capture lessons learned in BREACH_NET.md
- ✅ Create detailed mission plans before starting

**Don't:**
- ❌ Rely on conversation history for context
- ❌ Skip documentation updates
- ❌ Leave work uncommitted
- ❌ Assume knowledge from previous sessions

### Example: Starting Mission 4 After Mission 3

**New Chat Session:**
```
"I'm continuing work on AIRE PWA. Mission X is complete. 
Please review docs/SPRINT_LOG.md and 
docs/BREACH_NET.md, then help me start Mission Y."
```

**AI Response:**
- Reads `docs/SPRINT_LOG.md` (sees current mission)
- Reads `docs/BREACH_NET.md` (understands critical learnings)
- Reads `docs/RESUME_HERE.md` (quick status check)
- Reviews mission completion status
- Proposes next mission plan or asks for clarification

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
   - Check `docs/RESUME_HERE.md` for quick status
   - Review any TODO comments in code

3. **Ask for Status:**
   ```
   "What's the current state? What mission are we on? 
   What was the last thing completed?"
   ```

### Standard Post-Mission Documentation Update

**After EVERY mission completion, the following documentation updates are REQUIRED:**

1. **Update `docs/SPRINT_LOG.md`:**
   - Mark completed mission with checkboxes
   - Move to "Completed Missions" section
   - Update "Current Mission" to next mission
   - Add any new backlog items

2. **Update `docs/BREACH_NET.md`:**
   - **Only if problems were encountered:** Add new solution to "Problems, Vortices, & Solutions" section
   - Update "Critical Facts & Configuration" if stack/dependencies changed
   - Update "Core File Paths" if new files created
   - Update "API Endpoints" if new endpoints added
   - **Focus:** Document problems encountered and how they were solved, not implementation steps
   - **Do NOT add:** Step-by-step implementation details, mission completion status, feature descriptions

3. **Update `docs/RESUME_HERE.md`** (if needed):
   - Update current state
   - Update known issues
   - Update next steps

4. **Commit and Push:**
   - All changes must be committed
   - Push to remote repository
   - Verify documentation is complete

**This workflow is standardized and should be executed automatically after each mission without explicit user request.**

### Documentation Maintenance

**After Each Mission:**
1. ✅ Update `docs/SPRINT_LOG.md` (mark completed, add implementation details, update current mission)
2. ✅ Update `docs/BREACH_NET.md` (only if problems encountered - add solutions, update config/paths/endpoints)
3. ✅ Update `docs/RESUME_HERE.md` (if needed - quick status update)
4. ✅ Commit all changes
5. ✅ Push to remote
6. ✅ Verify documentation is complete and accurate

**Documentation Distinction:**
- **SPRINT_LOG.md:** What was built, how it was implemented, mission status
- **BREACH_NET.md:** Problems we hit, why they occurred, how we solved them, key learnings
- **RESUME_HERE.md:** Quick reference for current state and next steps

**Before Starting New Mission:**
1. ✅ Review `docs/SPRINT_LOG.md`
2. ✅ Review `docs/BREACH_NET.md`
3. ✅ Review `docs/RESUME_HERE.md` for quick status
4. ✅ Review any mission-specific plan
5. ✅ Confirm git status is clean
6. ✅ Identify user actions required

**⚠️ Important Notes:**
- **Homepage URL:** The `package.json` homepage field is set to `https://aire-mini.vercel.app` (Vercel deployment URL). This will be updated to `https://striveos.io` when Mission 8.5 (Custom Domain Configuration) is completed.
- **Vercel Functions:** Utility files are in `lib/api/` (NOT `api/lib/`) to prevent Vercel from auto-detecting them as serverless functions. See BREACH_NET.md Vortex #3.
- **Vercel Cron Jobs:** Hobby accounts are limited to daily cron jobs. Pro plan required for cron jobs running more frequently (e.g., every 5 minutes). See BREACH_NET.md for notification system details.
- **GitHub Repository:** `https://github.com/jonmayo7/aire-mini`

This approach ensures continuity without relying on conversation history.

