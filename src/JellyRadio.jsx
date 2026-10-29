import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { runSpring, reduced } from './spring.js';
import './JellyRadio.css';

// Port komponenty JellyRadio z React Bits bez závislosti na knihovně motion.
const DEFAULT_ITEMS = ['Low', 'Medium', 'High', 'Max'];
const SIZES = { sm: [28, 12, 12], md: [36, 13, 16], lg: [44, 14, 20] };
const spring = (k, m, bounce) => ({ stiffness: k, damping: 2 * Math.sqrt(k * m) * (1 - bounce), mass: m });

export default function JellyRadio({
  items = DEFAULT_ITEMS, value, defaultValue, onChange,
  chipColor = '#27272a', activeColor = '#f5f5f5', textColor = '#f5f5f5', activeTextColor = '#18181b',
  size = 'md', gap = 8, radius = 18, swell = 0.2, barge = 6, shrink = 0.05, jelly = 1, bounce = 0.25, stagger = 22, stiffness = 580,
  disabled = false, ariaLabel = 'Options', className = ''
}) {
  const list = items.map(it => (typeof it === 'string' ? { value: it, label: it } : it));
  const [inner, setInner] = useState(() => defaultValue ?? list[0]?.value);
  const current = value ?? inner;
  const at = Math.max(0, list.findIndex(it => it.value === current));
  const groupRef = useRef(null), chipRefs = useRef([]), widths = useRef([]), st = useRef([]), applied = useRef(at), cfg = useRef({});
  cfg.current = { swell, barge, shrink, jelly, bounce, stagger, stiffness, reduce: reduced(), count: list.length };
  const [h, font, px] = SIZES[size] ?? SIZES.md;
  const itemsKey = list.map(it => it.value).join('|');

  const get = i => (st.current[i] ||= { x: 0, sx: 1, sy: 1, run: {}, timer: {} });
  const paint = i => { const s = get(i), el = chipRefs.current[i]; if (el) el.style.transform = `translateX(${s.x}px) scale(${s.sx}, ${s.sy})`; };
  const halt = (s, k) => { s.run[k]?.stop(); clearTimeout(s.timer[k]); };
  const jump = (i, k, v) => { const s = get(i); halt(s, k); s[k] = v; paint(i); };
  const to = (i, k, target, sp, delay) => {
    const s = get(i), vel = s.run[k]?.live ? s.run[k].velocity : 0; halt(s, k);
    const go = () => { s.run[k] = runSpring({ from: s[k], to: target, velocity: vel, ...sp, onUpdate: v => { s[k] = v; paint(i); } }); };
    delay > 0 ? (s.timer[k] = setTimeout(go, delay * 1000)) : go();
  };
  const apply = (sel, instant) => {
    const C = cfg.current, group = groupRef.current, rtl = group ? getComputedStyle(group).direction === 'rtl' : false;
    const push = ((widths.current[sel] ?? 0) * C.swell) / 2 + C.barge;
    for (let i = 0; i < C.count; i++) {
      const s = get(i), far = Math.abs(i - sel), x = Math.sign(i - sel) * (rtl ? -1 : 1) * push, sc = i === sel ? 1 + C.swell : 1 - C.shrink;
      if (instant || C.reduce) { jump(i, 'x', x); jump(i, 'sx', sc); jump(i, 'sy', sc); continue; }
      const k = C.stiffness * (1 - 0.12 * Math.min(far, 3)), j = C.jelly;
      const inFlight = ['x', 'sx', 'sy'].some(key => s.run[key]?.live), delay = inFlight ? 0 : (far * C.stagger) / 1000;
      to(i, 'x', x, spring(k, 0.9, C.bounce), delay);
      to(i, 'sx', sc, spring(k * (1 + 0.24 * j), 0.9 - 0.1 * j, Math.min(0.85, C.bounce + 0.3 * j)), delay);
      to(i, 'sy', sc, spring(k * (1 - 0.14 * j), 0.9 + 0.05 * j, C.bounce), delay + 0.05 * j);
    }
  };
  const measure = () => {
    const group = groupRef.current; if (!group) return;
    widths.current = chipRefs.current.map(el => el?.offsetWidth ?? 0);
    const chipH = chipRefs.current[0]?.offsetHeight ?? 0, maxW = Math.max(0, ...widths.current);
    group.style.setProperty('--jr-pad-x', `${Math.ceil((maxW * swell * 1.3) / 2 + barge) + 2}px`);
    group.style.setProperty('--jr-pad-y', `${Math.ceil((chipH * swell) / 2) + 2}px`);
  };
  useLayoutEffect(() => {
    const settle = () => { measure(); apply(applied.current, true); };
    settle();
    const observer = new ResizeObserver(settle);
    groupRef.current && observer.observe(groupRef.current);
    document.fonts?.ready.then(settle);
    return () => observer.disconnect();
  }, [itemsKey, size, gap, swell, barge, shrink]);
  useEffect(() => { if (applied.current === at) return; applied.current = at; apply(at, true); }, [at]);
  useEffect(() => () => st.current.forEach(s => ['x', 'sx', 'sy'].forEach(k => halt(s, k))), []);

  const commit = (i, instant) => {
    if (disabled || i === at || !list[i] || list[i].disabled) return;
    applied.current = i; apply(i, instant);
    if (value === undefined) setInner(list[i].value);
    onChange?.(list[i].value, i);
  };
  const stepFrom = (i, dir) => { const n = list.length; let j = i; for (let t = 0; t < n; t++) { j = (j + dir + n) % n; if (!list[j].disabled) return j; } return i; };
  const onKeyDown = (e, i) => {
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = stepFrom(i, 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = stepFrom(i, -1);
    else if (e.key === 'Home') next = stepFrom(-1, 1);
    else if (e.key === 'End') next = stepFrom(list.length, -1);
    else if (e.key === ' ' || e.key === 'Enter') next = i;
    if (next === null) return;
    e.preventDefault(); commit(next, true); chipRefs.current[next]?.focus();
  };
  return (
    <div ref={groupRef} role="radiogroup" aria-label={ariaLabel} data-disabled={disabled ? '' : undefined} className={`jelly-radio${className ? ` ${className}` : ''}`}
      style={{ '--jr-chip': chipColor, '--jr-active': activeColor, '--jr-text': textColor, '--jr-active-text': activeTextColor, '--jr-gap': `${gap}px`, '--jr-radius': `${radius}px`, '--jr-h': `${h}px`, '--jr-font': `${font}px`, '--jr-px': `${px}px` }}>
      {list.map((it, i) => (
        <button key={it.value} ref={el => { chipRefs.current[i] = el; }} type="button" role="radio" aria-checked={i === at} tabIndex={i === at ? 0 : -1}
          disabled={disabled || !!it.disabled} className="jelly-radio__chip" data-on={i === at ? 'true' : 'false'}
          onClick={e => commit(i, e.detail === 0)} onKeyDown={e => onKeyDown(e, i)}>
          <span className="jelly-radio__skin">{it.icon ? <span className="jelly-radio__icon">{it.icon}</span> : null}<span className="jelly-radio__label">{it.label}</span></span>
        </button>
      ))}
    </div>
  );
}
