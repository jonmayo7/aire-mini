# API Endpoints Testing Guide

## Quick Test: Basic Endpoint Availability

**Test if endpoints exist (should NOT return DEPLOYMENT_NOT_FOUND):**

```bash
# Replace YOUR_APP_URL with your Vercel deployment URL
export APP_URL="https://your-app.vercel.app"

# Test 1: Check if endpoint exists (should return 401 Unauthorized, NOT 404)
curl -X GET "$APP_URL/api/cycles/history"

# Expected: 401 Unauthorized (endpoint exists, just needs auth)
# If you get: DEPLOYMENT_NOT_FOUND or 404 → endpoint not deployed
```

**Success Indicators:**
- ✅ `401 Unauthorized` = Endpoint exists! (just needs authentication)
- ❌ `404 Not Found` or `DEPLOYMENT_NOT_FOUND` = Endpoint not deployed

---

## Testing Authenticated Endpoints

Most endpoints require JWT authentication. You'll need a valid Supabase session token.

### Method 1: Get Token from Browser

1. Open your app in browser: `https://your-app.vercel.app`
2. Open Browser DevTools (F12) → Console
3. Run this JavaScript:
   ```javascript
   const session = await window.supabase.auth.getSession();
   console.log('Token:', session.data.session?.access_token);
   ```
4. Copy the token

### Method 2: Test with curl (using token)

```bash
# Set your token
export TOKEN="your-supabase-jwt-token-here"
export APP_URL="https://your-app.vercel.app"

# Test GET /api/cycles/history
curl -X GET "$APP_URL/api/cycles/history" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected: 200 OK with cycles array (or empty array if no cycles)

# Test GET /api/cycles/lists
curl -X GET "$APP_URL/api/cycles/lists" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected: 200 OK with previous_commit or null

# Test GET /api/user/preferences
curl -X GET "$APP_URL/api/user/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected: 200 OK with preferences object or null
```

---

## Testing Notification Endpoint (CRON_SECRET)

The `/api/notifications/send` endpoint is protected by `CRON_SECRET`:

```bash
# Get CRON_SECRET from Vercel environment variables
export CRON_SECRET="your-cron-secret-from-vercel"
export APP_URL="https://your-app.vercel.app"

# Test the notification endpoint
curl -X POST "$APP_URL/api/notifications/send" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Expected: 200 OK with notification results
# Or: 200 OK with "No notifications to send" if no users match
```

**Note:** This endpoint requires:
- `RESEND_API_KEY` in Vercel env vars
- `CRON_SECRET` in Vercel env vars
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` in Vercel env vars

---

## Testing in Vercel Dashboard

1. **Check Deployment Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment
   - Check "Build Logs" for any errors
   - Look for API function builds: `api/cycles/create`, `api/notifications/send`, etc.

2. **Check Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - You should see all API endpoints listed
   - Click on any endpoint to see invocation logs

3. **Verify Function Count:**
   - You should see ~8 functions:
     - `api/cycles/create`
     - `api/cycles/history`
     - `api/cycles/lists`
     - `api/notifications/send`
     - `api/resonance/query`
     - `api/user/preferences`
     - Plus lib files (verifyJWT, resonance)

---

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

APP_URL="https://your-app.vercel.app"
TOKEN="your-jwt-token-here"

echo "Testing API endpoints..."
echo ""

echo "1. Testing /api/cycles/history (should return 401 without auth)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" -X GET "$APP_URL/api/cycles/history"
echo ""

echo "2. Testing /api/cycles/history WITH auth..."
curl -s -w "\nStatus: %{http_code}\n" -X GET "$APP_URL/api/cycles/history" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "3. Testing /api/cycles/lists WITH auth..."
curl -s -w "\nStatus: %{http_code}\n" -X GET "$APP_URL/api/cycles/lists" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "4. Testing /api/user/preferences WITH auth..."
curl -s -w "\nStatus: %{http_code}\n" -X GET "$APP_URL/api/user/preferences" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "✅ If all returned 200 or 401 (not 404), endpoints are deployed!"
```

---

## Expected Responses

### Success Responses:
- **200 OK**: Request successful
- **201 Created**: Resource created (e.g., POST /api/cycles/create)
- **401 Unauthorized**: Endpoint exists but needs authentication (good sign!)

### Failure Responses:
- **404 Not Found** or **DEPLOYMENT_NOT_FOUND**: Endpoint not deployed ❌
- **405 Method Not Allowed**: Wrong HTTP method
- **500 Internal Server Error**: Server error (check logs)

---

## Troubleshooting

**If you still get DEPLOYMENT_NOT_FOUND:**

1. **Verify Vercel Settings:**
   - Framework Preset: "Other" or "No Framework" (NOT "Vite")
   - Output Directory: "dist" (or empty)

2. **Check vercel.json:**
   - Should have `builds` array with both API and static build
   - Should have `routes` array
   - Should have `crons` array

3. **Check Build Logs:**
   - Look for "Building API routes" or similar
   - Should see builds for each API file

4. **Force Redeploy:**
   - Trigger a new deployment
   - Or push an empty commit: `git commit --allow-empty -m "Force redeploy" && git push`

