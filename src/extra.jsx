import { useState, useEffect, useMemo } from 'react';
import { CATS, PARTS, BY, LOOK, SPEC, GAMES, MONITORS, RES_K, showVal, perf, dn, offers, best, fmt, spec, check, power, history, deals, optimize, fpsEff } from './data.js';

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
  return a ? (
    <div className="alert"><span>Hlídáme do {fmt(a.target)}{cur <= a.target ? ' · cíl splněn' : ''}</span><button className="mini" onClick={() => setAlert(p.id, null)}>Zrušit</button></div>
  ) : (
    <div className="alert"><input type="number" step="10" min="100" value={v} onChange={e => setV(+e.target.value)} aria-label="Cílová cena v Kč" /><button className="mini on" onClick={() => setAlert(p.id, v)}>Upozorni mě</button></div>
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
        <div className="picklist">{list.map(p => <button key={p.id} className={ids.includes(p.id) ? 'on' : ''} onClick={() => tog(p.id)}><b>{dn(p)}</b><small>{spec(p)}</small><span>{fmt(best(p).price)}</span></button>)}</div>
      </section>
      <section className="card cpage">{ids.length ? <CompareTable ids={ids} sel={sel} add={add} say={say} alerts={alerts} setAlert={setAlert} /> : <p className="muted">Vyber alespoň jeden díl. Pro porovnání zvol dva až čtyři.</p>}</section>
    </>
  );
}

export function DealsBar({ ui }) {
  const ds = useMemo(deals, []);
  return (
    <section className="deals" aria-label="Nejlepší nabídky">
      <div className="dh"><h2>Nejlepší nabídky právě teď</h2><small>Cena oproti průměru za posledních 30 dní</small></div>
      <div className="strip">
        {ds.map(d => (
          <article className="deal" key={d.p.id}>
            <small>{LBL[d.p.cat]}</small><b>{dn(d.p)}</b>
            <div><span className="pct">−{d.pct} %</span><span className="dp">{fmt(d.pr)}</span></div>
            <small>{d.shop}</small>
            <button onClick={() => ui.show([d.p.id])}>Detail a cena</button>
          </article>
        ))}
      </div>
    </section>
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
              <ul className="parts">{CATS.filter(([c]) => x.o[c]).map(([c, l]) => <li key={c}><span>{l}</span><span>{dn(x.o[c])}</span><b>{fmt(best(x.o[c]).price)}</b></li>)}</ul>
              {g && <p className="muted">{[0, 7, 8].map(k => `${GAMES[k][0]} ${fpsEff(g, x.o.cpu, GAMES[k][2])} FPS`).join(' · ')}</p>}
              <ul className="badges inline">{res.filter(b => b.l !== 'ok').slice(0, 2).map((b, j) => <Badge key={j} {...b} />)}{res.every(b => b.l === 'ok') && <Badge l="ok" t="Vše kompatibilní a vyvážené" />}</ul>
              <div className="actions"><button className="btn" onClick={() => go('builder', Object.values(sel).join(','))}>Upravit ve stavitelu</button><button className="ghost" onClick={() => save(`Na míru ${fmt(r.a.n)}`, sel)}>Uložit</button></div>
            </article>
          );
        })}
      </div>
    </>
  );
}

