import { useEffect, useRef, useState } from 'react';
import { CATS, PARTS, BY, GAMES, best, dn, fmt, check, power, rec, fpsAt, perf } from './data.js';
import { bestValue, avgFps, totalOf } from './value.js';

const LBL = Object.fromEntries(CATS);
const pr = p => best(p).price;
const objs = sel => Object.fromEntries(Object.entries(sel).map(([c, id]) => [c, BY[id]]));
const okWith = (o, cat, p) => !check({ ...o, [cat]: p }).some(r => r.l === 'bad');
const rank = (cat, p, f) => PARTS.filter(x => x.cat === cat).sort((a, b) => f(b) - f(a)).findIndex(x => x.id === p.id) + 1;
const pct = (a, b) => Math.round((a / b - 1) * 100);
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Vysvětlení jednoho dílu: vždy z reálných dat katalogu a aktuálních cen, žádné vymyšlené údaje.
function why(cat, o) {
  const p = o[cat]; if (!p) return null;
  const all = PARTS.filter(x => x.cat === cat), price = pr(p), L = [];
  const cheaper = (f, key) => all.filter(x => x.id !== p.id && pr(x) < price && okWith(o, cat, x) && f(x)).sort((a, b) => (key(b) - key(a)) || (pr(a) - pr(b)))[0];
  if (cat === 'cpu') {
    L.push(`${p.n} jader a ${p.th} vláken, boost ${p.f} GHz a ${p.l3} MB cache. Ve výkonu je na ${rank('cpu', p, x => x.sc)}. místě z ${all.length} procesorů v katalogu.`);
    L.push(`Socket ${p.s} určil, jakou desku a paměť potřebuješ${o.mb ? (o.mb.s === p.s ? ': tvoje deska sedí.' : ', ale tvoje deska má jiný socket.') : '.'}`);
    if (o.gpu) { const q = o.gpu.sc / p.sc; L.push(q > 2.1 ? `S ${dn(o.gpu)} ale může brzdit grafiku (poměr výkonu ${q.toFixed(1)}).` : q < 0.42 ? `Je silnější, než ${dn(o.gpu)} dokáže využít.` : `S ${dn(o.gpu)} je vyvážený (poměr ${q.toFixed(1)}), takže nic nebrzdí.`); }
    const a = cheaper(x => x.sc >= p.sc * 0.8 && (!o.mb || x.s === o.mb.s), x => x.sc);
    if (a) L.push(`Levnější možnost: ${dn(a)} za ${fmt(pr(a))} (o ${fmt(price - pr(a))} méně) dává asi ${Math.round((a.sc / p.sc) * 100)} % výkonu.`);
  } else if (cat === 'gpu') {
    L.push(`${p.vram} GB ${p.vt}, příkon ${p.tdp} W, délka ${p.len} mm. V poměru FPS na korunu je na ${rank('gpu', p, x => x.sc / pr(x))}. místě z ${all.length} karet.`);
    if (o.cpu) L.push(`Odhad v Cyberpunku 2077 na vysoké: ${fpsAt(p, o.cpu, 0, 'FHD', 2)} FPS ve Full HD a ${fpsAt(p, o.cpu, 0, 'QHD', 2)} FPS v 1440p.`);
    const up = all.filter(x => x.sc > p.sc && pr(x) - price <= 6000 && okWith(o, cat, x)).sort((a, b) => b.sc - a.sc)[0];
    if (up) L.push(`Za příplatek ${fmt(pr(up) - price)} jde ${dn(up)}: asi ${pct(up.sc, p.sc)} % víc výkonu.`);
    const a = cheaper(x => x.sc >= p.sc * 0.85, x => x.sc);
    if (a) L.push(`Levnější alternativa s podobným výkonem: ${dn(a)} za ${fmt(pr(a))}.`);
  } else if (cat === 'ram') {
    const lat = (p.cl * 2000) / p.mhz;
    L.push(`${p.t}, ${p.gb} GB (${p.kit}) při ${p.mhz} MT/s, skutečná latence ${lat.toFixed(1)} ns. ${o.mb ? (o.mb.t === p.t ? 'Typ odpovídá desce.' : 'Typ paměti neodpovídá desce.') : ''}`);
    L.push(p.gb >= 32 ? '32 GB je dnes pohodlí pro hry i práci.' : p.gb >= 16 ? '16 GB stačí na hraní, na tvorbu a multitasking už bude těsné.' : 'Tak malá kapacita je jen nouzová.');
    const alt = all.filter(x => x.t === p.t && (p.gb >= 32 ? x.gb === 16 : x.gb === 32)).sort((a, b) => pr(a) - pr(b))[0];
    if (alt) L.push(p.gb >= 32 ? `Varianta s 16 GB (${dn(alt)}) by ušetřila ${fmt(price - pr(alt))}.` : `Dvojnásobná kapacita ${dn(alt)} stojí o ${fmt(pr(alt) - price)} víc.`);
  } else if (cat === 'mb') {
    L.push(`Čipset ${p.chip}, formát ${p.ff}, ${p.m2}× M.2, ${p.lan}${p.wifi ? ', Wi-Fi' : ''}. Určuje ji socket ${p.s} procesoru a paměť ${p.t}.`);
    const a = cheaper(x => x.s === p.s && x.t === p.t, x => -pr(x));
    if (a) L.push(`Levnější deska se stejným socketem a pamětí: ${dn(a)} za ${fmt(pr(a))}, ale s ${a.m2} M.2 sloty${a.wifi ? '' : ' a bez Wi-Fi'}.`);
  } else if (cat === 'psu') {
    const d = power(o), need = rec(d), room = Math.round(((p.w - d) / p.w) * 100);
    L.push(`Odhad příkonu sestavy je ${d} W, doporučený zdroj ${need} W. Tvůj ${p.w} W (${p.eff}) má rezervu asi ${room} %.`);
    if (o.gpu && /12V/.test(o.gpu.pw) && !p.pw12) L.push('Grafika má konektor 12V-2x6, tenhle zdroj ho nemá nativně, bude potřeba redukce.');
    const a = cheaper(x => x.w >= need, x => -pr(x));
    if (a) L.push(`Levnější zdroj, který ještě stačí: ${dn(a)} za ${fmt(pr(a))}.`);
  } else if (cat === 'case') {
    L.push(`${p.type}, podporuje ${p.ff.join(' a ')}. Max. délka grafiky ${p.mg} mm${o.gpu ? `, tvoje karta má ${o.gpu.len} mm, rezerva ${p.mg - o.gpu.len} mm` : ''}. Chladič až ${p.ch} mm, v balení ${p.fans}.`);
    const a = cheaper(x => !o.gpu || x.mg >= o.gpu.len, x => -pr(x)); if (a && o.mb && a.ff.includes(o.mb.ff)) L.push(`Levnější skříň, kam se vše vejde: ${dn(a)} za ${fmt(pr(a))}.`);
  } else if (cat === 'ssd') {
    L.push(`${p.gb >= 1000 ? p.gb / 1000 + ' TB' : p.gb + ' GB'}, PCIe ${p.pc}.0, čtení ${p.rd} MB/s. ${p.pc >= 4 ? 'Na hry a systém je to víc než dost rychlé.' : 'Pro hry a systém stačí, rychlejší disk by pocítil hlavně při kopírování velkých souborů.'}`);
    const a = cheaper(x => x.gb >= Math.min(p.gb, 1000), x => x.rd); if (a) L.push(`Levnější možnost: ${dn(a)} za ${fmt(pr(a))}.`);
  }
  return { part: p.id, cat, lines: L };
}

