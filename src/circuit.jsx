// Pozadí: deska počítače (CPU patice, RAM sloty, čipset, PCIe, sběrnice se 45° ohyby). Statické SVG, nad ním pár signálních pulzů
// a „čočka“ kolem kurzoru, která odkryje měděné spoje. Čočka se hýbe jen přes transform (žádné překreslování).
import { useEffect, useRef, useState } from 'react';

// --- generátor scény (deterministický, 1600×1000) ---
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647), ri = (a, b) => Math.round(a + rnd() * (b - a));
const f = n => Math.round(n * 10) / 10;
function offsetPoly(pts, o) {
  const seg = pts.slice(0, -1).map(([x0, y0], i) => { const [x1, y1] = pts[i + 1], l = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / l, uy = (y1 - y0) / l; return { x: x0 - uy * o, y: y0 + ux * o, ux, uy }; });
  const out = [[seg[0].x, seg[0].y]];
  for (let i = 1; i < seg.length; i++) {
    const a = seg[i - 1], b = seg[i], det = a.ux * b.uy - a.uy * b.ux;
    if (Math.abs(det) < 1e-6) { out.push([b.x, b.y]); continue; }
    const t = ((b.x - a.x) * b.uy - (b.y - a.y) * b.ux) / det; out.push([a.x + t * a.ux, a.y + t * a.uy]);
  }
  const [lx, ly] = pts[pts.length - 1], s = seg[seg.length - 1]; out.push([lx - s.uy * o, ly + s.ux * o]); return out;
}
const d = pts => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L');
const bus = (pts, n, p) => Array.from({ length: n }, (_, k) => offsetPoly(pts, (k - (n - 1) / 2) * p));
const R = (x, y, w, h, r = 4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const C = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
const T = (x, y, t, rot = 0) => `<text x="${x}" y="${y}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${t}</text>`;

const BUSES = [
  [[[1396, 250], [1330, 250], [1292, 288], [1292, 372], [1264, 372]], 10, 6],
  [[[1396, 500], [1336, 500], [1298, 462], [1298, 430], [1264, 430]], 10, 6],
  [[[1016, 470], [980, 470], [940, 510], [940, 600], [900, 600], [900, 636]], 12, 6],
  [[[836, 720], [780, 720], [744, 756], [690, 756]], 10, 6],
  [[[700, 483], [640, 483], [610, 453], [610, 410], [590, 410]], 8, 6],
  [[[516, 380], [516, 330], [480, 294], [200, 294], [170, 264], [170, 200], [90, 200]], 8, 6],
];
function build() {
  seed = 7; let g = '', sil = '', paths = [];  // paths = polylines (vertex arrays) pro pulzy
  // sběrnice
  BUSES.forEach(([pts, n, p]) => { const lines = bus(pts, n, p); lines.forEach(l => { g += `<path d="${d(l)}"/>`; g += C(f(l[0][0]), f(l[0][1]), 2.6) + C(f(l.at(-1)[0]), f(l.at(-1)[1]), 2.6); }); paths.push(lines[Math.floor(n / 2)]); });
  // volné spoje
  for (let i = 0; i < 26; i++) {
    let x = ri(40, 1560), y = ri(40, 960), s = rnd() < .5 ? 1 : -1, t = rnd() < .5 ? 1 : -1; const pts = [[x, y]];
    x += s * ri(60, 220); pts.push([x, y]); const dd = ri(30, 90); x += s * dd; y += t * dd; pts.push([x, y]);
    if (rnd() < .5) { y += t * ri(40, 160); } else { x += s * ri(40, 160); } pts.push([x, y]);
    const s2 = pts.map(([a, b]) => [Math.max(10, Math.min(1590, a)), Math.max(10, Math.min(990, b))]); g += `<path d="${d(s2)}"/>` + C(s2[0][0], s2[0][1], 3.2) + C(s2.at(-1)[0], s2.at(-1)[1], 3.2); if (i % 3 === 0) paths.push(s2);
  }
  // CPU patice
  g += R(1010, 290, 260, 260, 14).replace('/>', ' stroke-dasharray="3 5"/>') + R(1020, 300, 240, 240, 10) + R(1034, 314, 212, 212, 6);
  for (let i = 0; i < 13; i++) for (let j = 0; j < 13; j++) g += C(1050 + i * 15, 330 + j * 15, 1.3).replace('/>', ' fill="currentColor" stroke="none"/>');
  g += `<path d="M1020 300h24l-24 24z" fill="currentColor" stroke="none"/>`;
  // VRM
  for (let i = 0; i < 7; i++) g += R(1030 + i * 36, 246, 26, 26, 5) + C(1043 + i * 36, 259, 6) + C(1043 + i * 36, 224, 8);
  for (let i = 0; i < 6; i++) g += R(960, 318 + i * 38, 26, 26, 5) + C(973, 331 + i * 38, 6) + C(934, 331 + i * 38, 8);
  // RAM
  for (let i = 0; i < 4; i++) g += R(1404 + i * 38, 130, 22, 420, 3) + `<path d="M${1404 + i * 38} 340h22"/>`;
  // chipset, M.2, PCIe, čipy, I/O
  g += R(840, 640, 120, 120, 6) + R(852, 652, 96, 96, 3);
  for (let i = 0; i < 10; i++) { const o = 852 + i * 10.6; g += `<path d="M${f(o)} 632v8M${f(o)} 760v8M832 ${f(o - 200)}h8M960 ${f(o - 200)}h8"/>`; }
  g += R(700, 470, 220, 26, 4) + C(930, 483, 7) + R(120, 720, 560, 22, 3) + R(120, 790, 240, 22, 3);
  for (let i = 0; i < 28; i++) g += `<path d="M${132 + i * 19.5} 724v14"/>`;
  g += R(520, 380, 70, 70, 4) + R(640, 230, 46, 46, 4) + C(330, 560, 34) + C(330, 560, 22);
  for (let i = 0; i < 8; i++) g += `<path d="M${528 + i * 8} 372v8M${528 + i * 8} 450v8M512 ${388 + i * 8}h8M590 ${388 + i * 8}h8"/>`;
  for (let i = 0; i < 6; i++) g += R(-20, 110 + i * 70, 110, 54, 6);
  for (let i = 0; i < 34; i++) g += R(ri(60, 1540), ri(40, 960), 10, 5, 1);
  // popisky
  sil += T(1096, 586, 'CPU') + T(1410, 104, 'DDR5') + T(878, 790, 'PCH') + T(712, 462, 'M.2') + T(124, 764, 'PCIe x16') + T(124, 834, 'PCIe x1') + T(528, 472, 'U7') + T(644, 222, 'U3') + T(310, 616, 'BAT') + T(10, 100, 'I/O') + T(1030, 212, 'VRM') + T(1380, 596, 'DIMM A1 A2 B1 B2');
  return { art: `<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${g}</g><g fill="currentColor" stroke="none">${sil}</g>`, paths };
}
const SCENE = build();
// Pulzy: CSS keyframy z geometrie spojů. Animuje se jen transform/opacity, takže běží na GPU bez práce hlavního vlákna.
const plen = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
function at(pts, f) { let t = f * plen(pts); for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (t <= l || i === pts.length - 1) { const k = Math.min(1, t / l); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; } t -= l; } return pts[0]; }
const PULSES = SCENE.paths.slice(0, 11).map((pts, i) => {
  const L = plen(pts); let acc = 0; const kf = [[0, pts[0], 0], [5, at(pts, .05), 1]];
  pts.forEach((q, j) => { if (j) acc += Math.hypot(q[0] - pts[j - 1][0], q[1] - pts[j - 1][1]); const pc = (acc / L) * 100; if (pc > 6 && pc < 94) kf.push([pc, q, 1]); });
  kf.push([95, at(pts, .95), 1], [100, pts.at(-1), 0]);
  const css = `@keyframes qp${i}{${kf.map(([pc, [x, y], o]) => `${f(pc)}%{transform:translate3d(${f(x)}px,${f(y)}px,0);opacity:${o}}`).join('')}}`;
  return { css, dur: Math.max(4, L / 55 + 1.5 + ((i * 37) % 30) / 10), begin: -((i * 53) % 70) / 10 };
});
const PULSE_CSS = PULSES.map(u => u.css).join('');

