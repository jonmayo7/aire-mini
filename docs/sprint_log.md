# AIRE PWA - Sprint Log

## Current Mission:
* [ ] **Mission 4: Refactor UI**
    * [ ] Re-build `PrimeScreen.tsx` with `shadcn/ui`
    * [ ] Re-build `ImproveScreen.tsx` with `shadcn/ui`
    * [ ] Re-build `CommitScreen.tsx` with `shadcn/ui`
    * [ ] Re-build `VisualizeScreen.tsx` with `shadcn/ui`

## Backlog (Next Missions):
* [ ] **Mission 5: Dashboard Implementation**
    * [ ] Build Ascent Graph visualization
    * [ ] Add "Improvement Log" link
    * [ ] Implement Kairos (AI Mirror) integration

## Active Blockers:
* None.

## Completed Missions:
* **Mission 1: The Great Pivot** (TMA Purge & PWA Install)
    * [x] Purged all Telegram Mini App dependencies
    * [x] Installed Supabase libraries
    * [x] Initialized shadcn/ui with Tailwind CSS
    * [x] Installed base UI components (button, input, textarea, card)
* **Mission 2: Build the Supabase Auth Gate** ✅ **TESTED & VERIFIED**
    * [x] Create Supabase client helper (`src/lib/supabaseClient.ts`)
    * [x] Build the `<Auth>` component (`src/pages/AuthScreen.tsx`)
    * [x] Create the "Dashboard" home page (`src/pages/DashboardScreen.tsx`)
    * [x] Implement the protected routing logic (`src/components/Root.tsx`)
    * [x] Create custom AuthProvider (`src/lib/authContext.tsx`) for Vite compatibility
    * [x] Update state management with `user_id` field
    * **Test Results:** ✅ Login successful, session persists on refresh, sign out redirects correctly

* **Mission 3: Update API Security** ✅ **IMPLEMENTED (Pending Database Migration)**
    * [x] Installed JWKS packages (`jsonwebtoken`, `jwks-rsa`, `@types/jsonwebtoken`)
    * [x] Created JWT verification utility (`api/lib/verifyJWT.ts`) using NEW JWKS approach
    * [x] Updated `api/cycles/create.ts` with JWT token extraction and verification
    * [x] Updated `api/cycles/lists.ts` with JWT token extraction and verification
    * [x] Created authenticated fetch helper (`src/lib/apiClient.ts`)
    * [x] Updated `VisualizeScreen.tsx` to send JWT token in Authorization header
    * [x] Updated `ImproveScreen.tsx` to send JWT token in Authorization header
    * [x] Added error handling for 401 responses (redirects to `/auth`)
    * [x] Created database migration guide (`docs/DATABASE_MIGRATION_MISSION3.md`)
    * **⚠️ User Action Required:** Run database migration SQL to rename `tg_user_id` → `user_id` and update RLS policy
    * **Approach:** NEW JWKS (RSA public/private keys) - more secure, supports key rotation