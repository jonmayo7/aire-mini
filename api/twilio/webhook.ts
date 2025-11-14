import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { formatPhoneNumber } from '../lib/phoneUtils.js';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Only allow POST (called by Twilio webhook)
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  const pwaUrl = process.env.PWA_URL || 'https://waymaker.ai/#/';

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole || !twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.error('Missing required environment variables for Twilio webhook.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Verify Twilio signature (optional but recommended for production)
    // For now, we'll skip signature verification in development
    // In production, uncomment and configure:
    /*
    const twilioSignature = req.headers['x-twilio-signature'] as string;
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const isValid = twilio.validateRequest(
      twilioAuthToken,
      twilioSignature,
      url,
      req.body
    );
    if (!isValid) {
      console.error('Invalid Twilio signature');
      return res.status(403).json({ error: 'Forbidden' });
    }
    */

    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

    // Extract incoming message data
    const fromNumber = req.body.From; // User's phone number
    const toNumber = req.body.To; // Twilio number
    const messageBody = (req.body.Body || '').trim().toUpperCase();
    const messageSid = req.body.MessageSid;

    console.log(`Received SMS from ${fromNumber}: ${messageBody}`);

    // Format phone number to E.164
    const formattedPhone = formatPhoneNumber(fromNumber);
    if (!formattedPhone) {
      console.error(`Invalid phone number format: ${fromNumber}`);
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Find user by phone number
    const { data: preferences, error: findError } = await supabase
      .from('user_preferences')
      .select('user_id, phone, preferred_notification_time, sms_opted_out')
      .eq('phone', formattedPhone)
      .single();

    // Handle keywords
    if (messageBody === 'JOIN' || messageBody === 'START') {
      // Opt-in or re-enable SMS
      const now = new Date().toISOString();
      
      if (preferences) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({
            sms_opted_out: false,
            optin_sms_received_at: messageBody === 'JOIN' ? now : preferences.optin_sms_received_at || now,
            updated_at: now,
          })
          .eq('user_id', preferences.user_id);

        if (updateError) {
          console.error('Error updating preferences:', updateError);
        } else {
          console.log(`User ${preferences.user_id} opted in via SMS keyword: ${messageBody}`);
        }
      } else {
        // New user - create entry (they'll need to complete onboarding)
        console.log(`New user ${formattedPhone} sent ${messageBody}, but no preferences found`);
      }

      // Get preferred notification time for response
      const notificationTime = preferences?.preferred_notification_time || '9:00 AM';
      const timeStr = formatTimeForSMS(notificationTime);

      // Send confirmation message
      await twilioClient.messages.create({
        to: formattedPhone,
        from: twilioPhoneNumber,
        body: messageBody === 'JOIN' 
          ? `✅ You're in! Daily reminders will start tomorrow at ${timeStr}. Reply STOP to unsubscribe. Msg&data rates may apply.`
          : `SMS reminders re-enabled. Reply STOP to unsubscribe.`,
      });

      return res.status(200).json({ message: 'Opt-in processed' });
    }

    if (messageBody === 'STOP' || messageBody === 'STOPALL' || messageBody === 'UNSUBSCRIBE') {
      // Opt-out SMS
      if (preferences) {
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({
            sms_opted_out: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', preferences.user_id);

        if (updateError) {
          console.error('Error updating opt-out status:', updateError);
        } else {
          console.log(`User ${preferences.user_id} opted out via SMS`);
        }
      }

      // Send confirmation message
      await twilioClient.messages.create({
        to: formattedPhone,
        from: twilioPhoneNumber,
        body: "You're unsubscribed. No more messages. Reply START to restart.",
      });

      return res.status(200).json({ message: 'Opt-out processed' });
    }

    if (messageBody === 'HELP' || messageBody === 'INFO') {
      // Send help message
      await twilioClient.messages.create({
        to: formattedPhone,
        from: twilioPhoneNumber,
        body: "WayMaker SMS: Reply JOIN to subscribe, STOP to unsubscribe, START to restart. For support: support@waymaker.ai",
      });

      return res.status(200).json({ message: 'Help sent' });
    }

    // Unknown keyword - send help message
    if (messageBody.length > 0) {
      await twilioClient.messages.create({
        to: formattedPhone,
        from: twilioPhoneNumber,
        body: "Sorry, I didn't understand that. Reply HELP for instructions, STOP to unsubscribe.",
      });
    }

    return res.status(200).json({ message: 'Webhook processed' });

  } catch (error: any) {
    console.error('Twilio webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

/**
 * Formats a time string (HH:MM or HH:MM:SS) for SMS display
 * @param timeStr - Time string in HH:MM or HH:MM:SS format
 * @returns Formatted time string (e.g., "9:00 AM")
 */
function formatTimeForSMS(timeStr: string | null | undefined): string {
  if (!timeStr) {
    return '9:00 AM';
  }

  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  } catch {
    return '9:00 AM';
  }
}

