// Qompify — O nás, právní stránky, cookie oznámení, smazání dat. Stránky se zobrazují jako běžné záložky (hash routa #/onas, #/ochrana-udaju …).
import { useEffect, useState } from 'react'
import { Head } from './extra.jsx'
import './legal.css'

// ▼▼ DOPLŇTE SVÉ ÚDAJE (zákon vyžaduje identifikaci provozovatele webu). Prázdné pole se na webu zobrazí jako upozornění. ▼▼
export const LEGAL = {
  operator: '',   // jméno a příjmení, nebo obchodní firma
  form: '',       // např. "Fyzická osoba podnikající dle živnostenského zákona, zapsaná v živnostenském rejstříku"
  ico: '',        // IČO
  address: '',    // adresa sídla / místa podnikání
  email: '',      // kontaktní e-mail
  updated: '1. 11. 2026',
}
// ▲▲

const KEY = { saved: 'qompify.saved.v1', alerts: 'qompify.alerts.v1', consent: 'qompify.consent.v1' }
const store = {
  get: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch { /* úložiště nedostupné */ } },
  keys: () => { try { return Object.keys(localStorage).filter((k) => k.startsWith('qompify.')) } catch { return [] } },
  del: (k) => { try { localStorage.removeItem(k) } catch { /* nic */ } },
}
const count = (k) => { try { const v = JSON.parse(store.get(k) || 'null'); return Array.isArray(v) ? v.length : v ? Object.keys(v).length : 0 } catch { return 0 } }

const H = ({ children }) => <h2>{children}</h2>
const L = ({ items }) => <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
const Miss = () => <span className="qlg-miss">doplňte</span>

function Who() {
  const rows = [['Provozovatel', LEGAL.operator], ['Právní forma', LEGAL.form], ['IČO', LEGAL.ico], ['Adresa', LEGAL.address], ['E-mail', LEGAL.email]]
  const incomplete = rows.some(([, v]) => !v)
  return (
    <>
      {incomplete && <p className="qlg-warn" role="alert">Chybí identifikační údaje provozovatele. Doplňte je v <code>src/legal.jsx</code> (objekt LEGAL) a web znovu sestavte.</p>}
      <dl className="qlg-dl">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || <Miss />}</dd></div>)}</dl>
    </>
  )
}

function MyData() {
  const [n, setN] = useState(() => ({ saved: count(KEY.saved), alerts: count(KEY.alerts), keys: store.keys().length }))
  const [ask, setAsk] = useState(false)
  const [done, setDone] = useState(false)
  const exportData = () => {
    const out = {}; store.keys().forEach((k) => { try { out[k] = JSON.parse(store.get(k)) } catch { out[k] = store.get(k) } })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }))
    a.download = 'qompify-moje-data.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const wipe = () => { store.keys().forEach(store.del); setN({ saved: 0, alerts: 0, keys: 0 }); setAsk(false); setDone(true) }
  return (
    <>
      <p>Qompify nemá uživatelské účty a na server nic neposílá. Všechno, co si uložíš, leží jen v tomto prohlížeči. Tady to můžeš vidět, stáhnout a smazat.</p>
      <dl className="qlg-dl">
        <div><dt>Uložené sestavy</dt><dd>{n.saved}</dd></div>
        <div><dt>Hlídané ceny</dt><dd>{n.alerts}</dd></div>
        <div><dt>Záznamů celkem</dt><dd>{n.keys}</dd></div>
      </dl>
      <div className="qlg-actions">
        <button className="qlg-btn alt" onClick={exportData}>Stáhnout moje data (JSON)</button>
        {!ask && !done && <button className="qlg-btn danger" onClick={() => setAsk(true)}>Smazat všechna data v tomto prohlížeči</button>}
        {ask && <><span>Opravdu smazat sestavy, hlídané ceny i souhlas s oznámením?</span>
          <button className="qlg-btn danger" onClick={wipe}>Ano, smazat</button>
          <button className="qlg-btn alt" onClick={() => setAsk(false)}>Zrušit</button></>}
      </div>
      {done && <p className="qlg-ok" role="status">Hotovo, data jsou smazána. <button className="qlg-link" onClick={() => location.reload()}>Načíst web znovu</button>, aby se vyčistil i stav na stránce.</p>}
    </>
  )
}