const upgrades = (o, budget) => {
  const out = [];
  for (const cat of ['gpu', 'cpu']) {
    const p = o[cat]; if (!p) continue;
    const c = PARTS.filter(x => x.cat === cat && x.sc > p.sc && pr(x) - pr(p) <= budget && okWith(o, cat, x)).sort((a, b) => b.sc - a.sc)[0];
    if (c) out.push(`${LBL[cat]}: ${dn(p)} → ${dn(c)}, příplatek ${fmt(pr(c) - pr(p))}, asi ${pct(c.sc, p.sc)} % víc výkonu.`);
  }
  if (o.ram && o.ram.gb < 32) { const c = PARTS.filter(x => x.cat === 'ram' && x.t === o.ram.t && x.gb === 32 && okWith(o, 'ram', x)).sort((a, b) => pr(a) - pr(b))[0]; if (c && pr(c) - pr(o.ram) <= budget) out.push(`Paměť: přechod na ${dn(c)} (32 GB), příplatek ${fmt(pr(c) - pr(o.ram))}.`); }
  return out;
};
const savings = o => {
  const out = [];
  for (const [cat] of CATS) {
    const p = o[cat]; if (!p) continue;
    const f = { cpu: x => x.sc >= p.sc * 0.85 && (!o.mb || x.s === o.mb.s), gpu: x => x.sc >= p.sc * 0.85, ram: x => x.t === p.t && x.gb >= p.gb, mb: x => x.s === p.s && x.t === p.t, psu: x => x.w >= rec(power(o)), case: x => (!o.gpu || x.mg >= o.gpu.len) && (!o.mb || x.ff.includes(o.mb.ff)), ssd: x => x.gb >= p.gb }[cat];
    const a = PARTS.filter(x => x.cat === cat && x.id !== p.id && pr(x) < pr(p) && okWith(o, cat, x) && f(x)).sort((a, b) => pr(a) - pr(b))[0];
    if (a) out.push({ save: pr(p) - pr(a), t: `${LBL[cat]}: místo ${dn(p)} stačí ${dn(a)}, ušetříš ${fmt(pr(p) - pr(a))}.` });
  }
  return out.sort((a, b) => b.save - a.save);
};

