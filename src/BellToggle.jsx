import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { runSpring, uiSpring, reduced } from './spring.js';
import './BellToggle.css';

// Port komponenty BellToggle z React Bits bez závislostí (motion / hugeicons).
const SEG_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';
const WARP = 0.6;
const SIZES = { sm: [36, 12.5, 14, 15, 8], md: [44, 13.5, 16, 19, 9], lg: [52, 15, 18, 23, 10] };
const WOBBLE = { amplitude: 0.4, passes: 3, duration: 420 };
const BELL_BODY = 'M6 16.5V10a6 6 0 0 1 12 0v6.5l1.6 2.3H4.4L6 16.5z';
const passOffset = (k, passes) => 1 - Math.pow(1 - (k + 2 / 3) / (passes + 1), WARP);
const ringKeyframes = (from, amplitude, passes, decay) => {
  const frames = [{ transform: `rotate(${from}deg)`, offset: 0, easing: SEG_EASE }];
  for (let k = 0; k < passes; k++) {
    const angle = amplitude * Math.pow(1 - k / passes, decay) * (k % 2 ? 1 : -1);
    frames.push({ transform: `rotate(${angle.toFixed(2)}deg)`, offset: passOffset(k, passes), easing: SEG_EASE });
  }
  frames.push({ transform: 'rotate(0deg)', offset: 1 });
  return frames;
};
const liveAngle = el => {
  const tf = getComputedStyle(el).transform;
  if (!tf || tf === 'none') return 0;
  const m = new DOMMatrix(tf);
  return (Math.atan2(m.b, m.a) * 180) / Math.PI;
};