const PAGES = {
  onas: ['O nás', () => (
    <>
      <p className="qlg-lead">Qompify pomáhá postavit počítač, který po sestavení hned funguje a nestojí víc, než musí.</p>
      <p className="qlg-beta"><b>Beta verze.</b> Web je v rané fázi a leccos je ještě syrové. Když něco nesedí, počítej s tím, že je to chyba na naší straně.</p>
      <H>Náš cíl</H>
      <p>Chceme být nejdůvěryhodnějším českým pomocníkem pro skládání PC. Vybereš díly a Qompify průběžně kontroluje patici, paměti, zdroj a rozměry skříně, odhadne výkon, najde nejnižší cenu v českých e-shopech a vysvětlí, proč jsou díly právě takové. Sestavu si můžeš uložit nebo stáhnout jako PDF.</p>
      <H>Pro koho je</H>
      <L items={['Pro první stavitele, kteří chtějí jistotu, že se díly k sobě hodí.', 'Pro ty, kdo hledají co nejvíc snímků za sekundu za korunu.', 'Pro nadšence, kteří chtějí podrobné parametry a srovnání.']} />
      <H>Jak zacházíme s cenami a čísly</H>
      <L items={[
        'Ověřená cena: viděli jsme ji u uvedeného českého obchodu k uvedenému datu.',
        'Orientační cena: odhad. Je takto označená všude, kde se objeví.',
        'Ceny u dalších obchodů se zatím dopočítávají ze základní ceny dílu, nejsou to živé nabídky. Před nákupem je vždy ověř u obchodu.',
        'FPS jsou modelový odhad, ne měření. Historie cen a „slevy“ proti 30denní historii jsou zatím simulované, dokud nepřipojíme živé cenové feedy.',
        'Sestavy v záložce Komunita jsou ukázky, které připravil provozovatel, ne sestavy skutečných uživatelů.',
        'Asistent sestavy je ve velmi rané beta verzi. Odpovídá jen z dat katalogu a umí se spletnout.',
      ]} />
      <H>Co Qompify není</H>
      <p>Není e-shop a nic neprodává. Nemá účty a nesbírá osobní údaje. Odkazy vedou do obchodů, kde nákup dokončíš. Z nákupů přes ně zatím nemáme žádnou provizi. Kdybychom partnerské odkazy zavedli, označíme je a doplníme tuto stránku.</p>
      <p><a href="#/provozovatel">Kdo web provozuje</a> · <a href="#/ochrana-udaju">Jak nakládáme s údaji</a></p>
    </>
  )],
  'ochrana-udaju': ['Ochrana osobních údajů', () => (
    <>
      <p>Správcem je provozovatel uvedený na stránce <a href="#/provozovatel">Provozovatel</a>. Platí nařízení GDPR a zákon č. 110/2019 Sb.</p>
      <H>Co zpracováváme</H>
      <p>Qompify sám neshromažďuje žádné osobní údaje. Nemá registraci, formuláře s osobními údaji, analytiku ani reklamu. Sestavy a hlídané ceny se ukládají jen do úložiště tvého prohlížeče (localStorage) a nikam se neodesílají.</p>
      <H>Třetí strany, které mohou získat tvou IP adresu</H>
      <L items={[
        'GitHub Pages: web běží na hostingu GitHubu, který může běžně zaznamenávat přístupy (IP adresa, čas, prohlížeč).',
        'Google Fonts: písmo Manrope se načítá ze serverů Google, které tím obdrží IP adresu. Provozovatel zvažuje přechod na písmo hostované přímo s webem.',
        'Obchody: po kliknutí na odkaz do e-shopu (Alza, Datart, Mironet, TS Bohemia, CZC.cz) se řídíš jejich zásadami.',
      ]} />
      <H>Tvá práva</H>
      <p>Máš právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost a námitku. U nás to jde přímo na stránce <a href="#/moje-data">Moje data</a>. Se stížností se můžeš obrátit na Úřad pro ochranu osobních údajů (<a href="https://uoou.gov.cz" rel="noopener noreferrer" target="_blank">uoou.gov.cz</a>).</p>
      <H>Děti</H>
      <p>Web není určen dětem do 15 let a o dětech nic neshromažďuje.</p>
    </>
  )],
  'podminky': ['Podmínky použití', () => (
    <>
      <H>Co web poskytuje</H>
      <p>Qompify je informační nástroj pro plánování sestavy a srovnání cen. Není e-shop, žádnou smlouvu o koupi s tebou neuzavírá a zobrazené ceny nejsou nabídkou ke koupi.</p>
      <H>Přesnost údajů</H>
      <L items={[
        'Ceny a dostupnost se mohou lišit od skutečné nabídky obchodu. Rozhodující je cena na webu prodejce.',
        'Kontrola kompatibility, odhad příkonu a výkonu jsou pomůcka. Před nákupem si klíčové parametry ověř u výrobce nebo prodejce.',
        'Označení „ověřená“ a „orientační“ cena vysvětluje stránka O nás.',
      ]} />
      <H>Odkazy a ochranné známky</H>
      <p>Názvy výrobců a produktů (Intel, AMD, NVIDIA a další) patří jejich majitelům a slouží jen k identifikaci dílů. S výrobci ani obchody nejsme nijak spojeni.</p>
      <H>Změny a rozhodné právo</H>
      <p>Podmínky i web můžeme měnit, platné znění je vždy zde. Řídí se právem České republiky. Tím nejsou dotčena tvá práva spotřebitele.</p>
    </>
  )],
  'vraceni': ['Vrácení zboží a reklamace', () => (
    <>
      <p>Qompify nic neprodává, proto u nás nelze nic objednat, vrátit ani reklamovat. Služba je zdarma, takže není co vracet. Nákup uzavíráš s e-shopem, kam tě odkaz zavede, a platí jeho obchodní podmínky.</p>
      <H>Obecně o tvých právech při nákupu v českém e-shopu</H>
      <L items={[
        'Při koupi na dálku (online) můžeš zpravidla do 14 dnů od převzetí odstoupit od smlouvy bez udání důvodu (občanský zákoník, § 1829).',
        'Na nové zboží máš zákonnou záruku 24 měsíců, vady uplatňuješ u prodejce.',
        'Pokud se s prodejcem nedohodneš, můžeš využít mimosoudní řešení sporů u České obchodní inspekce (coi.cz).',
      ]} />
      <p>Jde o obecný přehled. Konkrétní podmínky najdeš vždy u prodejce. Pokud někdy zavedeme placené služby, doplníme zde jejich podmínky.</p>
    </>
  )],
  'cookies': ['Cookies a úložiště prohlížeče', () => (
    <>
      <p>Qompify nepoužívá cookies, sledovací pixely ani analytiku. Používáme jen úložiště prohlížeče (localStorage), a to pro funkce, které sis sám vyžádal.</p>
      <dl className="qlg-dl">
        <div><dt>qompify.saved.v1</dt><dd>Uložené sestavy. Zůstávají, dokud je nesmažeš.</dd></div>
        <div><dt>qompify.alerts.v1</dt><dd>Hlídané ceny a cílové částky.</dd></div>
        <div><dt>qompify.consent.v1</dt><dd>Zapamatuje, že jsi zavřel oznámení o úložišti.</dd></div>
      </dl>
      <p>Takové technické úložiště nevyžaduje souhlas, proto u nás není co odmítat. Kdybychom někdy přidali analytiku nebo reklamu, zeptáme se tě předem. Vše smažeš na stránce <a href="#/moje-data">Moje data</a>. Písmo z Google Fonts je popsáno v <a href="#/ochrana-udaju">Ochraně údajů</a>.</p>
    </>
  )],
  'moje-data': ['Moje data', () => <MyData />],
  'provozovatel': ['Provozovatel', () => (
    <>
      <p>Web Qompify provozuje:</p>
      <Who />
      <p>Web běží na GitHub Pages: <a href="https://shadow-102.github.io/Qompify-WEB/">shadow-102.github.io/Qompify-WEB</a>.</p>
    </>
  )],
}

