# AIRE PWA - Sprint Log

## Current Mission:
* [ ] **Mission Verification: Pre-Mission 8** (BLOCKED - See Active Blockers)
    * [x] Fix ImproveScreen loading issue (added auth loading check, error handling)
    * [x] Fix login authentication error handling (enhanced auth events, redirectTo)
    * [x] Verify Vercel configuration is optimal (confirmed correct)
    * [ ] Test all API endpoints with curl (blocked by deployment issue)
    * [ ] Complete systematic mission verification (blocked by deployment issue)
    * [ ] Update documentation with verification results

* [ ] **Mission 8: Offline Support** (Blocked until verification complete)
    * [ ] Add offline detection and messaging
    * [ ] Implement service worker for PWA offline capabilities

* [ ] **Mission 8.5: Custom Domain Configuration** (Required before public launch)
    * [ ] Complete full testing cycle on Vercel default URL
    * [ ] Verify all features and API endpoints work correctly
    * [ ] Update `package.json` homepage to `https://striveos.io`
    * [ ] Configure `striveos.io` as custom domain in Vercel dashboard
    * [ ] Configure DNS settings per Vercel instructions
    * [ ] Verify SSL certificate provisioning
    * [ ] Update `PWA_URL` environment variable in Vercel (if needed)
    * [ ] Verify email domain `noreply@striveos.io` in Resend
    * [ ] Test all deep-links with custom domain
    * [ ] Test notification email deep-links
    * [ ] Verify all routes accessible with custom domain
    * [ ] **Status:** Blocked until MVP testing complete (Mission Verification)
    * **Note:** Custom domain configuration should be completed after successful MVP testing on Vercel default URL. See `docs/CONTEXT_MANAGEMENT.md` for deployment strategy notes.

## Backlog (Future Missions):
* [ ] **Mission 9: Kairos (AI Mirror)** - Deferred to post-MVP
* [ ] **Mission 10: Enhanced Analytics** - Post-MVP feature
* [ ] **Mission 11: Social Features** - Post-MVP feature

## Active Blockers:
* **Vercel Deployment Configuration Mismatch (CRITICAL):** ImproveScreen shows 404 error for `/api/cycles/lists` endpoint. Production deployment was built with old settings before Framework Preset was changed to "Other". Functions exist in Functions tab but are inaccessible. Multiple redeployments triggered but mismatch persists. Manual intervention in Vercel dashboard may be required. See `docs/RESUME_HERE.md` for resolution steps.

## Known Issues:
* **ImproveScreen API endpoint bug**: Fixed - changed `/api/cycles/list` to `/api/cycles/lists` (endpoint mismatch)
* **ImproveScreen loading issue**: Fixed - added auth loading check, error handling, and useCallback stabilization
* **Login "invalid credentials"**: Fixed - enhanced auth event handling and error display. User action required: Disable email confirmation in Supabase
* **Vercel Deployment Configuration Mismatch**: Production deployment shows "Configuration Settings in the current Production deployment differ from your current Project Settings". Functions exist but return 404. Project Settings are correct (Framework Preset: "Other"). Multiple git push redeployments have been attempted without resolving the mismatch. See Active Blockers and `docs/RESUME_HERE.md` for resolution steps.

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

* **Mission 3: Update API Security** ✅ **COMPLETE**
    * [x] Installed JWKS packages (`jsonwebtoken`, `jwks-rsa`, `@types/jsonwebtoken`)
    * [x] Created JWT verification utility (`api/lib/verifyJWT.ts`) using NEW JWKS approach
    * [x] Updated `api/cycles/create.ts` with JWT token extraction and verification
    * [x] Updated `api/cycles/lists.ts` with JWT token extraction and verification
    * [x] Created authenticated fetch helper (`src/lib/apiClient.ts`)
    * [x] Updated `VisualizeScreen.tsx` to send JWT token in Authorization header
    * [x] Updated `ImproveScreen.tsx` to send JWT token in Authorization header
    * [x] Added error handling for 401 responses (redirects to `/auth`)
    * [x] Created database table creation SQL script (`docs/CREATE_CYCLES_TABLE.sql`)
    * [x] Database table created with correct schema (`user_id` uuid, RLS enabled)
    * **Approach:** NEW JWKS (RSA public/private keys) - more secure, supports key rotation

