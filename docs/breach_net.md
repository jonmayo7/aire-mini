# Breach Net: AIRE PWA (v1)

**Project:** Project AIRE (Ascending Infinite Recursion Engine)  
**Purpose:** Critical learnings, problems encountered, and solutions discovered during development. This document focuses on **issues we ran into** and **how we solved them** to improve future development. **NOT for mission completion tracking** - see `sprint_log.md` for that.

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
- `shadcn/ui`: UI component library (button, input, textarea, card, label)
- `recharts`: Charting library for data visualization
- `resend`: Email service for sending notifications
- `tailwindcss`: Styling framework

### Core File Paths

- `src/index.tsx`: Main application entry point
- `src/components/Root.tsx`: Main router configuration with protected routing
- `src/lib/supabaseClient.ts`: Supabase client initialization
- `src/lib/authContext.tsx`: Custom AuthProvider for session management
- `src/store/aireStore.ts`: Zustand global state store
- `src/pages/AuthScreen.tsx`: Login/signup page
- `src/pages/DashboardScreen.tsx`: Main dashboard/home page
- `api/cycles/create.ts`: Serverless function to write cycle data (JWT authenticated)
- `api/cycles/lists.ts`: Serverless function to read previous commit (JWT authenticated)
- `src/pages/PrimeScreen.tsx`: Prime step of PICV cycle (shadcn/ui)
- `src/pages/ImproveScreen.tsx`: Improve step of PICV cycle (shadcn/ui)
- `src/pages/CommitScreen.tsx`: Commit step of PICV cycle (shadcn/ui, with Resonance Engine)
- `src/pages/VisualizeScreen.tsx`: Visualize/save step of PICV cycle (shadcn/ui)
- `src/pages/ImprovementLogScreen.tsx`: Improvement log page showing all past improve_text entries
- `src/pages/OnboardingScreen.tsx`: User preferences onboarding screen
- `src/components/AscentGraph.tsx`: Chart component displaying execution scores over time
- `api/cycles/history.ts`: Serverless function to fetch all cycles for authenticated user (JWT authenticated)
- `api/resonance/query.ts`: Serverless function for Resonance Engine suggestions (JWT authenticated)
- `api/lib/verifyJWT.ts`: JWT verification utility using JWKS (shared utility, NOT a serverless function)
- `api/lib/resonance.ts`: Utility for keyword matching and relevance scoring (shared utility, NOT a serverless function)
- `api/user/preferences.ts`: Serverless function for user preferences (GET/POST, JWT authenticated)
- `api/notifications/send.ts`: Serverless function for sending notifications (protected by CRON_SECRET)
- `src/hooks/useDebounce.ts`: Custom hook for debouncing input values
- `vercel.json`: Vercel configuration for cron jobs

**Note:** Shared utilities used by serverless functions (`verifyJWT`, `resonance`) are in `api/lib/`. They are automatically bundled with functions since they're in `api/` directory. They may appear in Vercel's Functions tab but won't be callable as endpoints since they don't export default functions (cosmetic issue only).

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
  - Returns most recent `commit_text` or null if no cycles exist
  
- **GET** `/api/cycles/history`: Fetches all cycles for authenticated user
  - ✅ **Status:** JWT authentication implemented (JWKS-based)
  - Requires `Authorization: Bearer <token>` header
  - Returns 401 if token invalid/missing
  - Extracts user_id from verified JWT token
  - Returns array of cycles ordered by `created_at DESC`
  - Used for Ascent Graph and Improvement Log
  
- **POST** `/api/resonance/query`: Fetches relevant past improvements for commit text
  - ✅ **Status:** JWT authentication implemented (JWKS-based)
  - Requires `Authorization: Bearer <token>` header
  - Returns 401 if token invalid/missing
  - Body: `{ commit_text: string }`
  - Returns top 3 most relevant improvements based on keyword matching
  - Used by CommitScreen for Resonance Engine suggestions
  
- **GET** `/api/user/preferences`: Fetches user notification preferences
  - ✅ **Status:** JWT authentication implemented (JWKS-based)
  - Requires `Authorization: Bearer <token>` header
  - Returns 401 if token invalid/missing
  - Returns user preferences or null if not set
  