const SUB = {
  onas: 'Co je Qompify, proč vzniklo a jak zacházíme s daty.',
  'ochrana-udaju': 'Jaké údaje zpracováváme, komu je předáváme a jaká máš práva.',
  podminky: 'Pravidla používání webu.',
  vraceni: 'Qompify nic neprodává. Tady je, jak to chodí v e-shopech, kam odkazujeme.',
  cookies: 'Cookies nepoužíváme. Co ukládáme do prohlížeče a proč.',
  'moje-data': 'Podívej se, co je uložené u tebe v prohlížeči, stáhni si to nebo to smaž.',
  provozovatel: 'Kdo web provozuje a jak nás kontaktovat.',
}
export const INFO = Object.keys(PAGES)

export function InfoPage({ slug }) {
  const [title, Body] = PAGES[slug]
  useEffect(() => { window.scrollTo?.(0, 0) }, [slug])
  return (
    <>
      <Head title={title} sub={SUB[slug]} />
      <nav className="qlg-nav" aria-label="Informace o webu">
        {INFO.map((s) => <a key={s} href={'#/' + s} className={'qlg-chip' + (s === slug ? ' on' : '')} aria-current={s === slug ? 'page' : undefined}>{PAGES[s][0]}</a>)}
      </nav>
      <article className="qlg-panel">
        <Body />
        <p className="qlg-date">Poslední aktualizace: {LEGAL.updated}</p>
      </article>
    </>
  )
}

export function LegalLinks() {
  return <nav className="qlg-links" aria-label="Právní informace">{INFO.map((s) => <a key={s} href={'#/' + s}>{PAGES[s][0]}</a>)}</nav>
}

export function CookieNotice() {
  const [show, setShow] = useState(() => !store.get(KEY.consent))
  if (!show) return null
  return (
    <div className="qlg-cookie" role="region" aria-label="Oznámení o úložišti prohlížeče">
      <p>Qompify nepoužívá cookies ani analytiku. Sestavy a hlídané ceny zůstávají jen v tvém prohlížeči. <a href="#/cookies">Podrobnosti</a></p>
      <button className="qlg-btn" onClick={() => { store.set(KEY.consent, '1'); setShow(false) }}>Rozumím</button>
    </div>
  )
}