// ---- rozpoznání záměru ----
const UNKNOWN = [{ lines: ['S touto žádostí neumím pomoci.', 'Umím vysvětlit díly ve tvé sestavě, porovnat ceny a výkon, zkontrolovat kompatibilitu a navrhnout sestavu s nejlepším poměrem cena/výkon. Zkus třeba „nejlepší sestava za 30 000 Kč“.'] }];
const EMPTY = [{ lines: ['Sestava je zatím prázdná. Vyber díly nebo načti hotovou sestavu a hned ti vysvětlím, proč v ní jsou. Návrh sestavy podle rozpočtu ti ale udělám i teď, stačí napsat třeba „nejlepší sestava za 30 000 Kč“.'] }];
const USE = { gaming: 'hraní', work: 'práci a tvorbu', office: 'kancelář' };

// Rozpočet z textu. Číslo bere jen s „k / tis / Kč“, se slovy „do / za / rozpočet…“ nebo když má aspoň 5 číslic, aby „RTX 5070“ nebyl rozpočet.
export const parseBudget = t => {
  const re = /(\d{1,3}(?:[ .\u00a0]\d{3})+|\d+)(?:,(\d))?\s*(k(?![a-z])|tis\w*|kc|czk)?/g; let m;
  while ((m = re.exec(t))) {
    let n = parseFloat(m[1].replace(/[ .\u00a0]/g, '') + (m[2] ? '.' + m[2] : '')); const suf = m[3] || '';
    const cue = /(do|za|rozpocet|max|okolo|cca|kolem|mam)\s*$/.test(t.slice(Math.max(0, m.index - 14), m.index));
    if (/^(k$|tis)/.test(suf) || (cue && n < 1000)) n *= 1000;
    if ((suf || cue || n >= 10000) && n >= 5000 && n <= 400000) return Math.round(n);
  }
  return 0;
};
const useOf = t => (/kancel|office|skol|ucebn/.test(t) ? 'office' : /prac|tvor|strih|render|video|work|3d|program/.test(t) ? 'work' : 'gaming');
const brandOf = t => (/intel/.test(t) ? 'Intel' : /amd|ryzen/.test(t) ? 'AMD' : '');
const ordered = o => CATS.map(([c]) => o[c]).filter(Boolean);
const buildMsg = (lines, o) => ({ lines, build: { ids: ordered(o).map(p => p.id), tot: totalOf(o) } });
const verified = o => { const l = ordered(o); return `Ověřenou cenu má ${l.filter(p => p.v).length} z ${l.length} dílů, ostatní ceny jsou odhad.`; };
const METHOD = 'Počítám takto: vezmu všechny kompatibilní sestavy v rozpočtu, nechám ty s aspoň 85 % výkonu nejrychlejší z nich a z nich vyberu nejvyšší výkon na korunu. Karty s méně než 10 GB VRAM mírně penalizuji.';

