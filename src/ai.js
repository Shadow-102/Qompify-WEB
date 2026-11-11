// Dotazy na umělou inteligenci (Gemini). Prohlížeč NIKDY nevidí klíč: volá Supabase Edge Function „gemini“,
// která klíč drží v Supabase Secrets a pustí jen přihlášeného uživatele. Mimo Supabase režim je AI vypnutá.
import { SUPABASE } from './config.js';
import { REMOTE, getToken } from './auth.js';

export const AI_ON = REMOTE;
export class AiError extends Error { constructor(code) { super(code); this.code = code; } }

export async function askAI(question, context, history = []) {
  const token = await getToken(); if (!token) throw new AiError('auth');
  let r;
  try {
    r = await fetch(SUPABASE.url.replace(/\/+$/, '') + '/functions/v1/gemini', {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE.anonKey, Authorization: 'Bearer ' + token },
      body: JSON.stringify({ question, context, history }),
    });
  } catch { throw new AiError('network'); }
  if (r.status === 401) throw new AiError('auth');
  if (r.status === 429) throw new AiError('rate');
  if (r.status === 404) throw new AiError('missing'); // funkce není nasazená
  if (!r.ok) throw new AiError('server');
  const j = await r.json().catch(() => ({}));
  if (!j.text) throw new AiError('empty');
  return j.text;
}
