# Vortex #3 Nuclear Option - Complete Vercel Project Reset

## ⚠️ WARNING: This will DELETE your Vercel project completely
**Make sure you've exported everything before proceeding!**

## Step 1: Export Environment Variables

### Option A: Manual Export (Current Method)
1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. **For each variable:**
   - Click on the variable name
   - Copy the **Value** (not the key)
   - Paste into a text file or password manager
   - Document which environments it applies to (Production, Preview, Development)

### Option B: Vercel CLI Export (Faster)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Export environment variables
vercel env pull .env.vercel.backup
```

**Note:** This creates a `.env.vercel.backup` file with all env vars. **DO NOT commit this file** - it contains secrets!

## Step 2: Document Current Environment Variables

**Required Variables (from BREACH_NET.md):**
- `VITE_SUPABASE_URL` - Frontend (Production, Preview, Development)
- `VITE_SUPABASE_ANON_KEY` - Frontend (Production, Preview, Development)
- `SUPABASE_URL` - Backend (Production, Preview, Development)
- `SUPABASE_SERVICE_ROLE` - Backend (Production, Preview, Development)
- `RESEND_API_KEY` - Notifications (Production only)
- `CRON_SECRET` - Cron jobs (Production only)
- `PWA_URL` - Optional (Production only, defaults to `https://striveos.io/#/`)

## Step 3: Document Project Settings

**Before deleting, note these settings:**
1. **Framework Preset:** Should be "Other" or "No Framework"
2. **Build Command:** Empty (or `npm run build`)
3. **Output Directory:** `dist`
4. **Install Command:** `pnpm install` (or `npm install`)
5. **Root Directory:** `.` (empty)
6. **Node Version:** Check in Settings → General

## Step 4: Delete Vercel Project

1. **Vercel Dashboard → Your Project → Settings**
2. Scroll to bottom → **Delete Project**
3. Type project name to confirm
4. **Click Delete**

## Step 5: Re-import from GitHub

1. **Vercel Dashboard → Add New → Project**
2. **Import Git Repository**
3. Select `jonmayo7/aire-mini`
4. **Configure Project:**
   - **Framework Preset:** Select "Other" (NOT Vite!)
   - **Root Directory:** Leave empty (`.`)
   - **Build Command:** Leave empty (or `npm run build`)
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install` (or `npm install`)
5. **Deploy** (don't add env vars yet - let it fail, we'll add them after)

## Step 6: Re-add Environment Variables

1. **After first deployment starts → Cancel it** (or let it fail)
2. **Go to Settings → Environment Variables**
3. **Add each variable:**
   - Click "Add New"
   - Enter **Name** (e.g., `VITE_SUPABASE_URL`)
   - Enter **Value** (from your backup)
   - Select **Environments** (Production, Preview, Development)
   - Click "Save"
4. **Repeat for all variables**

## Step 7: Verify Configuration

**Check Settings → General:**
- ✅ Framework Preset: "Other" or "No Framework"
- ✅ Build Command: Empty or `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `pnpm install`

## Step 8: Deploy

1. **Trigger new deployment** (or push a commit)
2. **Watch build logs** - should show:
   - ✅ Building `api/cycles/**/*.ts`
   - ✅ Building `api/resonance/**/*.ts`
   - ✅ Building `api/user/**/*.ts`
   - ✅ Building `api/notifications/**/*.ts`
   - ❌ Should NOT show `api/lib/*` anywhere

## Step 9: Verify Functions Tab

**After deployment completes:**
- Functions tab should show **only 6 functions** (no `api/lib/*`)
- Test endpoints - all should return 401/405, not 404

## Environment Variables: Team vs Project Level

### Team Level (Organization)
- **Location:** Vercel Dashboard → Team Settings → Environment Variables
- **Scope:** Available to ALL projects in the team
- **Use Case:** Shared secrets across multiple projects
- **Visibility:** Can be restricted by team members

### Project Level (Current Setup)
- **Location:** Vercel Dashboard → Project → Settings → Environment Variables
- **Scope:** Only available to THIS project
- **Use Case:** Project-specific secrets
- **Visibility:** Only visible to project members

**For AIRE PWA:** Keep environment variables at **Project Level** (current setup) since this is a single project.

## Backup File Template

Create a file `ENV_VARS_BACKUP.txt` (DO NOT commit to git):

```
=== AIRE PWA Environment Variables Backup ===
Date: [DATE]
Project: aire-mini

Production:
- VITE_SUPABASE_URL=[value]
- VITE_SUPABASE_ANON_KEY=[value]
- SUPABASE_URL=[value]
- SUPABASE_SERVICE_ROLE=[value]
- RESEND_API_KEY=[value]
- CRON_SECRET=[value]
- PWA_URL=[value or note: defaults to striveos.io]

Preview:
- VITE_SUPABASE_URL=[value]
- VITE_SUPABASE_ANON_KEY=[value]
- SUPABASE_URL=[value]
- SUPABASE_SERVICE_ROLE=[value]

Development:
- VITE_SUPABASE_URL=[value]
- VITE_SUPABASE_ANON_KEY=[value]
- SUPABASE_URL=[value]
- SUPABASE_SERVICE_ROLE=[value]
```

## After Nuclear Option

Once project is recreated and working:
1. ✅ Delete this guide (`VORTEX_3_NUCLEAR_OPTION.md`)
2. ✅ Update BREACH_NET.md Vortex #3 with final resolution
3. ✅ Verify all functions are correct
4. ✅ Test Improve screen works
5. ✅ Commit and push any remaining changes

