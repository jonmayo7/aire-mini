// Use explicit 'node:' prefix for built-in modules
import { createHmac } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to convert data to a string
function getSafeString(data: any): string {
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data !== null) return JSON.stringify(data);
  return String(data);
}

// Function to validate the initData
async function validate(initData: string, botToken: string): Promise<boolean> {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  urlParams.sort();

  let dataCheckString = '';
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1); // Remove last \n

  if (!hash) {
    throw new Error('No hash found in initData');
  }

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hmac = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
}

// The main serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const initData = getSafeString(req.body.initData);
    const botToken = process.env.BOT_TOKEN;

    if (!initData) {
      return res.status(400).json({ error: 'initData is missing.' });
    }
    if (!botToken) {
      throw new Error('BOT_TOKEN is not set in environment variables.');
    }

    const isValid = await validate(initData, botToken);

    if (isValid) {
      return res.status(200).json({ valid: true, message: 'HMAC validation successful.' });
    } else {
      return res.status(403).json({ valid: false, error: 'HMAC validation failed.' });
    }
  } catch (error: any) {
    console.error('Auth validation error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};