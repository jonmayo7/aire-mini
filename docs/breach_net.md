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
  - ✅ **Status:** JWT authentication implemented (JWKS-based)
  - Requires `Authorization: Bearer <token>` header
  - Returns 401 if token invalid/missing
  - Extracts user_id from verified JWT token
  
- **GET** `/api/cycles/lists`: Fetches the most recent commit_text
  - ✅ **Status:** JWT authentication implemented (JWKS-based)
  - Requires `Authorization: Bearer <token>` header
  - Returns 401 if token invalid/missing
  - Extracts user_id from verified JWT token

### Environment Variables

**Local Development (.env.local):**
- `VITE_SUPABASE_URL`: Supabase project URL (for frontend client)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (for frontend client) - **Must use NEW API keys**

**Vercel Deployment:**
- `SUPABASE_URL`: Supabase project URL (for serverless functions and JWKS URL construction)
- `SUPABASE_SERVICE_ROLE`: Supabase service role key with write/read access (for serverless functions) - **Must use NEW API keys**
- `SUPABASE_ANON_KEY`: Supabase anonymous key (optional, for client-side if needed)

**Note:** With JWKS approach, no `SUPABASE_JWT_SECRET` is needed. JWKS URL is automatically constructed from `SUPABASE_URL`.

### Supabase Schema (cycles table)

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | uuid | ⚠️ **[Migration Required]** Currently `tg_user_id` (int8). Must migrate to `user_id` (uuid). See `docs/MIGRATION_SQL.sql` |
| `prime_text` | text | |
| `execution_score` | int4 | |
| `improve_text` | text | |
| `commit_text` | text | |
| `created_at` | timestampz | |

**Migration Status:** 
- Current: `tg_user_id` (int8)
- Target: `user_id` (uuid)
- Migration SQL: See `docs/MIGRATION_SQL.sql`

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

- [x] **Replace `tg_user_id` column** with PWA-compatible user ID (Supabase Auth uuid) - **Migration SQL provided, user action required**
- [x] **Update Supabase RLS Policy** - **Policy SQL provided, user action required**
- [x] **Implement PWA-compatible authentication** for API endpoints - **Completed: JWKS-based JWT verification**
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

### Solution #2: JWKS-Based JWT Verification

**Date:** Mission 3 Implementation  
**Severity:** High (required for secure API authentication)

**Context:**
Implemented JWT-based authentication for API endpoints using Supabase's NEW JWKS (JSON Web Key Set) approach instead of legacy JWT secret.

**Implementation:**
1. **Created JWT verification utility** (`api/lib/verifyJWT.ts`):
   - Uses `jwks-rsa` to fetch and cache public keys from Supabase JWKS endpoint
   - Uses `jsonwebtoken` to verify tokens with RSA public keys
   - Automatically constructs JWKS URL from `SUPABASE_URL`
   - Extracts user_id from token payload (`sub` field)
   - Handles token expiration and validation errors

2. **Updated API endpoints** (`api/cycles/create.ts`, `api/cycles/lists.ts`):
   - Extract JWT token from `Authorization: Bearer <token>` header
   - Verify token using JWKS before processing requests
   - Return 401 Unauthorized for invalid/missing tokens
   - Use authenticated user_id from verified token for database operations

3. **Created authenticated fetch helper** (`src/lib/apiClient.ts`):
   - React hook that provides `authenticatedFetch` function
   - Automatically includes JWT token from current session
   - Handles missing session gracefully

4. **Updated frontend screens**:
   - `VisualizeScreen.tsx`: Uses authenticated fetch for cycle creation
   - `ImproveScreen.tsx`: Uses authenticated fetch for previous commit retrieval
   - Both handle 401 errors by redirecting to `/auth`

**Why JWKS over Legacy:**
- **More secure:** RSA public/private key pairs vs shared HMAC secret
- **Key rotation:** Supports automatic key rotation without code changes
- **Future-proof:** Supabase's recommended approach
- **No secrets in code:** Public keys fetched from JWKS endpoint (no JWT secret needed)

**Database Migration Required:**
- Column `tg_user_id` (int8) must be migrated to `user_id` (uuid)
- Migration SQL provided in `docs/MIGRATION_SQL.sql`
- RLS policy must be updated to use `auth.uid() = user_id`

**Lessons Learned:**
- JWKS approach requires no secrets in environment variables (only public keys)
- JWKS caching is critical for performance (24-hour cache used)
- Token payload structure: `sub` field contains the user_id (uuid)
- Always verify token before any database operation
- Frontend must handle 401 errors gracefully (redirect to login)

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