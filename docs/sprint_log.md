# AIRE PWA - Sprint Log

## Current Mission:

* [ ] **Mission 12: Custom Domain Configuration** (Required before public launch) - **IN PROGRESS**
    * [x] Update `package.json` homepage to `https://waymaker.ai` ✅
    * [x] Update code fallbacks in `create-checkout.ts` and `create-portal.ts` ✅
    * [x] Update documentation references ✅
    * [ ] Complete full testing cycle on Vercel default URL (user action required)
    * [ ] Configure `waymaker.ai` as custom domain in Vercel dashboard (user action required - see `docs/MISSION_12_SETUP_GUIDE.md`)
    * [ ] Configure DNS settings per Vercel instructions (user action required - see `docs/MISSION_12_SETUP_GUIDE.md`)
    * [ ] Verify SSL certificate provisioning (user action required)
    * [ ] Update `PWA_URL` environment variable in Vercel to `https://waymaker.ai/#/` (user action required)
    * [ ] **Update Stripe webhook endpoint URL** from `https://aire-mini.vercel.app/api/stripe/webhook` to `https://waymaker.ai/api/stripe/webhook` in Stripe dashboard (user action required - see `docs/MISSION_12_SETUP_GUIDE.md`)
    * [ ] Verify email domain `noreply@waymaker.ai` in Resend (user action required - see `docs/MISSION_12_SETUP_GUIDE.md`)
    * [ ] Test all deep-links with custom domain (user action required)
    * [ ] Test notification email deep-links (user action required)
    * [ ] Verify all routes accessible with custom domain (user action required)
    * **Note:** Code updates complete. Manual configuration steps documented in `docs/MISSION_12_SETUP_GUIDE.md`. See guide for DNS, Vercel, Stripe, and Resend setup instructions.

* [ ] **Mission 18: Landing Page Creation** (After Mission 12, Before Mission 14)
    * [ ] Transform AuthScreen to show landing page content for unauthenticated users
    * [ ] Add sign-up CTA and value proposition
    * [ ] Keep login functionality for existing users
    * [ ] Design landing page with compelling messaging about DiRP and WayMaker
    * [ ] Add visual elements (hero section, features, benefits)
    * [ ] Ensure smooth transition from landing page to sign-up/login
    * [ ] Test landing page on mobile and desktop
    * **Note:** Should be completed after custom domain (Mission 12) but before code splitting (Mission 14) to improve first-time user experience.

* [ ] **Mission 13: SMS Functionality with Compliance** (After Mission 12 - Custom Domain Required)
    * [ ] **Prerequisites:** Mission 12 (Custom Domain) must be complete
    * [x] Create Privacy Policy page (`/privacy` route) ✅
    * [x] Create Terms of Service page (`/terms` route) ✅
    * [x] Add privacy/terms links to onboarding screen near SMS opt-in ✅
    * [x] Create SMS compliance documentation (`docs/SMS_COMPLIANCE.md`) ✅
    * [ ] **Run SQL script** `sql/ADD_SMS_COMPLIANCE_FIELDS.sql` in Supabase SQL Editor to add SMS compliance fields to `user_preferences` table:
        * `sms_opted_out` (BOOLEAN, default false)
        * `preferences_saved_at` (TIMESTAMPTZ)
        * `optin_sms_received_at` (TIMESTAMPTZ)
        * `ip_address` (TEXT)
        * `user_agent` (TEXT)
    * [x] Update preferences API to capture consent metadata (timestamp, IP, user agent) ✅
    * [x] Create Twilio webhook endpoint for handling JOIN/STOP/START/HELP keywords ✅
    * [x] Install Twilio SDK package ✅
    * [ ] Add Twilio environment variables to Vercel (Account SID, Auth Token, Phone Number, Webhook Secret)
    * [x] Create phone number formatting utility for E.164 format ✅
    * [x] Update notification endpoint to send SMS and check opt-out status ✅
    * [ ] Configure Twilio webhook URL in Twilio console (`https://waymaker.ai/api/twilio/webhook`)
    * [ ] Submit privacy policy and terms URLs to Twilio for number verification
    * [ ] Test SMS double opt-in (JOIN), opt-out (STOP), and re-enable (START) flows
    * [ ] Test SMS delivery via cron job with test user preferences
    * [ ] Verify audit trail queries work for carrier compliance audits
    * **Note:** Mission 13 MUST be completed AFTER Mission 12 because Twilio requires a live custom domain for number verification and compliance documentation. Code implementation is complete, pending Mission 12 for Twilio configuration.

