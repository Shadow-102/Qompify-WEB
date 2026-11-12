// Dotazy na umělou inteligenci (Gemini). Prohlížeč NIKDY nevidí klíč: volá Supabase Edge Function (název v config.js),
// která klíč drží v Supabase Secrets a pustí jen přihlášeného uživatele. Mimo Supabase režim je AI vypnutá.
import { SUPABASE } from './config.js';
import { REMOTE, getToken } from './auth.js';

export const AI_ON = REMOTE;
export const AI_FN = (SUPABASE.aiFunction || 'gemini').trim();
export class AiError extends Error { constructor(code, detail = '') { super(code); this.code = code; this.detail = detail; } }

export async function askAI(question, context, history = []) {
  const token = await getToken(); if (!token) throw new AiError('auth');
  let r;
  try {
    r = await fetch(`${SUPABASE.url.replace(/\/+$/, '')}/functions/v1/${encodeURIComponent(AI_FN)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE.anonKey, Authorization: 'Bearer ' + token },
      body: JSON.stringify({ question, context, history }),
    });
  } catch { throw new AiError('network'); }
  const j = await r.json().catch(() => ({})), err = String(j.error || j.code || '');
  if (r.status === 401) throw new AiError('auth', String(r.status));
  if (r.status === 404) throw new AiError('missing');
  if (r.status === 429) throw new AiError('rate');
  if (r.status === 500 && err === 'not_configured') throw new AiError('config');
  if (r.status === 502 && err.startsWith('upstream_')) throw new AiError('upstream', err.replace('upstream_', ''));
  if (!r.ok) throw new AiError('server', String(r.status));
  if (!j.text) throw new AiError('empty');
  return j.text;
}
