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
- **UI Library:** shadcn/ui with Tailwind CSS (slate theme, default style)
- **State Management:** Zustand (with persist middleware)
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with custom AuthProvider

### Key Dependencies

- `react-router-dom`: For client-side routing
- `zustand`: For global state management
- `@supabase/supabase-js`: For backend DB communication and client
- `@supabase/auth-ui-react`: For authentication UI components
- `shadcn/ui`: UI component library (button, input, textarea, card)
- `tailwindcss`: Styling framework

### Core File Paths

- `src/index.tsx`: Main application entry point
- `src/components/Root.tsx`: Main router configuration with protected routing
- `src/lib/supabaseClient.ts`: Supabase client initialization
- `src/lib/authContext.tsx`: Custom AuthProvider for session management
- `src/store/aireStore.ts`: Zustand global state store
- `src/pages/AuthScreen.tsx`: Login/signup page
- `src/pages/DashboardScreen.tsx`: Main dashboard/home page
- `api/cycles/create.ts`: Serverless function to write cycle data (TODO: JWT auth)
- `api/cycles/lists.ts`: Serverless function to read previous commit (TODO: JWT auth)

### API Endpoints (Vercel Serverless)

- **POST** `/api/cycles/create`: Creates a new cycle record
  - ⚠️ **Status:** Currently uses placeholder user_id. Requires JWT token extraction and verification (Mission 3)
  
- **GET** `/api/cycles/lists`: Fetches the most recent commit_text
  - ⚠️ **Status:** Currently uses placeholder user_id. Requires JWT token extraction and verification (Mission 3)

### Environment Variables

**Local Development (.env.local):**
- `VITE_SUPABASE_URL`: Supabase project URL (for frontend client)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (for frontend client)

**Vercel Deployment:**
- `SUPABASE_URL`: Supabase project URL (for serverless functions)
- `SUPABASE_SERVICE_ROLE`: Supabase service role key with write/read access (for serverless functions)
- `SUPABASE_ANON_KEY`: Supabase anonymous key (for client-side, if needed)

### Supabase Schema (cycles table)

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid | ⚠️ **[Action Required - Mission 3]** Currently using placeholder. Must extract from JWT token. Column name should match Supabase Auth `auth.users.id` (uuid type) |
| `prime_text` | text | |
| `execution_score` | int4 | |
| `improve_text` | text | |
| `commit_text` | text | |
| `created_at` | timestampz | |

**Note:** If the database column is still named `tg_user_id`, it needs to be renamed to `user_id` to match Supabase Auth standard.

### Supabase RLS Policy (cycles table)

⚠️ **[Action Required - Mission 3]** The RLS policy should be updated to:
```sql
CREATE POLICY "Users can only access their own cycles"
ON cycles FOR ALL
USING (auth.uid() = user_id);
```

This ensures users can only read/write their own cycle data.

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

- [x] **Replace `tg_user_id` column** with PWA-compatible user ID (Supabase Auth uuid) - **In Progress (Mission 3)**
- [ ] **Update Supabase RLS Policy** to match new PWA authentication scheme (Mission 3)
- [ ] **Implement PWA-compatible authentication** for API endpoints (`/api/cycles/create` and `/api/cycles/lists`) - **Mission 3**
- [x] **Determine and integrate UI Library** - **Completed:** shadcn/ui with Tailwind CSS

## 4.0 Completed Solutions

### Solution #1: Vite + Supabase Auth Compatibility

**Date:** Mission 2 Implementation  
**Severity:** High (blocked auth implementation)

**Symptom:**
The deprecated `@supabase/auth-helpers-react` package's `createClientComponentClient` and `SessionContextProvider` did not work properly with Vite's environment variable system, causing blank page on load.

**Root Cause:**
- `createClientComponentClient()` expects Next.js-style environment variables
- `SessionContextProvider` from deprecated package has compatibility issues with Vite
- Missing proper TypeScript types for Vite's `import.meta.env`

**Solution:**
1. **Created custom Supabase client** (`src/lib/supabaseClient.ts`):
   - Used `createClient` from `@supabase/supabase-js` directly
   - Explicitly reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`
   - Added error handling for missing environment variables

2. **Created custom AuthProvider** (`src/lib/authContext.tsx`):
   - Replaced deprecated `SessionContextProvider` with custom React context
   - Uses Supabase's native `auth.getSession()` and `auth.onAuthStateChange()`
   - Provides `useAuth()` hook matching expected API
   - Fully compatible with Vite and React 18

3. **Added TypeScript definitions** (`src/global.d.ts`):
   - Extended `ImportMetaEnv` interface for Vite environment variables
   - Ensures type safety for environment variable access

**Lessons Learned:**
- Deprecated packages may have compatibility issues with modern tooling
- Custom solutions using native APIs are often more reliable than wrapper libraries
- Always verify environment variable access patterns match your build tool (Vite vs Next.js)

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