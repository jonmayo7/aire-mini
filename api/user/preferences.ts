import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT, extractTokenFromHeader } from '../lib/verifyJWT.js';

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for preferences endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // GET: Fetch user preferences
    if (req.method === 'GET') {
      console.log('Fetching preferences for user:', user_id);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (error) {
        // If no preferences found, return null (not an error)
        if (error.code === 'PGRST116') {
          return res.status(200).json({ preferences: null });
        }
        console.error('Supabase get preferences error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
      }

      return res.status(200).json({ preferences: data });
    }

    // POST: Create or update user preferences (upsert)
    if (req.method === 'POST') {
      const { email, phone, first_name, last_name, preferred_notification_time, notification_method, theme_preference } = req.body;
      
      // Capture consent metadata for SMS compliance
      const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || null;
      const userAgent = req.headers['user-agent'] || null;
      const preferencesSavedAt = new Date().toISOString();

      // Validation: At least one contact method required if saving notification preferences
      // But allow theme_preference or name updates without contact methods
      const isUpdatingNotifications = email !== undefined || phone !== undefined || 
                                       preferred_notification_time !== undefined || 
                                       notification_method !== undefined;

      if (isUpdatingNotifications && !email && !phone) {
        return res.status(400).json({ 
          error: 'At least one contact method (email or phone) is required when updating notification preferences' 
        });
      }

      // Validation: If notification_method is set, preferred_notification_time is required
      if (notification_method && !preferred_notification_time) {
        return res.status(400).json({ 
          error: 'preferred_notification_time is required when notification_method is set' 
        });
      }

      // Validation: theme_preference must be valid value
      if (theme_preference !== undefined && !['light', 'dark', 'system'].includes(theme_preference)) {
        return res.status(400).json({ 
          error: 'theme_preference must be one of: light, dark, system' 
        });
      }

      // Validation: first_name and last_name (basic validation)
      if (first_name !== undefined && first_name !== null && first_name.trim().length > 100) {
        return res.status(400).json({ 
          error: 'First name must be 100 characters or less' 
        });
      }
      if (last_name !== undefined && last_name !== null && last_name.trim().length > 100) {
        return res.status(400).json({ 
          error: 'Last name must be 100 characters or less' 
        });
      }

      // Fetch existing preferences to preserve values not being updated
      // Handle case where no preferences exist yet (PGRST116 = no rows found)
      let existingData = null;
      const { data: fetchedData, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user_id)
        .single();

      // If no preferences found (PGRST116), that's okay - we'll create a new row
      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No existing row - this is expected for new users
          existingData = null;
        } else {
          // Actual error fetching - log but continue (upsert will handle creation)
          console.error('Error fetching existing preferences:', fetchError);
          existingData = null;
        }
      } else {
        existingData = fetchedData;
      }

      console.log('Upserting preferences for user:', user_id, existingData ? '(updating existing)' : '(creating new)');
      
      // Build upsert object - always include all fields, using optional chaining for fallbacks
      const upsertPayload = {
        user_id,
        email: email !== undefined ? (email || null) : (existingData?.email || null),
        phone: phone !== undefined ? (phone || null) : (existingData?.phone || null),
        first_name: first_name !== undefined 
          ? (first_name?.trim() || null) 
          : (existingData?.first_name || null),
        last_name: last_name !== undefined 
          ? (last_name?.trim() || null) 
          : (existingData?.last_name || null),
        preferred_notification_time: preferred_notification_time !== undefined 
          ? (preferred_notification_time || null) 
          : (existingData?.preferred_notification_time || null),
        notification_method: notification_method !== undefined 
          ? (notification_method || null) 
          : (existingData?.notification_method || null),
        theme_preference: theme_preference !== undefined 
          ? (theme_preference || null) 
          : (existingData?.theme_preference || null),
        // Capture consent metadata when updating notification preferences
        preferences_saved_at: isUpdatingNotifications ? preferencesSavedAt : (existingData?.preferences_saved_at || null),
        ip_address: isUpdatingNotifications && ipAddress ? (Array.isArray(ipAddress) ? ipAddress[0] : ipAddress) : (existingData?.ip_address || null),
        user_agent: isUpdatingNotifications && userAgent ? userAgent : (existingData?.user_agent || null),
        sms_opted_out: existingData?.sms_opted_out ?? false,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Upsert payload:', JSON.stringify(upsertPayload, null, 2));
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(upsertPayload, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) {
        console.error('=== SUPABASE UPSERT ERROR ===');
        console.error('Error object:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Upsert payload that failed:', JSON.stringify(upsertPayload, null, 2));
        console.error('Existing data:', JSON.stringify(existingData, null, 2));
        return res.status(500).json({ 
          error: 'Database error', 
          details: error.message, 
          code: error.code,
          hint: error.hint,
          fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
      }

      return res.status(200).json({ preferences: data });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('No Authorization') || 
        error.message.includes('Invalid token') || 
        error.message.includes('Token has expired') ||
        error.message.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    console.error('Overall /api/user/preferences error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

