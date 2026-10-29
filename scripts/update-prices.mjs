// Aktualizace cen z XML feedů obchodů (formát Heureka / Zboží.cz: <SHOPITEM>).
// Použití:  npm run prices   (potom npm run build, commit a push)
// Feedy: vyplň scripts/feeds.json, nebo nastav proměnnou FEEDS_JSON (GitHub secret) se stejným JSON polem.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const feeds = JSON.parse(process.env.FEEDS_JSON || readFileSync('scripts/feeds.json', 'utf8')).filter(f => f.url && !f.url.startsWith('VLOZ'));
if (!feeds.length) { console.log('Žádné feedy nejsou nastavené (scripts/feeds.json). Nic se nemění.'); process.exit(0); }
const overrides = existsSync('scripts/overrides.json') ? JSON.parse(readFileSync('scripts/overrides.json', 'utf8')) : {};
const src = readFileSync('src/data.js', 'utf8');
const parts = [...src.matchAll(/^ {2}(?:cpu|gpu|ram|mb|psu|cs|ssd)\('([^']+)','([^']+)','([^']+)'/gm)].map(m => ({ id: m[1], name: m[2], brand: m[3] }));
const norm = s => ` ${s.toLowerCase().replace(/[^a-z0-9ěščřžýáíéůúďťň]+/g, ' ').trim()} `;
const tokens = p => overrides[p.id] || norm(p.name.replace(p.brand, '')).trim().split(' ').filter(Boolean);
const tag = (xml, t) => (xml.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

const prices = JSON.parse(readFileSync('src/prices.json', 'utf8'));
prices.items ||= {};
const found = {};
for (const f of feeds) {
  let xml;
  try { const r = await fetch(f.url); if (!r.ok) throw new Error(r.status); xml = await r.text(); } catch (e) { console.warn(`! ${f.shop}: feed se nepodařilo stáhnout (${e.message})`); continue; }
  let n = 0;
  for (const [, item] of xml.matchAll(/<SHOPITEM[^>]*>([\s\S]*?)<\/SHOPITEM>/g)) {
    const name = norm(tag(item, 'PRODUCTNAME') || tag(item, 'PRODUCT') || ''), price = parseFloat((tag(item, 'PRICE_VAT') || '').replace(',', '.'));
    if (!name.trim() || !(price > 100)) continue;
    const dd = tag(item, 'DELIVERY_DATE'), stock = dd === undefined ? true : dd !== '' && +dd <= 3;
    for (const p of parts) {
      if (!tokens(p).every(t => name.includes(` ${t} `))) continue;
      const cur = ((found[p.id] ||= {})[f.shop]);
      if (!cur || price < cur.price) found[p.id][f.shop] = { price: Math.round(price), stock };
      n++;
    }
  }
  console.log(`${f.shop}: spárováno ${n} nabídek`);
}
const today = new Date().toISOString().slice(0, 10);
for (const [id, shops] of Object.entries(found)) {
  const it = (prices.items[id] ||= { shops: {}, hist: [] });
  it.shops = shops;
  const low = Math.min(...Object.values(shops).filter(s => s.stock).map(s => s.price), ...Object.values(shops).map(s => s.price));
  if (it.hist.length && it.hist.at(-1)[0] === today) it.hist.at(-1)[1] = low; else it.hist.push([today, low]);
  it.hist = it.hist.slice(-120);
}
prices.updated = new Date().toISOString();
writeFileSync('src/prices.json', JSON.stringify(prices));
console.log(`Hotovo: ${Object.keys(found).length} z ${parts.length} dílů má živou cenu.`);
