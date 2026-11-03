// Stáhne písmo Manrope (latin + latin-ext = čeština) do docs/fonts/ a vytvoří docs/fonts.css.
// Spusť jednou: npm run fonts   (potřebuje internet a Node 18+). Soubory pak commitni, web už Google nikdy nekontaktuje.
import { mkdir, writeFile } from 'node:fs/promises';
const CSS_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'; // kvůli woff2
const WANT = ['latin', 'latin-ext'];

export function parse(css) {
  const out = []; const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g; let m;
  while ((m = re.exec(css))) {
    const url = /url\((https:[^)]+\.woff2)\)/.exec(m[2])?.[1], range = /unicode-range:\s*([^;]+);/.exec(m[2])?.[1];
    if (WANT.includes(m[1]) && url && range) out.push({ subset: m[1], url, range: range.trim() });
  }
  return out;
}
export const fontsCss = faces => `/* Manrope, hostováno přímo s webem (vytvořeno skriptem scripts/get-fonts.mjs) */\n` + faces.map(f =>
  `@font-face{font-family:'Manrope';font-style:normal;font-weight:400 800;font-display:swap;src:url(fonts/manrope-${f.subset}.woff2) format('woff2');unicode-range:${f.range}}`).join('\n') + '\n';

if (process.argv[1]?.endsWith('get-fonts.mjs')) {
  const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();
  const faces = parse(css);
  if (faces.length !== WANT.length) throw new Error(`Čekal jsem ${WANT.length} podmnožiny, našel ${faces.length}. Google asi změnil formát CSS.`);
  await mkdir('docs/fonts', { recursive: true });
  for (const f of faces) {
    const r = await fetch(f.url); if (!r.ok) throw new Error(`Stažení ${f.url} selhalo: ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer()); if (buf.length < 5000 || buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${f.subset}: soubor nevypadá jako woff2`);
    await writeFile(`docs/fonts/manrope-${f.subset}.woff2`, buf); console.log(`✔ docs/fonts/manrope-${f.subset}.woff2 (${Math.round(buf.length / 1024)} kB)`);
  }
  await writeFile('docs/fonts.css', fontsCss(faces)); console.log('✔ docs/fonts.css\nHotovo. Commitni složku docs/fonts a soubor docs/fonts.css.');
}