export default function BellToggle({
  offLabel = 'Notify me', onLabel = "You'll be notified", icon, label,
  color = '#f5f5f5', background = '#27272a', onColor = '#18181b', onBackground = '#f5f5f5',
  size = 'md', radius = 22, ringAmplitude = 17, ringPasses = 5, ringDecay = 1, ringDuration = 820, ringPivot = 16,
  crossfadeMs = 200, revealBounce = 0, count = 0, badge = true, badgeColor = '#ef4444', badgeTextColor = '#ffffff',
  waves = true, clapper = false, pressed, defaultPressed = false, onChange, disabled = false, className = ''
}) {
  const [inner, setInner] = useState(defaultPressed);
  const on = pressed ?? inner;
  const rootRef = useRef(null), glyphRef = useRef(null), clapperRef = useRef(null), waveLeft = useRef(null), waveRight = useRef(null);
  const offRef = useRef(null), onRef = useRef(null), lastInput = useRef('pointer'), pending = useRef(null), spring = useRef(null);
  const prevCount = useRef(count), t = useRef(on ? 1 : 0), widths = useRef([0, 0]);
  const [h, fs, iconSize, px, gap] = SIZES[size] ?? SIZES.md;

  const paint = () => { const [a, b] = widths.current; rootRef.current?.style.setProperty('--bt-clip', `${Math.max(a, b) - (a + (b - a) * t.current)}px`); };
  useLayoutEffect(() => {
    const measure = () => { widths.current = [offRef.current?.offsetWidth ?? 0, onRef.current?.offsetWidth ?? 0]; paint(); };
    measure();
    const observer = new ResizeObserver(measure);
    offRef.current && observer.observe(offRef.current); onRef.current && observer.observe(onRef.current);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [offLabel, onLabel, size]);

  const swing = (amplitude, passes, duration) => {
    const el = glyphRef.current; if (!el) return;
    el.getAnimations().forEach(a => a.cancel());
    el.animate(ringKeyframes(liveAngle(el), amplitude, passes, ringDecay), { duration, easing: 'linear' });
    const c = clapperRef.current;
    if (c) { c.getAnimations().forEach(a => a.cancel()); c.animate(ringKeyframes(liveAngle(c), amplitude * 1.6, passes, ringDecay), { duration, delay: 70, easing: 'linear' }); }
    if (!waves) return;
    for (let k = 0; k < passes; k++) {
      const side = k % 2 ? waveRight.current : waveLeft.current; if (!side) continue;
      const strength = Math.pow(1 - k / passes, ringDecay);
      side.animate([{ opacity: 0, transform: 'scale(0.55)' }, { opacity: 0.9 * strength, offset: 0.3 }, { opacity: 0, transform: 'scale(1.25)' }], { duration: 380, delay: passOffset(k, passes) * duration, easing: 'ease-out' });
    }
  };
  useLayoutEffect(() => {
    const pointer = pending.current === 'pointer' && !reduced();
    pending.current = null; spring.current?.stop();
    if (pointer) spring.current = runSpring({ from: t.current, to: on ? 1 : 0, ...uiSpring(revealBounce), onUpdate: v => { t.current = v; paint(); } });
    else { t.current = on ? 1 : 0; paint(); }
    if (on && pointer) swing(ringAmplitude, ringPasses, ringDuration);
  }, [on]);
  useLayoutEffect(() => () => spring.current?.stop(), []);
  useEffect(() => {
    const was = prevCount.current; prevCount.current = count;
    if (count > was && on && !reduced()) swing(ringAmplitude * WOBBLE.amplitude, WOBBLE.passes, WOBBLE.duration);
  }, [count]);

  const toggle = () => { pending.current = lastInput.current; if (pressed === undefined) setInner(!on); onChange?.(!on); };
  const press = e => { lastInput.current = 'pointer'; if (e.button === 0 && !disabled && rootRef.current) rootRef.current.dataset.pressed = ''; };
  const release = () => { if (rootRef.current) delete rootRef.current.dataset.pressed; };
  const key = e => { if (e.key === 'Enter' || e.key === ' ') lastInput.current = 'keyboard'; };
  const showBadge = badge && on && count > 0;
  const bell = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={BELL_BODY} /><path d="M12 2.5V4" />{!clapper && <path d="M10 20.5a2 2 0 0 0 4 0" />}</svg>
  );
  return (
    <span ref={rootRef} className={`bell-toggle${className ? ` ${className}` : ''}`} data-on={on ? 'true' : 'false'} data-disabled={disabled ? '' : undefined}
      style={{ '--bt-color': color, '--bt-bg': background, '--bt-on-color': onColor, '--bt-on-bg': onBackground, '--bt-badge': badgeColor, '--bt-badge-ink': badgeTextColor, '--bt-radius': `${radius}px`, '--bt-fade': `${crossfadeMs}ms`, '--bt-pivot': `${ringPivot}%`, '--bt-h': `${h}px`, '--bt-fs': `${fs}px`, '--bt-icon': `${iconSize}px`, '--bt-px': `${px}px`, '--bt-gap': `${gap}px` }}>
      <button type="button" className="bell-toggle__button" aria-pressed={on} aria-label={label ?? offLabel} disabled={disabled}
        onPointerDown={press} onPointerUp={release} onPointerCancel={release} onPointerLeave={release} onKeyDown={key} onClick={toggle}>
        <span className="bell-toggle__bell" aria-hidden="true">
          <span ref={glyphRef} className="bell-toggle__glyph">{icon ?? bell}</span>
          {clapper ? <span ref={clapperRef} className="bell-toggle__clapper"><svg viewBox="0 0 24 24"><circle cx="12" cy="20.4" r="1.7" fill="currentColor" /></svg></span> : null}
          {waves ? (<>
            <svg ref={waveLeft} className="bell-toggle__wave bell-toggle__wave--left" viewBox="0 0 14 14"><path d="M14 8a6 6 0 0 0-6 6" /><path d="M14 4A10 10 0 0 0 4 14" /></svg>
            <svg ref={waveRight} className="bell-toggle__wave bell-toggle__wave--right" viewBox="0 0 14 14"><path d="M0 8a6 6 0 0 1 6 6" /><path d="M0 4a10 10 0 0 1 10 10" /></svg>
          </>) : null}
          {badge ? <span className="bell-toggle__badge" data-show={showBadge ? '' : undefined}><span key={count} className="bell-toggle__digit">{count > 9 ? '9+' : count}</span></span> : null}
        </span>
        <span className="bell-toggle__say" aria-hidden="true">
          <span ref={offRef} className="bell-toggle__face bell-toggle__face--off">{offLabel}</span>
          <span ref={onRef} className="bell-toggle__face bell-toggle__face--on">{onLabel}</span>
        </span>
      </button>
    </span>
  );
}
