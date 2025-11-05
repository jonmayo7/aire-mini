# Deployment Strategy & Custom URL Configuration

## When to Configure Custom Domain (striveos.io)

### Optimal Timing

**After Mission 7 Completion (MVP Verification):**
1. ✅ **Complete MVP Testing on Default Vercel URL First**
   - Test all features on Vercel preview/production URL
   - Verify all API endpoints work correctly
   - Confirm authentication flow is stable
   - Test notification system end-to-end
   - Ensure no critical bugs exist

2. ✅ **Before Public Launch**
   - Custom domain should be configured before any public announcement
   - Allows for final testing with production domain
   - Ensures all deep-links and email notifications use correct URL

3. ✅ **After Deployment Verification**
   - Once you've verified the app works correctly on Vercel's default URL
   - After confirming all environment variables are set correctly
   - After testing the complete user flow

### Configuration Steps

**1. Update package.json homepage:**
```json
{
  "homepage": "https://striveos.io"
}
```

**2. Update Vercel Environment Variables:**
- Set `PWA_URL` to `https://striveos.io/#/` (or leave default if already correct)
- Verify all other environment variables are set

**3. Configure Custom Domain in Vercel:**
- Add `striveos.io` as custom domain in Vercel dashboard
- Follow DNS configuration instructions
- Wait for SSL certificate provisioning

**4. Update Email From Address:**
- Verify `noreply@striveos.io` domain in Resend
- Update `api/notifications/send.ts` if needed (currently hardcoded)

**5. Test Deep Links:**
- Verify email deep-links work correctly
- Test notification redirects
- Confirm all routes accessible

### Why Wait Until After Mission 7?

1. **MVP Completeness**: Mission 7 completes the MVP feature set
2. **Testing First**: Test on default URL to catch issues early
3. **Stability**: Ensure core functionality is stable before domain switch
4. **Clean Transition**: Single domain configuration point instead of multiple changes

### Current Status

- **Homepage URL**: Still set to original template URL (not configured yet)
- **PWA_URL**: Defaults to `https://striveos.io/#/` in code (env var can override)
- **Email From**: Hardcoded to `AIRE <noreply@striveos.io>` (requires domain verification in Resend)

### Next Steps After Testing

1. Complete full testing cycle on Vercel default URL
2. Fix any issues found during testing
3. Configure custom domain (striveos.io) in Vercel
4. Update package.json homepage
5. Verify all email notifications use correct domain
6. Test complete flow with custom domain
7. Proceed with public launch

---

**Recommendation**: Configure custom domain after successful testing and verification of MVP functionality on Vercel's default URL. This ensures a smooth transition and minimizes risk during deployment.

