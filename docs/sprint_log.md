# AIRE PWA - Sprint Log

## Current Mission:

* [ ] **Mission 10: Stripe Account Setup & Database Schema** (Pay Gate Integration - Phase 1)
    * [ ] Create Stripe account (if not exists)
    * [ ] Create Stripe products: Monthly ($9/month) and Annual ($79/year) subscription plans
    * [ ] Configure Stripe webhook endpoint: `https://aire-mini.vercel.app/api/stripe/webhook` (NOTE: Will update to `https://waymaker.ai/api/stripe/webhook` in Mission 12 when custom domain is configured)
    * [ ] Set up webhook events:
      * **Required:** `checkout.session.completed` (handles successful subscription creation)
      * **Required:** `customer.subscription.updated` (handles subscription status changes, renewals, cancellations)
      * **Required:** `customer.subscription.deleted` (handles subscription deletions)
      * **Optional but recommended:** `checkout.session.async_payment_failed` (for handling payment failures)
      * **Optional but recommended:** `checkout.session.async_payment_succeeded` (for handling delayed payment success)
    * [ ] Add Stripe API keys to Vercel environment variables (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`)
    * [ ] Add Stripe Price IDs to Vercel environment variables (`STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID`)
    * [ ] Create subscriptions table SQL script (`sql/CREATE_SUBSCRIPTIONS_TABLE.sql`)
    * [ ] Add subscription tracking fields: `stripe_customer_id`, `stripe_subscription_id`, `status`, `cycles_completed`, `trial_cycles_limit` (14), `current_period_start`, `current_period_end`
    * [ ] Run SQL script in Supabase to create subscriptions table with RLS policies
    * **Note:** Pay wall triggers after 14 completed cycles (not days). Pricing: $9/month, $79/year.
    * **Webhook URL Note:** When testing, if webhook signature verification fails, verify the webhook URL matches exactly. After Mission 12 (custom domain), webhook URL will need to be updated in Stripe dashboard to `https://waymaker.ai/api/stripe/webhook`.

* [ ] **Mission 10B: Subscription API Endpoints** (Pay Gate Integration - Phase 2)
    * [ ] Create `/api/subscriptions/status` endpoint (GET) - Check subscription status and cycles completed
    * [ ] Create `/api/subscriptions/create-checkout` endpoint (POST) - Generate Stripe Checkout session for monthly/annual
    * [ ] Create `/api/subscriptions/cancel` endpoint (POST) - Cancel subscription (set cancel_at_period_end)
    * [ ] Create `/api/subscriptions/reactivate` endpoint (POST) - Reactivate canceled subscription
    * [ ] Create `/api/stripe/webhook` endpoint (POST) - Handle Stripe webhook events, update subscription status
    * [ ] Implement cycle counting logic: Track `cycles_completed` count, trigger pay wall at 14 cycles
    * [ ] Update `vercel.json` to include new API routes

* [ ] **Mission 10C: Pay Gate UI & Route Protection** (Pay Gate Integration - Phase 3)
    * [ ] Create `PayGateModal` component with subscription messaging and Stripe Checkout redirect
    * [ ] Create `SubscriptionBanner` component for cycle count warnings (show at 10+ cycles)
    * [ ] Create `useSubscriptionStatus` hook to fetch and cache subscription status
    * [ ] Update `Root.tsx` to check subscription status and show PayGateModal when cycles_completed >= 14 and status !== 'active'
    * [ ] Implement post-checkout success flow (handle Stripe redirect, verify subscription activation)
    * [ ] Add subscription status check to cycle creation flow (increment cycles_completed counter)

* [ ] **Mission 10D: Seinfeld Method Visual Chain** (Pay Gate Integration - Phase 4)
    * [ ] Enhance `AscentGraph` component to show visual chain effect for consecutive cycles
    * [ ] Add glowing gold/white effect to dots representing consecutive calendar days with cycles
    * [ ] Implement streak detection: Calculate consecutive days from consistency data (`streakDays` from `consistencyCalculator`)
    * [ ] Visual styling: Glowing effect (CSS glow/shadow) for dots in active streak, no glow for missed days (breaks chain)
    * [ ] Chain visualization: Connect consecutive cycle dots with glowing line/effect
    * [ ] Update `ClusteredDot` component to show glow effect when part of active streak
    * **Note:** Seinfeld method = visual chain showing consecutive daily cycles. Streak logic already exists in `consistencyCalculator.ts` (`streakDays` field). Need to add visual representation.

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
    * [ ] **Update Stripe webhook endpoint URL** from `https://aire-mini.vercel.app/api/stripe/webhook` to `https://waymaker.ai/api/stripe/webhook` in Stripe dashboard
    * [ ] Verify email domain `noreply@waymaker.ai` in Resend
    * [ ] Test all deep-links with custom domain
    * [ ] Test notification email deep-links
    * [ ] Verify all routes accessible with custom domain
    * **Note:** Custom domain configuration should be completed after successful MVP testing on Vercel default URL. See `docs/CONTEXT_MANAGEMENT.md` for deployment strategy notes.

* [ ] **Mission 13: Social Login & Keychain Credentials** (After custom domain)
    * [ ] Configure OAuth providers in Supabase (Google, GitHub, etc.)
    * [ ] Update AuthScreen to show social login options
    * [ ] Add OAuth redirect URL configuration in Supabase
    * [ ] Test social login flow with custom domain
    * [ ] Implement WebAuthn/Passkeys for keychain credentials (browser-based)
    * [ ] Add "Sign in with passkey" option to AuthScreen
    * [ ] Test keychain credential flow
    * [ ] Verify social login works with existing JWT verification
    * **Note:** Should be done AFTER Mission 12 (Custom Domain) because OAuth requires stable redirect URLs. Keychain credentials use WebAuthn API (browser-native, no external dependencies).

* [ ] **Mission 14: Code Splitting & Performance Optimization**
    * [ ] Implement dynamic imports for route-based code splitting
    * [ ] Configure `build.rollupOptions.output.manualChunks` for optimal chunking
    * [ ] Split large dependencies (recharts, etc.) into separate chunks
    * [ ] Test bundle size reduction
    * [ ] Verify all functionality works after code splitting
    * [ ] Measure and document performance improvements
    * [ ] Verify security measures are in place and sufficient
    * **Note:** Addresses build warning about chunks > 500 kB. Should be done before public launch for better performance.

## Backlog (Future Missions):
* [ ] **Mission 15: Kairos (AI Mirror)** - Deferred to post-MVP
* [ ] **Mission 16: Enhanced Analytics** - Post-MVP feature
* [ ] **Mission 17: Social Features** - Post-MVP feature

## Position Improvement Opportunities:
* **Multi-Cycle Dot Click Interaction**: Multi-cycle day clusters (dots with count badges) are not currently clickable to open the DayDetailModal. The current implementation uses a React Context approach, but clicks on clustered dots do not trigger the modal. This is a scope creep from the initial "Your Journey" graph enhancements. Current display functionality works correctly, but interactive click behavior for multi-cycle clusters needs refinement. Consider alternative approaches: direct event handlers on SVG elements, recharts activeDot customization, or coordinate-based click detection.

* **Proactive Reframe: Offline as Tiered Roadmap**

  Treat offline as progressive enhancement, not upfront lift. Layer it post-validation:

  | Tier | Capability | Trigger | Effort |
  | --- | --- | --- | --- |
  | **Current (Mission 8)** | Queue writes, asset cache, initial-online required | MVP Launch | Done |
  | **Tier 2 (Post-Mission 12)** | Local reads (view past DiRPs offline), no initial online for return users | After custom domain + paygate live; user feedback shows offline pain | 3-5 days (IndexedDB migration for history) |
  | **Tier 3 (Post-Layer 2)** | Full local CRUD + conflict merge | After Foundry/SSI minting; community attestation needs offline resilience | 1-2 sprints (Yjs/CRDTs) |

  This sequences with your strategic layers—offline depth compounds as verification value grows.

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

* **Mission 8: Offline Support** ✅ **COMPLETE**
    * [x] Add offline detection and messaging
    * [x] Implement service worker for PWA offline capabilities
    * **Implementation Notes:**
      - Created `useOnlineStatus` hook with periodic checking for DevTools throttling detection
      - Created `OfflineBanner` component (yellow banner with z-index 9999)
      - Implemented service worker (`public/sw.js`) with Network First, Cache Fallback strategy
      - Service worker caches index.html, JS, CSS, and all assets automatically
      - Handles hash routing (all routes serve cached index.html when offline)
      - Handles favicon requests gracefully (returns 204 when offline)
      - Service worker registers immediately on app load (not waiting for load event)
      - Created PWA manifest.json with icons and metadata
      - Added offline save queue system (bonus feature)
      - Created `OfflineQueueProcessor` component for auto-sync when back online
      - Updated VisualizeScreen to queue saves when offline
      - Updated ImproveScreen to handle offline gracefully (skip API calls, allow continuation)
      - Added dashboard messaging for queued saves
      - Clear user messaging that data is safe and they can leave the page
    * **Test Results:** ✅ All offline functionality verified:
      - Page loads when offline (after initial online visit)
      - Yellow offline banner appears when offline
      - Users can complete full cycle offline (Prime → Improve → Commit → Visualize)
      - "Forge Forward" queues save when offline with clear messaging
      - Dashboard shows queued saves status
      - Auto-sync works when back online
      - Users can safely leave page (data persists in localStorage)
      - All pages work offline (cached assets load correctly)

* **Mission 9A: Text & Copy Updates** ✅ **COMPLETE**
    * [x] Updated Dashboard: "Welcome to your Daily AIRE" → "Welcome to your DiRP"
    * [x] Updated Dashboard description to DiRP branding with new messaging
    * [x] Updated AscentGraph: "Ascent Graph" → "Your Ascent"
    * [x] Updated AscentGraph description: "View your growth journey overtime, starts after day 2"
    * [x] Updated Visualize page: "Review today's DiRP. Click Forge Forward to save this data and complete today's cycle."
    * [x] Verified Commit page text (no change needed)

* **Mission 9B: UI Component Updates** ✅ **COMPLETE**
    * [x] Added "Exit Cycle" button to Prime page (replaces back button)
    * [x] Added "IMPROVE" heading to Improve page
    * [x] Simplified section headings: "Part 1: Rate" → "Rate", "Part 2: Reflect" → "Reflect"
    * [x] Updated reflect question: "What one action, if executed today, will guarantee clear progress and make today a success?"

* **Mission 9C: Ascent Graph Data Ordering** ✅ **COMPLETE**
    * [x] Verified cycles are listed chronologically based on date and time (newest on far right)
    * [x] Confirmed data sorting in DashboardScreen (ascending: oldest to newest)
    * [x] Confirmed data sorting in AscentGraph processedData (ascending: oldest to newest)
    * [x] Confirmed grouped data sorting in groupCyclesByDate (ascending: oldest to newest)
    * **Result:** Data ordering is correct - oldest cycles appear on the left, newest on the far right as intended

* **Mission 9D: Profile & Theme Settings** ✅ **COMPLETE**
    * [x] Created ThemeContext with light/dark/system mode support
    * [x] Added theme_preference column to user_preferences table
    * [x] Created ProfileScreen with theme selector and user info
    * [x] Added first_name and last_name fields (replaced username)
    * [x] Added "Profile & Settings" button to Dashboard
    * [x] Added "Back to Dashboard" button to Profile screen
    * [x] Updated dark mode colors from blue to slate grey/black
    * [x] Fixed dark mode text visibility issues (buttons, dialogs, consistency modal)
    * [x] Display name shows "First Last" when both names are set, otherwise email
    * **Implementation Notes:**
      - Theme preference stored in both localStorage (immediate) and user_preferences table (persistent)
      - System mode detects OS preference and updates dynamically
      - Email remains the login credential
      - All text elements use semantic color classes for dark mode compatibility
    * **Test Results:** ✅ All functionality verified:
      - Theme switching works correctly (light/dark/system)
      - Theme preference persists across page refreshes
      - Profile screen accessible from Dashboard
      - First/last name fields save and display correctly
      - Display name updates based on name fields
      - Dark mode colors and text visibility working correctly

* **Mission 9E: Log Visibility Improvements** ✅ **COMPLETE**
    * [x] Updated API endpoint to return prime_text and commit_text fields
    * [x] Created DiRPLogScreen with "All DiRPs" view showing visualize-style cards
    * [x] Implemented date grouping with single card per date
    * [x] Added visual stacked effect for days with multiple cycles
    * [x] Created day detail dialog showing all cycles chronologically for multi-cycle days
    * [x] Added search functionality: date range picker (react-datepicker) and keyword search
    * [x] Implemented segmented views: All DiRPs, Prime Log, Improve Log, Commit Log
    * [x] Added field-specific keyword search for each subcategory view
    * [x] Added score-based keyword search (search by execution_score)
    * [x] Updated Dashboard button from "View Improvement Log" to "DiRP Log"
    * [x] Added /dirp-log route and redirect /improvements to /dirp-log
    * [x] Fixed timezone handling: Calculate user's local date and send to API
    * [x] Fixed date parsing: Parse YYYY-MM-DD dates as local (not UTC) to prevent one-day-behind issue
    * [x] Fixed dark mode tab visibility and date picker calendar styling
    * [x] Updated Commit page question text to match improved wording
    * **Implementation Notes:**
      - Cycles grouped by cycle_date (user's local calendar date)
      - Single cycles display directly as visualize-style cards
      - Multi-cycle days show first cycle with badge indicator and stacked visual effect
      - Clicking multi-cycle day opens dialog with all cycles chronologically
      - Date range picker supports single date or date range selection with calendar UI
      - Keyword search searches all text fields in "All DiRPs" view, field-specific in subcategories
      - Score search: Numeric keywords (0-10) match execution_score values
      - All dates parsed as local timezone to prevent UTC conversion issues
      - All views use semantic Tailwind classes for dark/light theme support
    * **Test Results:** ✅ All functionality tested and verified working