* [ ] **Mission 14: Code Splitting & Performance Optimization**
    * [ ] Implement dynamic imports for route-based code splitting
    * [ ] Configure `build.rollupOptions.output.manualChunks` for optimal chunking
    * [ ] Split large dependencies (recharts, etc.) into separate chunks
    * [ ] Test bundle size reduction
    * [ ] Verify all functionality works after code splitting
    * [ ] Measure and document performance improvements
    * [ ] Verify security measures are in place and sufficient
    * **Note:** Addresses build warning about chunks > 500 kB. Should be done before public launch for better performance.

* [ ] **Mission 15: Functionality Updates Round 2**
    * [ ] **Mission 15.1: Seinfeld Method Visual Chain** (Visual Enhancement)
        * [ ] Enhance `AscentGraph` component to show visual chain effect for consecutive cycles
        * [ ] Add glowing gold/white effect to dots representing consecutive calendar days with cycles
        * [ ] Implement streak detection: Calculate consecutive days from consistency data (`streakDays` from `consistencyCalculator`)
        * [ ] Visual styling: Glowing effect (CSS glow/shadow) for dots in active streak, no glow for missed days (breaks chain)
        * [ ] Chain visualization: Connect consecutive cycle dots with glowing line/effect
        * [ ] Update `ClusteredDot` component to show glow effect when part of active streak
        * **Note:** Seinfeld method = visual chain showing consecutive daily cycles. Streak logic already exists in `consistencyCalculator.ts` (`streakDays` field). Need to add visual representation.
    * [ ] Additional Round 2 improvements to be added here

