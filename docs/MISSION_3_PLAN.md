# Mission 3: Update API Security - Implementation Plan

## Overview
Secure the API endpoints by implementing JWT-based authentication. Extract, verify, and use Supabase JWT tokens to identify authenticated users and ensure data isolation.

## ⚠️ USER ACTIONS REQUIRED BEFORE STARTING

### Decision: Legacy vs New JWT Signing Keys

**Recommendation: Use NEW JWT Signing Keys (JWKS)** ✅
- **More secure:** Uses RSA public/private key pairs instead of shared secret
- **Supports key rotation:** Update keys without downtime
- **Future-proof:** Supabase's recommended approach going forward
- **Better for production:** Industry standard JWKS approach

**Legacy JWT Secret:** 
- Simpler implementation (single secret)
- Works but deprecated
- No key rotation support

**Decision:** We'll implement the **NEW JWKS approach** unless you specify otherwise.

---

**Action 1: Switch to New API Keys (if using legacy)**
- Go to Supabase Dashboard → Your Project → Settings → API
- **If currently using Legacy keys:** Switch to "New API Keys" tab
- Copy the **new** `anon` key (for frontend)
- Copy the **new** `service_role` key (for backend)
- Update your `.env.local` with new `VITE_SUPABASE_ANON_KEY`
- Update Vercel env vars with new `SUPABASE_SERVICE_ROLE`

**Action 2: Get JWKS Endpoint (for NEW approach)**
- Go to Supabase Dashboard → Your Project → Settings → API
- Find "JWT Settings" section
- Copy the **JWKS URL** (typically: `https://[project-ref].supabase.co/.well-known/jwks.json`)
- OR note your project URL - we'll construct the JWKS URL from it

**Action 3: Verify Database Column Name**
- Go to Supabase Dashboard → Your Project → Table Editor → `cycles` table
- Check if the column is named `user_id` (uuid) or `tg_user_id` (text)
- **If it's `tg_user_id`:** We'll need to create a migration (documented in Phase 3)
- **If it's `user_id`:** Verify it's uuid type (not text)

**Action 4: Add Vercel Environment Variables** (after we create the code)
- We'll need `SUPABASE_URL` (already should exist)
- For NEW approach: JWKS URL will be constructed from SUPABASE_URL
- For LEGACY approach: Would need `SUPABASE_JWT_SECRET` (not needed with JWKS)

## Objectives
1. Extract JWT tokens from HTTP Authorization headers in API endpoints
2. Verify JWT tokens using Supabase's JWT verification
3. Extract authenticated user_id from verified tokens
4. Update frontend API calls to include JWT tokens in request headers
5. Ensure database schema matches Supabase Auth standards (uuid user_id)
6. Update/verify RLS policies for proper data isolation

## Implementation Steps

### Phase 1: Backend - JWT Token Extraction & Verification

#### Step 1.1: Create JWT Verification Utility
**File:** `api/lib/verifyJWT.ts` (new file)

Create a reusable utility function to:
- Extract JWT token from `Authorization: Bearer <token>` header
- Verify token using Supabase's JWKS (JSON Web Key Set)
- Extract and return user_id from verified token payload
- Handle errors (missing token, invalid token, expired token)

**Implementation Notes (NEW JWKS Approach):**
- Use `jwks-rsa` and `jsonwebtoken` packages
- Fetch JWKS from `https://[project-ref].supabase.co/.well-known/jwks.json`
- Verify token signature using public key from JWKS
- Token payload contains `sub` field which is the user_id (uuid)
- Cache JWKS to avoid repeated fetches (performance optimization)
- Return `{ user_id: string }` or throw error

**Alternative (LEGACY Approach - if you prefer):**
- Use `jsonwebtoken` package with `SUPABASE_JWT_SECRET`
- Simpler but less secure and no key rotation support

#### Step 1.2: Update `api/cycles/create.ts`
**Changes:**
1. Import JWT verification utility
2. Extract token from `req.headers.authorization`
3. Verify token and get user_id
4. Replace `user_id = 'placeholder'` with actual authenticated user_id
5. Update error handling for auth failures (401 Unauthorized)
6. Remove TODO comments

**Error Handling:**
- 401 if no token provided
- 401 if token invalid/expired
- 500 if verification process fails

