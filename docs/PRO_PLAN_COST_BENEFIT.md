# Vercel Pro Plan - Cost-Benefit Analysis

## Current Situation
- **Current Plan:** Pro (upgraded for cron jobs)
- **Other Paid Services:** Resend, Supabase, GitHub
- **Decision Framework:** Need to understand cost-benefit for future functionality decisions

## Vercel Plan Comparison

### Hobby Plan (Free)
- **Cost:** $0/month
- **Limitations:**
  - Cron jobs: Daily only (cannot run more frequently)
  - Build minutes: 6,000/month
  - Bandwidth: 100GB/month
  - Serverless function execution: 100GB-hours/month
  - Team members: 1

### Pro Plan ($20/month)
- **Cost:** $20/month (~$240/year)
- **Features:**
  - ✅ Cron jobs: Any frequency (including every 5 minutes)
  - ✅ Build minutes: 6,000/month (same as Hobby)
  - ✅ Bandwidth: 1TB/month (10x increase)
  - ✅ Serverless function execution: 1,000GB-hours/month (10x increase)
  - ✅ Team members: Unlimited
  - ✅ Advanced analytics
  - ✅ Password protection for preview deployments
  - ✅ Custom domains: Unlimited

## Why 5-Minute Cron Jobs?

### Design Rationale
The notification system uses a **5-minute time window** to match user preferred notification times:

1. **User Flexibility:** Users can set their preferred notification time to any minute (e.g., 9:17 AM, 3:42 PM)
2. **5-Minute Window:** The cron checks every 5 minutes and matches users whose preferred time falls within ±5 minutes of current time
3. **Example:**
   - User sets preference: 9:15 AM
   - Cron runs at: 9:13 AM, 9:18 AM, 9:23 AM, etc.
   - At 9:13 AM: Window is 9:08-9:18, user at 9:15 matches → ✅ Send notification
   - At 9:18 AM: Window is 9:13-9:23, user at 9:15 matches → ✅ Send notification (if not already sent)

### Alternatives Considered
- **Daily cron (Hobby limit):** Only runs once per day at fixed time → Users can't set flexible times
- **Hourly cron:** 60-minute window → Less precise, users might miss their preferred time
- **Every 5 minutes:** 10-minute window (±5 minutes) → Catches most user preferences accurately

### Why This Matters
- **User Experience:** Users want notifications at their preferred time, not a fixed system time
- **Retention:** Personalized notification timing improves engagement
- **Flexibility:** Accommodates different time zones and schedules

## Cost-Benefit Analysis

### When Pro Plan is Required

**Immediate Requirements:**
- ✅ **Notification System (Mission 7):** Requires 5-minute cron jobs → **Pro Plan Required**

**Future Requirements (Post-MVP):**
- **High-frequency cron jobs:** Any feature requiring > daily cron → Pro Plan
- **High traffic:** If bandwidth > 100GB/month → Pro Plan (10x increase)
- **Advanced features:** Password-protected previews, advanced analytics → Pro Plan

### When Hobby Plan is Sufficient

**Current MVP (without notifications):**
- Static site hosting: ✅ Hobby
- API endpoints: ✅ Hobby
- Build minutes: ✅ Hobby (6,000/month sufficient)
- Basic analytics: ✅ Hobby

**Alternative Solutions (if downgrading):**
- **Daily notifications only:** Set all users to same notification time (e.g., 9:00 AM) → Hobby Plan
- **External cron service:** Use external service (e.g., EasyCron, cron-job.org) to call API → Hobby Plan
  - **Cost:** ~$3-5/month for external service
  - **Trade-off:** Less secure, more complex setup

## Decision Framework

### Upgrade to Pro If:
1. **Notification System:** Required for Mission 7 (re-engagement loop)
2. **High Growth:** Bandwidth or function execution approaching Hobby limits
3. **Team Collaboration:** Need multiple team members
4. **Advanced Features:** Need password protection, custom domains, etc.

### Consider Alternatives If:
1. **Budget Constraints:** External cron service ($3-5/month) vs Pro Plan ($20/month)
2. **Low Traffic:** Well under Hobby limits, no need for advanced features
3. **Single Developer:** No team collaboration needs

## Current Recommendation

**For MVP Launch:**
- ✅ **Pro Plan Justified:** Notification system is critical for Day-2 retention (Mission 7)
- **Cost:** $20/month (~$240/year)
- **ROI:** If Pro Plan enables features that improve retention by even 5%, it pays for itself
- **Already Upgraded:** User has Pro plan for cron jobs

**Future Optimization:**
- Monitor usage: If staying well under Hobby limits, could optimize later
- Consider external cron service if budget becomes constraint
- Pro Plan provides headroom for growth

## Current Status
- ✅ **Pro Plan Active:** Upgraded specifically for 5-minute cron jobs
- ✅ **Notification System:** Mission 7 completed with Pro plan requirement
- ✅ **Other Paid Services:** Resend, Supabase, GitHub (not Vercel-specific)

## Related Services Costs (For Reference)
- **Resend:** Paid (email delivery)
- **Supabase:** Paid (database & auth)
- **GitHub:** Paid (code hosting)
- **Vercel Pro:** $20/month (hosting + cron jobs)

**Total Monthly Infrastructure:** ~$X + $20 (Vercel Pro)

## Documentation
- See `BREACH_NET.md` Vortex #3 for cron job limitation discovery
- See `SPRINT_LOG.md` Mission 7 for notification system implementation