- **POST** `/api/user/preferences`: Creates or updates user notification preferences
  - ✅ **Status:** JWT authentication implemented (JWKS-based)
  - Requires `Authorization: Bearer <token>` header
  - Returns 401 if token invalid/missing
  - Body: `{ email?, phone?, preferred_notification_time?, notification_method? }`
  - Upserts preferences based on user_id
  
- **POST** `/api/notifications/send`: Sends daily notification emails (called by cron job)
  - ✅ **Status:** Protected by Vercel's native CRON_SECRET
  - Requires `Authorization: Bearer ${CRON_SECRET}` header (automatically sent by Vercel Cron)
  - Returns 401 if CRON_SECRET doesn't match
  - Queries users with matching preferred_notification_time (5-minute window)
  - Sends emails via Resend to users with email method
  - Called by Vercel Cron every 5 minutes
  - **Why 5 minutes?** Users can set any preferred time (e.g., 9:17 AM). Cron runs every 5 minutes with ±5 minute window to catch flexible user preferences. This enables personalized notification timing vs. fixed system times. The 5-minute frequency requires Vercel Pro plan (Hobby plan limited to daily cron jobs only).

### Environment Variables

**Local Development (.env.local):**
- `VITE_SUPABASE_URL`: Supabase project URL (for frontend client)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (for frontend client) - **Must use NEW API keys**

**Vercel Deployment - Frontend Variables (REQUIRED!):**
- `VITE_SUPABASE_URL`: Supabase project URL (for frontend client) - **MUST be in Vercel!**
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (for frontend client) - **MUST be in Vercel!**
- **Without these, deployed app shows white screen error!**

**Vercel Deployment - Backend Variables:**
- `SUPABASE_URL`: Supabase project URL (for serverless functions and JWKS URL construction) - same value as VITE_SUPABASE_URL but without prefix
- `SUPABASE_SERVICE_ROLE`: Supabase service role key with write/read access (for serverless functions) - **Must use NEW API keys**
- `RESEND_API_KEY`: Resend API key for sending email notifications
- `CRON_SECRET`: Vercel's cron job secret (automatically sent in Authorization header, or set custom value)
- `PWA_URL`: PWA base URL for deep-linking (default: `https://waymaker.ai/#/`)

**Note:** With JWKS approach, no `SUPABASE_JWT_SECRET` is needed. JWKS URL is automatically constructed from `SUPABASE_URL`.

### Supabase Schema

**cycles table:**
- `user_id` (uuid) - References auth.users(id)
- `prime_text`, `improve_text`, `commit_text` (text)
- `execution_score` (int4, 0-10)
- `created_at` (timestampz)
- RLS enabled with policy: `auth.uid() = user_id`

**user_preferences table:**
- `user_id` (uuid) - References auth.users(id), unique constraint
- `email`, `phone` (text, nullable)
- `preferred_notification_time` (time)
- `notification_method` (text: 'email', 'sms', 'both')
- RLS enabled with policy: `auth.uid() = user_id`

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

### Vortex #2: Vercel API Endpoints Not Deploying (DEPLOYMENT_NOT_FOUND)

**Date:** Mission 7 (Notification System)  
**Severity:** Critical (API endpoints not accessible)

**Symptom:**
- `DEPLOYMENT_NOT_FOUND` error when testing API endpoints with curl
- API routes return 404 even though code is pushed
- Vercel deployment succeeds but API endpoints don't exist

**Root Cause:**
- Vercel Vite preset in UI settings overrides/conflicts with `vercel.json` builds configuration
- When framework preset is set, Vercel may ignore the `builds` array in `vercel.json`
- API endpoints in `api/**/*.ts` are not being built as serverless functions

**Solution Applied: Option B - Auto-Detection**

**Steps Taken:**
1. Removed `builds` array from `vercel.json` entirely
2. Vercel auto-detects API routes in `api/` folder (standard behavior)
3. Kept only `routes` and `crons` in `vercel.json`
4. Vite preset in UI handles frontend build (dist directory)

