import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// TEST: Try to import verifyJWT - this will fail if includeFiles isn't working
// Using dynamic import to catch errors at runtime
let verifyJWT: any;
let extractTokenFromHeader: any;
let importError: string | null = null;

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // TEST: Return import status immediately to verify if includeFiles works
  if (req.query.test === 'import') {
    try {
      const verifyModule = await import('../../lib/api/verifyJWT');
      verifyJWT = verifyModule.verifyJWT;
      extractTokenFromHeader = verifyModule.extractTokenFromHeader;
      return res.status(200).json({
        importSuccess: true,
        message: '✅ includeFiles WORKING - import succeeded',
        hasVerifyJWT: typeof verifyJWT === 'function',
        hasExtractToken: typeof extractTokenFromHeader === 'function'
      });
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      console.error('❌ Import test failed:', errorMsg);
      return res.status(200).json({
        importSuccess: false,
        importError: errorMsg,
        message: '❌ includeFiles NOT working - import failed',
        errorCode: error.code,
        errorStack: error.stack
      });
    }
  }

  // Normal function: Try to import if not already imported
  if (!verifyJWT) {
    try {
      const verifyModule = await import('../../lib/api/verifyJWT');
      verifyJWT = verifyModule.verifyJWT;
      extractTokenFromHeader = verifyModule.extractTokenFromHeader;
      console.log('✅ verifyJWT imported successfully');
    } catch (error: any) {
      importError = error.message || String(error);
      console.error('❌ Cannot import verifyJWT:', importError);
      return res.status(500).json({ 
        error: 'Import failed - includeFiles not working',
        details: importError,
        errorCode: error.code
      });
    }
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  // Check env vars
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error('Missing required environment variables for list endpoint.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Extract and verify JWT token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    const { user_id } = await verifyJWT(token);

    // Fetch data from Supabase
    console.log('Fetching previous commit for user:', user_id);
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data, error } = await supabase
      .from('cycles')
      .select('commit_text, created_at')
      .eq('user_id', user_id) // UUID from JWT token
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase list error:', error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    }

    // Handle "First Day" scenario
    if (!data || data.length === 0) {
      return res.status(200).json({ previous_commit: null });
    }

    // Success
    return res.status(200).json({ previous_commit: data[0].commit_text });

  } catch (error: any) {
    // Handle authentication errors
    if (error.message.includes('No Authorization') || 
        error.message.includes('Invalid token') || 
        error.message.includes('Token has expired') ||
        error.message.includes('No token')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }

    console.error('Overall /api/cycles/lists error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};