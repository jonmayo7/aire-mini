#!/usr/bin/env node

/**
 * Verify user_preferences table schema and test upsert
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function verifySchema() {
  console.log('🔍 Verifying user_preferences table schema...\n');
  
  // Get table columns
  const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_preferences'
      ORDER BY ordinal_position;
    `
  }).catch(async () => {
    // RPC might not exist, try direct query
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Error accessing table:', error);
      return { data: null, error };
    }
    
    // Try to get schema another way
    console.log('⚠️  Cannot query schema directly. Checking if table exists...');
    return { data: null, error: null };
  });
  
  // Try a simple select to verify table exists
  const { data: testData, error: testError } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(1);
  
  if (testError) {
    console.error('❌ Error querying user_preferences table:');
    console.error('   Code:', testError.code);
    console.error('   Message:', testError.message);
    console.error('   Details:', testError.details);
    console.error('   Hint:', testError.hint);
    return;
  }
  
  console.log('✅ Table exists and is accessible\n');
  
  // Try a test upsert with minimal data
  console.log('🧪 Testing upsert with test user_id...\n');
  
  const testUserId = '00000000-0000-0000-0000-000000000000';
  const testPayload = {
    user_id: testUserId,
    theme_preference: 'light',
    updated_at: new Date().toISOString(),
  };
  
  console.log('Test payload:', JSON.stringify(testPayload, null, 2));
  
  const { data: upsertData, error: upsertError } = await supabase
    .from('user_preferences')
    .upsert(testPayload, {
      onConflict: 'user_id',
    })
    .select()
    .single();
  
  if (upsertError) {
    console.error('❌ Upsert failed:');
    console.error('   Code:', upsertError.code);
    console.error('   Message:', upsertError.message);
    console.error('   Details:', upsertError.details);
    console.error('   Hint:', upsertError.hint);
    console.error('\n   Payload:', JSON.stringify(testPayload, null, 2));
  } else {
    console.log('✅ Upsert succeeded');
    console.log('   Result:', JSON.stringify(upsertData, null, 2));
    
    // Clean up test data
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', testUserId);
    console.log('   Test data cleaned up');
  }
}

verifySchema().catch(console.error);

