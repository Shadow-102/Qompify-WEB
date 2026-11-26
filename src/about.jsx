// Stránka O nás (#/onas): brandová scéna, čísla z katalogu, jak to funguje, pro koho, poctivost cen.
import { PARTS, MONITORS, GAMES, RETAILERS } from './data.js';
import { Scene, playIntro } from './intro.jsx';
import './about.css';

const STATS = [[PARTS.length, 'dílů v katalogu'], [MONITORS.length, 'monitorů'], [GAMES.length, 'her s odhadem FPS'], [RETAILERS.length, 'českých obchodů']];
const STEPS = [
  ['Vyber díly', 'Procesor, grafika, paměti, deska, zdroj, skříň a disk. Jeden díl z každé kategorie.', '#/builder', 'Otevřít stavitel'],
  ['Hlídáme kompatibilitu', 'Patice, typ pamětí, výkon zdroje i rozměry skříně kontrolujeme průběžně, jak sestavu skládáš.', '#/builder', 'Vyzkoušet'],
  ['Najdeme nejnižší cenu', 'U každého dílu porovnáme cenu v pěti českých e-shopech a umíme cenu hlídat.', '#/porovnat', 'Porovnat díly'],
  ['Ulož nebo stáhni PDF', 'Sestavu si ulož do prohlížeče nebo ji stáhni jako PDF i s odkazy do obchodů.', '#/komunita', 'Moje sestavy'],
];
const WHO = [
  ['První stavba', 'Chceš jistotu, že se díly k sobě hodí a počítač po složení hned naběhne.'],
  ['Výkon za korunu', 'Hledáš co nejvíc snímků za sekundu za každou utracenou korunu.'],
  ['Nadšenci', 'Chceš podrobné parametry, srovnání vedle sebe a historii cen.'],
];
const HONEST = [
  'Ceny u dalších obchodů se zatím dopočítávají ze základní ceny dílu, nejsou to živé nabídky. Před nákupem je vždy ověř u obchodu.',
  'FPS jsou modelový odhad, ne měření. Historie cen a „slevy“ proti 30denní historii jsou zatím simulované, dokud nepřipojíme živé cenové feedy.',
  'Sestavy v záložce Komunita jsou ukázky, které připravil autor webu, ne sestavy skutečných uživatelů.',
  'Asistent sestavy je ve velmi rané beta verzi. Odpovídá jen z dat katalogu a umí se spletnout.',
];

export function About() {
  return (
    <div className="qab">
      <section className="qab-hero">
        <div className="qab-copy">
          <span className="qab-eye">O nás</span>
          <h1>Postav si PC, které hned funguje.</h1>
          <p>Qompify pomáhá postavit počítač, který po sestavení hned funguje a nestojí víc, než musí. Chceme být nejdůvěryhodnějším českým pomocníkem pro skládání PC.</p>
          <p className="qab-beta"><b>Beta verze.</b> Web je v rané fázi a leccos je ještě syrové. Když něco nesedí, počítej s tím, že je to chyba na naší straně.</p>
          <div className="qab-cta">
            <a className="qab-btn" href="#/builder">Začít skládat</a>
            <button className="qab-btn alt" onClick={playIntro}>Přehrát úvod</button>
          </div>
        </div>
        <figure className="qab-art"><Scene still /></figure>
      </section>

      <ul className="qab-stats" aria-label="Qompify v číslech">
        {STATS.map(([n, l]) => <li key={l}><b>{n}</b><span>{l}</span></li>)}
      </ul>

      <section className="qab-sec">
        <h2>Jak to funguje</h2>
        <ol className="qab-steps">
          {STEPS.map(([t, d, href, cta], i) => (
            <li key={t} className="qab-card">
              <span className="qab-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t}</h3><p>{d}</p>
              <a href={href}>{cta} <span aria-hidden="true">→</span></a>
            </li>
          ))}
        </ol>
      </section>

      <section className="qab-sec">
        <h2>Pro koho je</h2>
        <div className="qab-who">{WHO.map(([t, d]) => <div key={t} className="qab-card"><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="qab-sec qab-split">
        <div className="qab-card">
          <h2>Jak zacházíme s cenami a čísly</h2>
          <dl className="qab-legend">
            <div><dt><span className="chip ok">Ověřeno</span></dt><dd>Cenu jsme viděli u uvedeného českého obchodu k uvedenému datu.</dd></div>
            <div><dt><span className="pct">Orientační</span></dt><dd>Odhad. Je takto označený všude, kde se objeví.</dd></div>
          </dl>
          <ul>{HONEST.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className="qab-card qab-not">
          <h2>Co Qompify není</h2>
          <p>Není e-shop a nic neprodává. Žádné účty nevedeme a osobní údaje nesbíráme. Odkazy vedou do obchodů, kde nákup dokončíš.</p>
          <p>Z nákupů přes ně zatím nemáme žádnou provizi. Kdybychom partnerské odkazy zavedli, označíme je a doplníme tuto stránku.</p>
          <p>Web běží na GitHub Pages. <a href="#/ochrana-udaju">Jak nakládáme s údaji</a></p>
        </div>
      </section>
    </div>
  );
}