* [ ] **Mission 16: Stripe TEST → LIVE Mode Transition** (Required before public launch)
    * [ ] **Prerequisites:** Mission 12 (Custom Domain) must be complete
    * [ ] **Step 1: Create Products in Stripe LIVE Mode**
        * [ ] Switch Stripe Dashboard to LIVE mode
        * [ ] Create Monthly subscription product ($9/month) in LIVE mode
        * [ ] Copy LIVE Price ID (starts with `price_`, not `price_test_`)
    * [ ] **Step 2: Create Webhook Endpoint in LIVE Mode**
        * [ ] In Stripe Dashboard → Developers → Webhooks
        * [ ] Click "Add endpoint"
        * [ ] Set URL: `https://waymaker.ai/api/stripe/webhook`
        * [ ] Select events:
            * `checkout.session.completed`
            * `customer.subscription.updated`
            * `customer.subscription.deleted`
            * `checkout.session.async_payment_failed` (optional)
            * `checkout.session.async_payment_succeeded` (optional)
        * [ ] Copy webhook signing secret (starts with `whsec_`, not `whsec_test_`)
    * [ ] **Step 3: Update Vercel Environment Variables**
        * [ ] Update `STRIPE_SECRET_KEY`: Replace `sk_test_...` with `sk_live_...`
            * **Where:** Stripe Dashboard → Developers → API keys → Secret key (LIVE mode)
        * [ ] Update `STRIPE_PUBLISHABLE_KEY` (if used): Replace `pk_test_...` with `pk_live_...`
            * **Where:** Stripe Dashboard → Developers → API keys → Publishable key (LIVE mode)
        * [ ] Update `STRIPE_WEBHOOK_SECRET`: Replace test secret with LIVE webhook secret
            * **Where:** Stripe Dashboard → Developers → Webhooks → Select LIVE webhook → Signing secret
        * [ ] Update `STRIPE_MONTHLY_PRICE_ID`: Replace test price ID with LIVE price ID
            * **Where:** Stripe Dashboard → Products → Monthly subscription (LIVE mode) → Pricing → Price ID
    * [ ] **Step 4: Verify Configuration**
        * [ ] Test webhook endpoint: Stripe Dashboard → Webhooks → Send test webhook
        * [ ] Verify webhook reaches endpoint successfully (check Vercel function logs)
        * [ ] Test checkout flow with real card (small amount) in LIVE mode
        * [ ] Verify subscription status updates correctly
        * [ ] Verify webhook processes subscription creation
    * [ ] **Step 5: Final Verification**
        * [ ] Test complete subscription flow end-to-end
        * [ ] Verify subscription management (cancel/reactivate) works
        * [ ] Verify pay gate appears correctly
        * [ ] Verify subscription banner appears correctly
        * [ ] Check Vercel function logs for any errors
    * [ ] **Critical Notes:**
        * ⚠️ **DO NOT switch to LIVE mode until custom domain is configured**
        * ⚠️ **Test products DO NOT work in LIVE mode** - must create products in LIVE mode
        * ⚠️ **Webhook URL MUST use custom domain** (`https://waymaker.ai/api/stripe/webhook`)
        * ⚠️ **Get NEW webhook secret** for live webhook endpoint (test secret won't work)
        * ⚠️ **Test thoroughly** before public launch

* [ ] **Mission 17: Social Login & Keychain Credentials** (After custom domain)
    * [ ] Configure OAuth providers in Supabase (Google, GitHub, etc.)
    * [ ] Update AuthScreen to show social login options
    * [ ] Add OAuth redirect URL configuration in Supabase
    * [ ] Test social login flow with custom domain
    * [ ] Implement WebAuthn/Passkeys for keychain credentials (browser-based)
    * [ ] Add "Sign in with passkey" option to AuthScreen
    * [ ] Test keychain credential flow
    * [ ] Verify social login works with existing JWT verification
    * **Note:** Should be done AFTER Mission 12 (Custom Domain) because OAuth requires stable redirect URLs. Keychain credentials use WebAuthn API (browser-native, no external dependencies).

* [ ] **Mission 19: Improvement Capture & Error Reporting** (After Mission 17)
    * [ ] Add wrench/settings icon (likely in header or profile area)
    * [ ] Create improvement capture form/modal
    * [ ] Create error reporting form/modal
    * [ ] Create database table for feedback submissions (improvements and errors)
    * [ ] Add API endpoint for submitting improvements/errors
    * [ ] Store submissions with user_id, timestamp, type (improvement/error), and content
    * [ ] Add UI to access feedback forms from app
    * [ ] Test submission flow and verify data storage
    * **Note:** Allows participants to share improvements and errors directly while using the app, improving product development feedback loop.

## Backlog (Future Missions):
* [ ] **Mission 20: Kairos (AI Mirror)** - Deferred to post-MVP
* [ ] **Mission 21: Enhanced Analytics** - Post-MVP feature
* [ ] **Mission 22: Social Features** - Post-MVP feature

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
* **Preferences API database errors**: Fixed - removed non-existent SMS compliance columns from upsert payload (columns will be added in Mission 13)

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

* **Mission 10: Pay Gate Integration** ✅ **COMPLETE**
    * **Mission 10: Stripe Account Setup & Database Schema** ✅
        * [x] Create Stripe account
        * [x] Create Stripe products: Monthly ($9/month) - Annual removed
        * [x] Configure Stripe webhook endpoint (TEST mode)
        * [x] Set up webhook events (5 events configured)
        * [x] Add Stripe API keys to Vercel environment variables (TEST mode)
        * [x] Add Stripe Price ID to Vercel environment variables
        * [x] Create subscriptions table SQL script
        * [x] Run SQL script in Supabase to create subscriptions table with RLS policies
        * [x] Trial limit set to 21 cycles
    * **Mission 10B: Subscription API Endpoints** ✅
        * [x] Create `/api/subscriptions/status` endpoint (GET)
        * [x] Create `/api/subscriptions/create-checkout` endpoint (POST)
        * [x] Create `/api/subscriptions/cancel` endpoint (POST)
        * [x] Create `/api/subscriptions/reactivate` endpoint (POST)
        * [x] Create `/api/stripe/webhook` endpoint (POST)
        * [x] Implement cycle counting logic (increments on cycle creation)
        * [x] Update `vercel.json` to include new API routes
        * [x] Fixed Stripe API version compatibility (2025-02-24.acacia)
        * [x] Fixed webhook to force 'active' status after successful payment
        * [x] Fixed email extraction (using JWT token instead of admin API)
    * **Mission 10C: Pay Gate UI & Route Protection** ✅
        * [x] Create `PayGateModal` component with subscription messaging
        * [x] Create `SubscriptionBanner` component (shows at 10+ cycles)
        * [x] Create `useSubscriptionStatus` hook
        * [x] Update `Root.tsx` to check subscription status and show PayGateModal when cycles_completed >= 21 and status !== 'active'
        * [x] Implement post-checkout success flow
        * [x] Add subscription status check to cycle creation flow
        * [x] Profile page overhaul with high-value subscription display ("WayMaker DiRP" status)
        * [x] Subscription management UI (cancel/reactivate)
        * [x] Fixed React hooks error #310 (hooks order)
        * [x] Improved pay gate UX (no blank pages, clear subscribe message)
        * [x] Added refresh button for subscription status
    * **Test Results:** ✅ All core functionality verified:
        - Subscription checkout flow working
        - Pay gate appears at 21+ cycles
        - Subscription banner appears at 10+ cycles
        - Subscription management (cancel/reactivate) working
        - Profile page shows subscription status correctly
        - Webhook processing subscription updates
    * **Note:** Currently in TEST mode. Mission 16 (Stripe TEST → LIVE Transition) must be completed after Mission 12 (Custom Domain).

* **Mission 11: UX Improvements & Mobile Optimization** ✅ **COMPLETE**
    * [x] Add conditional logic for first-time users: Score prior day performance
        * [x] Question: "Overall, on a scale from 1-10, how well did you show up with intention and maximize yesterday?"
        * [x] Display this question only for first-time users (users with 0 completed cycles)
        * [x] Added to PrimeScreen with visual distinction (muted background, border)
    * [x] Add conditional logic for first-time users: Graph placeholder message
        * [x] Show message "DiRP it up to start your journey!" where graph would be
        * [x] Display only when user has 0 cycles (data.length === 0)
        * [x] Updated empty state in AscentGraph component
    * [x] Delete text: "View your growth journey overtime, starts after day 2." from AscentGraph component
    * [x] Optimize mobile formatting across all screens
        * [x] Standardized button layouts: All buttons full-width on desktop and mobile for consistency
        * [x] Fixed button order: Back button always appears below Next button on all screens
        * [x] Optimized ProfileScreen mobile layout (subscription card padding, theme radio buttons, section spacing)
        * [x] Optimized DiRPLogScreen tabs (removed min-w-0 to allow full text coverage)
        * [x] Optimized graph scaling with responsive heights (h-[250px] sm:h-[300px] md:h-[350px])
        * [x] Fixed graph container centering (balanced margins, Y-axis width constraint)
        * [x] Optimized modal/dialog components for mobile (max-w-[95vw] sm:max-w-lg, scrollable)
        * [x] Standardized spacing patterns across all screens (p-4 sm:p-6, gap-4 sm:gap-6)
        * [x] Ensured touch targets meet 44x44px minimum (rating buttons)
        * [x] Verified typography scaling and mobile standards across all components
    * [x] Subscription management improvements
        * [x] Changed "Cancel Subscription" to "Manage Subscription" button
        * [x] Created Stripe billing portal API endpoint (/api/subscriptions/create-portal)
        * [x] Moved Manage Subscription button below "Manage Notification Preferences"
        * [x] Button opens Stripe customer portal for card updates and subscription management
    * **Test Results:** ✅ All format optimizations verified:
        - Button layouts consistent across all screens
        - Graph scales properly on mobile and desktop
        - Modals properly sized and scrollable on mobile
        - ProfileScreen mobile layout optimized
        - Graph container properly centered
        - Subscription management working correctly

* **Pre-Mission 12 Fixes** ✅ **COMPLETE**
    * [x] Fixed database error in preferences API when updating name or theme
        * **Root Cause:** Code was trying to upsert SMS compliance columns (`preferences_saved_at`, `ip_address`, `user_agent`, `sms_opted_out`) that don't exist yet (will be added in Mission 13)
        * **Fix:** Removed non-existent columns from upsert payload. Only existing columns are included.
        * **Files Modified:** `api/user/preferences.ts`
    * [x] Fixed related improvements container sizing on CommitScreen
        * **Issue:** Container height changed while typing on mobile, causing layout shifts
        * **Fix:** Added `min-h-[200px]` and `max-h-[400px]` with `overflow-y-auto` to lock container size
        * **Files Modified:** `src/pages/CommitScreen.tsx`
    * [x] Added Mission 18: Landing Page Creation to backlog (after Mission 12, before Mission 14)
    * [x] Added Mission 19: Improvement Capture & Error Reporting to backlog (after Mission 17)
    * **Test Results:** ✅ Preferences API now works correctly for updating name and theme