* **Mission 4: Refactor UI** ✅ **COMPLETE**
    * [x] Installed additional shadcn/ui components (`label`)
    * [x] Re-built `PrimeScreen.tsx` with shadcn/ui components (Card, Button, Textarea, Label)
    * [x] Re-built `ImproveScreen.tsx` with shadcn/ui components (Card, Button, Textarea, Label)
    * [x] Re-built `CommitScreen.tsx` with shadcn/ui components (Card, Button, Textarea, Label)
    * [x] Re-built `VisualizeScreen.tsx` with shadcn/ui components (Card, Button)
    * [x] All screens now use consistent Card-based layout matching DashboardScreen
    * [x] All form inputs use Label components for accessibility
    * [x] All functionality preserved (state management, API calls, navigation)

* **Mission 5: Dashboard Implementation** ✅ **COMPLETE**
    * [x] Created API endpoint `/api/cycles/history` for fetching all cycles (JWT authenticated)
    * [x] Installed recharts library for charting
    * [x] Built AscentGraph component with two lines:
      - Daily Line: Raw execution_score with color-coded dots (1-3 red, 4-6 yellow, 7-10 green)
      - Ascent Line: 7-day rolling average showing long-term trend
    * [x] Updated DashboardScreen to fetch and display Ascent Graph
    * [x] Created ImprovementLogScreen page to display all past improve_text entries
    * [x] Added `/improvements` route to Root.tsx with protected routing
    * [x] Added "View Improvement Log" button to DashboardScreen
    * [x] All API calls use JWT authentication with proper error handling
    * [x] Loading states and empty states implemented throughout
    * **Note:** Kairos (AI Mirror) integration deferred to post-MVP

* **Mission 6 (Part 1): Resonance Engine** ✅ **COMPLETE**
    * [x] Created keyword matching utility (`api/lib/resonance.ts`)
    * [x] Created Resonance API endpoint (`api/resonance/query.ts`) with JWT auth
    * [x] Created debounce hook (`src/hooks/useDebounce.ts`)
    * [x] Updated CommitScreen to show contextual improvement suggestions
    * [x] All functionality working with debounced search-as-you-type

* **Mission 7: Notification System** ✅ **COMPLETE**
    * [x] Created SQL script for `user_preferences` table with RLS policy (`docs/CREATE_USER_PREFERENCES_TABLE.sql`)
    * [x] Created API endpoint `/api/user/preferences` (GET/POST with JWT auth)
    * [x] Installed Resend package for email notifications
    * [x] Created API endpoint `/api/notifications/send` (protected by Vercel's native CRON_SECRET)
    * [x] Created OnboardingScreen (`src/pages/OnboardingScreen.tsx`) for collecting user preferences
    * [x] Updated VisualizeScreen to redirect to onboarding after first cycle
    * [x] Added `/onboarding` route to Root.tsx with protected routing
    * [x] Created vercel.json with cron job configuration (runs every 5 minutes)
    * **Implementation Details:**
      - Uses Vercel's native CRON_SECRET for cron authentication (simpler and more secure)
      - 5-minute time window for matching user preferred notification times
      - HTML email template with deep-link to `/prime` route
      - Upsert pattern for user preferences (allows updates)
      - Skip option available for users who want to defer setup
    * **⚠️ User Actions Required:**
      - Run SQL script in Supabase to create `user_preferences` table
      - Create Resend account and add `RESEND_API_KEY` to Vercel
      - Add `CRON_SECRET` to Vercel (Vercel can auto-generate or set custom value)
      - Optionally set `PWA_URL` if different from default

