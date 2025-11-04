# Fix Email Confirmation Links (localhost → Production URL)

## Problem
Email confirmation links from Supabase are pointing to `localhost` instead of your production URL.

## Root Cause
Supabase Auth settings need to be configured with your production URL as the site URL and redirect URLs.

## Solution: Update Supabase Auth Settings

### Step 1: Go to Supabase Auth Settings

1. Go to: **Supabase Dashboard** → **Your Project**
2. Navigate to: **Authentication** → **URL Configuration** (in left sidebar)
   - OR: **Authentication** → **Settings** → **URL Configuration**

### Step 2: Update Site URL

1. Find the **"Site URL"** field
2. Set it to your production URL:
   ```
   https://aire-mini-git-main-jon-mayos-projects.vercel.app
   ```
   (Or your custom domain if you have one)

### Step 3: Add Redirect URLs

1. Find the **"Redirect URLs"** section (or "Additional Redirect URLs")
2. Add these URLs (one per line):
   ```
   https://aire-mini-git-main-jon-mayos-projects.vercel.app/**
   https://aire-mini-git-main-jon-mayos-projects.vercel.app/#/auth
   https://aire-mini-git-main-jon-mayos-projects.vercel.app/#/*
   ```
   
   **Note:** The `/**` wildcard allows any path after your domain to work.

### Step 4: Save Settings

1. Click **"Save"** or **"Update"**
2. Changes take effect immediately

### Step 5: Test

1. Try to sign up with a new email
2. Check the confirmation email
3. The link should now point to your production URL, not localhost

---

## Optional: Add Local Development URL

If you want email confirmations to work in local development too, add:

```
http://localhost:5173/**
http://localhost:5173/#/auth
```

To the Redirect URLs list.

---

## Why This Happens

Supabase uses the "Site URL" setting to generate email confirmation links. If it's set to `http://localhost:3000` (or not set), all confirmation emails will point to localhost.

**Important:** The Site URL should match your production domain so users can confirm their email from the live app.

