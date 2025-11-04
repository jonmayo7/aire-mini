# Mission Verification Checklist

**Purpose:** Ensure 100% confidence that all missions 1-7 are functioning correctly before proceeding to Mission 8.

**App URL:** `https://aire-mini-git-main-jon-mayos-projects.vercel.app`

---

## Infrastructure Verification

### Supabase Verification

#### Database Tables
- [ ] **cycles table exists**
  - Location: Supabase Dashboard → Table Editor
  - Verify columns: `id`, `user_id`, `prime_text`, `improve_text`, `commit_text`, `execution_score`, `created_at`
  - Verify `user_id` is UUID type (not bigint)
  - Verify `execution_score` allows 0-10 or null

- [ ] **user_preferences table exists**
  - Location: Supabase Dashboard → Table Editor
  - Verify columns: `user_id`, `email`, `phone`, `preferred_notification_time`, `notification_method`, `created_at`, `updated_at`
  - Verify `user_id` is UUID and primary key

#### Row Level Security (RLS)
- [ ] **cycles table RLS enabled**
  - Location: Supabase Dashboard → Authentication → Policies
  - Policy exists: `auth.uid() = user_id`
  - Test: Create test user, verify can only see own cycles

- [ ] **user_preferences table RLS enabled**
  - Location: Supabase Dashboard → Authentication → Policies
  - Policy exists: `auth.uid() = user_id`
  - Test: Create test user, verify can only see own preferences

#### Authentication Settings
- [ ] **Site URL configured**
  - Location: Supabase Dashboard → Authentication → URL Configuration
  - Value: `https://aire-mini-git-main-jon-mayos-projects.vercel.app`
  - Verify: Email confirmation links point to production (not localhost)

- [ ] **Redirect URLs configured**
  - Location: Supabase Dashboard → Authentication → URL Configuration
  - Includes: `https://aire-mini-git-main-jon-mayos-projects.vercel.app/**`
  - Includes: `https://aire-mini-git-main-jon-mayos-projects.vercel.app/#/auth`
  - Optional: Localhost URLs for development

#### API Keys
- [ ] **Project URL matches Vercel env vars**
  - Supabase Dashboard → Settings → API → Project URL
  - Matches: `VITE_SUPABASE_URL` and `SUPABASE_URL` in Vercel

- [ ] **Anon key matches Vercel env vars**
  - Supabase Dashboard → Settings → API → anon public key
  - Matches: `VITE_SUPABASE_ANON_KEY` in Vercel

- [ ] **Service role key exists in Vercel**
  - Supabase Dashboard → Settings → API → service_role key
  - Matches: `SUPABASE_SERVICE_ROLE` in Vercel (backend only, never exposed to frontend)

#### Database Test Query
- [ ] **Can query cycles via Supabase dashboard**
  - Location: Supabase Dashboard → Table Editor → cycles
  - Run: `SELECT * FROM cycles LIMIT 10`
  - Verify: Query executes successfully

- [ ] **RLS test: User isolation**
  - Create two test accounts
  - Each account creates a cycle
  - Verify: Each account can only see their own cycles

---

### Vercel Verification

#### Environment Variables
- [ ] **Frontend variables (VITE_ prefix)**
  - `VITE_SUPABASE_URL` - Present and matches Supabase Project URL
  - `VITE_SUPABASE_ANON_KEY` - Present and matches Supabase anon key
  - Enabled for: Production, Preview, Development

