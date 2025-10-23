// api/auth/verify.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

function hmac(key: crypto.BinaryLike, data: string) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { initData, maxAgeSeconds = 86400 } =
      (req.method === 'POST' ? req.body : req.query) as {
        initData?: string;
        maxAgeSeconds?: number;
      };

    if (!initData || typeof initData !== 'string')
      return res.status(400).json({ ok: false, error: 'Missing initData' });

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return res.status(400).json({ ok: false, error: 'Missing hash' });

    const pairs: string[] = [];
    params.forEach((v, k) => {
      if (k !== 'hash') pairs.push(`${k}=${v}`);
    });
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    const botToken = process.env.BOT_TOKEN;
    if (!botToken)
      return res.status(500).json({ ok: false, error: 'Server misconfig: BOT_TOKEN missing' });

    const secretKey = hmac('WebAppData', botToken);
    const expected = hmac(secretKey, dataCheckString).toString('hex');

    const ok =
      expected.length === hash.length &&
      crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(hash, 'hex'));

    if (!ok) return res.status(401).json({ ok: false, error: 'Invalid signature' });

    const authDate = Number(params.get('auth_date') || 0) * 1000;
    if (Number.isFinite(authDate) && Date.now() - authDate > Number(maxAgeSeconds) * 1000)
      return res.status(401).json({ ok: false, error: 'Expired initData' });

    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return res.status(200).json({ ok: true, user });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Server error' });
  }
}