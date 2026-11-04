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
