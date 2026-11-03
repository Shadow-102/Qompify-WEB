// Cena s „odometrem“: každá číslice je sloupec 0–9, který se plynule posune (jen transform, běží na GPU, žádné překreslování Reactu po snímcích).
import { fmt } from './data.js';
const DIG = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export function Price({ value, className = '' }) {
  const s = fmt(value), chars = [...s].reverse();               // klíč od konce, aby přidání číslice neposunulo ostatní sloupce
  return (
    <span className={`odo ${className}`} style={{ display: "inline-flex", flexDirection: "row-reverse" }} role="img" aria-label={s}>
      {chars.map((c, i) => /\d/.test(c)
        ? <span key={i} className="dg" aria-hidden="true"><span className="dr" style={{ transform: `translate3d(0,${-(+c) * 10}%,0)` }}>{DIG.map(d => <i key={d}>{d}</i>)}</span></span>
        : <span key={i} className="sp" aria-hidden="true">{c}</span>)}
    </span>
  );
}
