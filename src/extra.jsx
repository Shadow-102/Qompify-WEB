import { useState, useEffect, useMemo } from 'react';
import BellToggle from './BellToggle.jsx';
import JellyRadio from './JellyRadio.jsx';
import { downloadBuildPdf } from './pdf.js';
import { CATS, PARTS, BY, LOOK, SPEC, GAMES, MONITORS, RES_K, showVal, perf, dn, offers, best, fmt, spec, check, power, history, deals, optimize, fpsEff, VERIFIED } from './data.js';

const LBL = Object.fromEntries(CATS);
const objs = sel => Object.fromEntries(Object.entries(sel).map(([c, id]) => [c, BY[id]]));
const selOf = ids => Object.fromEntries(ids.filter(i => BY[i]).map(i => [BY[i].cat, i]));
const dt = d => new Date(d).toLocaleDateString('cs-CZ');
export const Badge = ({ l, t }) => <li className={`badge ${l}`}><i />{t}</li>;
export const Head = ({ title, sub }) => <section className="hero slim"><h1>{title}</h1><p>{sub}</p></section>;
export function Offers({ p }) {
  const os = offers(p).slice().sort((a, b) => a.price - b.price), low = os.find(o => o.stock);
  return (
    <ul className="offers">
      {os.map(x => (
        <li key={x.n} className={!x.stock ? 'out' : x === low ? 'low' : ''}>
          <span>{x.n}</span><b>{fmt(x.price)}</b><em>{x.stock ? (x === low ? 'Nejlevnější' : 'Skladem') : 'Není skladem'}</em>
          <a href={x.url} target="_blank" rel="sponsored noopener noreferrer">Koupit</a>
        </li>
      ))}
    </ul>
  );
}

export function PriceChart({ p, w = 300, h = 96 }) {
  const hist = history(p), [hov, setHov] = useState(null), vs = hist.map(x => x.v);
  const lo = Math.min(...vs), hi = Math.max(...vs), pad = 6, n = vs.length - 1;
  const X = i => pad + (i / n) * (w - 2 * pad), Y = v => h - pad - ((v - lo) / (hi - lo || 1)) * (h - 2 * pad - 8);
  const d = vs.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  const i = hov ?? n, chg = Math.round((vs[n] / vs[0] - 1) * 100);
  const move = e => { const r = e.currentTarget.getBoundingClientRect(); setHov(Math.max(0, Math.min(n, Math.round((((e.clientX - r.left) / r.width) * w - pad) / (w - 2 * pad) * n)))); };
  return (
    <div className="pchart">
      <svg viewBox={`0 0 ${w} ${h}`} onMouseMove={move} onMouseLeave={() => setHov(null)} role="img" aria-label="Vývoj ceny za 90 dní">
        <path d={`${d}L${X(n)},${h}L${X(0)},${h}Z`} className="area" /><path d={d} className="line" /><circle cx={X(i)} cy={Y(vs[i])} r="4" />
      </svg>
      <small>{dt(hist[i].d)}: <b>{fmt(vs[i])}</b> · min {fmt(lo)} · max {fmt(hi)} · za 90 dní {chg > 0 ? '+' : ''}{chg} %</small>
    </div>
  );
}

function AlertBox({ p, alerts, setAlert }) {
  const a = alerts[p.id], cur = best(p).price, [v, setV] = useState(Math.round((cur * 0.93) / 10) * 10);
  return (
    <div className="alert">
      {!a && <input type="number" step="10" min="100" value={v} onChange={e => setV(+e.target.value)} aria-label="Cílová cena v Kč" />}
      <BellToggle offLabel="Upozorni mě" onLabel="Cenu hlídáme" label={`Hlídat cenu: ${dn(p)}`} color="#F3EBDD" background="#0b0f19" onColor="#ffffff" onBackground="#3B66F5" size="sm" radius={18} badge={false} pressed={!!a} onChange={on => setAlert(p.id, on ? v : null)} />
      {a && <span>do {fmt(a.target)}{cur <= a.target ? ' · cíl splněn' : ''}</span>}
    </div>
  );
}

