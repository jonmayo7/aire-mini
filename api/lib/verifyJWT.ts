import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Initialize JWKS client - constructs JWKS URL from Supabase URL
function getJwksClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  // Construct JWKS URL: https://[project-ref].supabase.co/.well-known/jwks.json
  const jwksUri = `${supabaseUrl}/.well-known/jwks.json`;

  return jwksClient({
    jwksUri,
    cache: true,
    cacheMaxAge: 86400000, // 24 hours
    rateLimit: true,
    jwksRequestsPerMinute: 5,
  });
}

// Get signing key from JWKS
async function getSigningKey(kid: string, jwksUri: string): Promise<string> {
  try {
    const client = getJwksClient();
    const key = await client.getSigningKey(kid);
    return key.getPublicKey();
  } catch (error: any) {
    console.error(`[verifyJWT] Failed to get signing key from JWKS:`, {
      kid,
      jwksUri,
      error: error.message,
      errorName: error.name,
    });
    throw error;
  }
}

// Verify JWT token and extract user_id
export async function verifyJWT(token: string): Promise<{ user_id: string }> {
  if (!token) {
    throw new Error('No token provided');
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL environment variable is not set');
  }

  // Decode token header to get kid (key ID) and algorithm
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new Error('Invalid token format');
  }

  const tokenAlg = decoded.header.alg;
  const kid = decoded.header.kid;
  const jwksUri = `${supabaseUrl}/.well-known/jwks.json`;

  // Log diagnostic information
  console.log(`[verifyJWT] Verifying token:`, {
    alg: tokenAlg,
    kid,
    jwksUri,
  });

  try {
    // Get the signing key from JWKS
    const signingKey = await getSigningKey(kid, jwksUri);

    // Determine allowed algorithms based on token algorithm
    // ECC P-256 uses ES256, RSA uses RS256
    const allowedAlgorithms: jwt.Algorithm[] = tokenAlg === 'ES256' 
      ? ['ES256'] 
      : tokenAlg === 'RS256'
      ? ['RS256']
      : ['RS256', 'ES256']; // Fallback: support both

    console.log(`[verifyJWT] Using algorithms:`, allowedAlgorithms);

    // Verify the token with the appropriate algorithm
    const payload = jwt.verify(token, signingKey, {
      algorithms: allowedAlgorithms,
    }) as jwt.JwtPayload;

    // Extract user_id from payload (stored in 'sub' field)
    const user_id = payload.sub;
    if (!user_id) {
      throw new Error('Token payload missing user_id (sub field)');
    }

    console.log(`[verifyJWT] Token verified successfully for user:`, user_id);
    return { user_id };
  } catch (error: any) {
    // Enhanced error logging
    console.error(`[verifyJWT] Token verification failed:`, {
      error: error.message,
      errorName: error.name,
      tokenAlg,
      kid,
      jwksUri,
    });

    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error(`Invalid token: ${error.message}`);
    }
    if (error.message?.includes('Not Found') || error.message?.includes('not found')) {
      throw new Error(`JWKS key not found (kid: ${kid}). This may indicate a key rotation or algorithm mismatch.`);
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | undefined): string {
  if (!authHeader) {
    throw new Error('No Authorization header provided');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header must start with "Bearer "');
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  if (!token) {
    throw new Error('Token is empty');
  }

  return token;
}

