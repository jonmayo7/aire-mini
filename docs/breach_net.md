# Breach Net: Critical Resolved Issues

**Purpose:** Short list of critical problems we solved to save time on future issues. Only fully resolved and verified solutions.

---

## Critical Configuration

- **Utilities:** `lib/api/verifyJWT.ts`, `lib/api/resonance.ts` (OUTSIDE `api/` to prevent auto-detection)
- **Vercel:** Framework Preset = "Other", `builds` array in `vercel.json` (Vite preset incompatible)
- **Stack:** React 18, TypeScript, Vite, Supabase, Vercel Serverless Functions

---

## Resolved Issues

### Issue #1: Vercel Serverless Function Utilities Auto-Detection
**Problem:** Vercel auto-detects ALL `.ts` files in `api/` as functions. Utilities in `api/lib/` were treated as separate functions, causing `ERR_MODULE_NOT_FOUND`.

**Solution:**
- Move utilities to `lib/api/` (outside `api/` directory)
- Use `builds` array with Framework Preset "Other"
- `@vercel/node` automatically bundles utilities when building API functions

**Rule:** NEVER put utilities in `api/` directory.

---

### Issue #2: Vite + Supabase Auth Compatibility
**Problem:** Deprecated `@supabase/auth-helpers-react` incompatible with Vite.

**Solution:** Custom Supabase client and AuthProvider using native APIs.

---

### Issue #3: JWKS-Based JWT Verification
**Problem:** Needed secure API authentication with key rotation.

**Solution:** JWKS approach using `jwks-rsa` and `jsonwebtoken`. More secure than HMAC secrets.

---

### Issue #4: ImproveScreen Loading Issue
**Problem:** API calls made before session available, causing infinite loops.

**Solution:** Added `authLoading` check, `hasSession` check, error handling, `useCallback` for stable function reference.

---

### Issue #5: Login Authentication Error Handling
**Problem:** "Invalid credentials" error on normal login.

**Solution:** Enhanced auth event handling, added `redirectTo` prop for hash routing.

**User Action:** Disable email confirmation in Supabase.

---

## Critical Rules

1. Utilities MUST be in `lib/api/` (not `api/lib/`)
2. Framework Preset MUST be "Other" when using `builds` array
3. Vite preset + builds array are incompatible
