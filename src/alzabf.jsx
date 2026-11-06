// Článek: Alza Black Friday 2026 a PC hardware. Všechna čísla se počítají z dat (src/alzabf.json), v textu nejsou ručně psaná.
// Data: výpis Alzy z 29. 10. 2026 + historie cen z Hlídače shopů (stažená 30. 10. 2026). Jak vznikl JSON: scripts/alza-bf.py.
import { useMemo, useState } from 'react';
import BF from './alzabf.json';
import { fmt } from './data.js';

const CAT = { gpu: 'Grafické karty', cpu: 'Procesory', ram: 'Paměti RAM', ssd: 'SSD disky', hdd: 'Pevné disky', mb: 'Základní desky', psu: 'Zdroje', case: 'Skříně', cooler: 'Chladiče', monitor: 'Monitory', periph: 'Herní periferie' };
const BF_DATE = '29. 10. 2026', HL_DATE = '30. 10. 2026', TOTAL = 45762;
const R = BF.map(([name, path, bf, ref, disc, diff, v, reft, orig, rating, reviews, stock, cat, check]) => ({ name, url: 'https://www.alza.cz/' + path, bf, ref, disc, diff, v, reft, orig, rating, reviews, stock: !!stock, cat, check }));
const isReal = r => r.v === 's' || r.v === 'a';
const pc = x => Math.round(Math.abs(x) * 100);
const num = n => n.toLocaleString('cs-CZ');
const median = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const VERDICT = { s: 'Skutečná sleva', a: 'Sleva i podle Alzy', n: 'Bez slevy', z: 'Dražší než dřív' };

const S = (() => {
  const real = R.filter(isReal), above = R.filter(r => r.v === 'z'), none = R.filter(r => r.v === 'n');
  const best = Object.keys(CAT).map(c => { const l = R.filter(r => r.cat === c && isReal(r)).sort((a, b) => b.disc - a.disc || b.diff - a.diff)[0]; return l && { c, r: l }; }).filter(Boolean);
  const inCat = c => R.filter(r => r.cat === c);
  return { total: R.length, real: real.length, realPct: Math.round((real.length / R.length) * 100), med: pc(median(real.map(r => r.disc))), above, none, origN: R.filter(r => r.orig).length, best, inCat,
    lowRev: R.filter(r => r.reviews == null || r.reviews < 10).length, checkOk: R.every(r => r.check == null || r.check === r.bf), counts: Object.fromEntries(Object.keys(CAT).map(c => [c, inCat(c).length])) };
})();
export const ALZA_META = { id: 'alza-bf', tag: 'Black Friday · data z 30. 10. 2026', t: 'Alza Black Friday 2026: které slevy na PC hardware jsou opravdu slevy', d: `${S.total} kousků PC hardwaru z výpisu Alzy porovnaných s historií cen. ${S.realPct} % slev je skutečných, grafické karty mezi nimi ale nejsou.` };

const PICK = [['cpu', 'AMD Ryzen 5 8400F'], ['mb', 'ASROCK B650 PRO RS'], ['ram', 'Patriot Viper RGB Elite 5 Ultra 32GB'], ['ssd', 'Samsung 990 1TB'], ['psu', 'Seasonic Core GC-650'], ['case', 'Fractal Design Pop Air'], ['gpu', 'GeForce RTX 5060 WINDFORCE']];
const Prose = ({ children }) => <div className="prose">{children}</div>;
const Chip = ({ r }) => <span className={`bft ${r.v}`}>{r.v === 'z' ? '+' : r.v === 'n' ? '' : '−'}{pc(r.disc)} %</span>;

