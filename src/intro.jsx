// Úvodní animace Qompify: vektorová verze brandového obrázku (vlny, spoje, oblouky, tečky, logo, nápis).
// Hraje jednou za relaci prohlížeče, jde přeskočit kliknutím nebo klávesou a při omezeném pohybu se nespustí.
import { useEffect, useState } from 'react';
import './intro.css';

const KEY = 'qompify.intro.v1';
const HOLD = 2900, OUT = 700;

// Spoje vpravo nahoře: jedna lomená čára, z ní 6 rovnoběžek se soustřednými zaobleními.
const BASE = [[1000, -42], [1365, 155], [1625, 105], [1728, 400], [1915, 580], [2160, 606]];
const GAP = 38, N = 6;
const norm = ([x, y]) => { const l = Math.hypot(x, y); return [x / l, y / l]; };
function trace(k) {
  const off = k * GAP, dir = [], nrm = [];
  for (let i = 0; i < BASE.length - 1; i++) { const d = norm([BASE[i + 1][0] - BASE[i][0], BASE[i + 1][1] - BASE[i][1]]); dir.push(d); nrm.push([d[1], -d[0]]); }
  const pts = BASE.map((p, i) => {
    if (i === 0 || i === BASE.length - 1) { const n = nrm[i ? i - 1 : 0]; return [p[0] + n[0] * off, p[1] + n[1] * off]; }
    const m = norm([nrm[i - 1][0] + nrm[i][0], nrm[i - 1][1] + nrm[i][1]]), s = off / (m[0] * nrm[i][0] + m[1] * nrm[i][1]);
    return [p[0] + m[0] * s, p[1] + m[1] * s];
  });
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = dir[i - 1], b = dir[i], right = a[0] * b[1] - a[1] * b[0] > 0;
    const lim = Math.min(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])) / 2;
    const r = Math.min(lim, 16 + (right ? k : N - 1 - k) * GAP * 0.9), [x, y] = pts[i];
    d += `L${(x - a[0] * r).toFixed(1)} ${(y - a[1] * r).toFixed(1)}Q${x.toFixed(1)} ${y.toFixed(1)} ${(x + b[0] * r).toFixed(1)} ${(y + b[1] * r).toFixed(1)}`;
  }
  const z = pts[pts.length - 1];
  return d + `L${z[0].toFixed(1)} ${z[1].toFixed(1)}`;
}
const TRACES = Array.from({ length: N }, (_, k) => trace(k));
const RINGS = [195, 232.5, 270, 307.5, 345].map((r) => `M${320 - r} 1240A${r} ${r} 0 0 1 ${320 + r} 1240`);
const GRID = Array.from({ length: 36 }, (_, i) => [17 + (i % 3) * 40, 331 + Math.floor(i / 3) * 39.7, Math.floor(i / 3)]);
const SCATTER = [[1937, 650], [1833, 716], [1972, 730], [1891, 813], [1989, 848], [1806, 878], [1938, 966]];
// Nápis OMPIFY z obdélníků (souřadnice z původního obrázku 2000 × 1125).
const T = 33, Y0 = 567, Y1 = 732, MID = 633, BOT = 699;
const LETTERS = [
  [[733, Y0, 165, T], [733, Y0, T, 165], [865, Y0, T, 165], [733, BOT, 165, T]],
  [[931, Y0, 165, T], [931, Y0, T, 165], [997, Y0, T, 165], [1063, Y0, T, 165]],
  [[1130, Y0, 165, T], [1130, Y0, T, 165], [1262, Y0, T, 98], [1130, MID, 165, T]],
  [[1328, Y0, T, 165]],
  [[1394, Y0, 165, T], [1394, Y0, T, 165], [1394, MID, 165, T]],
  [[1592, Y0, T, 98], [1725, Y0, T, 165], [1592, MID, 166, T], [1592, BOT, 166, T]],
];
const R = ([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />;

// Logo Q v souřadnicích src/assets/logo.png (966 × 959). Bílé části mají barvu pozadí scény.
const Q = () => (
  <>
    <rect className="qm-box" width="966" height="959" rx="96" />
    <path className="qm-hole" d="M158 175Q158 160 173 160H818Q833 160 833 175V645L696 521V289H294V672H487L610 801H173Q158 801 158 786Z" />
    <path className="qm-bar" d="M565 653L654 563L873 780L790 868Z" strokeLinejoin="round" strokeWidth="14" />
  </>
);
export const Mark = ({ className }) => (
  <svg className={className} viewBox="0 0 966 959" aria-hidden="true">
    <g className="qm"><Q /></g>
  </svg>
);

export function Scene({ still }) {
  return (
    <svg className={'qsc' + (still ? ' still' : '')} viewBox="0 0 2000 1125" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="qsc-g1" x1="0" y1="0" x2="0" y2="140" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="var(--qi-ink2)" /><stop offset="1" stopColor="var(--qi-ink)" /></linearGradient>
        <linearGradient id="qsc-g2" x1="0" y1="900" x2="0" y2="1125" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="var(--qi-ink)" /><stop offset="1" stopColor="var(--qi-ink2)" /></linearGradient>
        <linearGradient id="qsc-sh" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".75" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id="qsc-wm">{LETTERS.flat().map(R)}</clipPath>
        <clipPath id="qsc-row"><rect x="700" y={Y0} width="1100" height={Y1 - Y0} /></clipPath>
      </defs>
      <rect className="qsc-bg" width="2000" height="1125" />
      <g className="qsc-blob b1"><path fill="url(#qsc-g1)" d="M0 -40H930C850 50 775 112 690 112C565 112 470 30 355 33C220 37 70 115 0 235Z" /></g>
      <g className="qsc-blob b2"><path fill="url(#qsc-g2)" d="M770 1165C950 990 1125 868 1322 868C1560 868 1795 1000 2040 1060V1165Z" /></g>
      <g className="qsc-lines">
        {TRACES.map((d, i) => <path key={i} d={d} pathLength="1" style={{ '--i': i }} />)}
        {RINGS.map((d, i) => <path key={'r' + i} d={d} pathLength="1" className="ring" style={{ '--i': i }} />)}
      </g>
      <g className="qsc-glint">{[0, 2, 4].map((i) => <path key={i} d={TRACES[i]} pathLength="1" style={{ '--i': i }} />)}</g>
      <g className="qsc-dots">
        {GRID.map(([x, y, row], i) => <circle key={i} cx={x} cy={y} r="6.5" style={{ '--i': row }} />)}
        {SCATTER.map(([x, y], i) => <circle key={'s' + i} cx={x} cy={y} r="8" className="sc" style={{ '--i': i }} />)}
      </g>
      <g transform="translate(220 316) scale(.4855)"><g className="qsc-mark"><Q /></g></g>
      <g clipPath="url(#qsc-row)" className="qsc-word">
        {LETTERS.map((rs, i) => <g key={i} style={{ '--i': i }}>{rs.map(R)}</g>)}
      </g>
      <g clipPath="url(#qsc-wm)"><rect className="qsc-sheen" x="560" y={Y0 - 20} width="240" height={Y1 - Y0 + 40} fill="url(#qsc-sh)" /></g>
    </svg>
  );
}

const seen = () => { try { return sessionStorage.getItem(KEY) === '1' } catch { return false } };
const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } };

export function Intro() {
  const [st, setSt] = useState(() => (seen() || calm() ? 'off' : 'in'));
  useEffect(() => {
    const replay = () => { if (!calm()) setSt('in'); };
    addEventListener('qompify:intro', replay);
    return () => removeEventListener('qompify:intro', replay);
  }, []);
  useEffect(() => {
    if (st === 'off') return;
    if (st === 'in') {
      try { sessionStorage.setItem(KEY, '1') } catch { /* úložiště nedostupné */ }
      const skip = () => setSt('out');
      const t = setTimeout(skip, HOLD);
      addEventListener('keydown', skip); addEventListener('wheel', skip, { passive: true });
      return () => { clearTimeout(t); removeEventListener('keydown', skip); removeEventListener('wheel', skip); };
    }
    const t = setTimeout(() => setSt('off'), OUT);
    return () => clearTimeout(t);
  }, [st]);
  if (st === 'off') return null;
  return (
    <div className={'qintro' + (st === 'out' ? ' out' : '')} onClick={() => setSt('out')} role="presentation">
      <Scene />
      <span className="qintro-sr" role="status">Qompify</span>
      <button className="qintro-skip" onClick={(e) => { e.stopPropagation(); setSt('out') }}>Přeskočit</button>
    </div>
  );
}

export const playIntro = () => dispatchEvent(new Event('qompify:intro'));
