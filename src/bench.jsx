import { useState } from 'react';
import { PARTS, BY, GAMES, GFX, dn, best, fmt, fpsAt } from './data.js';
import JellyRadio from './JellyRadio.jsx';

const RES = [{ value: 'FHD', label: '1080p' }, { value: 'QHD', label: '1440p' }, { value: 'UWQHD', label: 'Ultrawide' }, { value: '4K', label: '4K' }];
const GFX_ITEMS = GFX.map(g => ({ value: g, label: g })); // bez „Off“: grafika vždy běží aspoň na nízké
const jelly = { chipColor: '#E5D9C5', activeColor: '#3B66F5', textColor: '#0b0f19', activeTextColor: '#ffffff', size: 'md', radius: 18 };
const tone = f => (f < 30 ? 'low' : f < 60 ? 'mid' : f < 120 ? 'ok' : 'hi');

export function Benchmarks() {
  const [res, setRes] = useState('QHD'), [lv, setLv] = useState('Vysoké'), [gi, setGi] = useState(0), [cid, setCid] = useState('r7-9800x3d'), [sid, setSid] = useState('rtx5060ti-16');
  const gpus = PARTS.filter(p => p.cat === 'gpu'), cpus = PARTS.filter(p => p.cat === 'cpu'), cpu = BY[cid], li = GFX.indexOf(lv), sg = BY[sid];
  const rows = gpus.map(g => ({ g, f: fpsAt(g, cpu, gi, res, li), pr: best(g).price })).sort((a, b) => b.f - a.f);
  const mx = Math.max(...rows.map(r => r.f), 144), rl = RES.find(r => r.value === res).label;
  return (
    <>
      <section className="hero slim"><h1>Benchmarky podle rozlišení a grafiky</h1><p>Vyber rozlišení a úroveň detailů. Každá hra reaguje na nastavení jinak, takže se čísla přepočítají zvlášť pro každý titul.</p></section>
      <section className="card benchc">
        <div className="bctl"><span className="muted">Rozlišení</span><JellyRadio items={RES} value={res} onChange={setRes} ariaLabel="Rozlišení" {...jelly} /></div>
        <div className="bctl"><span className="muted">Úroveň grafiky</span><JellyRadio items={GFX_ITEMS} value={lv} onChange={setLv} ariaLabel="Úroveň grafiky" {...jelly} /></div>
        <div className="frow">
          <label>Hra<select value={gi} onChange={e => setGi(+e.target.value)}>{GAMES.map((g, i) => <option key={g[0]} value={i}>{g[0]}</option>)}</select></label>
          <label>Procesor (omezuje FPS)<select value={cid} onChange={e => setCid(e.target.value)}>{cpus.map(c => <option key={c.id} value={c.id}>{dn(c)}</option>)}</select></label>
        </div>
      </section>
      <section className="card benchc">
        <h2>{GAMES[gi][0]} · {rl} · {lv}</h2>
        <p className="muted">Odhad FPS pro všechny grafiky s procesorem {dn(cpu)}. Zelená 120+, modrá 60+, žlutá 30+, červená pod 30 FPS.</p>
        <ul className="brows">
          {rows.map(({ g, f, pr }) => (
            <li key={g.id}>
              <span className="bn">{dn(g)}</span>
              <i className="bt"><b className={tone(f)} style={{ '--w': `${(f / mx) * 100}%` }} /></i>
              <span className="bv"><b>{f} FPS</b><small>{(f / pr * 1000).toFixed(1)} FPS / 1 000 Kč · {fmt(pr)}</small></span>
            </li>
          ))}
        </ul>
      </section>
      <section className="card benchc">
        <h2>Jak nastavení ovlivní jednotlivé hry</h2>
        <label className="frow">Grafická karta<select value={sid} onChange={e => setSid(e.target.value)}>{gpus.map(g => <option key={g.id} value={g.id}>{dn(g)}</option>)}</select></label>
        <div className="tw"><table className="sens">
          <thead><tr><th>Hra ({rl})</th>{GFX.map(g => <th key={g} className={g === lv ? 'cur' : ''}>{g}</th>)}<th>Nízké → Ultra</th></tr></thead>
          <tbody>{GAMES.map((G, i) => { const v = GFX.map((_, k) => fpsAt(sg, cpu, i, res, k)); return (
            <tr key={G[0]}><td>{G[0]}</td>{v.map((f, k) => <td key={k} className={`${tone(f)}${GFX[k] === lv ? ' cur' : ''}`}>{f}</td>)}<td>−{Math.round((1 - v[3] / v[0]) * 100)} %</td></tr>); })}</tbody>
        </table></div>
        <p className="muted">Esportové hry (CS2, Valorant) se skoro nezmění, kdežto Alan Wake 2 nebo Black Myth: Wukong na Ultra výrazně zpomalí. Čísla jsou orientační odhad, ne naměřená data.</p>
      </section>
    </>
  );
}
