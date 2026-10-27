export const CATS = [['cpu','Procesor'],['gpu','Grafická karta'],['ram','Paměť'],['mb','Základní deska'],['psu','Zdroj'],['case','Skříň'],['ssd','Úložiště']];
export const GAMES = [['Cyberpunk 2077','1080p, vysoké'],['Counter-Strike 2','1080p, nízké'],['Fortnite','1080p, střední']];
const P = (id, cat, name, brand, price, x) => ({ id, cat, name, brand, price, ...x });
export const PARTS = [
  P('r5-5600','cpu','Ryzen 5 5600','AMD',2990,{s:'AM4',c:'6/12',tdp:65,sc:62}),
  P('r5-7600','cpu','Ryzen 5 7600','AMD',4990,{s:'AM5',c:'6/12',tdp:65,sc:76}),
  P('r5-9600x','cpu','Ryzen 5 9600X','AMD',6490,{s:'AM5',c:'6/12',tdp:65,sc:85}),
  P('r7-7800x3d','cpu','Ryzen 7 7800X3D','AMD',11490,{s:'AM5',c:'8/16',tdp:120,sc:100}),
  P('r9-9950x','cpu','Ryzen 9 9950X','AMD',14990,{s:'AM5',c:'16/32',tdp:170,sc:112}),
  P('i5-12400f','cpu','Core i5-12400F','Intel',3490,{s:'LGA1700',c:'6/12',tdp:65,sc:64}),
  P('i5-14600kf','cpu','Core i5-14600KF','Intel',7990,{s:'LGA1700',c:'14/20',tdp:125,sc:90}),
  P('i7-14700k','cpu','Core i7-14700K','Intel',10990,{s:'LGA1700',c:'20/28',tdp:125,sc:102}),
  P('rx6600','gpu','Radeon RX 6600','Sapphire',4990,{vram:8,tdp:132,len:245,pcie:4,fps:[62,240,150]}),
  P('arc-b580','gpu','Arc B580','Intel',6490,{vram:12,tdp:190,len:272,pcie:4,fps:[74,260,160]}),
  P('rtx4060','gpu','GeForce RTX 4060','MSI',8490,{vram:8,tdp:115,len:240,pcie:4,fps:[78,300,180]}),
  P('rx7600xt','gpu','Radeon RX 7600 XT','Gigabyte',8990,{vram:16,tdp:190,len:280,pcie:4,fps:[72,280,170]}),
  P('rtx5060ti','gpu','GeForce RTX 5060 Ti 16GB','ASUS',12990,{vram:16,tdp:180,len:304,pcie:5,fps:[105,380,230]}),
  P('rx9070xt','gpu','Radeon RX 9070 XT','Sapphire',16990,{vram:16,tdp:304,len:320,pcie:5,fps:[140,450,290]}),
  P('rtx5070ti','gpu','GeForce RTX 5070 Ti','Gigabyte',21990,{vram:16,tdp:300,len:304,pcie:5,fps:[155,480,310]}),
  P('rtx5080','gpu','GeForce RTX 5080','MSI',33990,{vram:16,tdp:360,len:304,pcie:5,fps:[190,560,380]}),
  P('rtx5090','gpu','GeForce RTX 5090','ASUS',59990,{vram:32,tdp:575,len:336,pcie:5,fps:[260,700,480]}),
  P('d4-16','ram','Kingston Fury 16 GB 3200','Kingston',1190,{t:'DDR4',gb:16}),
  P('d4-32','ram','Corsair Vengeance 32 GB 3600','Corsair',2290,{t:'DDR4',gb:32}),
  P('d5-16','ram','Kingston Fury Beast 16 GB 6000','Kingston',1990,{t:'DDR5',gb:16}),
  P('d5-32','ram','G.Skill Ripjaws 32 GB 6000','G.Skill',3490,{t:'DDR5',gb:32}),
  P('d5-32rgb','ram','Corsair Vengeance RGB 32 GB 6400','Corsair',3990,{t:'DDR5',gb:32}),
  P('d5-64','ram','Kingston Fury 64 GB 6000','Kingston',6990,{t:'DDR5',gb:64}),
  P('a520','mb','MSI A520M-A PRO','MSI',1890,{s:'AM4',t:'DDR4',ff:'mATX'}),
  P('b550','mb','Gigabyte B550 Gaming X','Gigabyte',2990,{s:'AM4',t:'DDR4',ff:'ATX'}),
  P('b650m','mb','ASRock B650M Pro RS','ASRock',3290,{s:'AM5',t:'DDR5',ff:'mATX'}),
  P('b650','mb','MSI MAG B650 Tomahawk','MSI',4490,{s:'AM5',t:'DDR5',ff:'ATX'}),
  P('x870e','mb','ASUS ROG Strix X870E-E','ASUS',9990,{s:'AM5',t:'DDR5',ff:'ATX'}),
  P('b660m','mb','ASRock B660M Pro RS','ASRock',2790,{s:'LGA1700',t:'DDR4',ff:'mATX'}),
  P('b760','mb','MSI PRO B760-P','MSI',3990,{s:'LGA1700',t:'DDR5',ff:'ATX'}),
  P('z790','mb','Gigabyte Z790 Aorus Elite','Gigabyte',6990,{s:'LGA1700',t:'DDR5',ff:'ATX'}),
  P('psu450','psu','Endorfy Vero L5 450 W','Endorfy',890,{w:450}),
  P('psu550','psu','Endorfy Vero L5 Bronze 550 W','Endorfy',1190,{w:550}),
  P('psu650','psu','Corsair RM650e 650 W','Corsair',1990,{w:650}),
  P('psu750','psu','Seasonic Focus GX 750 W','Seasonic',2490,{w:750}),
  P('psu850','psu','be quiet! Pure Power 12 M 850 W','be quiet!',3290,{w:850}),
  P('psu1000','psu','MSI MPG A1000G 1000 W','MSI',4990,{w:1000}),
  P('psu1200','psu','Corsair RM1200x 1200 W','Corsair',6490,{w:1200}),
  P('c-mini','case','Endorfy Ventum 200','Endorfy',1090,{mg:300,ff:['mATX']}),
  P('c-mid','case','Fractal Pop Air','Fractal',1690,{mg:405,ff:['mATX','ATX']}),
  P('c-air','case','Fractal North','Fractal',2290,{mg:355,ff:['mATX','ATX']}),
  P('c-lian','case','Lian Li Lancool 216','Lian Li',2990,{mg:392,ff:['mATX','ATX']}),
  P('c-bq','case','be quiet! Pure Base 500DX','be quiet!',2490,{mg:369,ff:['mATX','ATX']}),
  P('c-xl','case','Corsair 4000D Airflow','Corsair',2690,{mg:360,ff:['mATX','ATX']}),
  P('ssd-500','ssd','Kingston NV3 500 GB','Kingston',990,{gb:500,pc:3}),
  P('ssd-1t3','ssd','Kingston NV2 1 TB','Kingston',1590,{gb:1000,pc:3}),
  P('ssd-1t4','ssd','WD Blue SN5100 1 TB','WD',1990,{gb:1000,pc:4}),
  P('ssd-2t4','ssd','Samsung 990 EVO Plus 2 TB','Samsung',3490,{gb:2000,pc:4}),
  P('ssd-2t5','ssd','Crucial T705 2 TB','Crucial',6490,{gb:2000,pc:5}),
  P('ssd-4t4','ssd','WD Black SN850X 4 TB','WD',7490,{gb:4000,pc:4}),
];
export const dn = p => (p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`);
export const BY = Object.fromEntries(PARTS.map(p => [p.id, p]));
export const RETAILERS = [
  ['Alza', q => `https://www.alza.cz/search.htm?exps=${q}`, 0.02],
  ['Smarty', q => `https://www.smarty.cz/search?q=${q}`, 0.01],
  ['TS Bohemia', q => `https://www.tsbohemia.cz/vyhledavani_c1.html?string=${q}`, 0],
  ['Mironet', q => `https://www.mironet.cz/vyhledavani/?string=${q}`, 0.012],
  ['CZC.cz', q => `https://www.czc.cz/${q}/hledat`, 0.005],
];
const hs = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const OUT = new Set(['rtx5090','i7-14700k','d5-32rgb','psu1200','ssd-2t5','b550','arc-b580']);
const cache = new Map();
export const offers = p => {
  if (!cache.has(p.id)) cache.set(p.id, RETAILERS.map(([n, u, b]) => {
    const r = hs(p.id + n);
    return { n, price: Math.round(p.price * (1 + b + ((r % 60) - 30) / 1000) / 10) * 10, stock: !OUT.has(p.id) && r % 7 !== 0, url: u(encodeURIComponent(dn(p))) };
  }));
  return cache.get(p.id);
};
export const best = p => { const os = offers(p), s = os.filter(o => o.stock); return (s.length ? s : os).reduce((a, b) => (b.price < a.price ? b : a)); };
export const fmt = n => `${Math.round(n).toLocaleString('cs-CZ')} Kč`;
export const spec = p => ({
  cpu: () => `${p.s} · ${p.c} jader · ${p.tdp} W`,
  gpu: () => `${p.vram} GB · ${p.tdp} W · ${p.len} mm · PCIe ${p.pcie}.0`,
  ram: () => `${p.t} · ${p.gb} GB`,
  mb: () => `${p.s} · ${p.t} · ${p.ff}`,
  psu: () => `${p.w} W · ATX`,
  case: () => `${p.ff.join(' / ')} · karta až ${p.mg} mm`,
  ssd: () => `${p.gb >= 1000 ? p.gb / 1000 + ' TB' : p.gb + ' GB'} · PCIe ${p.pc}.0`,
})[p.cat]();
export const power = o => (o.cpu || o.gpu ? 90 : 0) + (o.cpu?.tdp || 0) + (o.gpu?.tdp || 0);
export const rec = draw => Math.ceil((draw * 1.3) / 50) * 50;
export function check(o) {
  const r = [], { cpu, gpu, ram, mb, psu, case: cs } = o;
  if (cpu && mb) r.push(cpu.s === mb.s ? { l: 'ok', t: `Socket ${cpu.s} sedí` } : { l: 'bad', t: `Socket: procesor ${cpu.s}, deska ${mb.s}` });
  if (ram && mb) r.push(ram.t === mb.t ? { l: 'ok', t: `${ram.t} je podporována` } : { l: 'bad', t: `Deska potřebuje ${mb.t}, paměť je ${ram.t}` });
  if (psu && (cpu || gpu)) {
    const d = power(o), need = rec(d);
    r.push(psu.w >= need ? { l: 'ok', t: `Zdroj ${psu.w} W stačí (doporučeno ${need} W)` } : psu.w >= d * 1.1 ? { l: 'warn', t: `Zdroj ${psu.w} W je těsný, doporučeno ${need} W` } : { l: 'bad', t: `Zdroj ${psu.w} W je slabý, potřeba ${need} W` });
  }
  if (gpu && cs) r.push(gpu.len <= cs.mg ? { l: 'ok', t: `Karta ${gpu.len} mm se vejde (limit ${cs.mg} mm)` } : { l: 'bad', t: `Karta ${gpu.len} mm je delší než limit skříně ${cs.mg} mm` });
  if (mb && cs) r.push(cs.ff.includes(mb.ff) ? { l: 'ok', t: `Deska ${mb.ff} sedí do skříně` } : { l: 'bad', t: `Skříň nepojme desku ${mb.ff}` });
  return r.length ? r : [{ l: 'idle', t: 'Vyber díly a Qompify začne kontrolovat kompatibilitu' }];
}
export const TIERS = [
  { id: 't15', label: 'do 15 000 Kč', blurb: 'Plynulé hraní esportovek ve Full HD.', ids: ['r5-5600','rx6600','d4-16','a520','psu450','c-mini','ssd-1t3'] },
  { id: 't25', label: 'do 25 000 Kč', blurb: 'Vyvážená DDR5 platforma s prostorem na upgrade.', ids: ['r5-7600','rtx4060','d5-16','b650m','psu650','c-mid','ssd-1t4'] },
  { id: 't35', label: 'do 35 000 Kč', blurb: '16 GB grafika pro vysoké detaily a DLSS.', ids: ['r5-9600x','rtx5060ti','d5-32','b650','psu750','c-air','ssd-1t4'] },
  { id: 't50', label: '50 000+ Kč', blurb: 'Nejrychlejší herní procesor a high-end grafika.', ids: ['r7-7800x3d','rtx5070ti','d5-32','b650','psu850','c-air','ssd-2t4'] },
];
export const SEEDS = [
  { id: 's1', name: 'Tichá 1440p mašina', by: 'martin_k', likes: 128, ids: ['r5-9600x','rtx5060ti','d5-32','b650','psu750','c-bq','ssd-2t4'] },
  { id: 's2', name: 'CS2 za pár korun', by: 'dominik.cz', likes: 86, ids: ['i5-12400f','rx6600','d4-16','b660m','psu450','c-mini','ssd-1t3'] },
  { id: 's3', name: 'Streamovací monstrum', by: 'lenka_pc', likes: 211, ids: ['r9-9950x','rtx5080','d5-64','x870e','psu1000','c-lian','ssd-4t4'] },
  { id: 's4', name: 'Intel ve dvaceti pěti', by: 'jakub.b', likes: 54, ids: ['i5-14600kf','rx7600xt','d5-16','b760','psu650','c-xl','ssd-1t4'] },
];