#### Step 1.3: Update `api/cycles/lists.ts`
**Changes:**
1. Import JWT verification utility
2. Extract token from `req.headers.authorization`
3. Verify token and get user_id
4. Replace `user_id = 'placeholder'` with actual authenticated user_id
5. Update error handling for auth failures (401 Unauthorized)
6. Remove TODO comments

**Error Handling:**
- 401 if no token provided
- 401 if token invalid/expired
- 500 if verification process fails

### Phase 2: Frontend - Send JWT Tokens in API Calls

#### Step 2.1: Create API Helper Utility
**File:** `src/lib/apiClient.ts` (new file)

Create a utility function that:
- Gets current session from `useAuth()` hook
- Extracts access_token from session
- Provides helper functions for authenticated fetch calls
- Handles token refresh if needed

**API:**
```typescript
export async function authenticatedFetch(url: string, options: RequestInit): Promise<Response>
```

#### Step 2.2: Update `src/pages/VisualizeScreen.tsx`
**Changes:**
1. Import `useAuth` hook
2. Get session from `useAuth()`
3. Extract `access_token` from `session.access_token`
4. Add `Authorization: Bearer ${access_token}` header to fetch request
5. Handle 401 errors (redirect to /auth if token invalid)
6. Remove TODO comment

#### Step 2.3: Update `src/pages/ImproveScreen.tsx`
**Changes:**
1. Import `useAuth` hook
2. Get session from `useAuth()`
3. Extract `access_token` from `session.access_token`
4. Add `Authorization: Bearer ${access_token}` header to fetch request
5. Handle 401 errors (gracefully handle missing previous commit)
6. Remove TODO comment

### Phase 3: Database Schema Verification

**⚠️ USER ACTION REQUIRED:** Verify current database state before we proceed

#### Step 3.1: Verify Database Column Name
**User Action:** 
1. Go to Supabase Dashboard → Your Project → Table Editor → `cycles` table
2. Check the column name: Is it `user_id` (uuid) or `tg_user_id` (text)?
3. **Report back:** Column name and type

**If column is `tg_user_id` (text):**
- **User Action Required:** Run SQL migration in Supabase Dashboard → SQL Editor:
```sql
-- Rename column and change type
ALTER TABLE cycles 
  RENAME COLUMN tg_user_id TO user_id;
  
ALTER TABLE cycles 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
```
- Then verify the change was successful

**If column is `user_id` (uuid):**
- Verify it matches Supabase Auth `auth.users.id` type
- No migration needed - we'll proceed with implementation

#### Step 3.2: Update RLS Policy
**⚠️ USER ACTION:** Apply RLS policy in Supabase Dashboard

**User Action Required:**
1. Go to Supabase Dashboard → Your Project → Authentication → Policies
2. Or use SQL Editor → Run this SQL:
```sql
-- Drop old policy if exists
DROP POLICY IF EXISTS "Users can only access their own cycles" ON cycles;

-- Create new policy
CREATE POLICY "Users can only access their own cycles"
ON cycles FOR ALL
USING (auth.uid() = user_id);
```
3. Verify policy was created successfully

**Verification (after implementation):**
- Test that users can only see their own cycles
- Test that users cannot insert cycles for other users
- Test that users cannot update/delete other users' cycles

### Phase 4: Environment Variables

**⚠️ USER ACTION:** Verify environment variables are set correctly

#### Step 4.1: Verify Vercel Environment Variables
**With NEW JWKS Approach (Recommended):**
- ✅ `SUPABASE_URL` - Should already exist (used to construct JWKS URL)
- ✅ `SUPABASE_SERVICE_ROLE` - Should already exist (for database operations)
- ❌ `SUPABASE_JWT_SECRET` - NOT NEEDED (JWKS uses public keys from URL)

**User Action Required:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `SUPABASE_URL` exists and is correct
3. Verify `SUPABASE_SERVICE_ROLE` exists and is the NEW key (not legacy)
4. If using legacy keys, update to new keys from Supabase Dashboard
5. No additional variables needed for JWKS approach

**Note:** JWKS URL is automatically constructed from `SUPABASE_URL`:
- Format: `https://[project-ref].supabase.co/.well-known/jwks.json`
- We extract the project-ref from `SUPABASE_URL`

### Phase 5: Testing & Validation

