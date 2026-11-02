// Nejlepší poměr cena/výkon. Čistá logika bez UI, importuje jen data.js (jde testovat v Node).
// Postup: z všech kompatibilních sestav v rozpočtu (optimize().all) vezmeme ty, které mají aspoň 85 % výkonu
// nejrychlejší sestavy v rozpočtu, a z nich vybereme sestavu s nejvyšším výkonem na korunu.
import { optimize, GAMES, fpsAt, best, offers, check } from './data.js';

export const MIN_SHARE = 0.85;
export const avgFps = o => (o.gpu && o.cpu ? Math.round(GAMES.reduce((a, _, i) => a + fpsAt(o.gpu, o.cpu, i, 'FHD', 2), 0) / GAMES.length) : 0);
export const totalOf = o => Object.values(o).reduce((a, p) => a + best(p).price, 0);
const inStock = o => Object.values(o).every(p => offers(p).some(x => x.stock));
const clean = o => !check(o).some(r => r.l !== 'ok');
// Herní výkon = průměrné FPS (1080p, vysoké, 9 her, modelový odhad); karty s méně než 10 GB VRAM mírně penalizujeme (-8 %).
const perfOf = (use, r) => (use === 'gaming' ? avgFps(r.o) * (r.o.gpu.vram < 10 ? 0.92 : 1) : r.score);

export function bestValue(budget, use = 'gaming', brand = '') {
  const { all, min, list } = optimize(budget, use, brand);
  if (!all.length) return { none: true, min };
  if (use === 'office') { // kancelář: nejlepší hodnota = nejlevnější kompatibilní sestava s iGPU, 16 GB RAM a SSD
    const pick = all.reduce((a, b) => (b.tot < a.tot ? b : a));
    return { pick, top: list[0], same: pick === list[0], use, share: 1, fps: 0, topFps: 0 };
  }
  let pool = all.filter(r => inStock(r.o));
  if (!pool.length) pool = all;
  const scored = pool.map(r => ({ ...r, perf: perfOf(use, r) }));
  const top = scored.reduce((a, b) => (b.perf > a.perf || (b.perf === a.perf && b.tot < a.tot) ? b : a));
  let cand = scored.filter(r => r.perf >= top.perf * MIN_SHARE && clean(r.o));
  if (!cand.length) cand = scored.filter(r => r.perf >= top.perf * MIN_SHARE);
  const pick = cand.reduce((a, b) => (b.perf / b.tot > a.perf / a.tot ? b : a));
  const same = pick.o.cpu.id === top.o.cpu.id && pick.o.gpu?.id === top.o.gpu?.id;
  return { pick, top, same, use, share: pick.perf / top.perf, fps: avgFps(pick.o), topFps: avgFps(top.o) };
}
