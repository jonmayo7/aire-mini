import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { verifyJWT, extractTokenFromHeader } from '../lib/verifyJWT.js';

// Manual test endpoint for email notifications
// Usage: POST /api/notifications/test with Authorization header
// This sends a test email to the authenticated user
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;
  const resendApiKey = process.env.RESEND_API_KEY;
  const pwaUrl = process.env.PWA_URL || 'https://waymaker.ai/#/';

  if (!supabaseUrl || !supabaseServiceRole || !resendApiKey) {
    return res.status(500).json({ error: 'Server configuration error - missing environment variables' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const resend = new Resend(resendApiKey);

    // Get user email from preferences or auth
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('email')
      .eq('user_id', user_id)
      .single();

    // If no email in preferences, get from auth (fallback)
    let userEmail: string | null = preferences?.email || null;
    
    if (!userEmail) {
      // Get email from auth.users table
      const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
      userEmail = authUser?.user?.email || null;
    }

    if (!userEmail) {
      return res.status(400).json({ error: 'No email address found for user' });
    }

    // Send test email
    const deepLink = `${pwaUrl}prime`;
    
    try {
      const emailResult = await resend.emails.send({
        from: 'WayMaker <noreply@mail.waymaker.ai>',
        to: userEmail,
        subject: 'Your DiRP is ready',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your DiRP is ready</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">It's time to DiRP!</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Keep climbing.</p>
                <p style="font-size: 16px; margin-bottom: 30px;">Your Daily Intentional Reflection Protocol awaits...</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${deepLink}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Execute DiRP Now</a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">This is your daily reminder to continue your journey of clarity, momentum, and agency.</p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <strong>Test Email:</strong> This is a manual test email sent from the notification test endpoint.
                </p>
              </div>
            </body>
          </html>
        `,
        text: `It is time to DiRP it up! Continue your climb.\n\n${deepLink}\n\nThis is your daily reminder to continue your journey of clarity, momentum, and agency.\n\n---\nTest Email: This is a manual test email sent from the notification test endpoint.`,
      });

      return res.status(200).json({ 
        success: true,
        message: 'Test email sent successfully',
        emailId: emailResult.data?.id,
        to: userEmail,
        from: 'WayMaker <noreply@mail.waymaker.ai>'
      });
    } catch (emailError: any) {
      console.error('Resend email error:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send email', 
        details: emailError.message 
      });
    }

  } catch (error: any) {
    // Handle authentication errors
    if (error.message?.includes('Unauthorized') || 
        error.message?.includes('Invalid token') || 
        error.message?.includes('Token has expired') ||
        error.message?.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    
    console.error('Test endpoint error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

