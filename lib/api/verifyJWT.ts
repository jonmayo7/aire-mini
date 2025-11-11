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
async function getSigningKey(kid: string): Promise<string> {
  const client = getJwksClient();
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
}

// Verify JWT token and extract user_id
export async function verifyJWT(token: string): Promise<{ user_id: string }> {
  if (!token) {
    throw new Error('No token provided');
  }

  // Decode token header to get kid (key ID)
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new Error('Invalid token format');
  }

  try {
    // Get the signing key from JWKS
    const signingKey = await getSigningKey(decoded.header.kid);

    // Verify the token
    const payload = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
    }) as jwt.JwtPayload;

    // Extract user_id from payload (stored in 'sub' field)
    const user_id = payload.sub;
    if (!user_id) {
      throw new Error('Token payload missing user_id (sub field)');
    }

    return { user_id };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
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

