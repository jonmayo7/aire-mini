# Testing Guide - API Endpoints

## Step 3: Test Endpoints with curl

### Test from Terminal (macOS/Linux)

```bash
# Test /api/cycles/lists (should return 401, not 404)
curl -I https://aire-mini.vercel.app/api/cycles/lists

# Test /api/user/preferences (should return 401, not 404)
curl -I https://aire-mini.vercel.app/api/user/preferences

# Test /api/notifications/send (should return 401, not 404)
curl -I https://aire-mini.vercel.app/api/notifications/send

# Test /api/cycles/create (should return 405 Method Not Allowed for GET, not 404)
curl -I https://aire-mini.vercel.app/api/cycles/create

# Test /api/cycles/history (should return 401, not 404)
curl -I https://aire-mini.vercel.app/api/cycles/history

# Test /api/resonance/query (should return 405 Method Not Allowed for GET, not 404)
curl -I https://aire-mini.vercel.app/api/resonance/query
```

### Expected Responses

- **401 Unauthorized** = ✅ Endpoint exists, just needs authentication
- **404 Not Found** = ❌ Endpoint doesn't exist (problem!)
- **405 Method Not Allowed** = ✅ Endpoint exists, wrong HTTP method (that's fine)

### Test from Browser Console

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Network tab
3. Navigate to Improve screen
4. Check the request URL - should be `/api/cycles/lists` (with 's'), NOT `/api/cycles/list`

## Step 4: Test Improve Screen

### Steps:
1. **Clear browser cache** (or use incognito)
2. **Navigate to:** `https://aire-mini.vercel.app`
3. **Login** with your test account
4. **Complete Prime screen** - enter text, click "Next: Improve"
5. **Check Improve screen:**
   - Should NOT be stuck on "Loading..."
   - Should show the form (either with previous commitment or without)
   - Should NOT show error message

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "cycles"
4. Look for request to `/api/cycles/lists`
5. **If you see `/api/cycles/list` (no 's')** = Frontend bundle is still old
6. **If you see `/api/cycles/lists` (with 's')** = ✅ Correct!

### If Still Wrong Endpoint:
- CDN cache may take 5-10 minutes to clear
- Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Wait a few minutes and try again