const MAP = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><linearGradient id="x" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#f00"/><stop offset=".07" stop-color="#800000"/><stop offset=".93" stop-color="#800000"/><stop offset="1" stop-color="#000"/></linearGradient><linearGradient id="y" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset=".07" stop-color="#008000"/><stop offset=".93" stop-color="#008000"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="256" height="256" fill="#000"/><rect width="256" height="256" fill="url(#x)" style="mix-blend-mode:screen"/><rect width="256" height="256" fill="url(#y)" style="mix-blend-mode:screen"/></svg>');
const useReduced = () => {
  const [r, setR] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const m = matchMedia('(prefers-reduced-motion: reduce)'), f = () => setR(m.matches); m.addEventListener?.('change', f); return () => m.removeEventListener?.('change', f); }, []);
  return r;
};

export function Circuit() {
  const lens = useRef(null), inner = useRef(null), pul = useRef(null), reduce = useReduced();
  useEffect(() => {
    const L = lens.current, I = inner.current; if (!L || !I) return;
    const S = 190; let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
    const size = () => { const W = document.documentElement.clientWidth, H = document.documentElement.clientHeight, k = Math.max(W / 1600, H / 1000); if (pul.current) pul.current.style.transform = `translate3d(${(W - 1600 * k) / 2}px,${(H - 1000 * k) / 2}px,0) scale(${k})`; I.style.width = document.documentElement.clientWidth + 'px'; I.style.height = document.documentElement.clientHeight + 'px'; };
    const apply = () => { L.style.transform = `translate3d(${x - S}px,${y - S}px,0)`; I.style.transform = `translate3d(${S - x}px,${S - y}px,0)`; };
    const k = reduce ? 1 : 0.16;
    const loop = () => { x += (tx - x) * k; y += (ty - y) * k; apply(); raf = Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4 ? requestAnimationFrame(loop) : 0; };
    const move = e => { if (e.pointerType === 'touch') return; tx = e.clientX; ty = e.clientY; if (!on) { on = true; x = tx; y = ty; apply(); L.style.opacity = 1; } if (!raf) raf = requestAnimationFrame(loop); };
    const leave = () => { on = false; L.style.opacity = 0; };
    size(); addEventListener('resize', size); addEventListener('pointermove', move, { passive: true }); document.documentElement.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); };
  }, [reduce]);
  useEffect(() => { if (window.chrome) document.documentElement.classList.add('rf'); }, []); // lom světla přes backdrop-filter umí jen Chromium
  return (
    <div className="pcb" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}><defs><filter id="lg-ref" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB"><feImage href={MAP} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="m" /><feDisplacementMap in="SourceGraphic" in2="m" scale="22" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
      <svg className="pcb-art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><g id="pcb-art" dangerouslySetInnerHTML={{ __html: SCENE.art }} /></svg>
      {!reduce && (
        <div className="pcb-pulse" ref={pul}>
          <style>{PULSE_CSS}</style>
          {PULSES.map((u, i) => <i key={i} className="pulse" style={{ animation: `qp${i} ${u.dur}s linear ${u.begin}s infinite` }} />)}
        </div>
      )}
      <div className="pcb-lens" ref={lens}><svg className="pcb-art-in" ref={inner} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><use href="#pcb-art" /></svg></div>
    </div>
  );
}