function valueReply(budget, use, brand) {
  const r = bestValue(budget, use, brand), br = brand ? `, ${brand}` : '';
  if (r.none) return [{ lines: [`Za ${fmt(budget)}${br} neumím sestavit kompatibilní PC.${isFinite(r.min) ? ` Nejlevnější možná sestava v katalogu stojí asi ${fmt(r.min)}.` : ''}`] }];
  const o = r.pick.o, tot = totalOf(o), t = r.top.o, head = `Nejlepší poměr cena/výkon do ${fmt(budget)} pro ${USE[use]}${br}:`, why = [];
  if (use === 'gaming') {
    why.push(`Odhad ${r.fps} FPS v průměru (9 her, 1080p, vysoké), tedy ${((r.fps / tot) * 1000).toFixed(1)} FPS na 1 000 Kč. Celkem ${fmt(tot)}, z rozpočtu zbývá ${fmt(budget - tot)}.`);
    why.push(r.same ? 'Je to zároveň nejrychlejší kompatibilní sestava v tomto rozpočtu, víc výkonu za tuhle částku nenajdu.' : `Nejrychlejší sestava v rozpočtu (${dn(t.cpu)} + ${dn(t.gpu)}, ${fmt(r.top.tot)}) dá jen ${Math.max(0, Math.round((r.topFps / r.fps - 1) * 100))} % FPS navíc za ${fmt(r.top.tot - tot)} víc, proto ji jako nejlepší hodnotu nedoporučuji.`);
    why.push(METHOD);
  } else if (use === 'work') why.push(`Celkem ${fmt(tot)}. Výkon pro práci hodnotím podle jader a vláken procesoru a výkonu grafiky.`, METHOD);
  else why.push(`Celkem ${fmt(tot)}. Na kancelář stačí nejlevnější kompatibilní sestava s grafikou v procesoru, 16 GB paměti a SSD.`);
  why.push(verified(o), 'FPS jsou modelový odhad, ne měření. Před nákupem ověř ceny u obchodu.');
  return [buildMsg([head], o), { lines: why }];
}
function evaluateCurrent(o) {
  const cur = totalOf(o), curFps = avgFps(o), r = bestValue(cur, 'gaming');
  if (r.none) return [{ lines: ['Pro tuhle částku nenacházím srovnatelnou sestavu, nemám s čím poměr porovnat.'] }];
  const curV = (curFps / cur) * 1000, bestV = (r.fps / totalOf(r.pick.o)) * 1000, gain = Math.round((bestV / curV - 1) * 100);
  const head = `Tvoje sestava: ${curFps} FPS za ${fmt(cur)}, tedy ${curV.toFixed(1)} FPS na 1 000 Kč (odhad, 9 her, 1080p, vysoké).`;
  if (gain < 8) return [{ lines: [head, `To je pro tuhle cenu mezi nejvýhodnějšími sestavami, které katalog zvládne (nejlepší nalezená je jen o ${Math.max(0, gain)} % výhodnější).`, 'FPS jsou modelový odhad, ne měření.'] }];
  const p = r.pick.o;
  return [{ lines: [head, `Za stejné peníze to jde líp. Tahle sestava dává ${r.fps} FPS za ${fmt(totalOf(p))}, tedy ${bestV.toFixed(1)} FPS na 1 000 Kč (asi o ${gain} % víc):`] }, buildMsg([], p), { lines: [METHOD, verified(p)] }];
}