function Explorer() {
  const [cat, setCat] = useState('all'), [real, setReal] = useState(true), [sort, setSort] = useState('disc'), [q, setQ] = useState(''), [lim, setLim] = useState(15);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return R.filter(r => (cat === 'all' || r.cat === cat) && (!real || isReal(r)) && (!t || r.name.toLowerCase().includes(t)))
      .sort((a, b) => (sort === 'disc' ? b.disc - a.disc : sort === 'diff' ? b.diff - a.diff : a.bf - b.bf));
  }, [cat, real, sort, q]);
  const pick = f => e => { f(e); setLim(15); };
  return (
    <section className="card art" aria-label="Procházení nabídek">
      <h2>Projdi všechny nabídky</h2>
      <div className="chips" role="group" aria-label="Kategorie">
        <button className={cat === 'all' ? 'on' : ''} onClick={() => { setCat('all'); setLim(15); }}>Vše <small>{S.total}</small></button>
        {Object.keys(CAT).filter(c => S.counts[c]).map(c => <button key={c} className={cat === c ? 'on' : ''} onClick={() => { setCat(c); setLim(15); }}>{CAT[c]} <small>{S.counts[c]}</small></button>)}
      </div>
      <div className="frow">
        <label>Hledat<input value={q} onChange={pick(e => setQ(e.target.value))} placeholder="např. Samsung, UltraGear" maxLength={60} /></label>
        <label>Řadit podle<select value={sort} onChange={pick(e => setSort(e.target.value))}><option value="disc">Slevy v %</option><option value="diff">Ušetřené částky</option><option value="price">Ceny od nejnižší</option></select></label>
        <label className="chk"><input type="checkbox" checked={real} onChange={pick(e => setReal(e.target.checked))} /> Jen skutečné slevy</label>
      </div>
      <p className="muted" aria-live="polite">{num(list.length)} nabídek{real ? ', bez těch, které nejsou levnější než dřív' : ''}.</p>
      <ul className="bfx">
        {list.slice(0, lim).map(r => (
          <li key={r.url} className={r.v}>
            <div className="bfn"><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a><small>{CAT[r.cat]}{r.stock ? '' : ' · není skladem'}{r.reviews != null && r.reviews < 10 ? ' · málo recenzí' : r.reviews != null ? ` · ${r.reviews} recenzí` : ' · zatím bez recenzí'}</small></div>
            <div className="bfp"><b>{fmt(r.bf)}</b><small>dříve {fmt(r.ref)}</small></div>
            <div className="bfv"><Chip r={r} /><small>{VERDICT[r.v]}</small></div>
          </li>
        ))}
      </ul>
      {list.length > lim && <button className="ghost" onClick={() => setLim(l => l + 20)}>Zobrazit dalších {Math.min(20, list.length - lim)}</button>}
    </section>
  );
}

function BuildExample() {
  const items = PICK.map(([c, n]) => ({ c, r: R.find(r => r.cat === c && r.name.includes(n)) }));
  if (items.some(i => !i.r)) return null;
  const sum = (f, only) => items.filter(i => !only || only(i)).reduce((a, i) => a + f(i.r), 0), noGpu = i => i.c !== 'gpu';
  const bf = sum(r => r.bf), ref = sum(r => r.ref), bf2 = sum(r => r.bf, noGpu), ref2 = sum(r => r.ref, noGpu), gpu = items.find(i => i.c === 'gpu').r;
  return (
    <section className="card art" aria-label="Sestava z výpisu">
      <h2>Kolik ušetříš na celém PC?</h2>
      <p className="muted">Poskládali jsme jednu sestavu na platformě AM5 jen z položek výpisu.</p>
      <div className="tw"><table className="sens bft2"><thead><tr><th>Díl</th><th>Black Friday</th><th>Dříve</th><th>Rozdíl</th></tr></thead><tbody>
        {items.map(({ c, r }) => <tr key={c}><td><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a><small>{CAT[c]}</small></td><td>{fmt(r.bf)}</td><td>{fmt(r.ref)}</td><td className={r.v === 'z' ? 'low' : 'hi'}>{r.ref - r.bf >= 0 ? '−' : '+'}{fmt(Math.abs(r.ref - r.bf))}</td></tr>)}
        <tr className="cur"><td>Celkem</td><td>{fmt(bf)}</td><td>{fmt(ref)}</td><td>{ref - bf >= 0 ? '−' : '+'}{fmt(Math.abs(ref - bf))}</td></tr>
      </tbody></table></div>
      <p>Celá sestava vyjde na <b>{fmt(bf)}</b> proti <b>{fmt(ref)}</b> za referenční ceny, takže ušetříš jen {fmt(ref - bf)} ({Math.round(((ref - bf) / ref) * 100)} %). Bez grafické karty by úspora byla {fmt(ref2 - bf2)} ({Math.round(((ref2 - bf2) / ref2) * 100)} %). Karta je ale o {fmt(gpu.bf - gpu.ref)} dražší než dřív a skoro celou úsporu spolkne.</p>
      <p className="muted">Díly jsme vybrali podle názvu a patice (AM5, DDR5). Kompatibilitu si před nákupem ověř, třeba ve Stavitelu.</p>
      <a className="btn" href="#/builder">Poskládat vlastní sestavu</a>
    </section>
  );
}

