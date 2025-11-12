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
      const { email, phone, preferred_notification_time, notification_method } = req.body;

      // Validation: At least one contact method required if saving preferences
      if (!email && !phone) {
        return res.status(400).json({ 
          error: 'At least one contact method (email or phone) is required' 
        });
      }

      // Validation: If notification_method is set, preferred_notification_time is required
      if (notification_method && !preferred_notification_time) {
        return res.status(400).json({ 
          error: 'preferred_notification_time is required when notification_method is set' 
        });
      }

      console.log('Upserting preferences for user:', user_id);
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id,
          email: email || null,
          phone: phone || null,
          preferred_notification_time: preferred_notification_time || null,
          notification_method: notification_method || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert preferences error:', error);
        return res.status(500).json({ error: 'Database error', details: error.message });
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