#### Step 5.1: Test Authentication Flow
1. Login as User A
2. Create a cycle → Verify it saves with User A's ID
3. Login as User B
4. Fetch cycles → Verify only User B's cycles appear (or null if first time)
5. Try to access User A's data → Should fail (401 or empty)

#### Step 5.2: Test Error Handling
1. Make API call without token → Should return 401
2. Make API call with invalid token → Should return 401
3. Make API call with expired token → Should return 401
4. Verify frontend handles 401 gracefully (redirects to /auth)

#### Step 5.3: Test Token Refresh
1. Verify tokens refresh automatically via Supabase client
2. Ensure API calls continue working after token refresh
3. Test session persistence across page refreshes

## Dependencies

### New Packages Required (NEW JWKS Approach)
- `jsonwebtoken` - For JWT verification
- `jwks-rsa` - For fetching and caching JWKS keys
- `@types/jsonwebtoken` - TypeScript types

### New Packages Required (LEGACY Approach - if chosen)
- `jsonwebtoken` - For JWT verification
- `@types/jsonwebtoken` - TypeScript types

### Environment Variables Required
- **Vercel:** `SUPABASE_URL` (already exists - used to construct JWKS URL)
- **Vercel:** `SUPABASE_SERVICE_ROLE` (already exists - for database operations)
- **NOT NEEDED with JWKS:** `SUPABASE_JWT_SECRET` (only needed for legacy approach)

## Files to Create
- `api/lib/verifyJWT.ts` - JWT verification utility
- `src/lib/apiClient.ts` - Authenticated fetch helper

## Files to Modify
- `api/cycles/create.ts` - Add JWT auth
- `api/cycles/lists.ts` - Add JWT auth
- `src/pages/VisualizeScreen.tsx` - Add JWT to headers
- `src/pages/ImproveScreen.tsx` - Add JWT to headers

## Database Actions Required
- [ ] Verify/rename `user_id` column (if needed)
- [ ] Update RLS policy (if needed)

## Success Criteria
- [ ] All API endpoints require valid JWT token
- [ ] Users can only access their own cycle data
- [ ] Frontend sends JWT tokens in all API requests
- [ ] Error handling works correctly (401 redirects to /auth)
- [ ] Database RLS policy enforces data isolation
- [ ] All TODO comments removed
- [ ] Tests pass for authenticated and unauthenticated scenarios

## Post-Mission Checklist

After Mission 3 completion:
1. ✅ Update `docs/sprint_log.md`:
   - Mark Mission 3 as complete
   - Add Mission 4 to current mission or backlog
   - Update test results
   
2. ✅ Update `docs/breach_net.md`:
   - Document any new solutions/vortices encountered
   - Update action items (mark JWT auth as complete)
   - Add any critical learnings about JWT verification
   
3. ✅ Commit and push:
   ```bash
   git add .
   git commit -m "Mission 3: Complete API Security with JWT auth"
   git push origin main
   ```
   
4. ✅ Verify all user actions were completed:
   - JWT secret added to Vercel
   - Database column verified/updated
   - RLS policy updated

## Risk Mitigation
- **Risk:** Database column mismatch (text vs uuid)
  - **Mitigation:** Verify schema before implementing, plan migration if needed
- **Risk:** JWT secret not available
  - **Mitigation:** Document where to find it, add to Vercel env vars early
- **Risk:** Token refresh issues
  - **Mitigation:** Use Supabase client's built-in refresh mechanism
- **Risk:** RLS policy conflicts
  - **Mitigation:** Test in Supabase dashboard SQL editor before deploying

## Notes

### NEW JWKS Approach (Recommended)
- JWT tokens are automatically included in Supabase session objects
- Tokens are signed with RSA private keys, verified with public keys from JWKS
- JWKS endpoint is public and cacheable (no secrets needed)
- Supports automatic key rotation without code changes
- Tokens expire after 1 hour (default), Supabase client handles refresh
- Service role key should NOT be used for JWT verification (security risk)

### Legacy Approach (If Chosen)
- Uses single shared secret (HMAC-SHA256)
- Simpler implementation but less secure
- No key rotation support - requires code update to change secret
- Still works but deprecated by Supabase

### Migration Consideration
- If currently using legacy keys, switching to new keys now is recommended
- Both frontend (anon key) and backend (service role) should be updated together
- User sessions will remain valid - no user impact during migration