export function AlzaBfArticle() {
  const gpus = S.inCat('gpu'), rams = S.inCat('ram'), ramUp = rams.filter(r => r.v === 'z').length, cooler = R.find(r => r.cat === 'cooler' && /AM4/.test(r.name)), vram8 = gpus.filter(r => /\b8G\b/.test(r.name)).length;
  return (
    <>
      <header className="ahead"><small>{ALZA_META.tag}</small><h1>{ALZA_META.t}</h1>
        <p className="lede">Prošli jsme výpis Alzy z {BF_DATE} a každou položku porovnali s historií cen z Hlídače shopů. Z {num(TOTAL)} nabídek je {S.total} PC hardware. {S.realPct} % z nich je opravdu zlevněných, grafické karty ale mezi nimi nehledej.</p></header>
      <section className="card art"><div className="ppi">
        <div><b>{S.total}</b><small>kousků PC hardwaru z {num(TOTAL)} nabídek</small></div>
        <div><b>{S.realPct} %</b><small>má skutečnou slevu</small></div>
        <div><b>{S.med} %</b><small>medián skutečných slev</small></div>
        <div><b>{S.above.length}</b><small>je dražších než dřív</small></div>
        <div><b>{S.origN}</b><small>má u Alzy přeškrtnutou cenu</small></div>
      </div></section>
      <Prose><h2>Jak jsme to počítali</h2>
        <p>Výpis Alzy (CSV z {BF_DATE}) jsme spojili s daty Hlídače shopů. Ten každé nabídce přiřadí referenční cenu: buď nejčastější cenu za posledních 90 dní, nebo nejnižší cenu za 30 dní před akcí, jak to požaduje evropská směrnice. Sleva se počítá z ní, ne z přeškrtnuté ceny, kterou si obchod určí sám.</p>
        <p>Alza ukazuje původní cenu jen u {S.origN} z {S.total} kousků hardwaru. U ostatních bys bez historie cen nepoznal, od čeho se sleva počítá. Do přehledu jsme zařadili jen položky, které jsme podle názvu poznali jako díly počítače a herní periferie. Hotové počítače a notebooky jsme vynechali.</p></Prose>
      <section className="card art"><h2>Nejlepší sleva v každé kategorii</h2>
        <div className="tw"><table className="sens bft2"><thead><tr><th>Kategorie</th><th>Nabídka</th><th>Cena</th><th>Dříve</th><th>Sleva</th></tr></thead><tbody>
          {S.best.map(({ c, r }) => <tr key={c}><td>{CAT[c]}</td><td><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>{r.reviews != null && r.reviews < 10 ? <small>málo recenzí</small> : null}</td><td>{fmt(r.bf)}</td><td>{fmt(r.ref)}</td><td className="hi">−{pc(r.disc)} %</td></tr>)}
        </tbody></table></div>
        <p className="muted">U položek s málo recenzemi je dobré před nákupem projít hodnocení a parametry.</p></section>
      <section className="card art"><h2>Grafické karty: bez slevy</h2>
        <p>Ve výpisu jsou jen {gpus.length} grafické karty a žádná není levnější než dřív.{vram8 ? ` ${vram8 === gpus.length ? 'Všechny mají' : vram8 === 1 ? 'Jedna má' : `${vram8} z nich mají`} navíc podle názvu jen 8 GB paměti.` : ''}</p>
        <div className="tw"><table className="sens bft2"><thead><tr><th>Karta</th><th>Cena</th><th>Referenční cena</th><th>Rozdíl</th></tr></thead><tbody>
          {gpus.map(r => <tr key={r.url}><td><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a></td><td>{fmt(r.bf)}</td><td>{fmt(r.ref)}</td><td className={r.v === 'z' ? 'low' : 'hi'}>{r.v === 'z' ? '+' : '−'}{pc(r.disc)} %</td></tr>)}
        </tbody></table></div>
        <p>Podobně dopadly paměti: z {rams.length} sad RAM je {ramUp} dražších než referenční cena. Celkem je ve výpisu {S.above.length} kousků hardwaru dražších než dřív a {S.none.length} bez jakékoli slevy. Najdeš je v seznamu níž po vypnutí filtru „Jen skutečné slevy“.</p></section>
      <Explorer />
      <BuildExample />
      <Prose><h2>Na co si dát pozor</h2>
        <ul>
          {cooler && <li>Chladič {cooler.name} je podle označení určený jen pro patici AM4. Na novější patice nepasuje.</li>}
          <li>U {S.lowRev} nabídek je méně než 10 recenzí. Sleva sama o kvalitě nic neříká.</li>
          <li>{S.checkOk ? 'U žádné z položek se cena mezi výpisem a kontrolou ' + HL_DATE + ' nezměnila.' : 'Některé ceny se mezi výpisem a kontrolou ' + HL_DATE + ' změnily.'} Černý pátek ale připadá až na 27. 11. 2026, takže skutečná nabídka se může lišit.</li>
          <li>Rozhodující je vždy cena na webu obchodu. Sleduj ji třeba rozšířením Hlídač shopů.</li>
        </ul>
        <h2>Zdroj a omezení</h2>
        <p>Data: výpis Alzy z {BF_DATE} (23:44) a Hlídač shopů, ceny staženy {HL_DATE}. Hlídač nemusí mít celou historii u nových produktů. Odkazy vedou na Alzu bez partnerského kódu a Qompify z nich nemá žádnou provizi.</p></Prose>
    </>
  );
}