export function answer(q, sel) {
  const o = objs(sel), t = norm(q), n = Object.keys(o).length, has = (...k) => k.some(x => new RegExp('\\b' + x).test(t)); // shoda od začátku slova: „hra“ nesmí chytit „vyhraje“
  if (/^(ahoj|cau|nazdar|dobry den|cus|zdravim)\b/.test(t)) return [{ lines: ['Ahoj! Napiš rozpočet a k čemu PC chceš, třeba „nejlepší sestava za 30 000 Kč“, nebo se zeptej na díly své sestavy.'] }];
  if (/^(dik|dekuj)/.test(t)) return [{ lines: ['Rádo se stalo. Zeptej se na cokoli dalšího.'] }];
  const map = [['cpu', ['procesor', 'cpu']], ['gpu', ['grafik', 'gpu', 'karta', 'karty']], ['ram', ['ram', 'pamet']], ['mb', ['desk', 'chipset', 'socket']], ['psu', ['zdroj', 'napaj']], ['case', ['skrin', 'case']], ['ssd', ['ssd', 'disk', 'uloz']]];
  const cat = map.find(([, k]) => has(...k))?.[0], budget = parseBudget(t);
  if (has('vylepsit', 'upgrade', 'pridat', 'zlepsit', 'prihodit')) { if (!n) return EMPTY; const b = parseInt((t.replace(/\s/g, '').match(/(\d{3,6})/) || [])[1] || '5000'); const u = upgrades(o, b); return [{ lines: u.length ? [`S příplatkem do ${fmt(b)} se nejvíc vyplatí:`, ...u] : [`S příplatkem do ${fmt(b)} už nenacházím kompatibilní zlepšení, které by se vyplatilo.`] }]; }
  if (has('usetrit', 'snizit', 'ubrat') || (has('levnej', 'levne') && !budget)) { if (!n) return EMPTY; const s = savings(o); return [{ lines: s.length ? [`Kde jde ušetřit bez větší újmy (celkem až ${fmt(s.reduce((a, x) => a + x.save, 0))}):`, ...s.slice(0, 4).map(x => x.t)] : ['Sestava je už skoro nejlevnější možná: levnější kompatibilní díly se stejným výkonem v katalogu nemám.'] }]; }
  const buildWords = has('sestav', 'pc', 'pocitac', 'gaming', 'hry', 'hrani', 'hrat', 'kancel', 'praci', 'tvorb', 'rozpocet', 'poradit', 'doporuc', 'navrh', 'vyplati', 'pomer', 'vykon', 'nejlepsi', 'levn');
  const valueQ = has('pomer', 'cena vykon', 'cena/vykon', 'vyplati', 'vyhodn', 'nejlepsi sestav', 'nejlepsi pc', 'doporuc sestav', 'navrhni', 'co koupit', 'jaky pc', 'jaka sestava', 'sestav mi');
  if (budget && buildWords) return valueReply(budget, useOf(t), brandOf(t));
  if (valueQ) return n && o.cpu && o.gpu ? evaluateCurrent(o) : [{ lines: ['Napiš rozpočet a k čemu PC chceš, třeba „nejlepší poměr cena/výkon za 30 000 Kč, gaming“, a navrhnu sestavu. Nebo vyber procesor a grafiku a vyhodnotím tu svou.'] }];
  if (has('hry', 'hra', 'fps', 'hrat', 'cyberpunk')) { if (!n) return EMPTY; if (!o.gpu || !o.cpu) return [{ lines: ['Na odhad FPS potřebuji v sestavě procesor i grafiku.'] }]; return [{ lines: ['Odhad FPS na vysoké detaily (1080p / 1440p):', ...[0, 1, 4, 7].map(i => `${GAMES[i][0]}: ${fpsAt(o.gpu, o.cpu, i, 'FHD', 2)} / ${fpsAt(o.gpu, o.cpu, i, 'QHD', 2)} FPS`), 'Jde o odhad, ne o naměřená data.'] }]; }
  if (has('brzd', 'bottleneck', 'vyvazen')) { if (!n) return EMPTY; if (!o.gpu || !o.cpu) return [{ lines: ['Potřebuji v sestavě procesor i grafiku.'] }]; const r = o.gpu.sc / o.cpu.sc; return [{ lines: [r > 2.1 ? `Ano, procesor ${dn(o.cpu)} může brzdit grafiku ${dn(o.gpu)} (poměr ${r.toFixed(1)}, ideál je 0,5 až 2).` : r < 0.42 ? `Opačně: procesor je pro grafiku předimenzovaný (poměr ${r.toFixed(1)}).` : `Ne, sestava je vyvážená (poměr výkonu grafiky a procesoru ${r.toFixed(1)}).`] }]; }
  if (has('kompatib', 'funguje')) { if (!n) return EMPTY; return [{ lines: check(o).map(x => `${x.l === 'ok' ? 'V pořádku' : x.l === 'warn' ? 'Pozor' : 'Problém'}: ${x.t}`) }]; }
  if (cat) { if (!n) return EMPTY; return [why(cat, o) || { lines: [`V sestavě zatím chybí ${LBL[cat].toLowerCase()}.`] }]; }
  if (has('vysvetli', 'celou', 'cela sestav', 'shrn', 'popis sestav', 'proc tyto', 'proc tyhle')) { if (!n) return EMPTY; return CATS.map(([c]) => why(c, o)).filter(Boolean).concat([{ lines: [`Celkem ${fmt(Object.values(o).reduce((a, p) => a + pr(p), 0))}. ${check(o).some(r => r.l === 'bad') ? 'Pozor, sestava má konflikty.' : 'Všechny díly jsou kompatibilní.'} Zeptej se na cokoli dalšího.`] }]); }
  return UNKNOWN;
}

