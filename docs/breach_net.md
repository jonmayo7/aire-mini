# Breach Net: AIRE PWA (v1)

**Project:** Project AIRE (Ascending Infinite Recursion Engine)  
**Purpose:** An After-Action Review (AAR) and "break the glass" document to codify critical lessons from the initial MVP sprint. This log is filtered to be platform-agnostic and directly support the new Progressive Web App (PWA) build.

---

## Table of Contents

1. [Critical Facts & Configuration](#10-critical-facts--configuration)
2. [Problems, Vortices, & Solutions](#20-problems-vortices--solutions)
3. [Action Items](#30-action-items)

---

## 1.0 Critical Facts & Configuration

This section codifies the final, stable configuration of the core stack, excluding all Telegram-specific elements.

### Stack

- **Frontend:** React 18, TypeScript, Vite
- **UI Library:** (To Be Determined - Note: The `@telegram-apps/telegram-ui` library is deprecated for this build.)
- **State Management:** Zustand (with persist middleware)
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)

### Key Dependencies

- `react-router-dom`: For client-side routing
- `zustand`: For global state
- `@supabase/supabase-js`: For backend DB communication

### Core File Paths

- `src/index.tsx`: Main application entry point
- `src/components/Root.tsx`: Main router configuration
- `src/store/aireStore.ts`: Zustand global state store
- `api/cycles/create.ts`: Serverless function to write cycle data
- `api/cycles/lists.ts`: Serverless function to read previous commit

### API Endpoints (Vercel Serverless)

- **POST** `/api/cycles/create`: Creates a new cycle record
  - ⚠️ **Note:** This will require a new PWA-compatible auth method
  
- **GET** `/api/cycles/lists`: Fetches the most recent commit_text
  - ⚠️ **Note:** This will require a new PWA-compatible auth method

### Environment Variables (Vercel)

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE`: Supabase key with write/read access
- `SUPABASE_ANON_KEY`: Supabase client-side key

### Supabase Schema (cycles table)

| Column | Type | Notes |
|--------|------|-------|
| `tg_user_id` | text | ⚠️ **[Action Required]** Must be replaced with new user ID from PWA authentication system (e.g., Supabase Auth uuid) |
| `prime_text` | text | |
| `execution_score` | int4 | |
| `improve_text` | text | |
| `commit_text` | text | |
| `created_at` | timestampz | |

### Supabase RLS Policy (cycles table)

⚠️ **[Action Required]** The previous RLS policy was `((select auth.uid())::text = tg_user_id::text)`. This must be updated to match your new PWA authentication scheme.

---

## 2.0 Problems, Vortices, & Solutions

This is a log of all major, platform-agnostic bugs, their root causes, and the final working solutions.

### Vortex #1: The "Phantom" Vercel Build Failure

**Date:** Initial MVP Sprint  
**Severity:** Critical (blocked deployment)

**Symptom:**
Vercel builds repeatedly failed with TypeScript errors (`Cannot find module 'crypto'`, `Cannot find name 'process'`) even after pushing fixes. Deployed app showed old code.

**Root Cause:**
The Vercel project's build cache was corrupted and stuck on an old build command (`tsc --noEmit && vite build`) from the original template. This forced frontend (DOM) type-checking rules onto our backend (Node.js) API files.

**Solution (Multi-Part):**
1. **Destroy Environment:** The Vercel project was unrecoverable. It had to be deleted from the Vercel dashboard and re-imported from GitHub.
2. **Re-add Env Vars:** All environment variables (`SUPABASE_URL`, etc.) had to be re-added to the new Vercel project.
3. **Unified tsconfig.json:** Deleted `tsconfig.node.json` and `vercel.json`. Used a single root `tsconfig.json` to include types for both frontend and backend.

**Lessons Learned:**
- Always check Vercel build settings in dashboard, not just local config files
- Build cache corruption can persist across deployments
- When in doubt, nuclear option (delete/recreate) can be faster than debugging corrupted state

---

## 3.0 Action Items

Tracked items that require attention before production or during refactoring.

- [ ] **Replace `tg_user_id` column** with PWA-compatible user ID (e.g., Supabase Auth uuid)
- [ ] **Update Supabase RLS Policy** to match new PWA authentication scheme
- [ ] **Implement PWA-compatible authentication** for API endpoints (`/api/cycles/create` and `/api/cycles/lists`)
- [ ] **Determine and integrate UI Library** (replace deprecated `@telegram-apps/telegram-ui`)

---

## Template for Adding New Vortices

When documenting a new problem/vortex, use this format:

```
### Vortex #N: [Title]

**Date:** [YYYY-MM-DD]  
**Severity:** [Critical/High/Medium/Low]

**Symptom:**
[Clear description of what was wrong/not working]

**Root Cause:**
[What actually caused the problem]

**Solution:**
[Step-by-step solution, numbered if multiple steps]

**Lessons Learned:**
[Key takeaways to prevent recurrence]
```