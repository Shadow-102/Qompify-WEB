// Testovací přihlášení. POZOR: web běží na statickém hostingu bez serveru, takže se heslo ověřuje v prohlížeči.
// Hash v kódu stojí v cestě jen náhodnému zvědavci, nejde o skutečné zabezpečení. Pro ostré účty je potřeba server (viz README).
import { useSyncExternalStore } from 'react';
import { sha256 } from './sha256.js';

export const AUTH = {
  users: { test: 'f3fda6cfe6753dc2dc31f473d463ee5133f479f6368ef9ba0b7be431eb67d9e2' }, // sha256('qompify:' + uživatel + ':' + heslo)
  hint: { user: 'test', pass: 'test' },                                               // null = nezobrazovat testovací údaje na přihlašovací stránce
  days: 30,
};
export const SESSION_KEY = 'qompify.session.v1';
const hashOf = (u, p) => sha256(`qompify:${u}:${p}`);
const read = s => { try { return JSON.parse(s.getItem(SESSION_KEY) || 'null'); } catch { return null; } };
const valid = x => x && typeof x.u === 'string' && AUTH.users[x.u] && Date.now() - x.t < AUTH.days * 864e5;

export function currentUser() {
  try { const x = [localStorage, sessionStorage].map(read).find(valid); return x ? x.u : null; } catch { return null; }
}
export function checkLogin(user, pass) {
  const u = String(user || '').trim().toLowerCase();
  return !!AUTH.users[u] && AUTH.users[u] === hashOf(u, String(pass || '')) ? u : null;
}
export function signIn(user, pass, remember) {
  const u = checkLogin(user, pass); if (!u) return false;
  try { (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify({ u, t: Date.now() })); } catch { /* úložiště zakázáno */ }
  set(u); return true;
}
export function signOut() { try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch { /* nic */ } set(null); }

let user = currentUser(); const subs = new Set();
const set = u => { user = u; subs.forEach(f => f()); };
if (typeof addEventListener !== 'undefined') addEventListener('storage', e => { if (e.key === SESSION_KEY) set(currentUser()); });
export const useAuth = () => useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => user, () => null);
