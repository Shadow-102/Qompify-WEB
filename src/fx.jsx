// Drobné efekty: slova nadpisu vyjíždějí po jednom, „spoj“ pod nadpisem se dokreslí, lesk na prvcích sleduje kurzor.
import { Fragment, useEffect, useState } from 'react';
export const Words = ({ text }) => text.split(' ').map((w, i) => <Fragment key={i}><span className="w"><span style={{ '--i': i }}>{w}</span></span>{' '}</Fragment>);
export const Trace = () => (
  <svg className="trace" viewBox="0 0 240 18" aria-hidden="true">
    <circle className="tv" cx="4" cy="5" r="3" /><path d="M8 5H140l10 10h62" pathLength="1" /><circle className="tp" cx="220" cy="15" r="3.6" />
  </svg>
);
export function usePointerGlow() {
  useEffect(() => {
    let raf = 0, ev;
    const sel = '.btn,.card,.deal,.pick,.slot,.qlg-btn';
    const run = () => { raf = 0; const t = ev.target.closest && ev.target.closest(sel); if (!t) return; const r = t.getBoundingClientRect(); t.style.setProperty('--mx', ev.clientX - r.left + 'px'); t.style.setProperty('--my', ev.clientY - r.top + 'px'); };
    const move = e => { if (e.pointerType === 'touch') return; ev = e; if (!raf) raf = requestAnimationFrame(run); };
    addEventListener('pointermove', move, { passive: true });
    return () => { removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);
}

// Přepínač efektů: vypne pozadí s deskou a rozmazané sklo (pro slabší zařízení). Pamatuje si volbu.
const FX = 'qompify.fx.v1';
const readFx = () => { try { return localStorage.getItem(FX) !== 'off'; } catch { return true; } };
export function useFxPref() { useEffect(() => { document.documentElement.classList.toggle('lite', !readFx()); }, []); }
export function FxToggle() {
  const [on, setOn] = useState(readFx);
  const flip = () => { const n = !on; setOn(n); document.documentElement.classList.toggle('lite', !n); try { n ? localStorage.removeItem(FX) : localStorage.setItem(FX, 'off'); } catch { /* nic */ } };
  return <button type="button" className="fxt" onClick={flip} aria-pressed={on}>Efekty pozadí: <b>{on ? 'zapnuto' : 'vypnuto'}</b></button>;
}

// Vzhled: světlý / tmavý. Bez volby uživatele se řídí systémem. Přepnutí se plynule prolne (View Transitions, kde je podporováno).
const TH = 'qompify.theme.v1';
const readTheme = () => { try { const t = localStorage.getItem(TH); return t === 'light' || t === 'dark' ? t : null; } catch { return null; } };
const sysDark = () => matchMedia('(prefers-color-scheme: dark)').matches;
const applyTheme = t => { document.documentElement.dataset.theme = t; document.querySelector('meta[name=theme-color]')?.setAttribute('content', t === 'dark' ? '#0A0C10' : '#F5F6F8'); };
export function useThemePref() {
  useEffect(() => {
    applyTheme(readTheme() || (sysDark() ? 'dark' : 'light'));
    const m = matchMedia('(prefers-color-scheme: dark)'), f = () => { if (!readTheme()) applyTheme(m.matches ? 'dark' : 'light'); };
    m.addEventListener?.('change', f); return () => m.removeEventListener?.('change', f);
  }, []);
}
export function ThemeToggle({ icon }) {
  const [t, setT] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => { const o = new MutationObserver(() => setT(document.documentElement.dataset.theme || 'light')); o.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); return () => o.disconnect(); }, []);
  const flip = () => {
    const n = t === 'dark' ? 'light' : 'dark', go = () => { applyTheme(n); try { localStorage.setItem(TH, n); } catch { /* nic */ } };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(go); else go();
  };
  const label = t === 'dark' ? 'Přepnout na světlý vzhled' : 'Přepnout na tmavý vzhled';
  if (icon) return (
    <button type="button" className="thm" onClick={flip} aria-label={label} title={label}>
      <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" /></svg>
      <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
    </button>
  );
  return <button type="button" className="fxt" onClick={flip}>Vzhled: <b>{t === 'dark' ? 'tmavý' : 'světlý'}</b></button>;
}
