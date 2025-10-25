import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function hmac(key: crypto.BinaryLike, data: string) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function verifyInitData(initData: string, botToken: string, maxAgeSeconds = 86400) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new Error('Missing hash');

  const pairs: string[] = [];
  params.forEach((v, k) => { if (k !== 'hash') pairs.push(`${k}=${v}`); });
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = hmac('WebAppData', botToken);
  const expected = hmac(secretKey, dataCheckString).toString('hex');

  const ok = expected.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(hash, 'hex'));
  if (!ok) throw new Error('Invalid signature');

  const authDate = Number(params.get('auth_date') || 0) * 1000;
  if (Number.isFinite(authDate) && Date.now() - authDate > maxAgeSeconds * 1000) {
    throw new Error('Expired initData');
  }

  const userStr = params.get('user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user?.id) throw new Error('No Telegram user');
  return { user };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

    const { initData, prime, learn, executionScore, improve, commit, cycleDate } = req.body ?? {};
    if (!initData) return res.status(400).json({ ok: false, error: 'Missing initData' });

    const BOT_TOKEN = process.env.BOT_TOKEN!;
    if (!BOT_TOKEN) return res.status(500).json({ ok: false, error: 'Server misconfig: BOT_TOKEN' });

    const { user } = verifyInitData(initData, BOT_TOKEN);

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return res.status(500).json({ ok: false, error: 'Server misconfig: Supabase envs' });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const payload = {
      tg_user_id: Number(user.id),
      cycle_date: cycleDate ?? null,
      prime_text: prime ?? null,
      learn_text: learn ?? null,
      execution_score: typeof executionScore === 'number' ? executionScore : null,
      improve_text: improve ?? null,
      commit_text: commit ?? null,
    };

    const { data, error } = await sb.from('cycles').insert(payload).select('*').single();
    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, cycle: data });
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e?.message || 'Bad request' });
  }
}