const PAN = { 'QD-OLED': 'oled', 'QD-OLED zakřivený': 'oled', 'IPS Black': 'ips', 'Fast IPS': 'ips', IPS: 'ips', VA: 'va' };
const RESPTS = { FHD: 1, QHD: 1.8, UWQHD: 2.2, '4K': 3.2 };
export function Articles() {
  const gpus = PARTS.filter(p => p.cat === 'gpu'), [gid, setGid] = useState('rtx5060ti-16'), [gi, setGi] = useState(0), [rf, setRf] = useState('all'), [use, setUse] = useState('gaming');
  const [pick, setPick] = useState(null), [open, setOpen] = useState(null), gpu = BY[gid];
  const fps = res => Math.round(gpu.sc * GAMES[gi][2] * RES_K[res]);
  const bars = ['FHD', 'QHD', 'UWQHD', '4K'].map(r => ({ r, v: fps(r) })), maxF = Math.max(...bars.map(b => b.v), 150);
  const okRes = [...bars].reverse().find(b => b.v >= 90) || bars.find(b => b.v >= 60) || bars[0];
  const pts = MONITORS.filter(m => rf === 'all' || m.res === rf);
  const val = m => (RESPTS[m.res] * m.hz * (PAN[m.panel] === 'oled' ? 1.4 : 1)) / best(m).price * 1000;
  const list = MONITORS.filter(m => m.tags.includes(use)).sort((a, b) => val(b) - val(a));
  const W = 640, H = 300, px = v => 50 + (v / 23000) * (W - 70), py = v => H - 34 - ((v - 40) / 260) * (H - 54);
  const cheapOled = MONITORS.filter(m => PAN[m.panel] === 'oled').sort((a, b) => best(a).price - best(b).price)[0];
  const m0 = [...MONITORS].sort((a, b) => val(b) - val(a))[0], budget = MONITORS.filter(m => m.hz >= 144 && m.res === 'QHD').sort((a, b) => best(a).price - best(b).price)[0];
  const sm = MONITORS.find(m => m.id === pick);
  return (
    <>
      <Head title="Jaký monitor koupit v roce 2026" sub="Rozlišení, frekvence a panel rozhodují o tom, jestli tvoje grafika vydělá. Interaktivní průvodce s grafy a výběrem monitorů za aktuální české ceny." />
      <section className="card art">
        <h2>1. Co utáhne tvoje grafika</h2>
        <div className="frow"><label>Grafická karta<select value={gid} onChange={e => setGid(e.target.value)}>{gpus.map(g => <option key={g.id} value={g.id}>{dn(g)}</option>)}</select></label>
          <label>Hra<select value={gi} onChange={e => setGi(+e.target.value)}>{GAMES.map((g, i) => <option key={g[0]} value={i}>{g[0]}</option>)}</select></label></div>
        <svg className="bars" viewBox="0 0 640 210" role="img" aria-label="Odhad FPS podle rozlišení">
          {[60, 144, 240].filter(v => v < maxF * 1.1).map(v => <g key={v}><line x1="90" x2="630" y1={190 - (v / maxF) * 170} y2={190 - (v / maxF) * 170} className="grid" /><text x="84" y={194 - (v / maxF) * 170} textAnchor="end">{v}</text></g>)}
          {bars.map((b, i) => <g key={b.r}><rect x={110 + i * 130} y={190 - (b.v / maxF) * 170} width="80" height={(b.v / maxF) * 170} rx="8" className={b === okRes ? 'sbar on' : 'sbar'} /><text x={150 + i * 130} y={184 - (b.v / maxF) * 170} textAnchor="middle" className="val">{b.v}</text><text x={150 + i * 130} y="206" textAnchor="middle">{b.r === 'UWQHD' ? '3440×1440' : b.r}</text></g>)}
        </svg>
        <p className="muted">Odhad pro {dn(gpu)} v {GAMES[gi][0]}. Doporučujeme <b>{okRes.r === 'UWQHD' ? '3440×1440' : okRes.r}</b> ({okRes.v} FPS), takže hledej monitor kolem {Math.min(360, Math.round(okRes.v / 20) * 20)} Hz.</p>
      </section>
      <section className="card art">
        <h2>2. Cena a frekvence</h2>
        <div className="chips">{['all', 'FHD', 'QHD', '4K'].map(r => <button key={r} className={rf === r ? 'on' : ''} onClick={() => setRf(r)}>{r === 'all' ? 'Všechna rozlišení' : r}</button>)}</div>
        <svg className="scatter" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cena a frekvence monitorů">
          {[60, 120, 180, 240, 300].map(v => <g key={v}><line x1="50" x2={W - 20} y1={py(v)} y2={py(v)} className="grid" /><text x="44" y={py(v) + 4} textAnchor="end">{v} Hz</text></g>)}
          {[0, 5000, 10000, 15000, 20000].map(v => <text key={v} x={px(v)} y={H - 12} textAnchor="middle">{v / 1000} tis.</text>)}
          {pts.map(m => <circle key={m.id} cx={px(best(m).price)} cy={py(m.hz)} r={m.size > 27 ? 11 : 8} className={`pt ${PAN[m.panel]}${pick === m.id ? ' sel' : ''}`} onClick={() => setPick(m.id)} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setPick(m.id)}><title>{dn(m)}</title></circle>)}
        </svg>
        <p className="legend"><i className="ips" /> IPS <i className="va" /> VA <i className="oled" /> OLED · větší kruh = 32"</p>
        <p className="muted">{sm ? <><b>{dn(sm)}</b>: {sm.size}" {sm.res} {sm.panel}, {sm.hz} Hz, {sm.ms} ms, {fmt(best(sm).price)}</> : 'Klikni na bod pro detail monitoru.'}</p>
      </section>
      <section className="card art">
        <h2>3. Doporučené monitory</h2>
        <div className="chips">{[['gaming', 'Hraní'], ['esport', 'Esport'], ['work', 'Tvorba a práce'], ['office', 'Kancelář']].map(([k, l]) => <button key={k} className={use === k ? 'on' : ''} onClick={() => setUse(k)}>{l}</button>)}</div>
        <ul className="mons">
          {list.map((m, i) => { const f = Math.round(gpu.sc * GAMES[gi][2] * RES_K[m.res]); return (
            <li key={m.id}>
              <div className="mh"><span className="rank">{i + 1}</span><div><b>{dn(m)}</b><small>{m.size}" · {m.res} · {m.panel} · {m.hz} Hz · {m.ms} ms{m.hdr ? ' · HDR' : ''}</small></div><div className="mp"><b>{fmt(best(m).price)}</b><small>{m.v ? 'ověřená akční cena' : 'odhad ceny'}</small></div></div>
              <p className="muted">{use === 'office' || use === 'work' ? 'Dobrý obraz pro dlouhou práci.' : f >= m.hz * 0.8 ? `Tvoje ${dn(gpu)} utáhne přibližně plných ${m.hz} Hz.` : f >= 60 ? `Tvoje grafika dá asi ${f} FPS z ${m.hz} Hz, frekvenci nevyužiješ celou.` : 'Pro tvou grafiku je to příliš náročné rozlišení.'}</p>
              <div className="actions"><button className="ghost" onClick={() => setOpen(open === m.id ? null : m.id)}>{open === m.id ? 'Skrýt ceny' : 'Ceny a vývoj'}</button></div>
              {open === m.id && <div className="mx"><Offers p={m} /><PriceChart p={m} w={420} h={96} /></div>}
            </li>); })}
        </ul>
      </section>
      <section className="card art">
        <h2>Naše tipy</h2>
        <ul className="verdict"><li>Nejlepší poměr cena/výkon: <b>{dn(m0)}</b> ({fmt(best(m0).price)})</li><li>Levný start do 144+ Hz QHD: <b>{dn(budget)}</b> ({fmt(best(budget).price)})</li><li>Nejlevnější OLED: <b>{dn(cheapOled)}</b> ({fmt(best(cheapOled).price)})</li></ul>
        <p className="muted">Pozor: akční ceny jsou často vázané na slevové kódy obchodů a po čase se vrací výš. Před koupí je ověř. Pro 4K při 240 Hz potřebuješ grafiku třídy RTX 5080 a výš.</p>
      </section>
    </>
  );
}
