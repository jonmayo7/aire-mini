# Vortex #3 Breach Plan - Stale Functions Tab

## Problem
Vercel Functions tab still shows `/api/lib/resonance` and `/api/lib/verifyJWT` even after:
- ✅ Files moved from `api/lib/*` to `lib/api/*`
- ✅ All imports updated
- ✅ Code committed and pushed
- ✅ New deployment triggered

## Diagnosis
- Files are correctly moved in git (commit `f9452a8`)
- `api/` directory no longer contains `lib/` folder
- Curl tests show `FUNCTION_INVOCATION_FAILED` = functions exist but are broken (old cached functions)
- Functions tab is showing **stale/cached metadata**

## Solution Options (Least to Most Aggressive)

### Option 1: Wait + Force Refresh (Try First)
1. **Wait 5-10 minutes** - Vercel Functions tab metadata can lag
2. **Hard refresh Functions tab** - Clear browser cache, refresh Vercel dashboard
3. **Check deployment logs** - Verify latest deployment actually built without `api/lib/*`
4. **Redeploy again** - Trigger another deployment with build cache cleared

### Option 2: Purge Everything + Redeploy
1. **Vercel Dashboard → Settings → Data Cache**
   - Purge Data Cache
   - Purge CDN Cache
2. **Vercel Dashboard → Settings → Build Cache** (if available)
   - Clear build cache
3. **Vercel Dashboard → Deployments**
   - Delete ALL old deployments (keep only latest)
   - Redeploy with fresh cache
4. **Wait 10 minutes** - Let Vercel fully propagate changes

### Option 3: Nuclear Option (Like Vortex #1)
If Options 1 & 2 fail:
1. **Export all environment variables** from Vercel (Settings → Environment Variables)
2. **Delete Vercel project** completely
3. **Re-import from GitHub** (fresh project)
4. **Re-add all environment variables**
5. **First deployment should be clean** - no stale functions

## Verification Steps
After any solution:

1. **Check build logs** - Should show:
   - ✅ Building `api/cycles/**/*.ts`
   - ✅ Building `api/resonance/**/*.ts`
   - ✅ Building `api/user/**/*.ts`
   - ✅ Building `api/notifications/**/*.ts`
   - ❌ Should NOT show `api/lib/*` anywhere

2. **Functions tab should show only 6 functions:**
   - `/api/cycles/create`
   - `/api/cycles/history`
   - `/api/cycles/lists`
   - `/api/resonance/query`
   - `/api/user/preferences`
   - `/api/notifications/send`

3. **Test endpoints:**
   ```bash
   curl -I https://aire-mini.vercel.app/api/lib/resonance
   # Should return 404 (not found), NOT FUNCTION_INVOCATION_FAILED
   ```

## Why This Happens
Vercel's Functions tab metadata can be cached and may not update immediately after deployments. The actual deployed functions are correct (they're failing because files don't exist), but the UI is showing stale data.

## Recommendation
**Start with Option 1** - wait 10 minutes and check again. If still showing, try **Option 2**. Only use **Option 3** if absolutely necessary.