export function CompareTable({ ids, sel, add, say, alerts, setAlert, done }) {
  const ps = ids.map(i => LOOK[i]), cat = ps[0].cat, rows = SPEC[cat] || MON_ROWS, o = objs(sel), cur = o[cat], multi = ps.length > 1, isPart = !!BY[ps[0].id];
  const win = (k, d) => { if (!d || !multi) return -1; const v = ps.map(p => p[k]); if (v.some(x => typeof x !== 'number') || new Set(v).size === 1) return -1; return v.indexOf(d > 0 ? Math.max(...v) : Math.min(...v)); };
  const info = ps.map(p => { const res = isPart ? check({ ...o, [cat]: p }) : [], pr = best(p).price, pf = perf(p); return { p, pr, pf, vpm: pf ? (pf / pr) * 1000 : 0, bad: res.filter(r => r.l === 'bad'), warn: res.filter(r => r.l === 'warn') }; });
  const top = (f, hi) => info.reduce((x, y) => ((hi ? f(y) > f(x) : f(y) < f(x)) ? y : x));
  const cheap = top(i => i.pr, false), fast = info.some(i => i.pf) ? top(i => i.pf, true) : null, val = info.some(i => i.vpm) ? top(i => i.vpm, true) : null;
  const mine = Object.keys(sel).length;
  return (
    <>
      {multi && <ul className="verdict"><li>Nejlevnější: <b>{dn(cheap.p)}</b></li>{fast && <li>Nejvyšší výkon: <b>{dn(fast.p)}</b></li>}{val && <li>Nejlepší cena/výkon: <b>{dn(val.p)}</b></li>}</ul>}
      <div className="tw"><table>
        <thead><tr><th />{info.map(i => <th key={i.p.id}>{dn(i.p)}<small>{i.p.v ? 'Ověřená cena (CZ e-shopy, 10/2026)' : 'Orientační cena'}</small></th>)}</tr></thead>
        <tbody>
          <tr><td>Nejnižší cena</td>{info.map(i => <td key={i.p.id} className={multi && i === cheap ? 'win' : ''}><b>{fmt(i.pr)}</b></td>)}</tr>
          {rows.map(([k, l, u, d]) => { const w = win(k, d); return <tr key={k}><td>{l}</td>{ps.map((p, j) => <td key={p.id} className={w === j ? 'win' : ''}>{showVal(p[k], u)}</td>)}</tr>; })}
          {isPart && <tr className="for"><td>Pro tvou sestavu</td>{info.map(i => (
            <td key={i.p.id}>
              {i.bad.length ? <span className="bad">Nekompatibilní: {i.bad.map(b => b.t).join('; ')}</span> : i.warn.length ? <span>Sedí, ale: {i.warn.map(b => b.t).join('; ')}</span> : <span>{mine ? 'Sedí do tvé sestavy.' : 'Sestava je zatím prázdná, nic k ověření.'}</span>}
              {cur && cur.id !== i.p.id && <small>{i.pr - best(cur).price >= 0 ? '+' : ''}{fmt(i.pr - best(cur).price)} oproti {dn(cur)}{i.pf && perf(cur) ? `, výkon ${i.pf >= perf(cur) ? '+' : ''}${Math.round((i.pf / perf(cur) - 1) * 100)} %` : ''}</small>}
            </td>))}</tr>}
          <tr><td>Vývoj ceny (90 dní)</td>{ps.map(p => <td key={p.id}><PriceChart p={p} w={260} h={84} /></td>)}</tr>
          <tr><td>Hlídat cenu</td>{ps.map(p => <td key={p.id}><AlertBox p={p} alerts={alerts} setAlert={setAlert} /></td>)}</tr>
          <tr><td>Ceny v obchodech</td>{ps.map(p => <td key={p.id}><Offers p={p} /></td>)}</tr>
          {isPart && <tr><td />{ps.map(p => <td key={p.id}><button className="btn" onClick={() => { add(p.id); say(`${p.name} přidán do stavitele`); done?.(); }}>Do sestavy</button></td>)}</tr>}
        </tbody>
      </table></div>
    </>
  );
}
const MON_ROWS = [['size','Úhlopříčka','"',0],['res','Rozlišení'],['panel','Panel'],['hz','Frekvence','Hz',1],['ms','Odezva','ms',-1],['hdr','HDR','yn']];

export function Compare({ ids, onClose, ...rest }) {
  useEffect(() => { const f = e => e.key === 'Escape' && onClose(); addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, [onClose]);
  return (
    <div className="mwrap" role="dialog" aria-label="Detail a porovnání">
      <div className="scrim" onClick={onClose} />
      <div className="modal">
        <header><h2>{ids.length > 1 ? `Porovnání: ${LBL[LOOK[ids[0]].cat]}` : 'Detail dílu'}</h2><button className="ghost" onClick={onClose}>Zavřít</button></header>
        <CompareTable ids={ids} done={onClose} {...rest} />
      </div>
    </div>
  );
}

export function ComparePage({ sel, add, say, alerts, setAlert }) {
  const [cat, setCat] = useState('cpu'), [ids, setIds] = useState([]), [q, setQ] = useState('');
  const list = PARTS.filter(p => p.cat === cat && dn(p).toLowerCase().includes(q.toLowerCase())).sort((a, b) => best(a).price - best(b).price);
  const tog = id => setIds(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id].slice(-4)));
  return (
    <>
      <Head title="Porovnání dílů do detailu" sub="Vyber kategorii a až čtyři díly. Uvidíš všechny parametry vedle sebe, vývoj ceny a to, jak díl sedí do tvé sestavy." />
      <section className="card filters">
        <div className="chips">{CATS.map(([c, l]) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => { setCat(c); setIds([]); }}>{l}</button>)}</div>
        <label className="frow">Hledat<input value={q} onChange={e => setQ(e.target.value)} placeholder="např. Ryzen, RTX, Samsung" /></label>
        <div className="picklist">{list.map(p => <button key={p.id} data-part={p.id} className={ids.includes(p.id) ? 'on' : ''} onClick={() => tog(p.id)}><b>{dn(p)}</b><small>{spec(p)}</small><span>{fmt(best(p).price)}</span></button>)}</div>
      </section>
      <section className="card cpage">{ids.length ? <CompareTable ids={ids} sel={sel} add={add} say={say} alerts={alerts} setAlert={setAlert} /> : <p className="muted">Vyber alespoň jeden díl. Pro porovnání zvol dva až čtyři.</p>}</section>
    </>
  );
}

export function PdfBtn({ title, ids, className = 'ghost' }) {
  const [busy, setBusy] = useState(false);
  return <button className={className} disabled={busy} onClick={async () => { setBusy(true); try { await downloadBuildPdf(title, ids); } finally { setBusy(false); } }}>{busy ? 'Připravuji PDF…' : 'Stáhnout PDF'}</button>;
}

export function Shards() {
  return (
    <svg className="shards" viewBox="0 0 420 300" aria-hidden="true">
      <defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#cdeef5" /><stop offset="1" stopColor="#62b6cb" /></linearGradient></defs>
      <g fill="none" stroke="url(#gl)" strokeWidth="1.4" strokeLinejoin="round">
        <path pathLength="1" d="M210 12 L300 120 L250 290 L150 290 L110 130 Z" />
        <path pathLength="1" d="M210 12 L250 290 M210 12 L150 290 M110 130 L300 120" />
        <path pathLength="1" d="M300 120 L400 190 L330 260 L250 290" />
        <path pathLength="1" d="M110 130 L20 200 L80 270 L150 290" />
      </g>
    </svg>
  );
}

