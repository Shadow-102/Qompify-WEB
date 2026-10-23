import { useState, useEffect, useMemo, useRef } from 'react';
import GradientASCII from './GradientASCII.jsx';
import { CATS, PARTS, BY, TIERS, SEEDS, GAMES, offers, best, fmt, spec, check, power, rec } from './data.js';
import logo from './assets/logo.png';

const NAV = [['builder', 'Stavitel PC'], ['sestavy', 'Hotové sestavy'], ['katalog', 'Katalog'], ['komunita', 'Komunita']];
const KEY = 'qompify.saved.v1';
const LBL = Object.fromEntries(CATS);
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const linkOf = ids => `${location.origin}${location.pathname}#/builder?b=${ids.join(',')}`;
const parse = s => Object.fromEntries((s || '').split(',').filter(id => BY[id]).map(id => [BY[id].cat, id]));
const objs = sel => Object.fromEntries(Object.entries(sel).map(([c, id]) => [c, BY[id]]));
const total = sel => Object.values(sel).reduce((a, id) => a + best(BY[id]).price, 0);
const selOf = ids => parse(ids.join(','));

function useRoute() {
  const read = () => { const [p, q = ''] = location.hash.slice(2).split('?'); return { page: p || 'builder', q: new URLSearchParams(q) }; };
  const [r, setR] = useState(read);
  useEffect(() => { const f = () => setR(read()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return r;
}
function useTween(v) {
  const [x, setX] = useState(v), r = useRef(v);
  useEffect(() => {
    const a = r.current, t0 = performance.now(); let f;
    const step = t => { const k = Math.min(1, (t - t0) / 500); r.current = a + (v - a) * (1 - Math.pow(1 - k, 3)); setX(r.current); if (k < 1) f = requestAnimationFrame(step); };
    f = requestAnimationFrame(step);
    return () => cancelAnimationFrame(f);
  }, [v]);
  return x;
}

const Badge = ({ l, t }) => <li className={`badge ${l}`}><i />{t}</li>;
const Head = ({ title, sub }) => <section className="hero slim"><h1>{title}</h1><p>{sub}</p></section>;

function Offers({ p }) {
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

function Share({ ids, title, copy }) {
  if (!ids.length) return null;
  const url = linkOf(ids), text = `${title} ${url}`;
  return (
    <div className="share">
      <button onClick={() => copy(url, 'Odkaz zkopírován')}>Odkaz</button>
      <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">Reddit</a>
      <button onClick={() => copy(text, 'Zkopírováno, vlož do Discordu')}>Discord</button>
      <button onClick={() => copy(text, 'Zkopírováno, vlož do TikToku')}>TikTok</button>
    </div>
  );
}

function Sheet({ cat, sel, onClose, onPick }) {
  const [sort, setSort] = useState('rec');
  useEffect(() => { const f = e => e.key === 'Escape' && onClose(); addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, [onClose]);
  const list = useMemo(() => {
    if (!cat) return [];
    const o = objs(sel);
    const items = PARTS.filter(p => p.cat === cat).map(p => ({ p, bad: check({ ...o, [cat]: p }).find(r => r.l === 'bad'), pr: best(p).price }));
    const ok = items.filter(i => !i.bad && (cat !== 'ram' || i.p.gb >= 16) && (cat !== 'ssd' || i.p.gb >= 1000));
    const sc = i => (i.p.sc ? i.p.sc / i.pr : i.p.fps ? i.p.fps[0] / i.pr : -i.pr);
    const top = ok.length ? ok.reduce((a, b) => (sc(b) > sc(a) ? b : a)) : null;
    const out = items.map(i => ({ ...i, rec: i === top }));
    return out.sort((a, b) => (sort === 'rec' ? (b.rec - a.rec) || (!!a.bad - !!b.bad) || a.pr - b.pr : a.pr - b.pr));
  }, [cat, sel, sort]);
  return (
    <div className={`sheet${cat ? ' open' : ''}`} aria-hidden={!cat}>
      <div className="scrim" onClick={onClose} />
      <aside className="panel" role="dialog" aria-label="Výběr dílu">
        <header>
          <h2>{LBL[cat] || ''}</h2>
          <div className="seg">
            <button className={sort === 'rec' ? 'on' : ''} onClick={() => setSort('rec')}>Doporučené</button>
            <button className={sort === 'price' ? 'on' : ''} onClick={() => setSort('price')}>Od nejlevnějšího</button>
          </div>
          <button className="ghost" onClick={onClose}>Zavřít</button>
        </header>
        <ul>
          {list.map(({ p, bad, rec: isRec, pr }) => (
            <li key={p.id}>
              <button className={`pick${bad ? ' dim' : ''}${sel[cat] === p.id ? ' cur' : ''}`} onClick={() => onPick(p.id)}>
                <span><b>{p.brand} {p.name}</b><small>{spec(p)}</small>{bad && <small className="why">Nekompatibilní: {bad.t}</small>}</span>
                <span className="pp">{isRec && <em className="tag">Doporučujeme</em>}<b>{fmt(pr)}</b></span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function Builder({ sel, setSel, add, save, copy }) {
  const [pick, setPick] = useState(null), [focus, setFocus] = useState(null), [name, setName] = useState('');
  const o = objs(sel), res = check(o), draw = power(o), tot = total(sel), n = useTween(tot), ids = Object.values(sel);
  const fp = BY[focus] || BY[ids[ids.length - 1]];
  const cap = o.psu ? o.psu.w : rec(draw), pct = draw ? Math.min(100, (draw / cap) * 100) : 0;
  const worst = res.some(r => r.l === 'bad') ? 'bad' : res.some(r => r.l === 'warn') ? 'warn' : res[0].l === 'idle' ? 'idle' : 'ok';
  return (
    <>
      <section className="hero">
        <h1>Poskládej PC, které nastartuje na první pokus.</h1>
        <p>Vyber díly. Qompify hlídá socket, zdroj i délku grafiky a hledá nejnižší cenu v pěti českých e-shopech.</p>
      </section>
      <div className="builder">
        <section className="card slots">
          <h2>Tvoje sestava</h2>
          <ul>
            {CATS.map(([c, label]) => {
              const p = o[c];
              return (
                <li key={c} className={p ? 'filled' : ''}>
                  <button className="slot" onClick={() => setPick(c)}>
                    <span className="slot-l">{label}</span>
                    <span className="slot-n">{p ? <><b>{p.brand} {p.name}</b><small>{spec(p)}</small></> : <small>Vybrat z {PARTS.filter(x => x.cat === c).length} dílů</small>}</span>
                    <span className="slot-p">{p ? fmt(best(p).price) : 'Vybrat'}</span>
                  </button>
                  {p && <button className="mini" onClick={() => setFocus(p.id)}>Ceny</button>}
                  {p && <button className="mini" aria-label={`Odebrat ${label}`} onClick={() => setSel(s => { const r = { ...s }; delete r[c]; return r; })}>×</button>}
                </li>
              );
            })}
          </ul>
        </section>
        <aside className="side">
          <section className={`card sum ${worst}`}>
            <p className="muted">Nejnižší ceny celkem</p>
            <div className="total">{fmt(n)}</div>
            <ul className="badges">{res.map((r, i) => <Badge key={i} {...r} />)}</ul>
            <div className="meter" aria-label="Odhad příkonu">
              <div><span>Odhadovaný příkon {draw} W</span><span>{o.psu ? `zdroj ${o.psu.w} W` : `doporučeno ${cap} W`}</span></div>
              <i><b style={{ width: pct + '%' }} className={pct > 77 ? 'hot' : ''} /></i>
            </div>
            <form className="save" onSubmit={e => { e.preventDefault(); if (ids.length) { save(name, sel); setName(''); } }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Název sestavy" aria-label="Název sestavy" maxLength={40} />
              <button className="btn" disabled={!ids.length}>Uložit sestavu</button>
            </form>
            <Share ids={ids} title={`Moje PC sestava za ${fmt(tot)}, Qompify`} copy={copy} />
          </section>
          <section className="card cmp">
            <h2>{fp ? `${fp.brand} ${fp.name}` : 'Porovnání cen'}</h2>
            {fp ? <><p className="muted">{spec(fp)}</p><Offers p={fp} /></> : <p className="muted">Vyber první díl a uvidíš ceny z Alzy, Smarty, TS Bohemia, Mironetu a CZC.</p>}
          </section>
        </aside>
      </div>
      <Sheet cat={pick} sel={sel} onClose={() => setPick(null)} onPick={id => { add(id); setFocus(id); setPick(null); }} />
    </>
  );
}

function Tiers({ go, save }) {
  const rows = useMemo(() => TIERS.map(t => {
    const sel = selOf(t.ids), o = objs(sel), tot = total(sel);
    return { ...t, sel, o, tot, res: check(o), fps: o.gpu.fps.map(f => (f / tot) * 1000) };
  }), []);
  const mx = GAMES.map((_, i) => Math.max(...rows.map(r => r.fps[i])));
  return (
    <>
      <Head title="Hotové sestavy s nejlepším poměrem cena/výkon" sub="Čtyři rozpočty, jedna myšlenka: co nejvíc snímků za každou korunu. Snímky jsou orientační, měřené při 1080p." />
      <div className="tiers">
        {rows.map(r => (
          <article className="card tier" key={r.id}>
            <header><h2>{r.label}</h2><b>{fmt(r.tot)}</b></header>
            <p className="muted">{r.blurb}</p>
            <ul className="parts">{CATS.map(([c, l]) => <li key={c}><span>{l}</span><span>{r.o[c].brand} {r.o[c].name}</span><b>{fmt(best(r.o[c]).price)}</b></li>)}</ul>
            <div className="fps">
              {GAMES.map(([g, q], i) => (
                <div key={g}>
                  <div className="row"><span>{g} <small>{q}</small></span><span>{r.o.gpu.fps[i]} FPS · {r.fps[i].toFixed(1)} FPS / 1 000 Kč</span></div>
                  <i className="bar"><b style={{ '--w': (r.fps[i] / mx[i]) * 100 + '%' }} /></i>
                </div>
              ))}
            </div>
            <ul className="badges inline">{[r.res.every(x => x.l === 'ok') ? { l: 'ok', t: 'Vše kompatibilní' } : { l: 'warn', t: 'Zkontroluj kompatibilitu' }].map((b, i) => <Badge key={i} {...b} />)}</ul>
            <div className="actions"><button className="btn" onClick={() => go('builder', r.ids.join(','))}>Upravit ve stavitelu</button><button className="ghost" onClick={() => save(r.label, r.sel)}>Uložit</button></div>
          </article>
        ))}
      </div>
    </>
  );
}

function Catalog({ add, say }) {
  const [cat, setCat] = useState('all'), [q, setQ] = useState(''), [max, setMax] = useState(60000), [stock, setStock] = useState(false);
  const [vram, setVram] = useState(0), [tdp, setTdp] = useState(0), [pc, setPc] = useState(0), [open, setOpen] = useState(null);
  const list = useMemo(() => PARTS.filter(p => {
    const pr = best(p).price, g = p.pcie ?? p.pc;
    return (cat === 'all' || p.cat === cat) && pr <= max && `${p.brand} ${p.name}`.toLowerCase().includes(q.toLowerCase())
      && (!stock || offers(p).some(o => o.stock)) && (!vram || p.vram >= vram) && (!tdp || p.tdp <= tdp) && (!pc || g >= pc);
  }).sort((a, b) => best(a).price - best(b).price), [cat, q, max, stock, vram, tdp, pc]);
  const sel = (v, set, label, opts) => <label>{label}<select value={v} onChange={e => set(+e.target.value)}><option value={0}>Libovolné</option>{opts.map(x => <option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></label>;
  return (
    <>
      <Head title="Katalog dílů a srovnávač cen" sub="Filtruj podle ceny, dostupnosti i technických parametrů. U každého dílu uvidíš ceny ze všech pěti obchodů." />
      <section className="card filters">
        <div className="chips">{[['all', 'Vše'], ...CATS].map(([c, l]) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{l}</button>)}</div>
        <div className="frow">
          <label>Hledat<input value={q} onChange={e => setQ(e.target.value)} placeholder="např. RTX, Ryzen, 1 TB" /></label>
          <label>Cena do {fmt(max)}<input type="range" min={1000} max={60000} step={500} value={max} onChange={e => setMax(+e.target.value)} /></label>
          {sel(vram, setVram, 'VRAM od', [[8, '8 GB'], [12, '12 GB'], [16, '16 GB'], [32, '32 GB']])}
          {sel(tdp, setTdp, 'TDP do', [[65, '65 W'], [125, '125 W'], [200, '200 W'], [320, '320 W']])}
          {sel(pc, setPc, 'PCIe od', [[3, '3.0'], [4, '4.0'], [5, '5.0']])}
          <label className="chk"><input type="checkbox" checked={stock} onChange={e => setStock(e.target.checked)} />Jen skladem</label>
        </div>
      </section>
      <p className="count">{list.length} dílů</p>
      <ul className="catalog">
        {list.map(p => (
          <li key={p.id} className="card part">
            <div className="ph"><span className="muted">{LBL[p.cat]}</span><b>{p.brand} {p.name}</b><small>{spec(p)}</small></div>
            <div className="pr"><b>{fmt(best(p).price)}</b><span className="muted">nejnižší cena</span></div>
            <div className="actions"><button className="btn" onClick={() => { add(p.id); say(`${p.name} přidán do stavitele`); }}>Do sestavy</button><button className="ghost" onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? 'Skrýt ceny' : 'Porovnat ceny'}</button></div>
            {open === p.id && <Offers p={p} />}
          </li>
        ))}
        {!list.length && <li className="card empty">Nic nevyhovuje. Zvyš maximální cenu nebo vypni některý filtr.</li>}
      </ul>
    </>
  );
}

function Community({ saved, persist, go, copy }) {
  const [liked, setLiked] = useState({});
  const card = (b, mine) => {
    const sel = selOf(b.ids), tot = total(sel), ok = check(objs(sel)).every(r => r.l === 'ok'), o = objs(sel);
    return (
      <article className="card build" key={b.id}>
        <header><h2>{b.name}</h2><b>{fmt(tot)}</b></header>
        <p className="muted">{mine ? `Uloženo ${b.at}` : `od ${b.by}`} · {o.cpu?.name}, {o.gpu?.name}</p>
        <ul className="badges inline"><Badge l={ok ? 'ok' : 'warn'} t={ok ? 'Vše kompatibilní' : 'Zkontroluj kompatibilitu'} /></ul>
        <div className="actions">
          <button className="btn" onClick={() => go('builder', b.ids.join(','))}>Otevřít</button>
          {!mine && <button className={`ghost${liked[b.id] ? ' on' : ''}`} aria-pressed={!!liked[b.id]} onClick={() => setLiked(l => ({ ...l, [b.id]: !l[b.id] }))}>♥ {b.likes + (liked[b.id] ? 1 : 0)}</button>}
          {mine && <button className="ghost" onClick={() => persist(saved.filter(s => s.id !== b.id))}>Smazat</button>}
        </div>
        <Share ids={b.ids} title={`${b.name} za ${fmt(tot)}, Qompify`} copy={copy} />
      </article>
    );
  };
  return (
    <>
      <Head title="Uložené sestavy a komunita" sub="Ukládej si konfigurace, posílej je kamarádům a nech se inspirovat sestavami ostatních." />
      <h2 className="sec">Moje sestavy</h2>
      <div className="tiers">{saved.length ? saved.map(b => card(b, true)) : <div className="card empty">Zatím nic uloženého. Sestav PC ve Stavitelu a stiskni Uložit sestavu.</div>}</div>
      <h2 className="sec">Sestavy z komunity</h2>
      <div className="tiers">{SEEDS.map(b => card(b, false))}</div>
    </>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div>
        <h3>Záruka v Česku</h3>
        <p>Na nové zboží platí zákonná záruka 24 měsíců. Reklamaci vyřizuješ přímo u prodejce, ne u Qompify. Při nákupu online máš 14 dní na odstoupení od smlouvy.</p>
      </div>
      <div>
        <h3>Partnerské odkazy</h3>
        <p>Odkazy „Koupit“ vedou do e-shopů Alza, Smarty, TS Bohemia, Mironet a CZC.cz. Za nákup přes ně můžeme získat provizi, cena se pro tebe nezmění.</p>
      </div>
      <div>
        <h3>Ceny a dostupnost</h3>
        <p>Ceny v této verzi jsou demonstrační a slouží k předvedení srovnávače. Před nákupem vždy ověř aktuální cenu a skladovost na stránce obchodu.</p>
      </div>
      <p className="legal">© {new Date().getFullYear()} Qompify. Názvy produktů a značek patří jejich vlastníkům.</p>
    </footer>
  );
}

export default function App() {
  const { page, q } = useRoute();
  const [sel, setSel] = useState(() => parse(q.get('b')));
  const [saved, setSaved] = useState(load);
  const [toast, setToast] = useState('');
  const tm = useRef();
  const say = m => { setToast(m); clearTimeout(tm.current); tm.current = setTimeout(() => setToast(''), 2400); };
  useEffect(() => { const b = q.get('b'); if (b) setSel(parse(b)); }, [q.toString()]);
  const persist = l => { setSaved(l); try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} };
  const go = (p, b) => { location.hash = `/${p}${b ? `?b=${b}` : ''}`; };
  const copy = async (text, msg) => { try { await navigator.clipboard.writeText(text); say(msg); } catch { say('Kopírování se nepovedlo'); } };
  const save = (name, s) => { persist([{ id: Date.now(), name: name || 'Moje sestava', ids: Object.values(s), at: new Date().toLocaleDateString('cs-CZ') }, ...saved]); say('Sestava uložena'); };
  const add = id => setSel(s => ({ ...s, [BY[id].cat]: id }));
  return (
    <>
      <div className="bg"><GradientASCII colors={['#3B66F5', '#F3EBDD', '#4A75FF', '#1E3FD8']} shape="horizon" characters=" =+xX0S8#@" lightMode={false} /></div>
      <div className="app">
        <header className="nav">
          <a className="brand" href="#/builder"><img src={logo} alt="" /><span>Qompify</span></a>
          <nav>{NAV.map(([k, l]) => <a key={k} href={`#/${k}`} aria-current={(page === k || (k === 'builder' && !NAV.some(n => n[0] === page))) ? 'page' : undefined}>{l}{k === 'komunita' && saved.length ? <sup>{saved.length}</sup> : null}</a>)}</nav>
        </header>
        <main key={page} className="view">
          {page === 'sestavy' ? <Tiers go={go} save={save} /> : page === 'katalog' ? <Catalog add={add} say={say} /> : page === 'komunita' ? <Community saved={saved} persist={persist} go={go} copy={copy} /> : <Builder sel={sel} setSel={setSel} add={add} save={save} copy={copy} />}
        </main>
        <Footer />
      </div>
      <div className={`toast${toast ? ' on' : ''}`} role="status">{toast}</div>
    </>
  );
}