- [ ] **Backend variables (no prefix)**
  - `SUPABASE_URL` - Present and matches Supabase Project URL
  - `SUPABASE_SERVICE_ROLE` - Present and matches Supabase service_role key
  - `RESEND_API_KEY` - Present and valid
  - `CRON_SECRET` - Present (can be auto-generated or custom)
  - `PWA_URL` - Present (optional, defaults to https://striveos.io/#/)

#### Build Configuration
- [ ] **Framework preset**
  - Location: Vercel Dashboard → Project Settings → General
  - Value: "Other" (NOT "Vite")
  - Why: `vercel.json` has explicit builds, "Vite" preset would conflict

- [ ] **vercel.json configuration**
  - File exists: `vercel.json`
  - Contains: `builds` array with API and static build
  - Contains: `routes` array for API and frontend routing
  - Contains: `crons` array with `/api/notifications/send` schedule

#### Deployment Status
- [ ] **Latest deployment successful**
  - Location: Vercel Dashboard → Deployments
  - Status: Ready/Deployed (not failed)
  - Build logs: No errors

#### Functions Deployed
- [ ] **Functions tab shows all endpoints**
  - Location: Vercel Dashboard → Functions tab
  - Expected functions:
    - `/api/cycles/create`
    - `/api/cycles/history`
    - `/api/cycles/lists`
    - `/api/resonance/query`
    - `/api/user/preferences`
    - `/api/notifications/send`
  - Note: May only show after first invocation

#### API Endpoints Test
- [ ] **All endpoints return 200/401 (not 404)**
  - Test with curl (see `docs/TEST_ENDPOINTS.md`)
  - `/api/cycles/history` - Returns 401 without auth, 200 with valid JWT
  - `/api/cycles/lists` - Returns 401 without auth, 200 with valid JWT
  - `/api/user/preferences` - Returns 401 without auth, 200 with valid JWT
  - `/api/notifications/send` - Returns 401 without CRON_SECRET

#### Cron Job
- [ ] **Cron job configured**
  - Location: Vercel Dashboard → Functions tab → Cron Jobs
  - Path: `/api/notifications/send`
  - Schedule: `*/5 * * * *` (every 5 minutes)
  - Status: Active

---

### Resend Verification

#### Account & API Key
- [ ] **Resend account exists and is active**
  - Location: https://resend.com/dashboard
  - Status: Active account

- [ ] **API key present in Vercel**
  - Location: Vercel Dashboard → Environment Variables
  - Key: `RESEND_API_KEY`
  - Value: Valid Resend API key

#### Domain Configuration
- [ ] **Domain configured (if using custom)**
  - Location: Resend Dashboard → Domains
  - Status: Verified domain OR using default Resend domain
  - Note: Default domain works for testing

#### Email Sending Test
- [ ] **Can send test email via API**
  - Use curl or Postman to test `/api/notifications/send` with CRON_SECRET
  - Verify: Email received successfully
  - Check: Email contains correct deep-link to `/prime` route

- [ ] **Integration working**
  - Location: Vercel Dashboard → Functions → `/api/notifications/send` → Logs
  - Trigger: Cron job runs every 5 minutes
  - Verify: Logs show successful email sends (when users match time window)

---

## Mission-by-Mission Verification

### Mission 1: The Great Pivot (TMA Purge & PWA Install) ✅

- [ ] **No Telegram dependencies**
  - Check: `package.json` - no `@telegram-apps/telegram-ui`
  - Check: `src/index.tsx` - no Telegram imports
  - Check: `src/components/Root.tsx` - no Telegram components
  - Check: `index.html` - no Telegram scripts

- [ ] **Supabase libraries installed**
  - `@supabase/supabase-js` - Present in `package.json`
  - `@supabase/auth-ui-react` - Present in `package.json`

- [ ] **shadcn/ui installed**
  - `tailwindcss` - Present in `package.json`
  - `src/components/ui/` directory exists
  - Components: `button`, `input`, `textarea`, `card`, `label` exist

---

### Mission 2: Build the Supabase Auth Gate ✅

- [ ] **Login functionality**
  - Navigate to: `/auth`
  - Action: Enter email and password
  - Result: Successfully logs in OR shows clear error message
  - Note: "Invalid credentials" error needs investigation

- [ ] **Sign up functionality**
  - Navigate to: `/auth`
  - Action: Click "Sign up" and create account
  - Result: Account created, email confirmation sent
  - Result: Email confirmation link works (redirects to app)

- [ ] **Password reset**
  - Navigate to: `/auth`
  - Action: Click "Forgot password"
  - Result: Password reset email sent
  - Result: Password reset link works and logs user in

- [ ] **Session persistence**
  - Action: Log in successfully
  - Action: Refresh page
  - Result: Still logged in (session persists)

- [ ] **Sign out**
  - Action: Click "Sign Out" button
  - Result: Redirected to `/auth` page
  - Result: Cannot access protected routes

- [ ] **Protected routing**
  - Action: Try to access `/prime` without logging in
  - Result: Redirected to `/auth`
  - Action: Log in, then access `/prime`
  - Result: Can access route

---

### Mission 3: Update API Security ✅

- [ ] **JWT verification utility exists**
  - File: `src/lib/api-utils/verifyJWT.ts`
  - Uses: JWKS approach (not legacy JWT secret)
  - Function: `verifyJWT()` extracts user_id from token

- [ ] **API endpoints require JWT**
  - `/api/cycles/create` - Returns 401 without token
  - `/api/cycles/history` - Returns 401 without token
  - `/api/cycles/lists` - Returns 401 without token
  - `/api/resonance/query` - Returns 401 without token
  - `/api/user/preferences` - Returns 401 without token

- [ ] **Authenticated fetch helper**
  - File: `src/lib/apiClient.ts`
  - Hook: `useAuthenticatedFetch()`
  - Function: Automatically adds JWT token to requests

- [ ] **401 error handling**
  - Action: Access protected route with expired/invalid token
  - Result: Redirected to `/auth`

---

### Mission 4: Refactor UI ✅

- [ ] **shadcn/ui components used**
  - All PICV screens use `Card`, `Button`, `Textarea`, `Label`
  - Check: `PrimeScreen.tsx`, `ImproveScreen.tsx`, `CommitScreen.tsx`, `VisualizeScreen.tsx`

- [ ] **Consistent styling**
  - All screens have Card-based layout
  - All form inputs have Label components
  - Consistent spacing and typography

- [ ] **Accessibility**
  - All inputs have `htmlFor` attributes on labels
  - Keyboard navigation works
  - Screen reader friendly

---

### Mission 5: Dashboard Implementation ✅

- [ ] **Dashboard loads**
  - Navigate to: `/` (after login)
  - Result: Dashboard displays with "Welcome to your Daily AIRE"

- [ ] **Ascent Graph displays**
  - Action: Complete at least one cycle
  - Result: Ascent Graph shows on dashboard
  - Verify: Daily Line (raw execution_score) with color-coded dots
  - Verify: Ascent Line (7-day rolling average)
  - Verify: Dots colored: 1-3 red, 4-6 yellow, 7-10 green

- [ ] **Improvement Log link**
  - Action: Click "View Improvement Log" button
  - Result: Navigates to `/improvements`
  - Result: Shows list of all past `improve_text` entries

- [ ] **API endpoint works**
  - `/api/cycles/history` - Returns cycles array with JWT auth
  - Verify: Cycles ordered by `created_at DESC`
  - Verify: Only returns cycles for authenticated user

---

### Mission 6: Resonance Engine ✅

- [ ] **Resonance suggestions appear**
  - Navigate to: `/commit`
  - Action: Type commit text
  - Result: After 3+ characters and 500ms debounce, suggestions appear

- [ ] **Top 3 suggestions shown**
  - Result: Maximum 3 suggestions displayed
  - Result: Each suggestion shows: date, improve_text, execution_score, relevance_score

- [ ] **Keyword matching works**
  - Action: Type keywords that match past improvements
  - Result: Relevant improvements appear in suggestions
  - Action: Type unrelated text
  - Result: Suggestions may be empty or less relevant

- [ ] **API endpoint works**
  - `/api/resonance/query` - Returns suggestions with JWT auth
  - Body: `{ commit_text: string }`
  - Returns: Array of up to 3 scored improvements

---

### Mission 7: Notification System ✅

- [ ] **Onboarding screen appears**
  - Action: Complete first PICV cycle
  - Result: After "Forge Forward", redirected to `/onboarding`

- [ ] **Preferences form works**
  - Navigate to: `/onboarding`
  - Action: Enter email, preferred time, notification method
  - Action: Click "Save Preferences"
  - Result: Preferences saved successfully
  - Verify: Preferences appear in Supabase `user_preferences` table

- [ ] **Skip option works**
  - Action: Click "Skip for now"
  - Result: Redirected to dashboard (no error)

- [ ] **API endpoint works**
  - `/api/user/preferences` GET - Returns preferences with JWT auth
  - `/api/user/preferences` POST - Saves preferences with JWT auth

- [ ] **Cron job configured**
  - Location: Vercel Dashboard → Functions → Cron Jobs
  - Path: `/api/notifications/send`
  - Schedule: Every 5 minutes
  - Status: Active

- [ ] **Notification email sent**
  - Action: Set preferred_notification_time to current time (within 5-minute window)
  - Wait: Up to 5 minutes for cron job to run
  - Result: Email received with deep-link to `/prime`
  - Verify: Email contains correct message and styling

- [ ] **Database table exists**
  - Supabase: `user_preferences` table exists
  - RLS: Enabled and working

---

## Full Flow Verification

### Complete PICV Cycle Test
1. [ ] **Log in** - Successfully authenticate
2. [ ] **Navigate to Prime** - Click "Start Daily Cycle"
3. [ ] **Complete Prime** - Enter gratitude text, click Next
4. [ ] **Complete Improve** - Enter reflection, rate previous commitment (if applicable), click Next
5. [ ] **Complete Commit** - Enter commitment, see Resonance suggestions, click Next
6. [ ] **Visualize** - Review all data, click "Forge Forward"
7. [ ] **Onboarding** - First cycle redirects to onboarding
8. [ ] **Set Preferences** - Enter email and preferred time
9. [ ] **Dashboard** - Redirected to dashboard, see updated Ascent Graph
10. [ ] **Second Cycle** - Complete another cycle to verify persistence

---

## Verification Notes

### Issues Found
- [ ] **Login "invalid credentials"**: Password reset works but normal login shows error
  - Status: Needs investigation
  - Workaround: Use password reset to log in

### All Clear
- [ ] All infrastructure verified and working
- [ ] All missions 1-7 verified and functioning
- [ ] Ready to proceed to Mission 8

---

## Next Steps After Verification

1. **Resolve any issues found** during verification
2. **Update documentation** with verification results
3. **Proceed to Mission 8**: Offline Support (once foundation is 100% verified)

