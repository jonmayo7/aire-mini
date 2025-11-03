# Mission 3: Update API Security - Implementation Plan

## Overview
Secure the API endpoints by implementing JWT-based authentication. Extract, verify, and use Supabase JWT tokens to identify authenticated users and ensure data isolation.

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
- Verify token using Supabase's JWT secret
- Extract and return user_id from verified token payload
- Handle errors (missing token, invalid token, expired token)

**Implementation Notes:**
- Use `jsonwebtoken` package or Supabase's built-in verification
- Token payload contains `sub` field which is the user_id (uuid)
- Verify against `SUPABASE_JWT_SECRET` (from Supabase dashboard → Settings → API)
- Return `{ user_id: string }` or throw error

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

#### Step 3.1: Verify Database Column Name
**Action:** Check if `cycles` table has `user_id` (uuid) or `tg_user_id` (text)

**If column is `tg_user_id` (text):**
- Migration needed: Rename column to `user_id` and change type to uuid
- Update all API queries to use `user_id`
- This may require Supabase dashboard migration or SQL script

**If column is `user_id` (uuid):**
- Verify it matches Supabase Auth `auth.users.id` type
- No migration needed

#### Step 3.2: Update RLS Policy
**Action:** Ensure RLS policy matches new authentication scheme

**SQL Policy (if not already set):**
```sql
-- Drop old policy if exists
DROP POLICY IF EXISTS "Users can only access their own cycles" ON cycles;

-- Create new policy
CREATE POLICY "Users can only access their own cycles"
ON cycles FOR ALL
USING (auth.uid() = user_id);
```

**Verification:**
- Test that users can only see their own cycles
- Test that users cannot insert cycles for other users
- Test that users cannot update/delete other users' cycles

### Phase 4: Environment Variables

#### Step 4.1: Add Vercel Environment Variable
**Variable:** `SUPABASE_JWT_SECRET`

**How to get:**
1. Go to Supabase Dashboard → Settings → API
2. Copy "JWT Secret" (not the anon key or service role key)
3. Add to Vercel project environment variables

**Note:** This is different from `SUPABASE_SERVICE_ROLE` - it's specifically for JWT verification

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

### New Packages Required
- `jsonwebtoken` (or use Supabase's built-in verification)
- `@types/jsonwebtoken` (if using jsonwebtoken)

### Environment Variables Required
- **Vercel:** `SUPABASE_JWT_SECRET` (for JWT verification)

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
- JWT tokens are automatically included in Supabase session objects
- Tokens expire after 1 hour (default), Supabase client handles refresh
- Service role key should NOT be used for JWT verification (security risk)
- JWT secret is different from service role key - it's for verifying tokens only

