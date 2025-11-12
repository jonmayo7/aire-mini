# Breach Net: Critical Resolved Issues

**Purpose:** Short list of critical problems we solved to save time on future issues. Only fully resolved and verified solutions.

---

## Critical Configuration

- **Utilities:** `api/lib/verifyJWT.ts`, `api/lib/resonance.ts` (INSIDE `api/` for Vercel bundling)
- **Vercel:** Framework Preset = "Other", `builds` array in `vercel.json` (Vite preset incompatible)
- **Stack:** React 18, TypeScript, Vite, Supabase, Vercel Serverless Functions
- **Supabase JWT:** Must use modern JWT signing keys (ECC P-256 with ES256), not legacy HS256
- **JWKS Endpoint:** `/auth/v1/.well-known/jwks.json` (NOT `/.well-known/jwks.json`)

---

## Resolved Issues

### Issue #1: Vercel Serverless Function Utilities Bundling
**Problem:** Utilities in `lib/api/` (outside `api/` directory) were not being bundled into functions, causing `ERR_MODULE_NOT_FOUND` at runtime.

**Solution:**
- Move utilities to `api/lib/` (inside `api/` directory)
- Use explicit `builds` array with Framework Preset "Other"
- `@vercel/node` automatically bundles utilities from `api/` when building API functions
- Explicit builds prevent `api/lib/*.ts` from being deployed as separate functions

**Rule:** Utilities MUST be in `api/lib/` (inside `api/` directory) for proper bundling.

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

### Issue #6: JWT Verification Vortex (ESM → Bundling → Algorithm → Endpoint Path)
**Problem:** Multi-layered issue causing "Token verification failed: Not Found" errors. Started with ESM import errors, progressed through bundling issues, then JWT-specific problems.

**Root Cause:** Did not update nor verify all settings in external apps (Supabase) until the end. JWT key was on legacy (HS256) until the very end. Once updated to modern JWT signing keys (ECC P-256), then we were also able to update the JWKS endpoint path.

**Secondary Issues:**
- ESM import errors: Missing `.js` extensions in relative imports
- Bundling: Utilities in wrong location (`lib/api/` vs `api/lib/`)
- Algorithm mismatch: Code only supported RS256, but tokens used ES256 (ECC P-256)
- Endpoint path: Wrong JWKS endpoint path (`/.well-known/jwks.json` vs `/auth/v1/.well-known/jwks.json`)

**Solution:**
1. Added `.js` extensions to all relative imports in API files
2. Moved utilities from `lib/api/` to `api/lib/` for proper bundling
3. Completed JWT migration in Supabase (rotated to ECC P-256 from legacy HS256)
4. Added ES256 algorithm support in `verifyJWT.ts` (detects token algorithm, supports both RS256 and ES256)
5. Updated JWKS endpoint path from `/.well-known/jwks.json` to `/auth/v1/.well-known/jwks.json`
6. Added comprehensive diagnostic logging for troubleshooting

**Key Learnings:**
- Always verify external app settings (Supabase, Vercel, etc.) FIRST before assuming code issues
- Always probe endpoints directly (e.g., via scripts) before assuming configuration
- Partial migrations create silent mismatches (alg/kid/endpoint)
- Diagnostic logging was key to isolating each layer of the problem
- Progress, not recursion: Errors evolved (404 → module not found → token failed → algorithm mismatch → endpoint 404), confirming forward momentum

---

## Critical Rules

1. Utilities MUST be in `api/lib/` (not `lib/api/`) for Vercel bundling
2. Framework Preset MUST be "Other" when using `builds` array
3. Vite preset + builds array are incompatible
4. JWKS endpoint path MUST be `/auth/v1/.well-known/jwks.json` (not `/.well-known/jwks.json`)
5. Always verify external app settings (Supabase JWT configuration) before troubleshooting code
6. Supabase JWT must use modern signing keys (ECC P-256), not legacy HS256
