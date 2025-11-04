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
- `shadcn/ui`: UI component library (button, input, textarea, card, label)
- `recharts`: Charting library for data visualization
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
- `src/pages/CommitScreen.tsx`: Commit step of PICV cycle (shadcn/ui)
- `src/pages/VisualizeScreen.tsx`: Visualize/save step of PICV cycle (shadcn/ui)
- `src/pages/ImprovementLogScreen.tsx`: Improvement log page showing all past improve_text entries
- `src/components/AscentGraph.tsx`: Chart component displaying execution scores over time
- `api/cycles/history.ts`: Serverless function to fetch all cycles for authenticated user (JWT authenticated)

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
  
- **GET** `/api/cycles/history`: Fetches all cycles for authenticated user
  - ✅ **Status:** JWT authentication implemented (JWKS-based)
  - Requires `Authorization: Bearer <token>` header
  - Returns 401 if token invalid/missing
  - Extracts user_id from verified JWT token
  - Returns array of cycles ordered by `created_at DESC`
  - Used for Ascent Graph and Improvement Log

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

### Solution #3: UI Refactoring with shadcn/ui

**Date:** Mission 4 Implementation  
**Severity:** Medium (UI consistency and accessibility)

**Context:**
Refactored all four PICV cycle screens (Prime, Improve, Commit, Visualize) from basic HTML elements to polished shadcn/ui components for consistent, accessible UI.

**Implementation:**
1. **Installed label component** (`npx shadcn@latest add label`):
   - Added accessible form labels for all text inputs
   - Ensures proper accessibility with `htmlFor` attributes

2. **Refactored PrimeScreen.tsx**:
   - Replaced basic `<textarea>` with shadcn/ui `Textarea`
   - Replaced basic `<button>` with shadcn/ui `Button`
   - Wrapped content in `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
   - Added `Label` component for accessibility
   - Maintained existing functionality and validation

3. **Refactored ImproveScreen.tsx**:
   - Replaced custom `RatingButtonGrid` with shadcn/ui `Button` components (1-10 grid)
   - Replaced basic `<textarea>` with shadcn/ui `Textarea`
   - Wrapped content in separate `Card` components for "Previous Commitment", "Part 1: Rate", "Part 2: Reflect"
   - Added `Label` components for accessibility
   - Maintained conditional logic (first-time vs returning user)
   - Maintained API integration and loading states

4. **Refactored CommitScreen.tsx**:
   - Replaced basic `<textarea>` with shadcn/ui `Textarea`
   - Replaced basic buttons with shadcn/ui `Button` components
   - Wrapped content in `Card` components (matching PrimeScreen pattern)
   - Added `Label` component for accessibility

5. **Refactored VisualizeScreen.tsx**:
   - Replaced custom `DataRow` component with structured card layout
   - Displayed each data point (Prime, Improve, Score, Commit) in organized sections
   - Replaced basic buttons with shadcn/ui `Button` components
   - Maintained API integration and error handling

**Design Principles Applied:**
- **Consistency:** All screens match DashboardScreen's Card-based layout
- **Accessibility:** All form inputs use Label components with proper `htmlFor` attributes
- **Responsive:** Maintained mobile-first approach with `max-w-2xl mx-auto` container
- **Functionality First:** Preserved all existing behavior, state management, and API calls

**Lessons Learned:**
- shadcn/ui components provide consistent styling out of the box
- Card-based layouts create visual hierarchy and improve readability
- Label components are essential for accessibility and screen readers
- Button variants (`default`, `outline`) provide clear visual feedback
- Maintaining existing functionality while refactoring requires careful testing
- Consistent spacing and layout patterns improve user experience

### Solution #4: Dashboard Implementation with Ascent Graph

**Date:** Mission 5 Implementation  
**Severity:** Medium (core user engagement feature)

**Context:**
Implemented the Dashboard as the "home base" with visual feedback through Ascent Graph and access to improvement history, transforming the placeholder into a functional engagement center.

**Implementation:**
1. **Created cycle history API endpoint** (`api/cycles/history.ts`):
   - GET endpoint to fetch all cycles for authenticated user
   - Uses existing JWT verification utility
   - Returns cycles ordered by `created_at DESC`
   - Handles empty results gracefully (returns empty array)
   - Error handling for 401 (unauthorized) and 500 (server errors)

2. **Installed recharts library**:
   - React-first charting library with TypeScript support
   - Works seamlessly with shadcn/ui and Tailwind CSS
   - Responsive by default

3. **Built AscentGraph component** (`src/components/AscentGraph.tsx`):
   - **Daily Line**: Raw execution_score with custom `<Dot>` components
     - Color-coded dots based on score:
       - Score 1-3: Red (#ef4444) - poor performance
       - Score 4-6: Yellow (#eab308) - moderate performance
       - Score 7-10: Green (#22c55e) - good performance
     - Uses custom dot renderer function with recharts `<Dot>` component
   - **Ascent Line**: 7-day rolling average of execution_score
     - Shows long-term trend/smoothing
     - Calculated using sliding window algorithm
     - Dashed line style to distinguish from daily line
   - Empty state: "Complete your first cycle to see your ascent"
   - Date formatting: "Today", "Yesterday", or "MMM DD" format
   - Wrapped in shadcn/ui Card component

4. **Updated DashboardScreen** (`src/pages/DashboardScreen.tsx`):
   - Fetches cycles on mount using `/api/cycles/history`
   - Displays AscentGraph component
   - Adds "View Improvement Log" button
   - Maintains existing "Start Daily Cycle" and "Sign Out" buttons
   - Loading state handling (though not explicitly shown - graph handles empty state)
   - Error handling redirects to `/auth` on 401

5. **Created ImprovementLogScreen** (`src/pages/ImprovementLogScreen.tsx`):
   - Fetches all cycles with `improve_text` using `/api/cycles/history`
   - Displays as scrollable list of cards
   - Each card shows:
     - Date (formatted: "MMM DD, YYYY")
     - Improvement text (full text, whitespace preserved)
     - Execution score (if available): "Score: X/10"
   - Empty state: "No improvements logged yet. Complete a cycle to see your progress."
   - Back button to return to Dashboard
   - Uses shadcn/ui Card components consistently

6. **Updated routing** (`src/components/Root.tsx`):
   - Added `/improvements` route pointing to `ImprovementLogScreen`
   - Protected route (requires authentication)
   - Redirects to `/auth` if not authenticated

**Technical Decisions:**
- **7-day rolling average**: Provides meaningful trend visualization without being too sensitive to daily fluctuations
- **Color-coded dots**: Immediate visual feedback on performance levels
- **Dual-line approach**: Shows both daily performance and long-term trend
- **Empty states**: Critical for first-time users, maintain encouraging tone
- **Date formatting**: User-friendly relative dates ("Today", "Yesterday") for recent entries

**Lessons Learned:**
- Recharts requires careful data transformation for multi-line charts
- Rolling average calculation must handle edge cases (fewer than 7 data points)
- Custom dot components in recharts require proper payload structure
- Empty states are essential for good UX, especially for first-time users
- Filtering null scores is important for clean graph display
- Date sorting and formatting are critical for proper chart ordering
- Protected routes must redirect to auth on 401 errors
- Loading states improve perceived performance

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