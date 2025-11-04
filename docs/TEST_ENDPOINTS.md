# Quick Endpoint Testing Guide

## App URL
```
https://aire-mini-git-main-jon-mayos-projects.vercel.app
```

## Step 1: Get Your JWT Token

1. Open your app in browser: https://aire-mini-git-main-jon-mayos-projects.vercel.app
2. Log in if needed
3. Open Browser DevTools (F12) → Console tab
4. Run this JavaScript:
   ```javascript
   // Method 1: If you have Supabase client available
   const session = await window.supabase?.auth.getSession();
   console.log('Token:', session?.data?.session?.access_token);
   
   // Method 2: Check localStorage directly
   const keys = Object.keys(localStorage);
   const authKey = keys.find(k => k.includes('auth-token') || k.includes('supabase'));
   if (authKey) {
     const tokenData = JSON.parse(localStorage.getItem(authKey));
     console.log('Token:', tokenData?.access_token);
   }
   ```
5. Copy the token value

## Step 2: Test Endpoints

Run these commands in your terminal (replace `YOUR_TOKEN` with the token from Step 1):

```bash
export APP_URL="https://aire-mini-git-main-jon-mayos-projects.vercel.app"
export TOKEN="YOUR_TOKEN_HERE"

# Test 1: /api/cycles/history (should return 200 with cycles array)
echo "Testing /api/cycles/history..."
curl -X GET "$APP_URL/api/cycles/history" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

# Test 2: /api/user/preferences (should return 200 with preferences or null)
echo -e "\nTesting /api/user/preferences..."
curl -X GET "$APP_URL/api/user/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

# Test 3: /api/cycles/lists (should return 200 with previous_commit)
echo -e "\nTesting /api/cycles/lists..."
curl -X GET "$APP_URL/api/cycles/lists" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

## Expected Results

✅ **200 OK** = Endpoint exists and working!
✅ **401 Unauthorized** = Endpoint exists but token is invalid/expired
❌ **404 Not Found** = Endpoint not deployed

## Testing /api/notifications/send (Cron Endpoint)

This endpoint requires `CRON_SECRET`. You can test it manually:

```bash
export CRON_SECRET="your-cron-secret-from-vercel"
export APP_URL="https://aire-mini-git-main-jon-mayos-projects.vercel.app"

curl -X POST "$APP_URL/api/notifications/send" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"
```

**Note:** This endpoint is normally called by Vercel's cron job automatically every 5 minutes. Manual testing is only for verification.

---

## Environment Variables Guide

### Frontend Variables (`.env.local` - for local development only)
These use `VITE_` prefix and are only available in the browser:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** These same variables must also be in Vercel Dashboard for production!

### Frontend Variables (Vercel Dashboard - REQUIRED for production!)
**These MUST be in Vercel Dashboard with `VITE_` prefix:**

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables (for **Production**, **Preview**, and **Development** environments):
   - `VITE_SUPABASE_URL` = your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon/public key

**Critical:** Without these, your deployed app will show a white screen with the error you're seeing!

### Backend Variables (Vercel Dashboard - for production)
These are **NOT** in `.env.local`. They must be added to **Vercel Dashboard**:

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `SUPABASE_URL` (your Supabase project URL - same as VITE_SUPABASE_URL but without VITE_ prefix)
   - `SUPABASE_SERVICE_ROLE` (your Supabase service role key - secret!)
   - `RESEND_API_KEY` (from your Resend account)
   - `CRON_SECRET` (generate a random secret string)
   - `PWA_URL` (optional, defaults to https://striveos.io/#/)

**Important:** 
- `VITE_` prefixed variables are **baked into the frontend build** at build time
- `RESEND_API_KEY` and `CRON_SECRET` are **backend-only** variables
- They are **NOT** available in the browser (security!)
- They should **NOT** be in `.env.local` (frontend can't use them anyway)
- They **MUST** be in Vercel Dashboard for serverless functions to work

