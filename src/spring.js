// Malý pružinový animátor (náhrada knihovny motion): fyzikální pružina přes requestAnimationFrame.
export function runSpring({ from, to, velocity = 0, stiffness, damping, mass = 1, onUpdate, onDone }) {
  let x = from, v = velocity, last = performance.now(), raf, dead = false;
  const step = now => {
    if (dead) return;
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    const n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
    for (let i = 0; i < n; i++) { v += ((-stiffness * (x - to) - damping * v) / mass) * h; x += v * h; }
    if (Math.abs(x - to) < 0.0005 && Math.abs(v) < 0.005) { dead = true; onUpdate(to); onDone?.(); return; }
    onUpdate(x); raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return { stop() { dead = true; cancelAnimationFrame(raf); }, get velocity() { return v; }, get live() { return !dead; } };
}
export const uiSpring = bounce => ({ stiffness: ((2 * Math.PI) / 0.3) ** 2, damping: ((1 - bounce) * 4 * Math.PI) / 0.3, mass: 1 });
export const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
