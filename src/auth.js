// Přihlášení. Dvě varianty podle src/config.js:
//  • Supabase vyplněný  → skutečné účty (e-mail + heslo přes Supabase Auth, REST bez knihovny)
//  • Supabase prázdný   → místní testovací účet (hash v kódu, jen hradlo v rozhraní, ne zabezpečení)
// V obou případech platí: web běží na statickém hostingu, takže přihlášení skrývá rozhraní. Data v balíčku JS ale zůstávají čitelná.
import { useSyncExternalStore } from 'react';
import { sha256 } from './sha256.js';
import { SUPABASE } from './config.js';

export const REMOTE = !!(SUPABASE.url && SUPABASE.anonKey);
export const AUTH = { users: { test: 'f3fda6cfe6753dc2dc31f473d463ee5133f479f6368ef9ba0b7be431eb67d9e2' }, days: 30 }; // sha256('qompify:' + uživatel + ':' + heslo)
export const SESSION_KEY = 'qompify.session.v1';
const api = p => SUPABASE.url.replace(/\/+$/, '') + '/auth/v1' + p;
const hdr = (extra = {}) => ({ 'Content-Type': 'application/json', apikey: SUPABASE.anonKey, ...extra });
const hashOf = (u, p) => sha256(`qompify:${u}:${p}`);
const store = () => [localStorage, sessionStorage];
const read = s => { try { return JSON.parse(s.getItem(SESSION_KEY) || 'null'); } catch { return null; } };
const validLocal = x => x && typeof x.u === 'string' && AUTH.users[x.u] && Date.now() - x.t < AUTH.days * 864e5;
const validRemote = x => x && x.m === 'sb' && typeof x.e === 'string' && x.rt && Date.now() - x.t < 60 * 864e5;
const valid = x => (REMOTE ? validRemote(x) : validLocal(x));
const find = () => { try { for (const s of store()) { const x = read(s); if (valid(x)) return [s, x]; } } catch { /* úložiště zakázáno */ } return null; };
const save = (obj, remember) => { try { const [keep, drop] = remember ? store() : store().reverse(); keep.setItem(SESSION_KEY, JSON.stringify(obj)); drop.removeItem(SESSION_KEY); } catch { /* nic */ } };

export function currentUser() { const f = find(); return f ? (REMOTE ? f[1].e : f[1].u) : null; }
export function checkLogin(user, pass) { // jen místní režim
  const u = String(user || '').trim().toLowerCase();
  return !!AUTH.users[u] && AUTH.users[u] === hashOf(u, String(pass || '')) ? u : null;
}
// vrací { ok } nebo { ok:false, error: 'invalid' | 'rate' | 'unconfirmed' | 'network' | 'server' }
export async function signIn(user, pass, remember) {
  if (!REMOTE) { const u = checkLogin(user, pass); if (!u) return { ok: false, error: 'invalid' }; save({ u, t: Date.now() }, remember); set(u); return { ok: true }; }
  try {
    const email = String(user || '').trim(), r = await fetch(api('/token?grant_type=password'), { method: 'POST', headers: hdr(), body: JSON.stringify({ email, password: String(pass || '') }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = `${j.error_code || ''} ${j.msg || ''} ${j.error_description || ''}`;
      return { ok: false, error: r.status === 429 ? 'rate' : /not.?confirmed/i.test(msg) ? 'unconfirmed' : r.status === 400 || r.status === 401 ? 'invalid' : 'server' };
    }
    save({ m: 'sb', e: j.user?.email || email, at: j.access_token, rt: j.refresh_token, x: j.expires_at ?? Math.floor(Date.now() / 1000) + (j.expires_in || 3600), t: Date.now() }, remember);
    set(currentUser()); return { ok: true };
  } catch { return { ok: false, error: 'network' }; }
}
export function signOut() {
  const f = find();
  if (REMOTE && f?.[1].at) fetch(api('/logout'), { method: 'POST', headers: hdr({ Authorization: `Bearer ${f[1].at}` }) }).catch(() => {}); // best-effort
  try { store().forEach(s => s.removeItem(SESSION_KEY)); } catch { /* nic */ }
  set(null);
}
// Obnova přístupového tokenu těsně před vypršením. Odmítnutí ze serveru (smazaný uživatel, zrušená relace) = odhlášení. Chyba sítě relaci nechá.
export async function refresh() {
  const f = find(); if (!REMOTE || !f) return; const [s, x] = f;
  if (x.x - Date.now() / 1000 > 90) return;
  try {
    const r = await fetch(api('/token?grant_type=refresh_token'), { method: 'POST', headers: hdr(), body: JSON.stringify({ refresh_token: x.rt }) });
    if (r.ok) { const j = await r.json(); s.setItem(SESSION_KEY, JSON.stringify({ ...x, at: j.access_token, rt: j.refresh_token || x.rt, x: j.expires_at ?? Math.floor(Date.now() / 1000) + (j.expires_in || 3600) })); }
    else if (r.status === 400 || r.status === 401 || r.status === 403) signOut();
  } catch { /* offline: ponech */ }
}

let user = currentUser(); const subs = new Set();
const set = u => { user = u; subs.forEach(f => f()); };
if (typeof addEventListener !== 'undefined') { addEventListener('storage', e => { if (e.key === SESSION_KEY) set(currentUser()); }); if (REMOTE) refresh(); }
export const useAuth = () => useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => user, () => null);
