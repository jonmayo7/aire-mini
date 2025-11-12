#!/usr/bin/env node

/**
 * Probe Supabase JWKS endpoint to diagnose token verification issues
 * Checks if JWKS endpoint exists and returns keys
 */

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL not set in environment');
  process.exit(1);
}

const jwksUri = `${supabaseUrl}/.well-known/jwks.json`;

console.log('🔍 Probing Supabase JWKS endpoint...\n');
console.log(`URL: ${jwksUri}\n`);

async function probe() {
  try {
    const response = await fetch(jwksUri);
    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`Status: ${status} ${statusText}`);
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`\n❌ Error Response:`);
      console.log(text);
      
      if (status === 404) {
        console.log('\n⚠️  JWKS endpoint not found (404)');
        console.log('This suggests your Supabase project may be using legacy JWT secret.');
        console.log('Legacy JWT secret projects do not expose JWKS endpoints.');
        console.log('\nSolution: Migrate to JWT signing keys in Supabase dashboard,');
        console.log('or switch verification method to use HMAC with JWT_SECRET.');
      }
      return;
    }
    
    const data = await response.json();
    console.log(`\n✅ JWKS Response:`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.keys && Array.isArray(data.keys)) {
      console.log(`\n📊 Found ${data.keys.length} key(s) in JWKS`);
      data.keys.forEach((key, index) => {
        console.log(`\nKey ${index + 1}:`);
        console.log(`  - kid: ${key.kid || 'N/A'}`);
        console.log(`  - kty: ${key.kty || 'N/A'}`);
        console.log(`  - use: ${key.use || 'N/A'}`);
        console.log(`  - alg: ${key.alg || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  JWKS response does not contain keys array');
    }
    
  } catch (error) {
    console.error('\n❌ Error probing JWKS endpoint:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Network error - check SUPABASE_URL format');
      console.log('Expected format: https://[project-ref].supabase.co');
    }
  }
}

probe();