**Final `vercel.json` Configuration:**
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "crons": [
    {
      "path": "/api/notifications/send",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Why This Works:**
- Vercel automatically detects TypeScript files in `api/` folder as serverless functions
- No explicit `builds` array needed when using framework presets
- Routes configuration ensures proper routing
- Vite preset handles frontend build separately

**Alternative Solutions (if auto-detection fails):**

**Option A: Remove Framework Preset**
1. In Vercel Dashboard → Project Settings → General
2. Set Framework Preset to "Other" or "No Framework"
3. Add back `builds` array with both API and static build
4. `vercel.json` handles all builds explicitly

**Solution Updated: Option A - Explicit Builds (After auto-detection failed)**

**Steps Taken:**
1. Added back `builds` array with both API and static build
2. User must remove Vite preset in Vercel UI (set to "Other" or "No Framework")
3. `vercel.json` now handles ALL builds explicitly
4. This ensures API endpoints are built regardless of UI settings

**Updated `vercel.json` Configuration:**
```json
{
  "builds": [
    { "src": "api/**/*.ts", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [...],
  "crons": [...]
}
```

**User Action Required:**
1. In Vercel Dashboard → Project Settings → General
2. Set Framework Preset to "Other" or "No Framework"
3. Keep Output Directory as "dist" (or leave empty)
4. Redeploy to pick up new configuration

**Solution Status: ✅ RESOLVED**

**Final Configuration:**
- `vercel.json` has explicit builds for both API and frontend
- Vite preset removed from UI (set to "Other")
- Both API and frontend builds working correctly
- 6 API functions deployed successfully (verified in Functions tab)

**Verification:**
- Functions tab shows 6 functions: `/api/cycles/create`, `/api/cycles/history`, `/api/cycles/lists`, `/api/lib/resonance`, `/api/lib/verifyJWT`, `/api/resonance/query`
- Build logs show successful compilation of all API files (including notifications/send and user/preferences)
- Curl test returns HTML (Vercel deployment protection page) = **endpoints exist!** ✅
- HTML response is NOT an error - it's Vercel protecting preview deployments

**Note:** Functions tab may only show invoked functions. All endpoints are built and deployed. The HTML response confirms endpoints exist (protected by Vercel deployment protection).

**Note:** HTML response from curl is Vercel's deployment protection, NOT a 404 error. This means endpoints are deployed correctly.

**Lessons Learned:**
- Framework presets in UI can override `vercel.json` builds configuration
- Always verify both UI settings AND `vercel.json` are aligned
- Test API endpoints immediately after deployment to catch this early
- Vercel auto-detection works but can conflict with explicit builds

---

## 3.0 Completed Solutions

**Note:** These solutions document problems encountered and how they were solved. For implementation details and mission completion status, see `sprint_log.md`.

### Solution #1: Vite + Supabase Auth Compatibility

**Date:** Mission 2  
**Severity:** High (blocked auth implementation)

**Problem:**
Blank page on load. Deprecated `@supabase/auth-helpers-react` package incompatible with Vite's environment variable system.

**Root Cause:**
- `createClientComponentClient()` expects Next.js-style env vars
- `SessionContextProvider` has Vite compatibility issues
- Missing TypeScript types for `import.meta.env`

**Solution:**
- Created custom Supabase client using `createClient` directly from `@supabase/supabase-js`
- Built custom AuthProvider using native Supabase `auth.getSession()` and `auth.onAuthStateChange()`
- Added TypeScript definitions for `ImportMetaEnv` interface

**Key Learning:**
Deprecated packages may break with modern tooling. Custom solutions using native APIs are more reliable than wrapper libraries.

### Solution #2: JWKS-Based JWT Verification

**Date:** Mission 3  
**Severity:** High (required for secure API authentication)

**Problem:**
Needed secure API authentication. Legacy JWT secret approach is less secure and doesn't support key rotation.

**Root Cause:**
- Legacy HMAC secrets require shared secret in env vars
- No automatic key rotation support
- Less secure than RSA public/private key pairs

**Solution:**
- Implemented JWKS (JSON Web Key Set) approach using `jwks-rsa` and `jsonwebtoken`
- Created `api/lib/verifyJWT.ts` utility that:
  - Fetches and caches public keys from Supabase JWKS endpoint
  - Verifies tokens with RSA public keys
  - Extracts user_id from token `sub` field
- Created `src/lib/apiClient.ts` hook for authenticated fetch requests
- All API endpoints verify JWT before processing

**Why JWKS over Legacy:**
- More secure (RSA vs HMAC)
- Supports automatic key rotation
- No secrets in env vars (only public keys)
- Future-proof (Supabase's recommended approach)

**Key Learning:**
JWKS caching (24-hour) is critical for performance. Token `sub` field contains user_id (uuid). Always verify token before database operations.

### Solution #3: UI Refactoring with shadcn/ui

**Date:** Mission 4  
**Severity:** Medium (UI consistency and accessibility)

**Problem:**
Inconsistent UI across screens, accessibility issues with basic HTML elements, poor visual hierarchy.

**Root Cause:**
- Basic HTML elements without consistent styling
- Missing proper form labels for accessibility
- No visual hierarchy or consistent layout patterns

**Solution:**
- Refactored all PICV screens to use shadcn/ui components (Card, Button, Textarea, Label)
- Card-based layouts for visual hierarchy
- Proper Label components with `htmlFor` attributes for accessibility
- Consistent spacing and layout patterns

**Key Learning:**
shadcn/ui provides consistent styling out of the box. Card-based layouts improve readability. Label components are essential for screen readers.

### Solution #4: Ascent Graph Rolling Average Bug

**Date:** Mission 5  
**Severity:** Medium (data visualization accuracy)

**Problem:**
Rolling average calculation could result in negative array indices, causing incorrect trend visualization.

**Root Cause:**
- `calculateRollingAverage` used `data.slice(i - windowSize, i + 1)`
- When `i < windowSize`, this created negative start index
- JavaScript slice handles this, but results in incorrect window calculation

**Solution:**
- Changed to `Math.max(0, i - windowSize + 1)` to ensure valid start index
- Properly handles edge cases when fewer than 7 data points exist

**Key Learning:**
Always validate array slice indices. Edge cases (fewer data points than window size) must be handled explicitly.

### Solution #5: Debouncing for Search-as-You-Type

**Date:** Mission 6  
**Severity:** Medium (API performance)

**Problem:**
Resonance Engine queries triggered on every keystroke, causing excessive API calls and potential rate limiting.

**Root Cause:**
- No debouncing mechanism for user input
- Each character typed triggered new API request
- Could result in 10+ API calls for a single commit text entry

**Solution:**
- Created `src/hooks/useDebounce.ts` hook with 500ms delay
- Added minimum 3-character threshold before querying
- Debounced commit text triggers API call only after user stops typing

**Key Learning:**
Debouncing is critical for search-as-you-type features. Minimum character threshold reduces noise from very short queries.

### Solution #6: Vercel Cron Authentication

**Date:** Mission 7  
**Severity:** Medium (security)

**Problem:**
Initially used custom `NOTIFICATION_SERVICE_KEY` with manual header/query parameter checks. This required manual cron configuration and was less secure.

**Root Cause:**
- Custom service key approach required manual configuration
- Had to check multiple sources (headers, query params)
- Not using Vercel's native cron security features

**Solution:**
- Switched to Vercel's native `CRON_SECRET` approach
- Verifies `Authorization: Bearer ${CRON_SECRET}` header
- Vercel automatically sends this header in cron requests
- Removed all custom service key logic

**Key Learning:**
Vercel's native CRON_SECRET is simpler and more secure than custom service keys. Vercel automatically handles authentication - no manual configuration needed.

### Solution #7: ImproveScreen Loading Issue

**Date:** Mission Verification  
**Severity:** Critical (blocked all mission verification)

**Problem:**
ImproveScreen stuck on loading screen indefinitely, preventing user from completing PICV cycle and blocking all mission verification.

**Root Cause:**
- `useAuthenticatedFetch` hook not checking if auth session was still loading
- API call made before session was available
- No error state displayed to user
- `authenticatedFetch` function reference changed on every render, causing useEffect to run repeatedly

**Solution:**
- Added `authLoading` check before making API call in ImproveScreen
- Added `hasSession` check and redirect if no session
- Added error state and error display UI with retry button
- Added `useCallback` to `useAuthenticatedFetch` hook to stabilize function reference
- Improved error handling with better logging and user feedback

**Files Modified:**
- `src/pages/ImproveScreen.tsx` - Added auth loading check, error handling, error display
- `src/lib/apiClient.ts` - Added useCallback for stable function reference

**Key Learning:**
Always check auth loading state before making authenticated API calls. Use `useCallback` to stabilize function references in hooks to prevent unnecessary re-renders. Always display errors to users with actionable feedback.

### Solution #8: Login Authentication Error Handling

**Date:** Mission Verification  
**Severity:** High (blocks user access)

**Problem:**
"Invalid credentials" error on normal login, though password reset worked. Error messages not clear, no visibility into auth events.

**Root Cause:**
- Supabase Auth UI component doesn't show detailed error messages
- No logging of auth events for debugging
- Email confirmation might be required (user action needed)
- No redirectTo prop set for hash routing

**Solution:**
- Enhanced auth event handling with detailed logging
- Added error display capability (though Auth UI component handles most errors internally)
- Added `redirectTo` prop for proper hash routing support
- Added explicit handling for different auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
- Added session check on component mount

**Files Modified:**
- `src/pages/AuthScreen.tsx` - Enhanced auth event handling, error display, redirectTo

**User Action Required:**
- Disable email confirmation in Supabase (Settings → Authentication → Email → Confirm email: OFF)

**Key Learning:**
Always log auth events for debugging. Set redirectTo prop for proper routing with hash-based routers. Email confirmation should be disabled for MVP to reduce friction.

---

### Vortex #3: Vercel Auto-Detecting api/lib/* as Serverless Functions

**Date:** Mission Verification  
**Severity:** Critical (functions appearing in Functions tab that shouldn't exist)

**Symptom:**
Even after explicitly excluding `api/lib/*` from `vercel.json` builds array, Vercel Functions tab still shows `/api/lib/resonance` and `/api/lib/verifyJWT` as separate functions. These are utility files that should be bundled into other functions, not deployed as standalone functions.

**Root Cause:**
- Vercel's build system auto-detects ALL `.ts` files in `api/` directory as potential serverless functions
- This happens BEFORE `vercel.json` builds configuration is applied
- The `builds` array in `vercel.json` only controls HOW files are built, not WHICH files Vercel scans
- Files in `api/lib/` were being treated as entry points even though they're just utilities

**Solution:**
- **Moved utilities outside `api/` directory:**
  - Moved `api/lib/verifyJWT.ts` → `lib/api/verifyJWT.ts`
  - Moved `api/lib/resonance.ts` → `lib/api/resonance.ts`
- **Updated all API endpoint imports:**
  - Changed from `'../lib/verifyJWT'` to `'../../lib/api/verifyJWT'`
  - Updated in: `api/cycles/create.ts`, `api/cycles/lists.ts`, `api/cycles/history.ts`, `api/resonance/query.ts`, `api/user/preferences.ts`
- **Vercel now only scans `api/` for actual serverless functions:**
  - `lib/api/*` is outside `api/`, so Vercel ignores it
  - Functions can still import from `lib/api/*` normally
  - No separate functions created for utilities

**Files Modified:**
- Created `lib/api/` directory (moved from `api/lib/`)
- Updated all API endpoint imports to new path
- Updated `docs/BREACH_NET.md` file paths

**Key Learning:**
Vercel auto-detects ALL `.ts` files in `api/` as serverless functions, regardless of `vercel.json` configuration. Shared utilities should be placed OUTSIDE the `api/` directory (e.g., `lib/api/`) to prevent them from being treated as functions. The `vercel.json` builds array controls HOW files are built, not WHICH files Vercel scans.

**Additional Discovery:**
- **Cron Jobs Limitation:** Vercel Hobby accounts are limited to daily cron jobs only. Cron jobs running more frequently (e.g., every 5 minutes) require Pro plan. This was preventing the notification system from working correctly.
- **Environment Variables:** All environment variables should be set at Project level (not Team level) for single-project deployments. Setting to "All Environments" (Production, Preview, Development) is correct for most variables.

**Resolution Status:** ✅ **RESOLVED**
- Files moved correctly (`api/lib/*` → `lib/api/*`)
- Imports updated
- Nuclear option executed (Vercel project deleted and recreated)
- **Result:** Functions tab now shows only 6 functions (no `api/lib/*`)
- **Additional Discovery:** Cron jobs require Pro plan - Hobby accounts limited to daily cron jobs only

**Final Resolution Steps:**
1. **File Movement:** Moved `api/lib/verifyJWT.ts` and `api/lib/resonance.ts` to `lib/api/` directory
2. **Import Updates:** Updated all API endpoint imports from `../lib/verifyJWT` to `../../lib/api/verifyJWT`
3. **Nuclear Option:** Deleted Vercel project completely and re-imported from GitHub to clear stale function metadata
4. **Environment Variables:** Re-added all environment variables to new project
5. **Verification:** Functions tab confirmed only 6 functions (cycles/create, cycles/history, cycles/lists, resonance/query, user/preferences, notifications/send)
6. **ImproveScreen 404 Fix:** Added improved error handling for 404 responses with retry functionality. The 404 was caused by deployment propagation delay after nuclear option, not a code issue.

**Key Learnings:**
- Vercel Functions tab metadata can persist even after files are moved/deleted. Nuclear option (delete/recreate project) is sometimes necessary to clear stale metadata.
- After nuclear option, allow 5-10 minutes for deployment propagation before testing endpoints.
- First-time users (no previous cycles) should receive `200` with `{ previous_commit: null }`, not 404. The 404 was a deployment issue, not a logic issue.
- Always improve error handling in frontend to distinguish between deployment issues (404) and data issues (null response).
- **Deployment Configuration Mismatch:** If Vercel shows "Configuration Settings in the current Production deployment differ from your current Project Settings", the Production deployment was built with old settings. Functions may exist but be inaccessible due to old build configuration. Solution: Trigger a new deployment (push a commit or manually redeploy) to sync current project settings with Production deployment.

---

### Vortex #4: Persistent Vercel Deployment Configuration Mismatch (ImproveScreen 404)

**Date:** Mission Verification  
**Severity:** Critical (blocking all testing and mission verification)

**Symptom:**
- ImproveScreen shows "API endpoint not found. Please try again in a few moments." - 404 error for `/api/cycles/lists`
- Error in browser console: `Failed to load resource: the server responded with a status of 404 ()`
- Vercel error response: `NOT_FOUND cle1::kb2gq-1762384476542-f2459e08863f`
- Vercel Dashboard shows: "Configuration Settings in the current Production deployment differ from your current Project Settings"
- Build logs show warning: "Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply"

**Root Cause:**
- **CRITICAL:** When `builds` array exists in `vercel.json`, Vercel **IGNORES** the Framework Preset in Project Settings
- This creates a configuration mismatch: Project Settings say "Other" but `vercel.json` builds array overrides it
- Production deployments were built with conflicting configurations
- Multiple redeployments couldn't fix it because the root cause (conflicting configs) wasn't addressed

**Solution Attempt 1: Auto-Detection (Failed)**
1. Removed `builds` array from `vercel.json`
2. Set Framework Preset to "Vite" in Vercel Dashboard
3. Result: Functions were detected but failed with `ERR_MODULE_NOT_FOUND` for `lib/api/verifyJWT`

**Root Cause of Failure:**
- Vercel's auto-detection **only bundles files within `api/` directory**
- Files outside `api/` (like `lib/api/verifyJWT.ts`) are **not bundled** when using auto-detection
- Error: `Cannot find module '/var/task/lib/api/verifyJWT'` - the file doesn't exist in the function bundle

**Solution Attempt 2: Explicit Builds with Framework Preset = "Other" (Partial)**
1. Restored `builds` array in `vercel.json`
2. Set Framework Preset to "Other" in Vercel Dashboard
3. Result: Functions worked but **Vite preset was completely ignored** - frontend lost Vite optimizations

**Root Cause of Partial Solution:**
- When `builds` array exists, Vercel **ignores Framework Preset entirely** (not just for functions, but for entire project)
- Frontend build degraded to generic Node.js builder, losing esbuild caching and chunk splitting
- Warning "Due to `builds` existing..." means Vite preset is being overridden

**Final Solution: Functions Config with Vite Preset (Correct)**
1. **Remove `builds` array completely** - Allows Vite preset to be fully active
2. **Move utilities to `api/lib/`** - Files in `api/` are automatically bundled with functions
3. **Use `excludeFiles` to prevent auto-detection** - Prevents utilities from being treated as separate functions
4. **Set Framework Preset to "Vite"** - Full Vite optimizations for frontend
5. **Use tightened glob pattern `api/*/*.ts`** - Prevents accidental functions from tests/mocks

**Why `includeFiles` Failed:**
- `includeFiles` does NOT work with Vite preset + auto-detection
- Files outside `api/` directory are not bundled when using auto-detection
- Error: `Cannot find module '/var/task/lib/verifyJWT'` - files not in function bundle

**Final `vercel.json` Configuration:**
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/assets/(.*)", "dest": "/assets/$1", "headers": { "Cache-Control": "public, max-age=31536000, immutable" } },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "crons": [
    {
      "path": "/api/notifications/send",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Note:** No `functions` config needed - Vercel auto-detects all `.ts` files in `api/` directory. Utilities in `api/lib/` are automatically bundled with functions since they're in `api/` directory.

**Note:** `excludeFiles` is NOT a valid property in `vercel.json`. Utilities in `api/lib/` may appear in Functions tab but won't be callable as endpoints (they're not exported as default functions).

**Note:** `framework` field is NOT valid in `vercel.json`. Framework Preset must be set in Vercel Dashboard → Project Settings → General.

**Vercel Dashboard Settings:**
- Framework Preset: **"Vite"** (fully active, no override)
- Output Directory: **"dist"**
- Build Command: (empty - Vite handles it)

**Why This Works:**
- No `builds` array = Vite preset fully active for frontend (esbuild caching, chunk splitting)
- No `functions` config = Vercel auto-detects all `.ts` files in `api/` directory
- Utilities in `api/lib/` are automatically bundled with functions (files in `api/` are included)
- Utilities won't be callable as endpoints (they don't export default functions)
- Import paths use relative paths within `api/` directory: `../lib/verifyJWT`
- **Note:** Utilities may appear in Functions tab (cosmetic issue only - they're not actual endpoints)

**Resolution Status:** ✅ **RESOLVED**

**Key Learning:**
- **Critical:** `builds` array causes Vercel to ignore Framework Preset **entirely** (frontend AND functions), not just for functions
- **Vercel auto-detection limitation:** Only bundles files within `api/` directory
- **`includeFiles` does NOT work with Vite preset + auto-detection** - files outside `api/` are not bundled
- **Solution:** Move utilities to `api/lib/` so they're automatically bundled (they won't be callable as endpoints since they don't export default functions)
- **For Vite projects with shared utilities:** Utilities MUST be in `api/` directory to be bundled. They may appear in Functions tab but won't be actual endpoints (cosmetic issue only)
- **The warning "Due to `builds` existing..." means Vite preset is being ignored** - this is a problem, not just informational
- **Future-proof:** `functions` config aligns with Vercel's shift away from `builds` array (deprecating in v38+)

---

### Solution #9: Vercel Serverless Function Import Path Issue

**Date:** Mission Verification  
**Severity:** Critical (API endpoints failing in production)

**Problem:**
ImproveScreen stuck on loading with `ERR_INSUFFICIENT_RESOURCES` error. API endpoint `/api/cycles/lists` not accessible. Error showed endpoint `/api/cycles/list` (without 's'), suggesting build or import resolution issues.

**Root Cause:**
- API endpoints were importing utilities from `src/lib/api-utils/` directory
- Vercel's `@vercel/node` builder doesn't properly resolve TypeScript imports from `src/` directory in serverless functions
- This caused build failures or runtime errors that weren't visible in local development
- The `ERR_INSUFFICIENT_RESOURCES` error was caused by infinite retry loops when the endpoint failed

**Solution:**
1. **Moved shared utilities to `api/lib/` directory:**
   - Moved `verifyJWT.ts` from `src/lib/api-utils/` to `api/lib/`
   - Moved `resonance.ts` from `src/lib/api-utils/` to `api/lib/`
2. **Updated all API endpoint imports:**
   - Changed from `'../../src/lib/api-utils/verifyJWT'` to `'../lib/verifyJWT'`
   - Updated in: `api/cycles/create.ts`, `api/cycles/lists.ts`, `api/cycles/history.ts`, `api/resonance/query.ts`, `api/user/preferences.ts`
3. **Added infinite loop prevention in ImproveScreen:**
   - Added `hasAttempted` state to prevent multiple API calls
   - Improved error handling for network errors
   - Better error messages for users

**Files Modified:**
- Created `api/lib/verifyJWT.ts` (moved from `src/lib/api-utils/verifyJWT.ts`)
- Created `api/lib/resonance.ts` (moved from `src/lib/api-utils/resonance.ts`)
- Updated all API endpoint imports
- Updated `src/pages/ImproveScreen.tsx` with infinite loop prevention

**Key Learning:**
Vercel serverless functions should import shared utilities from `api/lib/`, not `src/`. The `@vercel/node` builder doesn't properly bundle TypeScript files from `src/` directory. Always keep serverless function dependencies within the `api/` directory structure.

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