const CHIPS = [['Nejlepší sestava za 30 000 Kč', 0], ['Je moje sestava výhodná?', 1], ['Vysvětli celou sestavu', 1], ['Proč tenhle procesor?', 1], ['Proč tahle grafika?', 1], ['Stačí zdroj?', 1], ['Co ve hrách?', 1], ['Co vylepšit za 5 000 Kč?', 1], ['Kde ušetřit?', 1], ['Brzdí něco grafiku?', 1]];
export function Assistant({ sel, auto }) {
  const [msgs, setMsgs] = useState([]), [busy, setBusy] = useState(false), [txt, setTxt] = useState('');
  const ran = useRef(false), box = useRef(null), timers = useRef([]), ids = Object.values(sel).join(','), n = Object.keys(sel).length;
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const reply = list => {
    setBusy(true); let d = 0;
    list.forEach((r, i) => { d += i ? 650 : 450; timers.current.push(setTimeout(() => setMsgs(m => [...m, { who: 'bot', ...r }]), d)); });
    timers.current.push(setTimeout(() => setBusy(false), d + 30));
  };
  const ask = q => { if (!q.trim()) return; clear(); setMsgs(m => [...m, { who: 'me', lines: [q] }]); reply(answer(q, sel)); setTxt(''); };
  useEffect(() => {
    clear(); setBusy(false);
    const total = Object.values(sel).reduce((a, id) => a + pr(BY[id]), 0);
    setMsgs([{ who: 'bot', lines: n ? [`Načetl jsem tvou sestavu: ${n} dílů za ${fmt(total)}. Zeptej se, nebo klikni na otázku níž.`] : ['Ahoj, jsem asistent sestavy. Napiš rozpočet, třeba „nejlepší sestava za 30 000 Kč“, nebo vyber díly a vysvětlím ti, proč jsou v sestavě právě ty.'] }]);
    if (auto && n && !ran.current) { ran.current = true; setMsgs(m => [...m, { who: 'me', lines: ['Vysvětli celou sestavu'] }]); reply(answer('Vysvětli celou sestavu', sel)); }
    return clear;
  }, [ids]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs, busy]);
  return (
    <section className="card assist" aria-label="Asistent sestavy (beta)">
      <header><h2>Asistent sestavy <span className="beta">beta</span></h2><small>Je ve velmi rané beta verzi a zatím dost syrový. Odpovídá jen na otázky o sestavě, cenách, výkonu a kompatibilitě, a umí navrhnout sestavu s nejlepším poměrem cena/výkon. Odpovídá z dat katalogu, FPS jsou odhad.</small></header>
      <div className="chat" ref={box} aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.who}`}>
            {m.part && <b className="mhead" data-part={m.part}>{LBL[m.cat]}: {dn(BY[m.part])}</b>}
            {m.lines.map((l, j) => <p key={j}>{l}</p>)}
            {m.build && (
              <>
                <ul className="abuild">{m.build.ids.map(id => <li key={id} data-part={id}><span>{LBL[BY[id].cat]}</span><b>{dn(BY[id])}</b><em>{fmt(pr(BY[id]))}</em></li>)}</ul>
                <p className="abt">Celkem <b>{fmt(m.build.tot)}</b> · <a href={`#/builder?b=${m.build.ids.join(',')}`}>Otevřít ve Stavitelu</a></p>
              </>
            )}
          </div>
        ))}
        {busy && <div className="msg bot typing" aria-label="Asistent píše"><i /><i /><i /></div>}
      </div>
      <div className="chips">{CHIPS.map(([c, needs]) => <button key={c} disabled={needs && !n} onClick={() => ask(c)}>{c}</button>)}</div>
      <form className="ask" onSubmit={e => { e.preventDefault(); ask(txt); }}>
        <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="Zeptej se třeba: nejlepší sestava za 30 000 Kč" aria-label="Otázka pro asistenta" maxLength={200} /><button className="btn" disabled={!txt.trim()}>Odeslat</button>
      </form>
    </section>
  );
}
