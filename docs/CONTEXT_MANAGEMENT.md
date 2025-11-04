# Context Window Management Strategy

## The Challenge
As we build out the AIRE PWA, our conversation history and codebase will grow. LLM context windows have limits, so we need a strategy to maintain continuity.

## Solution: Mission-Based Documentation

### Strategy Overview
After each mission completion, we'll:
1. **Update Documentation** - Capture all learnings in `sprint_log.md` and `breach_net.md`
2. **Commit & Push** - Ensure all work is saved and pushed to git
3. **Create Mission Summary** - Document what was built, how, and why
4. **Start Fresh** - Begin next mission with reference to documentation only

### Key Documentation Files

**`docs/sprint_log.md`**
- **Purpose:** Mission completion tracking and implementation details
- Current mission status
- Completed missions with detailed implementation notes
- Important technical decisions per mission
- User actions required per mission
- Backlog of future missions
- Active blockers

**`docs/breach_net.md`**
- **Purpose:** Critical learnings, problems encountered, and solutions
- **NOT for mission completion tracking** - see `sprint_log.md` for that
- Critical facts & configuration (stack, dependencies, file paths, API endpoints)
- Problems, vortices, and solutions (issues we ran into and how we solved them)
- Lessons learned that improve future development
- **Focus:** Problems encountered → Root causes → Solutions → Key learnings

**`docs/MISSION_X_PLAN.md`**
- Detailed implementation plan for each mission
- User actions required
- Success criteria
- Testing procedures

### Workflow for New Sessions

When starting a new chat session after Mission 3:

1. **Read Core Documentation:**
   ```
   - docs/sprint_log.md (current status)
   - docs/breach_net.md (critical learnings)
   - docs/MISSION_3_PLAN.md (if Mission 3 completed)
   ```

2. **Review Recent Commits:**
   ```bash
   git log --oneline -10
   git diff HEAD~1 HEAD  # See last mission's changes
   ```

3. **Check Current State:**
   - Review sprint_log.md for current mission
   - Check breach_net.md for any blockers or warnings
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
- ✅ Capture lessons learned in breach_net.md
- ✅ Create detailed mission plans before starting

**Don't:**
- ❌ Rely on conversation history for context
- ❌ Skip documentation updates
- ❌ Leave work uncommitted
- ❌ Assume knowledge from previous sessions

### Example: Starting Mission 4 After Mission 3

**New Chat Session:**
```
"I'm continuing work on AIRE PWA. Mission 3 is complete. 
Please review docs/sprint_log.md and docs/breach_net.md, 
then help me start Mission 4."
```

**AI Response:**
- Reads sprint_log.md (sees Mission 4 is next)
- Reads breach_net.md (understands critical learnings)
- Reviews Mission 3 completion status
- Proposes Mission 4 plan or asks for clarification

### Emergency Context Recovery

If we lose context mid-mission:

1. **Check Git Status:**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Review Documentation:**
   - Read sprint_log.md for current mission status
   - Check breach_net.md for recent solutions
   - Review any TODO comments in code

3. **Ask for Status:**
   ```
   "What's the current state? What mission are we on? 
   What was the last thing completed?"
   ```

### Standard Post-Mission Documentation Update

**After EVERY mission completion, the following documentation updates are REQUIRED:**

1. **Update `sprint_log.md`:**
   - Mark completed mission with checkboxes
   - Move to "Completed Missions" section
   - Update "Current Mission" to next mission
   - Add any new backlog items

2. **Update `breach_net.md`:**
   - **Only if problems were encountered:** Add new solution to "Problems, Vortices, & Solutions" section
   - Update "Critical Facts & Configuration" if stack/dependencies changed
   - Update "Core File Paths" if new files created
   - Update "API Endpoints" if new endpoints added
   - **Focus:** Document problems encountered and how they were solved, not implementation steps
   - **Do NOT add:** Step-by-step implementation details, mission completion status, feature descriptions

3. **Commit and Push:**
   - All changes must be committed
   - Push to remote repository
   - Verify documentation is complete

**This workflow is standardized and should be executed automatically after each mission without explicit user request.**

### Documentation Maintenance

**After Each Mission:**
1. ✅ Update sprint_log.md (mark completed, add implementation details, update current mission)
2. ✅ Update breach_net.md (only if problems encountered - add solutions, update config/paths/endpoints)
3. ✅ Commit all changes
4. ✅ Push to remote
5. ✅ Verify documentation is complete and accurate

**Documentation Distinction:**
- **sprint_log.md:** What was built, how it was implemented, mission status
- **breach_net.md:** Problems we hit, why they occurred, how we solved them, key learnings

**Before Starting New Mission:**
1. ✅ Review sprint_log.md
2. ✅ Review breach_net.md
3. ✅ Review any mission-specific plan
4. ✅ Confirm git status is clean
5. ✅ Identify user actions required

This approach ensures continuity without relying on conversation history.