export function DealsBar({ ui }) {
  const items = useMemo(() => {
    const ver = VERIFIED.map(v => ({ p: LOOK[v.id], pr: v.price, shop: v.shop, v })), seen = new Set(ver.map(x => x.p.id));
    const drops = deals().filter(d => !seen.has(d.p.id)).slice(0, 7).map(d => ({ p: d.p, pr: d.pr, shop: d.shop, pct: d.pct }));
    return [...ver, ...drops];
  }, []);
  return (
    <section className="deals" aria-label="Nejlepší nabídky">
      <div className="dh"><h2>Nejlepší nabídky právě teď</h2><small>Najeď na kartu pro parametry dílu. Značka „Ověřeno“ znamená cenu ověřenou v e-shopu nebo v článku se zdrojem.</small></div>
      <div className="strip">
        {items.map(d => (
          <article className="deal" key={d.p.id} data-part={d.p.id} data-note={d.v ? d.v.note : `Cena je o ${d.pct} % níž než průměr za posledních 30 dní (model vývoje cen).`} tabIndex={0}>
            <small>{d.p.cat === 'monitor' ? 'Monitor' : LBL[d.p.cat]}</small><b>{dn(d.p)}</b>
            <div><span className={d.v ? 'chip ok' : 'pct'}>{d.v ? 'Ověřeno' : `−${d.pct} %`}</span><span className="dp">{fmt(d.pr)}</span></div>
            <small>{d.shop}{d.v ? ` · ${d.v.date}` : ' · proti 30denní historii'}</small>
            <div className="dact"><button onClick={() => ui.show([d.p.id])}>Detail a cena</button>{d.v && <a href={d.v.src} target="_blank" rel="noopener noreferrer">Zdroj</a>}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HoverLayer() {
  const [h, setH] = useState(null);
  useEffect(() => {
    let t;
    const over = e => { const el = e.target.closest?.('[data-part]'); if (!el) return; clearTimeout(t); const r = el.getBoundingClientRect(); setH(s => (s && s.id === el.dataset.part && s.t === r.top && s.l === r.left ? s : { id: el.dataset.part, l: r.left, t: r.top, b: r.bottom, note: el.dataset.note || '' })); };
    const out = e => { if (e.target.closest?.('[data-part]')) { clearTimeout(t); t = setTimeout(() => setH(null), 90); } };
    const hide = () => setH(null);
    document.addEventListener('mouseover', over); document.addEventListener('mouseout', out); document.addEventListener('focusin', over); document.addEventListener('focusout', out);
    addEventListener('scroll', hide, true); addEventListener('keydown', hide);
    return () => { clearTimeout(t); document.removeEventListener('mouseover', over); document.removeEventListener('mouseout', out); document.removeEventListener('focusin', over); document.removeEventListener('focusout', out); removeEventListener('scroll', hide, true); removeEventListener('keydown', hide); };
  }, []);
  const p = h && LOOK[h.id]; if (!p) return null;
  const rows = (SPEC[p.cat] || MON_ROWS).filter(r => r[0] !== 'sc').slice(0, 9), W = 340, left = Math.max(8, Math.min(h.l, innerWidth - W - 8)), below = h.b + 400 < innerHeight || h.t < 420;
  const b = best(p);
  return (
    <div className="hcard" role="tooltip" style={{ left, top: below ? h.b + 8 : h.t - 8, width: W, transform: below ? 'none' : 'translateY(-100%)' }}>
      <b>{dn(p)}</b><small>{p.cat === 'monitor' ? 'Monitor' : LBL[p.cat]} · {p.v ? 'ověřená cena' : 'orientační cena'}</small>
      <dl>{rows.map(([k, l, u]) => <div key={k}><dt>{l}</dt><dd>{showVal(p[k], u)}</dd></div>)}</dl>
      <div className="hp"><b>{fmt(b.price)}</b><span>{b.n}</span></div>
      <PriceChart p={p} w={300} h={52} />
      {h.note && <p className="hn">{h.note}</p>}
      <small>Klikni pro detail a porovnání cen.</small>
    </div>
  );
}

const parseAsk = s => {
  const m = s.replace(/\s/g, '').match(/(\d+(?:[.,]\d+)?)(k(?!č)|tis)?/i), t = s.toLowerCase();
  let n = m ? parseFloat(m[1].replace(',', '.')) : 0; if ((m && m[2]) || n < 1000) n *= 1000;
  return { n, use: /kancel|office|škol|učeb/.test(t) ? 'office' : /prac|tvor|střih|render|video|work|3d|program/.test(t) ? 'work' : 'gaming', brand: /intel/.test(t) ? 'Intel' : /amd|ryzen/.test(t) ? 'AMD' : '' };
};
const USE = { gaming: 'hraní', work: 'práci a tvorbu', office: 'kancelář' };
export function Optimizer({ go, save }) {
  const [txt, setTxt] = useState('35 000 Kč, gaming'), [r, setR] = useState(null);
  const run = t => { const a = parseAsk(t); setR({ a, ...optimize(a.n, a.use, a.brand) }); };
  useEffect(() => run('35 000 Kč, gaming'), []);
  return (
    <>
      <Head title="Sestava na míru podle rozpočtu" sub="Napiš částku a k čemu PC chceš, třeba „35 000 Kč, gaming“. Qompify projde všechny kompatibilní kombinace a vybere nejvýkonnější." />
      <section className="card filters">
        <form className="ask" onSubmit={e => { e.preventDefault(); run(txt); }}>
          <input value={txt} onChange={e => setTxt(e.target.value)} aria-label="Rozpočet a účel" placeholder="35 000 Kč, gaming" /><button className="btn">Najít sestavu</button>
        </form>
        <div className="chips">{['25 000 Kč, gaming', '35 000 Kč, gaming', '45 000 Kč, Intel gaming', '50 000 Kč, tvorba videa', '25 000 Kč, kancelář'].map(t => <button key={t} onClick={() => { setTxt(t); run(t); }}>{t}</button>)}</div>
      </section>
      {r && <p className="count">Rozpočet {fmt(r.a.n)} · {USE[r.a.use]}{r.a.brand ? ` · ${r.a.brand}` : ''}</p>}
      <div className="tiers">
        {r && !r.list.length && <div className="card empty">Za tuto částku se nepodařilo sestavit kompatibilní PC. Nejlevnější možná sestava vychází asi na {fmt(r.min)}.</div>}
        {r && r.list.map((x, i) => {
          const sel = Object.fromEntries(Object.entries(x.o).map(([c, p]) => [c, p.id])), res = check(x.o), g = x.o.gpu;
          return (
            <article className="card tier" key={i}>
              <header><h2>{i ? `Alternativa ${i}` : 'Nejlepší volba'}</h2><b>{fmt(x.tot)}</b></header>
              <p className="muted">Zbývá {fmt(r.a.n - x.tot)} z rozpočtu</p>
              <ul className="parts">{CATS.filter(([c]) => x.o[c]).map(([c, l]) => <li key={c}><span>{l}</span><span data-part={x.o[c].id}>{dn(x.o[c])}</span><b>{fmt(best(x.o[c]).price)}</b></li>)}</ul>
              {g && <p className="muted">{[0, 7, 8].map(k => `${GAMES[k][0]} ${fpsEff(g, x.o.cpu, GAMES[k][2])} FPS`).join(' · ')}</p>}
              <ul className="badges inline">{res.filter(b => b.l !== 'ok').slice(0, 2).map((b, j) => <Badge key={j} {...b} />)}{res.every(b => b.l === 'ok') && <Badge l="ok" t="Vše kompatibilní a vyvážené" />}</ul>
              <div className="actions"><button className="btn" onClick={() => go('builder', Object.values(sel).join(','))}>Upravit ve stavitelu</button><button className="ghost" onClick={() => save(`Na míru ${fmt(r.a.n)}`, sel)}>Uložit</button><PdfBtn title={`Na míru ${fmt(r.a.n)}`} ids={Object.values(sel)} /></div>
            </article>
          );
        })}
      </div>
    </>
  );
}

const PAN = { 'QD-OLED': 'oled', 'QD-OLED zakřivený': 'oled', 'IPS Black': 'ips', 'Fast IPS': 'ips', IPS: 'ips', VA: 'va' };
const RESPTS = { FHD: 1, QHD: 1.8, UWQHD: 2.2, '4K': 3.2 };
const Prose = ({ children }) => <div className="prose">{children}</div>;
const PANELS = {
  IPS: { txt: 'IPS je univerzální volba: věrné barvy, široké úhly a rozumná cena. Černá je spíš šedá a kontrast průměrný, rychlé varianty (Fast IPS) ale zvládají i esport.', v: [['Barvy', 8], ['Kontrast', 4], ['Odezva', 7], ['Pozorovací úhly', 9], ['Jas', 7], ['Odolnost proti vypálení', 10], ['Cena (vyšší = dražší)', 5]] },
  VA: { txt: 'VA nabídne hlubokou černou a vysoký kontrast za nízkou cenu, ideální na tmavé hry a filmy. Slabinou jsou pomalejší přechody tmavých odstínů a užší úhly.', v: [['Barvy', 6], ['Kontrast', 8], ['Odezva', 5], ['Pozorovací úhly', 5], ['Jas', 6], ['Odolnost proti vypálení', 10], ['Cena (vyšší = dražší)', 3]] },
  OLED: { txt: 'OLED má dokonalou černou, téměř nulovou odezvu a výborné barvy. Počítej s dražší cenou, nižším jasem na celé ploše a rizikem vypálení při dlouho statickém obrazu.', v: [['Barvy', 10], ['Kontrast', 10], ['Odezva', 10], ['Pozorovací úhly', 9], ['Jas', 6], ['Odolnost proti vypálení', 5], ['Cena (vyšší = dražší)', 8]] },
};
function PanelPicker() {
  const [k, setK] = useState('IPS'), P = PANELS[k];
  return (
    <section className="card art">
      <h2>Panely v praxi</h2>
      <JellyRadio items={Object.keys(PANELS).map(x => ({ value: x, label: x }))} value={k} onChange={setK} ariaLabel="Typ panelu" chipColor="#E5D9C5" activeColor="#3B66F5" textColor="#0b0f19" activeTextColor="#ffffff" />
      <ul className="pbars">{P.v.map(([l, v]) => <li key={l}><span>{l}</span><i><b style={{ '--w': `${v * 10}%` }} /></i><em>{v}/10</em></li>)}</ul>
      <p className="muted">{P.txt} Hodnoty jsou naše zjednodušené hodnocení typického panelu, ne měření konkrétního modelu.</p>
    </section>
  );
}
const RESPX = { FHD: [1920, 1080], QHD: [2560, 1440], UWQHD: [3440, 1440], '4K': [3840, 2160] };
function PpiCalc() {
  const [sz, setSz] = useState(27), [r, setR] = useState('QHD'), ppi = Math.round(Math.hypot(...RESPX[r]) / sz), cm = Math.round((3438 / ppi) * 2.54);
  const lab = ppi < 90 ? 'hrubší obraz' : ppi < 120 ? 'dobrá ostrost' : ppi < 160 ? 'velmi jemný obraz' : 'téměř tiskově ostrý';
  return (
    <section className="card art">
      <h2>Spočítej si ostrost obrazu</h2>
      <div className="frow"><label>Úhlopříčka: {sz}"<input type="range" min="21" max="49" value={sz} onChange={e => setSz(+e.target.value)} /></label>
        <label>Rozlišení<select value={r} onChange={e => setR(e.target.value)}><option value="FHD">1920×1080 (FHD)</option><option value="QHD">2560×1440 (QHD)</option><option value="UWQHD">3440×1440 (ultrawide)</option><option value="4K">3840×2160 (4K)</option></select></label></div>
      <div className="ppi"><div><b>{ppi}</b><small>pixelů na palec (PPI)</small></div><div><b>{cm} cm</b><small>odtud už pixely nerozeznáš</small></div><div><b>{lab}</b><small>hodnocení</small></div></div>
      <i className="gauge"><b style={{ '--w': `${Math.min(100, Math.max(5, ((ppi - 60) / 140) * 100))}%` }} /></i>
    </section>
  );
}
function MotionDemo() {
  const rows = [[60, '60 Hz', '16,7 ms'], [144, '144 Hz', '6,9 ms'], [240, '240 Hz', '4,2 ms']];
  return (
    <section className="card art">
      <h2>Jak se liší plynulost při 60, 144 a 240 Hz</h2>
      <div className="mrows">{rows.map(([hz, l, ms]) => <div key={hz} className="mrow"><span>{l}<small>{ms} na snímek</small></span><i className="mtrack"><b className="ball" style={{ '--steps': Math.round(hz / 6) }} /></i></div>)}</div>
      <p className="muted">Kulička urazí stejnou dráhu za stejný čas, ale počet zobrazených pozic odpovídá frekvenci. Je to zvýrazněná ilustrace: tvůj monitor ukazuje pořád jen svých vlastních Hz.</p>
    </section>
  );
}
function MonitorArticle() {
  const gpus = PARTS.filter(p => p.cat === 'gpu'), [gid, setGid] = useState('rtx5060ti-16'), [gi, setGi] = useState(0), [rf, setRf] = useState('all'), [use, setUse] = useState('gaming');
  const [pick, setPick] = useState(null), [open, setOpen] = useState(null), gpu = BY[gid];
  const fps = res => Math.round(gpu.sc * GAMES[gi][2] * RES_K[res]);
  const bars = ['FHD', 'QHD', 'UWQHD', '4K'].map(r => ({ r, v: fps(r) })), maxF = Math.max(...bars.map(b => b.v), 150);
  const okRes = [...bars].reverse().find(b => b.v >= 90) || bars.find(b => b.v >= 60) || bars[0], rn = r => (r === 'UWQHD' ? '3440×1440' : r);
  const pts = MONITORS.filter(m => rf === 'all' || m.res === rf);
  const val = m => (RESPTS[m.res] * m.hz * (PAN[m.panel] === 'oled' ? 1.4 : 1)) / best(m).price * 1000;
  const list = MONITORS.filter(m => m.tags.includes(use)).sort((a, b) => val(b) - val(a));
  const W = 640, H = 300, px = v => 50 + (v / 23000) * (W - 70), py = v => H - 34 - ((v - 40) / 260) * (H - 54);
  const cheapOled = MONITORS.filter(m => PAN[m.panel] === 'oled').sort((a, b) => best(a).price - best(b).price)[0];
  const m0 = [...MONITORS].sort((a, b) => val(b) - val(a))[0], budget = MONITORS.filter(m => m.hz >= 144 && m.res === 'QHD').sort((a, b) => best(a).price - best(b).price)[0];
  const sm = MONITORS.find(m => m.id === pick);
  return (
    <>
      <header className="ahead"><small>Průvodce · aktualizováno 30. 10. 2026</small><h1>Jaký monitor koupit v roce 2026</h1>
        <p className="lede">Monitor držíš před očima několik hodin denně, přesto se často vybírá podle jednoho čísla na krabici. Projdeme krok za krokem, co které číslo znamená, a ukážeme to na grafech, které si můžeš sám přepínat.</p></header>
      <Prose><h2>Nejdřív grafika, potom monitor</h2>
        <p>Monitor má smysl jen tak dobrý, jak ho dokáže nakrmit grafická karta. 4K monitor s 240 Hz je zbytečný, když karta dává v tvých hrách 70 FPS. Proto začni výběrem karty a hry, ty tvoje.</p></Prose>
      <section className="card art">
        <h2>Co utáhne tvoje grafika</h2>
        <div className="frow"><label>Grafická karta<select value={gid} onChange={e => setGid(e.target.value)}>{gpus.map(g => <option key={g.id} value={g.id}>{dn(g)}</option>)}</select></label>
          <label>Hra<select value={gi} onChange={e => setGi(+e.target.value)}>{GAMES.map((g, i) => <option key={g[0]} value={i}>{g[0]}</option>)}</select></label></div>
        <svg className="bars" viewBox="0 0 640 210" role="img" aria-label="Odhad FPS podle rozlišení">
          {[60, 144, 240].filter(v => v < maxF * 1.1).map(v => <g key={v}><line x1="90" x2="630" y1={190 - (v / maxF) * 170} y2={190 - (v / maxF) * 170} className="grid" /><text x="84" y={194 - (v / maxF) * 170} textAnchor="end">{v}</text></g>)}
          {bars.map((b, i) => <g key={b.r}><rect x={110 + i * 130} y={190 - (b.v / maxF) * 170} width="80" height={(b.v / maxF) * 170} rx="8" className={b === okRes ? 'sbar on' : 'sbar'} /><text x={150 + i * 130} y={184 - (b.v / maxF) * 170} textAnchor="middle" className="val">{b.v}</text><text x={150 + i * 130} y="206" textAnchor="middle">{rn(b.r)}</text></g>)}
        </svg>
        <p className="muted">{dn(gpu)} v {GAMES[gi][0]}: nejvyšší rozlišení, které drží aspoň 90 FPS, je <b>{rn(okRes.r)}</b> ({okRes.v} FPS). Hledej monitor kolem {Math.min(360, Math.round(okRes.v / 20) * 20)} Hz.</p>
      </section>
      <Prose><h2>Rozlišení a ostrost</h2>
        <p>Rozlišení samo o sobě neříká, jak ostrý obraz uvidíš. Rozhoduje poměr počtu pixelů a velikosti panelu, tedy hustota pixelů (PPI). Na 27" je QHD zlatý střed, FHD už je vidět jako zrnitý a 4K se vyplatí od 32" nebo pro tvorbu.</p></Prose>
      <PpiCalc />
      <Prose><h2>Obnovovací frekvence a plynulost</h2>
        <p>Každý další skok frekvence přináší menší zlepšení: z 60 na 144 Hz je rozdíl velký, ze 144 na 240 Hz už jemnější. Smysl mají jen tolik hertzů, kolik FPS ti grafika skutečně dá.</p></Prose>
      <MotionDemo />
      <Prose><h2>Panel mění všechno ostatní</h2>
        <p>Typ panelu určuje kontrast, odezvu i barvy. Vyber si typ a podívej se, v čem je silný a co obětuje.</p></Prose>
      <PanelPicker />
      <Prose><h2>Kolik za to zaplatit</h2>
        <p>Nejlevnější monitory s vysokou frekvencí stojí dnes pár tisíc, OLED začíná kolem 12 tisíc. Graf ukazuje každý monitor jako bod: čím výš a víc vlevo, tím výhodnější. Klikni na bod pro parametry.</p></Prose>
      <section className="card art">
        <h2>Cena a frekvence</h2>
        <div className="chips">{['all', 'FHD', 'QHD', '4K'].map(r => <button key={r} className={rf === r ? 'on' : ''} onClick={() => setRf(r)}>{r === 'all' ? 'Všechna rozlišení' : r}</button>)}</div>
        <svg className="scatter" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cena a frekvence monitorů">
          {[60, 120, 180, 240, 300].map(v => <g key={v}><line x1="50" x2={W - 20} y1={py(v)} y2={py(v)} className="grid" /><text x="44" y={py(v) + 4} textAnchor="end">{v} Hz</text></g>)}
          {[0, 5000, 10000, 15000, 20000].map(v => <text key={v} x={px(v)} y={H - 12} textAnchor="middle">{v / 1000} tis.</text>)}
          {pts.map(m => <circle key={m.id} cx={px(best(m).price)} cy={py(m.hz)} r={m.size > 27 ? 11 : 8} className={`pt ${PAN[m.panel]}${pick === m.id ? ' sel' : ''}`} onClick={() => setPick(m.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setPick(m.id)}><title>{dn(m)}</title></circle>)}
        </svg>
        <p className="legend"><i className="ips" /> IPS <i className="va" /> VA <i className="oled" /> OLED. Větší kruh je 32".</p>
        <p className="muted">{sm ? <><b>{dn(sm)}</b>: {sm.size}" {sm.res} {sm.panel}, {sm.hz} Hz, {sm.ms} ms, {fmt(best(sm).price)}</> : 'Klikni na bod pro detail monitoru.'}</p>
      </section>
      <Prose><h2>Naše doporučení</h2>
        <p>Vyber účel a seznam se seřadí podle poměru cena a výkon. Pod každým monitorem uvidíš, jestli ho tvoje vybraná grafika utáhne naplno. Najetím myši zobrazíš parametry, kliknutím na „Ceny a vývoj“ porovnáš obchody.</p></Prose>
      <section className="card art">
        <div className="chips">{[['gaming', 'Hraní'], ['esport', 'Esport'], ['work', 'Tvorba a práce'], ['office', 'Kancelář']].map(([k, l]) => <button key={k} className={use === k ? 'on' : ''} onClick={() => setUse(k)}>{l}</button>)}</div>
        <ul className="mons">
          {list.map((m, i) => { const f = Math.round(gpu.sc * GAMES[gi][2] * RES_K[m.res]); return (
            <li key={m.id}>
              <div className="mh"><span className="rank">{i + 1}</span><div data-part={m.id}><b>{dn(m)}</b><small>{m.size}" · {m.res} · {m.panel} · {m.hz} Hz · {m.ms} ms{m.hdr ? ' · HDR' : ''}</small></div><div className="mp"><b>{fmt(best(m).price)}</b><small>{m.v ? 'ověřená akční cena' : 'odhad ceny'}</small></div></div>
              <p className="muted">{use === 'office' || use === 'work' ? 'Dobrý obraz pro dlouhou práci.' : f >= m.hz * 0.8 ? `Tvoje ${dn(gpu)} utáhne přibližně plných ${m.hz} Hz.` : f >= 60 ? `Tvoje grafika dá asi ${f} FPS z ${m.hz} Hz, frekvenci nevyužiješ celou.` : 'Pro tvou grafiku je to příliš náročné rozlišení.'}</p>
              <div className="actions"><button className="ghost" onClick={() => setOpen(open === m.id ? null : m.id)}>{open === m.id ? 'Skrýt ceny' : 'Ceny a vývoj'}</button></div>
              {open === m.id && <div className="mx"><Offers p={m} /><PriceChart p={m} w={420} h={96} /></div>}
            </li>); })}
        </ul>
        <ul className="verdict"><li>Nejlepší poměr cena/výkon: <b>{dn(m0)}</b> ({fmt(best(m0).price)})</li><li>Levný start do 144+ Hz QHD: <b>{dn(budget)}</b> ({fmt(best(budget).price)})</li><li>Nejlevnější OLED: <b>{dn(cheapOled)}</b> ({fmt(best(cheapOled).price)})</li></ul>
        <p className="muted">Akční ceny jsou často vázané na slevové kódy a po čase se vrací výš. Před koupí je ověř. Pro 4K při 240 Hz potřebuješ grafiku třídy RTX 5080 a výš.</p>
      </section>
      <Prose><h2>Slovníček parametrů</h2><p>Co přesně znamenají čísla v tabulkách a na krabicích:</p></Prose>
      <section className="card art"><Glossary items={MON_GLOSS} /></section>
    </>
  );
}

const Glossary = ({ items }) => <dl className="gloss">{items.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>;
const MON_GLOSS = [
  ['Rozlišení', 'Počet pixelů: FHD je 1920×1080, QHD 2560×1440, 4K 3840×2160. Víc pixelů znamená ostřejší obraz, ale grafika musí vykreslit víc práce. 4K je zhruba 2,25× náročnější než QHD a QHD 1,8× náročnější než FHD.'],
  ['Úhlopříčka a PPI', 'Hustota pixelů (PPI) říká, jak jemný je obraz. 24" FHD má asi 92 PPI, 27" QHD asi 109 PPI, 32" 4K asi 138 PPI a 27" 4K asi 163 PPI. Pro 27" je QHD zlatý střed, 4K se vyplatí od 32" nebo na tvorbu.'],
  ['Obnovovací frekvence (Hz)', 'Kolikrát za sekundu se obraz překreslí. 60 Hz stačí na kancelář, 144 až 180 Hz je znatelně plynulé hraní, 240 Hz a víc dává smysl hlavně v esportu. Frekvenci využiješ jen tehdy, když grafika dává tolik FPS.'],
  ['Odezva (ms)', 'Za jak dlouho pixel změní barvu. Čím nižší, tím méně šmouh za pohybem. OLED má kolem 0,03 ms, rychlé IPS 0,5 až 1 ms, běžná VA bývá pomalejší. Výrobci měří různě, proto jde o orientační číslo.'],
  ['Typ panelu: IPS', 'Věrné barvy a široké pozorovací úhly. Černá bývá spíš šedá a kontrast kolem 1000:1. Fast IPS je rychlejší varianta pro hráče. Dobrá volba na práci i hry.'],
  ['Typ panelu: VA', 'Hlubší černá a vyšší kontrast (často 3000:1 a víc), obvykle nižší cena. Slabinou bývají pomalejší přechody tmavých barev a užší úhly.'],
  ['Typ panelu: OLED a QD-OLED', 'Každý pixel svítí sám, takže je černá dokonalá a odezva téměř nulová. Cenou je riziko vypálení při dlouho statickém obrazu, nižší jas na celé ploše a lesklý povrch. QD-OLED přidává kvantové tečky pro sytější barvy.'],
  ['HDR a jas (cd/m²)', 'HDR rozšiřuje rozdíl mezi nejtmavším a nejsvětlejším. Smysl má jen s vysokým špičkovým jasem a dobrým kontrastem. Levné „HDR“ bez lokálního stmívání obraz spíš zhorší. Hledej DisplayHDR 600 a víc nebo OLED.'],
  ['Adaptive-Sync (FreeSync, G-Sync Compatible)', 'Monitor mění frekvenci podle FPS, takže zmizí trhání obrazu bez zpoždění, které přidává klasická vertikální synchronizace. Dnes ho má skoro každý herní monitor.'],
  ['Rozhraní: DisplayPort a HDMI', 'DisplayPort zvládne vyšší frekvence při vyšším rozlišení než starší HDMI. U některých monitorů je například QHD při 180 Hz možné jen přes DisplayPort, přes HDMI jen 144 Hz. DisplayPort 2.1 přenese 4K při 240 Hz bez komprese, DisplayPort 1.4 to zvládne s kompresí DSC.'],
  ['Barevný gamut a ΔE', 'Pokrytí sRGB (web) a DCI-P3 (video, HDR) udává, kolik barev panel zobrazí. Pro tvorbu hledej 99 % sRGB a tovární kalibraci s ΔE pod 2. Pro hry a běžnou práci stačí běžné pokrytí.'],
  ['Zakřivení a poměr stran', 'Zakřivení (například 1000R nebo 1500R) obalí obraz kolem tebe, hodí se u širokých monitorů. Ultrawide 21:9 nebo 32:9 přidá šířku, ale některé hry s ním nepočítají.'],
];
const PART_GLOSS = [
  ['Jádra a vlákna (CPU)', 'Jádro je samostatná výpočetní jednotka, vlákno umožní jádru zpracovat dvě úlohy najednou. Hry využijí 6 až 8 rychlých jader, střih videa nebo renderování i 16 a víc.'],
  ['Takt a boost (GHz)', 'Základní takt je výchozí rychlost, boost krátkodobé maximum při zátěži. Vyšší číslo je lepší jen v rámci stejné architektury, nelze porovnávat AMD s Intelem jen podle GHz.'],
  ['L3 cache a 3D V-Cache', 'Rychlá paměť přímo u procesoru. Modely X3D mají extra cache navíc a v hrách patří k nejrychlejším.'],
  ['TDP a skutečný příkon', 'TDP je orientační chladicí požadavek, ne přesná spotřeba. Qompify počítá s příkonem procesoru a grafiky plus 90 W na zbytek a k tomu přidá rezervu 30 % pro doporučený zdroj.'],
  ['Socket a čipset', 'Socket (AM4, AM5, LGA1700, LGA1851) musí odpovídat desce. Čipset (B650, B760, Z890…) určuje počet M.2 slotů, přetaktování a výbavu desky.'],
  ['VRAM a typ paměti (GPU)', 'Paměť grafiky pro textury. 8 GB je dnes minimum pro Full HD, 12 až 16 GB je rozumné pro QHD a 4K. GDDR7 je rychlejší než GDDR6.'],
  ['Sběrnice a šířka pásma', 'Šířka paměťové sběrnice v bitech (128, 192, 256, 512) spolu s typem paměti určuje propustnost. Úzká sběrnice u levnějších karet zpomaluje 4K.'],
  ['TBP (příkon grafiky)', 'Celkový příkon karty při zátěži. Určuje velikost zdroje i počet napájecích konektorů (8-pin nebo 12V-2x6).'],
  ['PCIe generace', 'Rychlost propojení karty nebo SSD se základní deskou. Každá generace zdvojnásobuje propustnost, ale pro většinu her nehraje roli. U SSD je znát při kopírování velkých souborů.'],
  ['Ray tracing, DLSS a FSR', 'Ray tracing počítá realistické světlo, ale ubírá FPS. DLSS (NVIDIA) a FSR (AMD) vykreslí hru v nižším rozlišení a chytře ji zvětší, takže FPS vzroste.'],
  ['DDR4 a DDR5', 'Dva nekompatibilní typy paměti: deska podporuje vždy jen jeden z nich. DDR5 je novější a rychlejší, DDR4 zůstává levnější volbou pro starší platformy.'],
  ['Frekvence (MT/s) a latence CL', 'Vyšší MT/s zvyšuje propustnost, nižší CL zkracuje čekání. Skutečná latence v ns je CL ÷ MT/s × 2000, takže DDR5-6000 CL30 je rychlejší než 6000 CL36.'],
  ['Sada 2×16 a profil EXPO/XMP', 'Dva moduly běží v dual-channel, což je rychlejší než jeden velký. Profil EXPO (AMD) nebo XMP (Intel) je potřeba zapnout v BIOSu, jinak paměť běží pomaleji.'],
  ['TBW, DRAM a HMB (SSD)', 'TBW je celkový objem dat, který lze na disk zapsat za jeho život. DRAM cache zrychluje práci disku, levnější modely místo ní používají část paměti počítače (HMB).'],
  ['80+ účinnost a ATX 3.x (zdroj)', '80+ Bronze, Gold, Platinum říká, kolik energie zdroj promění v teplo. Gold je dobrá volba. ATX 3.x a konektor 12V-2x6 potřebují nejnovější výkonné grafiky.'],
  ['Max. délka GPU a výška chladiče (skříň)', 'Skříň má limity: pokud je karta delší než povolená délka, nevejde se. Stejně tak vysoký vzduchový chladič procesoru. Proto Qompify kontroluje délku karty a formát desky.'],
];
const ARTICLES = [
  { id: 'monitory', t: 'Jaký monitor koupit v roce 2026', d: 'Interaktivní průvodce: co utáhne tvoje grafika, jak souvisí cena s frekvencí a které monitory za aktuální ceny stojí za to. Obsahuje vysvětlení všech parametrů.', tag: 'Monitory · interaktivní grafy' },
  { id: 'parametry', t: 'Co znamenají parametry PC dílů', d: 'Jádra, VRAM, MT/s, TBW, ATX 3.x. Srozumitelné vysvětlení specifikací procesorů, grafik, pamětí, disků, zdrojů a skříní.', tag: 'Průvodce · slovníček' },
];
function LatencyCalc() {
  const [mt, setMt] = useState(6000), [cl, setCl] = useState(30), ns = ((cl * 2000) / mt), ref = [[3200, 16], [5600, 36], [6000, 36], [6000, 30], [6400, 32]];
  return (
    <section className="card art">
      <h2>Skutečná latence paměti</h2>
      <div className="frow"><label>Frekvence (MT/s)<select value={mt} onChange={e => setMt(+e.target.value)}>{[3200, 3600, 5600, 6000, 6400, 7200, 8000].map(v => <option key={v}>{v}</option>)}</select></label><label>Latence CL: {cl}<input type="range" min="14" max="46" value={cl} onChange={e => setCl(+e.target.value)} /></label></div>
      <div className="ppi"><div><b>{ns.toFixed(1)} ns</b><small>skutečná latence</small></div></div>
      <ul className="pbars">{ref.map(([m, c]) => { const n = (c * 2000) / m; return <li key={m + '-' + c}><span>{m} CL{c}</span><i><b style={{ '--w': `${Math.max(8, 100 - (n - 8) * 8)}%` }} /></i><em>{n.toFixed(1)} ns</em></li>; })}</ul>
      <p className="muted">Čím kratší pruh, tím pomalejší paměť. Vzorec: CL ÷ MT/s × 2000.</p>
    </section>
  );
}
function PsuCalc() {
  const cpus = PARTS.filter(p => p.cat === 'cpu'), gpus = PARTS.filter(p => p.cat === 'gpu'), [c, setC] = useState('r7-9800x3d'), [g, setG] = useState('rtx5070ti');
  const o = { cpu: BY[c], gpu: BY[g] }, d = power(o), need = Math.ceil((d * 1.3) / 50) * 50, ok = PARTS.filter(p => p.cat === 'psu' && p.w >= need).sort((a, b) => best(a).price - best(b).price).slice(0, 3);
  return (
    <section className="card art">
      <h2>Jaký zdroj potřebuješ</h2>
      <div className="frow"><label>Procesor<select value={c} onChange={e => setC(e.target.value)}>{cpus.map(p => <option key={p.id} value={p.id}>{dn(p)}</option>)}</select></label><label>Grafická karta<select value={g} onChange={e => setG(e.target.value)}>{gpus.map(p => <option key={p.id} value={p.id}>{dn(p)}</option>)}</select></label></div>
      <div className="ppi"><div><b>{d} W</b><small>odhad příkonu</small></div><div><b>{need} W</b><small>doporučený zdroj</small></div></div>
      <p className="muted">Zdroje, které stačí, od nejlevnějšího: {ok.length ? ok.map(p => `${dn(p)} (${fmt(best(p).price)})`).join(', ') : 'žádný z katalogu, zvol slabší komponenty.'}</p>
    </section>
  );
}
function PartsArticle() {
  return (
    <>
      <header className="ahead"><small>Průvodce · slovníček</small><h1>Co znamenají parametry PC dílů</h1>
        <p className="lede">Specifikace na e-shopech vypadají jako šifra. Tady je překlad: co číslo říká, kdy na něm záleží a kdy se ho nemusíš bát.</p></header>
      <Prose><h2>Dvě čísla, která si spočítáš sám</h2><p>Dvě věci se dají snadno spočítat a ušetří peníze: skutečná latence paměti a potřebný výkon zdroje. Vyzkoušej si je s vlastními díly.</p></Prose>
      <LatencyCalc /><PsuCalc />
      <Prose><h2>Slovníček</h2><p>Všechny parametry z katalogu a z porovnání dílů:</p></Prose>
      <section className="card art"><Glossary items={PART_GLOSS} /></section>
    </>
  );
}
export function Articles({ a }) {
  const art = ARTICLES.find(x => x.id === a);
  if (!art) return (
    <>
      <Head title="Články a průvodci" sub="Vyber téma. Článek se otevře po kliknutí." />
      <div className="tiers">{ARTICLES.map(x => (
        <a key={x.id} className="card artcard" href={`#/clanky?a=${x.id}`}><small>{x.tag}</small><h2>{x.t}</h2><p className="muted">{x.d}</p><span className="btn">Číst článek</span></a>
      ))}</div>
    </>
  );
  return (<><a className="back" href="#/clanky">← Všechny články</a>{a === 'monitory' ? <MonitorArticle /> : <PartsArticle />}</>);
}
