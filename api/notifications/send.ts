import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST (called by cron job)
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Verify Vercel Cron authentication
  // Vercel automatically sends CRON_SECRET in Authorization header as "Bearer ${CRON_SECRET}"
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
    console.error('Unauthorized notification service call - invalid CRON_SECRET');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;
  const resendApiKey = process.env.RESEND_API_KEY;
  const pwaUrl = process.env.PWA_URL || 'https://waymaker.ai/#/';

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole || !resendApiKey) {
    console.error('Missing required environment variables for notification service.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const resend = new Resend(resendApiKey);

    // Get current time (5-minute window for matching)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate time window (current time ± 5 minutes)
    const windowStart = new Date();
    windowStart.setHours(currentHour, Math.max(0, currentMinute - 5), 0, 0);
    const windowEnd = new Date();
    windowEnd.setHours(currentHour, Math.min(59, currentMinute + 5), 59, 999);

    // Format times for SQL query (HH:MM:SS)
    const timeStart = `${String(windowStart.getHours()).padStart(2, '0')}:${String(windowStart.getMinutes()).padStart(2, '0')}:00`;
    const timeEnd = `${String(windowEnd.getHours()).padStart(2, '0')}:${String(windowEnd.getMinutes()).padStart(2, '0')}:59`;

    console.log(`Checking for users with notification time between ${timeStart} and ${timeEnd}`);

    // Query users whose preferred_notification_time matches current window
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('user_id, email, phone, notification_method, preferred_notification_time')
      .not('preferred_notification_time', 'is', null)
      .or(`notification_method.eq.email,notification_method.eq.both`)
      .gte('preferred_notification_time', timeStart)
      .lte('preferred_notification_time', timeEnd);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    if (!preferences || preferences.length === 0) {
      console.log('No users found for notification at this time');
      return res.status(200).json({ 
        message: 'No notifications to send',
        sent: 0 
      });
    }

    console.log(`Found ${preferences.length} users to notify`);

    // Send notifications
    const results = [];
    for (const pref of preferences) {
      // Only send email if email is set and method is email or both
      if (pref.email && (pref.notification_method === 'email' || pref.notification_method === 'both')) {
        try {
          const deepLink = `${pwaUrl}prime`;
          const emailResult = await resend.emails.send({
            from: 'AIRE <noreply@waymaker.ai>',
            to: pref.email,
            subject: 'Your next AIRE cycle is ready',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Your next AIRE cycle is ready</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Your next AIRE cycle is ready</h1>
                  </div>
                  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Begin your ascent.</p>
                    <p style="font-size: 16px; margin-bottom: 30px;">Your daily cycle awaits. Take the next step forward.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${deepLink}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Begin Your Cycle</a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">This is your daily reminder to continue your journey of clarity, momentum, and agency.</p>
                  </div>
                </body>
              </html>
            `,
            text: `Your next AIRE cycle is ready. Begin your ascent.\n\n${deepLink}\n\nThis is your daily reminder to continue your journey of clarity, momentum, and agency.`,
          });

          results.push({
            user_id: pref.user_id,
            email: pref.email,
            status: 'sent',
            messageId: emailResult.data?.id,
          });
          console.log(`Email sent to ${pref.email} for user ${pref.user_id}`);
        } catch (emailError: any) {
          console.error(`Failed to send email to ${pref.email}:`, emailError);
          results.push({
            user_id: pref.user_id,
            email: pref.email,
            status: 'failed',
            error: emailError.message,
          });
        }
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return res.status(200).json({
      message: 'Notification processing complete',
      sent: sentCount,
      failed: failedCount,
      results,
    });

  } catch (error: any) {
    console.error('Overall /api/notifications/send error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

