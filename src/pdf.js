// Generátor PDF přímo v prohlížeči: sestava se vykreslí na plátno (A4, 150 dpi), uloží jako JPEG
// a zabalí do PDF s klikacími odkazy na nejlevnější obchod u každého dílu.
import logo from './assets/logo.png';
import { CATS, BY, GAMES, best, dn, fmt, spec, check, power, rec, fpsEff } from './data.js';

const W = 1240, H = 1754, K = 72 / 150;
const SANS = "Manrope, 'Helvetica Neue', Arial, sans-serif";
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const fit = (c, text, max) => { if (c.measureText(text).width <= max) return text; let t = text; while (t.length > 1 && c.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; };
const wrap = (c, text, max) => { const out = []; let line = ''; for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; };

function pdfFromJpeg(jpeg, links) {
  const enc = new TextEncoder(), chunks = [], offs = []; let len = 0;
  const push = d => { const b = typeof d === 'string' ? enc.encode(d) : d; chunks.push(b); len += b.length; };
  const obj = (n, body) => { offs[n] = len; push(`${n} 0 obj\n${body}\nendobj\n`); };
  const pw = (W * K).toFixed(2), ph = (H * K).toFixed(2), esc = s => s.replace(/[\\()]/g, m => '\\' + m);
  push('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R /Annots [${links.map((_, i) => `${6 + i} 0 R`).join(' ')}] >>`);
  offs[4] = len; push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); push(jpeg); push('\nendstream\nendobj\n');
  const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  links.forEach((l, i) => obj(6 + i, `<< /Type /Annot /Subtype /Link /Rect [${(l.x * K).toFixed(2)} ${((H - l.y - l.h) * K).toFixed(2)} ${((l.x + l.w) * K).toFixed(2)} ${((H - l.y) * K).toFixed(2)}] /Border [0 0 0] /A << /S /URI /URI (${esc(l.url)}) >> >>`));
  const n = 6 + links.length, xref = len;
  push(`xref\n0 ${n}\n0000000000 65535 f \n` + offs.slice(1, n).map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join(''));
  push(`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

export async function downloadBuildPdf(rawTitle, ids) {
  const title = rawTitle.replace(/,?\s*Qompify$/, '').slice(0, 44);
  const sel = {}; ids.forEach(i => BY[i] && (sel[BY[i].cat] = BY[i]));
  try { await document.fonts.load('600 26px Manrope'); await document.fonts.ready; } catch {}
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), links = [], url = `${location.origin}${location.pathname}#/builder?b=${ids.join(',')}`;
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
  const g = c.createLinearGradient(0, 0, W, 280); g.addColorStop(0, '#06121d'); g.addColorStop(0.55, '#1b4965'); g.addColorStop(1, '#62b6cb');
  c.fillStyle = g; c.fillRect(0, 0, W, 280);
  try { c.drawImage(await img(logo), 60, 56, 76, 76); } catch {}
  c.fillStyle = '#fff'; c.font = `26px Theovd, ${SANS}`; c.textBaseline = 'alphabetic'; c.fillText('Qompify', 154, 108);
  c.font = `500 22px ${SANS}`; c.textAlign = 'right'; c.fillText(`Vytvořeno ${new Date().toLocaleDateString('cs-CZ')}`, W - 60, 106); c.textAlign = 'left';
  c.font = `800 52px ${SANS}`; c.fillText(title, 60, 216);
  let y = 340; c.fillStyle = '#6b7280'; c.font = `600 19px ${SANS}`; c.fillText('Díl', 60, y - 24); c.fillText('Nejlevnější obchod', 1020, y - 24); c.textAlign = 'right'; c.fillText('Cena', 1000, y - 24); c.textAlign = 'left';
  let total = 0, i = 0;
  for (const [cat, label] of CATS) {
    const p = sel[cat]; if (!p) continue; const b = best(p); total += b.price;
    if (i++ % 2 === 0) { c.fillStyle = '#f3f8fa'; c.fillRect(40, y - 8, W - 80, 82); }
    c.fillStyle = '#6b7280'; c.font = `500 20px ${SANS}`; c.fillText(label, 60, y + 36);
    c.fillStyle = '#0b0f19'; c.font = `700 25px ${SANS}`; c.fillText(fit(c, dn(p), 640), 250, y + 30);
    c.fillStyle = '#6b7280'; c.font = `400 19px ${SANS}`; c.fillText(fit(c, spec(p), 700), 250, y + 62);
    c.fillStyle = '#0b0f19'; c.font = `800 26px ${SANS}`; c.textAlign = 'right'; c.fillText(fmt(b.price), 1000, y + 40); c.textAlign = 'left';
    c.fillStyle = '#3B66F5'; c.font = `600 22px ${SANS}`; const sw = c.measureText(b.n).width; c.fillText(b.n, 1020, y + 40); c.fillRect(1020, y + 46, sw, 2);
    links.push({ x: 250, y: y, w: 640, h: 40, url: b.url }, { x: 1020, y: y + 12, w: sw + 20, h: 40, url: b.url });
    y += 90;
  }
  y += 12; const tg = c.createLinearGradient(40, y, W - 40, y); tg.addColorStop(0, '#cdeef5'); tg.addColorStop(1, '#e9f6f9');
  c.fillStyle = tg; c.beginPath(); c.roundRect(40, y, W - 80, 84, 22); c.fill();
  c.fillStyle = '#1b4965'; c.font = `600 24px ${SANS}`; c.fillText('Celkem za nejnižší ceny', 70, y + 52);
  c.fillStyle = '#0b0f19'; c.font = `800 46px ${SANS}`; c.textAlign = 'right'; c.fillText(fmt(total), W - 70, y + 58); c.textAlign = 'left';
  y += 128; const o = sel, res = check(o), draw = power(o);
  c.fillStyle = '#0b0f19'; c.font = `800 30px ${SANS}`; c.fillText('Kompatibilita a napájení', 60, y); y += 20;
  for (const r of res.slice(0, 7)) {
    y += 36; c.fillStyle = { ok: '#1f8a5b', warn: '#b57a0a', bad: '#c93c3c', idle: '#9ca3af' }[r.l]; c.beginPath(); c.arc(74, y - 8, 8, 0, 7); c.fill();
    c.fillStyle = '#1f2937'; c.font = `500 22px ${SANS}`; c.fillText(fit(c, r.t, 1000), 100, y);
  }
  if (draw) { y += 44; c.fillStyle = '#6b7280'; c.font = `500 21px ${SANS}`; c.fillText(`Odhadovaný příkon ${draw} W, doporučený zdroj od ${rec(draw)} W.`, 60, y); }
  if (sel.gpu && sel.cpu && y < H - 330) {
    y += 64; c.fillStyle = '#0b0f19'; c.font = `800 30px ${SANS}`; c.fillText('Odhad výkonu (1080p, vysoké detaily)', 60, y);
    [0, 1, 7, 8].forEach((gi, k) => { const f = fpsEff(sel.gpu, sel.cpu, GAMES[gi][2]), x = 60 + (k % 2) * 560, yy = y + 46 + Math.floor(k / 2) * 42; c.fillStyle = '#1f2937'; c.font = `500 22px ${SANS}`; c.fillText(GAMES[gi][0], x, yy); c.font = `800 22px ${SANS}`; c.textAlign = 'right'; c.fillText(`${f} FPS`, x + 480, yy); c.textAlign = 'left'; });
    y += 130;
  }
  c.fillStyle = '#d1d5db'; c.fillRect(60, H - 140, W - 120, 2);
  c.fillStyle = '#6b7280'; c.font = `400 18px ${SANS}`;
  wrap(c, 'Ceny pocházejí z českých e-shopů (Alza, Datart, Mironet, TS Bohemia, CZC.cz) a jsou orientační. Před nákupem si ověř aktuální cenu a skladovost u obchodu. Výkon ve hrách je odhad.', W - 120).forEach((l, k) => c.fillText(l, 60, H - 104 + k * 26));
  c.fillStyle = '#3B66F5'; c.font = `600 19px ${SANS}`; const ut = fit(c, `Otevřít sestavu: ${url}`, W - 120); c.fillText(ut, 60, H - 40); links.push({ x: 60, y: H - 62, w: Math.min(c.measureText(ut).width, W - 120), h: 30, url });
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.92)), jpeg = new Uint8Array(await blob.arrayBuffer());
  const out = pdfFromJpeg(jpeg, links), a = document.createElement('a');
  a.href = URL.createObjectURL(out);
  a.download = `qompify-${title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'sestava'}.pdf`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
