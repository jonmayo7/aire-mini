# Vortex Breakthrough: Step-by-Step Verification Guide

## ⚠️ CRITICAL: The Same Values, Different Names

**IMPORTANT:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are **THE SAME VALUES** as `SUPABASE_URL` and `SUPABASE_ANON_KEY` - just with the `VITE_` prefix!

You already have these values in Vercel. You just need to **duplicate them** with the `VITE_` prefix.

---

## Step 1: Find Your Supabase Values

### Where to Find in Supabase Dashboard:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **API** (in the left sidebar)
4. You'll see:
   - **Project URL** = This is your `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon public** key = This is your `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`

### Copy These Exact Values:
- **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
- **anon public** key (long string starting with `eyJ...`)

---

## Step 2: Add to Vercel Dashboard

1. Go to: **Vercel Dashboard** → **Your Project** (`aire-mini`) → **Settings** → **Environment Variables**

2. **Add these 2 NEW variables** (duplicate your existing ones with `VITE_` prefix):

   | Variable Name | Value | Environments |
   |--------------|-------|--------------|
   | `VITE_SUPABASE_URL` | Copy from Supabase "Project URL" | ✅ Production, ✅ Preview, ✅ Development |
   | `VITE_SUPABASE_ANON_KEY` | Copy from Supabase "anon public" key | ✅ Production, ✅ Preview, ✅ Development |

3. **Verify you have ALL these variables** in Vercel:

   **Frontend (with VITE_ prefix):**
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`

   **Backend (no prefix):**
   - ✅ `SUPABASE_URL` (same value as VITE_SUPABASE_URL)
   - ✅ `SUPABASE_SERVICE_ROLE` (different from anon key - this is the service role key)
   - ✅ `RESEND_API_KEY`
   - ✅ `CRON_SECRET`
   - ✅ `PWA_URL`

---

## Step 3: Framework Preset - KEEP AS "Other"

**DO NOT CHANGE THIS!** 

Your `vercel.json` has explicit builds:
```json
{
  "builds": [
    { "src": "api/**/*.ts", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ]
}
```

**Framework Preset MUST be "Other"** because:
- We have explicit builds in `vercel.json`
- Setting it to "Vite" would conflict with our configuration
- "Other" allows `vercel.json` to control everything

---

## Step 4: Trigger New Deployment

After adding the `VITE_` variables:

1. **Option A (Recommended):** Push a small change to trigger redeploy:
   ```bash
   git commit --allow-empty -m "trigger: Redeploy after adding VITE_ env vars"
   git push origin main
   ```

2. **Option B:** Go to Vercel Dashboard → Deployments → Click "Redeploy" on latest deployment

---

## Step 5: Verification Checklist

### ✅ Frontend Working (White Screen Fixed)
- [ ] Open app: https://aire-mini-git-main-jon-mayos-projects.vercel.app
- [ ] Should see login screen (NOT white screen)
- [ ] Can log in successfully
- [ ] Dashboard loads after login

### ✅ API Endpoints Working
- [ ] Get JWT token from browser (see TEST_ENDPOINTS.md)
- [ ] Test `/api/cycles/history` - returns 200 OK
- [ ] Test `/api/user/preferences` - returns 200 OK
- [ ] Test `/api/cycles/lists` - returns 200 OK

### ✅ Day 2 Re-engagement System (Per PROJECT_AIRE.md)
- [ ] Complete first PICV cycle
- [ ] After cycle, redirected to `/onboarding` screen
- [ ] Can enter email and preferred notification time
- [ ] Preferences save successfully
- [ ] Cron job runs every 5 minutes (check Vercel Functions logs)
- [ ] Email notifications sent at preferred time

---

## Step 6: Verify Day 2 System

### Test the Full Flow:

1. **Complete First Cycle:**
   - Log in
   - Go through Prime → Improve → Commit → Visualize
   - Click "Save & Forge Forward"

2. **Onboarding Should Trigger:**
   - After first cycle, should redirect to `/onboarding`
   - Enter email and preferred time
   - Save preferences

3. **Verify Database:**
   - Go to Supabase Dashboard → Table Editor → `user_preferences`
   - Should see your user_id with email and preferred_notification_time

4. **Verify Cron Job:**
   - Go to Vercel Dashboard → Functions tab
   - Look for `/api/notifications/send` in function list
   - Check Vercel logs to see if cron runs (every 5 minutes)

5. **Test Notification Manually:**
   - Use curl with `CRON_SECRET` (see TEST_ENDPOINTS.md)
   - Should return 200 OK and send emails if time matches

---

## Troubleshooting

### Still White Screen?
- ✅ Check Vercel Dashboard → Environment Variables
- ✅ Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are there
- ✅ Check they're enabled for Production, Preview, Development
- ✅ Wait for redeploy to complete
- ✅ Hard refresh browser (Cmd+Shift+R)

### API Endpoints Not Working?
- ✅ Check Functions tab in Vercel - should show 6+ functions
- ✅ Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` are in Vercel
- ✅ Test with JWT token (see TEST_ENDPOINTS.md)

### Framework Preset Confusion?
- ✅ **Keep it as "Other"** - this is correct for our setup
- ✅ Our `vercel.json` controls the builds explicitly

---

## Success Criteria

You've broken through the vortex when:
1. ✅ App loads (no white screen)
2. ✅ Can log in and complete PICV cycle
3. ✅ Onboarding redirects after first cycle
4. ✅ Preferences save to database
5. ✅ API endpoints return 200 OK with JWT auth
6. ✅ Cron job runs (check Vercel logs)

---

## Next Steps After Verification

Once everything works:
1. Test full Day 2 flow: Complete cycle → Onboarding → Wait for notification
2. Verify notification email arrives at preferred time
3. Update SPRINT_LOG.md with Mission 7 completion
4. Plan Mission 8: Offline Support (if needed)

