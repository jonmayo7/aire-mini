# AIRE PWA - Sprint Log

## Current Mission:
* [ ] **Mission 8: Offline Support**
    * [ ] Add offline detection and messaging
    * [ ] Implement service worker for PWA offline capabilities

* [ ] **Mission 9: Functionality Improvements Round 1**
    * [ ] **Dashboard Page Updates:**
        * [ ] Change "Welcome to your Daily AIRE" to "Welcome to your DiRP"
        * [ ] Change "Begin your daily cycle to build clarity, momentum, and agency." to "Your Daily intentional Reflection Protocol is your engine to build clarity, momentum, and agency."
        * [ ] Change "Ascent Graph" to "Your Ascent"
        * [ ] Change "Your execution score over time" to "View your growth journey overtime, starts after day 2"
    * [ ] **Prime Page Updates:**
        * [ ] Replace back button with "Exit Cycle" button
    * [ ] **Improve Page Updates:**
        * [ ] Add heading: "Commit"
        * [ ] Change "Part 1: Rate" to "Rate"
        * [ ] Change "Part 2: Reflect" to "Reflect"
        * [ ] Change "What is the most powerful insight from executing this commitment?" to "What one action, if executed today, will guarantee clear progress and make today a success?"
    * [ ] **Commit Page Updates:**
        * [ ] Verify text: "What is the one decisive action that, when you execute it today, will move you unmistakably forward?" (no change needed per notes)
    * [ ] **Visualize Page Updates:**
        * [ ] Change "Review your cycle. Saving will lock this data and start your next cycle." to "Review today's DiRP. Forge Forward will save this data and complete today's cycle."
    * [ ] **Ascent Graph Functionality:**
        * [ ] Verify cycles are listed chronologically based on date and time (newest on far right)
        * [ ] Fix if not chronological
    * [ ] **Profile Access:**
        * [ ] Add profile access option (to adjust username, update settings, etc.)
        * [ ] Add theme option (light vs dark vs system mode) if possible
    * [ ] **Log Visibility Improvements:**
        * [ ] Create "View DiRP Log" parent view
        * [ ] Within DiRP log, add ability to view each day's visualize
        * [ ] Add segmented views: View Improvement Log, View Commit Log, View Prime Log within parent DiRP log view

* [ ] **Mission 10: Pay Gate Integration** (Required before public launch)
    * [ ] Research payment provider options (Stripe recommended - already in use)
    * [ ] Set up Stripe account/products/subscription plans
    * [ ] Determine optimal free trial period (7-21 days based on effectiveness)
    * [ ] Add Stripe API keys to Vercel environment variables
    * [ ] Create subscription management API endpoints (create subscription, check status, cancel)
    * [ ] Add user subscription tracking to database (extend user_preferences or create subscriptions table)
    * [ ] Implement free trial tracking (count days since first cycle)
    * [ ] Create pay gate UI component (seamless integration into protocol flow)
    * [ ] Add subscription status check to protected routes
    * [ ] Display subscription messaging before trial expiration
    * [ ] Test subscription flow end-to-end
    * [ ] Verify subscription status persists across sessions
    * **Note:** Critical for launch monetization. Should come after UI improvements so users see polished product. Seamless integration into protocol - users understand pricing before trial ends.

* [ ] **Mission 11: SMS Functionality**
    * [ ] Research SMS provider options (Twilio, AWS SNS, etc.)
    * [ ] Select SMS provider and set up account
    * [ ] Add SMS provider API key to Vercel environment variables
    * [ ] Update `/api/notifications/send` endpoint to support SMS delivery
    * [ ] Update notification logic to send SMS when user has opted in
    * [ ] Test SMS delivery with test phone number
    * [ ] Verify SMS notifications work with cron job
    * [ ] Update user preferences UI to show SMS status correctly
    * **Note:** Users can already opt into SMS in onboarding, but functionality not yet implemented. This fills the gap before public launch.

* [ ] **Mission 12: Custom Domain Configuration** (Required before public launch)
    * [ ] Complete full testing cycle on Vercel default URL
    * [ ] Verify all features and API endpoints work correctly
    * [ ] Update `package.json` homepage to `https://waymaker.ai`
    * [ ] Configure `waymaker.ai` as custom domain in Vercel dashboard
    * [ ] Configure DNS settings per Vercel instructions
    * [ ] Verify SSL certificate provisioning
    * [ ] Update `PWA_URL` environment variable in Vercel (if needed)
    * [ ] Verify email domain `noreply@waymaker.ai` in Resend
    * [ ] Test all deep-links with custom domain
    * [ ] Test notification email deep-links
    * [ ] Verify all routes accessible with custom domain
    * **Note:** Custom domain configuration should be completed after successful MVP testing on Vercel default URL. See `docs/CONTEXT_MANAGEMENT.md` for deployment strategy notes.

## Backlog (Future Missions):
* [ ] **Mission 13: Kairos (AI Mirror)** - Deferred to post-MVP
* [ ] **Mission 14: Enhanced Analytics** - Post-MVP feature
* [ ] **Mission 15: Social Features** - Post-MVP feature

## Known Issues:
* **ImproveScreen API endpoint bug**: Fixed - changed `/api/cycles/list` to `/api/cycles/lists` (endpoint mismatch)
* **ImproveScreen loading issue**: Fixed - added auth loading check, error handling, and useCallback stabilization
* **Login "invalid credentials"**: Fixed - enhanced auth event handling and error display. User action required: Disable email confirmation in Supabase

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

* **Mission Verification: Pre-Mission 8** ✅ **COMPLETE**
    * [x] Fix ImproveScreen loading issue (added auth loading check, error handling)
    * [x] Fix login authentication error handling (enhanced auth events, redirectTo)
    * [x] Verify Vercel configuration is optimal (confirmed correct)
    * [x] Test all API endpoints (verified working after JWT verification fixes)
    * [x] Complete systematic mission verification (all endpoints verified working)
    * [x] Update documentation with verification results
    * **Implementation Notes:**
      - Resolved JWT verification vortex through systematic troubleshooting
      - Fixed ESM import errors (added .js extensions)
      - Fixed bundling issues (moved utilities to `api/lib/`)
      - Completed Supabase JWT migration (ECC P-256 with ES256)
      - Updated JWKS endpoint path to `/auth/v1/.well-known/jwks.json`
      - Added ES256 algorithm support in verification code
      - All API endpoints now working correctly
      - Improve page loads successfully without 500 errors
    * **Test Results:** ✅ All core functionality verified across 2 complete cycles:
      - Dashboard, Prime, Improve, Commit, Visualize all working correctly
      - Graph displays correctly after 2nd cycle (expected behavior)
      - Context pulling and related improvements display correctly
      - Notification preferences setup working (email opt-in functional)
      - **Note:** SMS opt-in exists in UI but SMS functionality not yet implemented (tracked for future mission)

