import LIVE from './prices.json';
export const CATS = [['cpu','Procesor'],['gpu','Grafická karta'],['ram','Paměť'],['mb','Základní deska'],['psu','Zdroj'],['case','Skříň'],['ssd','Úložiště']];
export const GFX = ['Nízké', 'Střední', 'Vysoké', 'Ultra'];
export const GAMES = [['Cyberpunk 2077','1080p, vysoké',1,[1.9,1.4,1,0.68]],['Black Myth: Wukong','1080p, vysoké',0.62,[2.1,1.5,1,0.62]],['Alan Wake 2','1080p, vysoké',0.55,[2.0,1.45,1,0.6]],['Hogwarts Legacy','1080p, vysoké',0.85,[1.7,1.3,1,0.75]],["Baldur's Gate 3",'1080p, vysoké',1.15,[1.5,1.25,1,0.82]],['Forza Horizon 5','1080p, vysoké',1.6,[1.5,1.25,1,0.8]],['Fortnite','1080p, vysoké',1.9,[1.3,1.12,1,0.8]],['Counter-Strike 2','1080p, vysoké',3.1,[1.18,1.08,1,0.92]],['Valorant','1080p, vysoké',3.9,[1.1,1.05,1,0.95]]];
export const fpsEff = (g, c, k) => Math.round(Math.min(g.sc, c.sc * 2.1) * k);
export const fpsAt = (g, c, gi, res, li) => { const G = GAMES[gi]; return Math.round(Math.min(g.sc * G[2] * G[3][li] * RES_K[res], c.sc * 2.1 * G[2])); };
// Ceny: v=1 ověřeno na českých e-shopech (Datart / Zboží.cz, 10/2026), v=0 orientační odhad.
const cpu = (id,name,brand,price,v,s,n,th,fb,f,l3,tdp,ig,pcie,mem,nm,sc) => ({id,cat:'cpu',name,brand,price,v,s,n,th,fb,f,l3,tdp,ig,pcie,mem,nm,sc});
const gpu = (id,name,brand,price,v,vram,vt,bus,tdp,len,pcie,pw,rt,fps) => ({id,cat:'gpu',name,brand,price,v,vram,vt,bus,tdp,len,pcie,pw,rt,fps,sc:fps[0]});
const ram = (id,name,brand,price,v,t,gb,mhz,cl,kit,exp,rgb) => ({id,cat:'ram',name,brand,price,v,t,gb,mhz,cl,kit,exp,rgb});
const mb = (id,name,brand,price,v,s,t,ff,chip,m2,wifi,lan,pcie) => ({id,cat:'mb',name,brand,price,v,s,t,ff,chip,m2,wifi,lan,pcie});
const psu = (id,name,brand,price,v,w,eff,atx3,mod,fan,pw12) => ({id,cat:'psu',name,brand,price,v,w,eff,atx3,mod,fan,pw12});
const cs = (id,name,brand,price,v,mg,ff,ch,fans,glass,type) => ({id,cat:'case',name,brand,price,v,mg,ff,ch,fans,glass,type});
const ssd = (id,name,brand,price,v,gb,pc,rd,wr,tbw,nand) => ({id,cat:'ssd',name,brand,price,v,gb,pc,rd,wr,tbw,nand});
export const PARTS = [
  cpu('i3-12100f','Core i3-12100F','Intel',2190,0,'LGA1700',4,8,3.3,4.3,12,58,0,5,'DDR4/DDR5',10,45),
  cpu('r5-5600','Ryzen 5 5600','AMD',3090,1,'AM4',6,12,3.5,4.4,32,65,0,4,'DDR4',7,62),
  cpu('i5-12400f','Core i5-12400F','Intel',3290,0,'LGA1700',6,12,2.5,4.4,18,65,0,5,'DDR4/DDR5',10,64),
  cpu('i5-13400f','Core i5-13400F','Intel',4490,0,'LGA1700',10,16,2.5,4.6,20,65,0,5,'DDR4/DDR5',10,72),
  cpu('r5-7600','Ryzen 5 7600','AMD',4590,0,'AM5',6,12,3.8,5.1,32,65,1,5,'DDR5',5,76),
  cpu('r5-9600x','Ryzen 5 9600X','AMD',4498,1,'AM5',6,12,3.9,5.4,32,65,1,5,'DDR5',4,85),
  cpu('r5-5700x3d','Ryzen 7 5700X3D','AMD',5490,0,'AM4',8,16,3.0,4.1,96,105,0,4,'DDR4',7,80),
  cpu('r7-7700','Ryzen 7 7700','AMD',6290,0,'AM5',8,16,3.8,5.3,32,65,1,5,'DDR5',5,84),
  cpu('i5-14600kf','Core i5-14600KF','Intel',7490,0,'LGA1700',14,20,3.5,5.3,24,125,0,5,'DDR4/DDR5',10,90),
  cpu('r7-9700x','Ryzen 7 9700X','AMD',7490,0,'AM5',8,16,3.8,5.5,32,65,1,5,'DDR5',4,92),
  cpu('u5-245k','Core Ultra 5 245K','Intel',4990,0,'LGA1851',14,14,4.2,5.2,24,125,1,5,'DDR5',3,92),
  cpu('r7-7800x3d','Ryzen 7 7800X3D','AMD',8790,0,'AM5',8,16,4.2,5.0,96,120,1,5,'DDR5',5,100),
  cpu('r9-9900x','Ryzen 9 9900X','AMD',9990,0,'AM5',12,24,4.4,5.6,64,120,1,5,'DDR5',4,108),
  cpu('i7-14700kf','Core i7-14700KF','Intel',9990,0,'LGA1700',20,28,3.4,5.6,33,125,0,5,'DDR4/DDR5',10,102),
  cpu('u7-265k','Core Ultra 7 265K','Intel',7490,0,'LGA1851',20,20,3.9,5.5,30,125,1,5,'DDR5',3,108),
  cpu('r7-9800x3d','Ryzen 7 9800X3D','AMD',10260,1,'AM5',8,16,4.7,5.2,96,120,1,5,'DDR5',4,112),
  cpu('r9-9950x','Ryzen 9 9950X','AMD',12490,0,'AM5',16,32,4.3,5.7,64,170,1,5,'DDR5',4,120),
  cpu('r9-9950x3d','Ryzen 9 9950X3D','AMD',17490,0,'AM5',16,32,4.3,5.7,128,170,1,5,'DDR5',4,128),
  gpu('rx6600','Radeon RX 6600 8GB','Sapphire',6990,0,8,'GDDR6',128,132,245,4,'1× 8-pin',1,[62,240,150]),
  gpu('rtx5050','GeForce RTX 5050 8GB','MSI',10590,1,8,'GDDR6',128,130,230,5,'1× 8-pin',1,[64,250,150]),
  gpu('arc-b580','Arc B580 12GB','Intel',7990,0,12,'GDDR6',192,190,272,4,'1× 8-pin',1,[74,260,160]),
  gpu('rx7600','Radeon RX 7600 8GB','Gigabyte',8490,0,8,'GDDR6',128,165,240,4,'1× 8-pin',1,[70,270,165]),
  gpu('rtx5060','GeForce RTX 5060 8GB','ASUS',11090,1,8,'GDDR7',128,145,240,5,'1× 8-pin',1,[80,310,185]),
  gpu('rtx5060ti-8','GeForce RTX 5060 Ti 8GB','Gigabyte',12990,0,8,'GDDR7',128,180,260,5,'1× 8-pin',1,[100,370,225]),
  gpu('rx9060xt-16','Radeon RX 9060 XT 16GB','Sapphire',12490,1,16,'GDDR6',128,160,270,5,'1× 8-pin',1,[90,330,200]),
  gpu('rtx5060ti-16','GeForce RTX 5060 Ti 16GB','ASUS',17490,0,16,'GDDR7',128,180,304,5,'1× 8-pin',1,[105,380,230]),
  gpu('rtx5070','GeForce RTX 5070 12GB','MSI',21990,0,12,'GDDR7',192,250,300,5,'1× 12V-2x6',1,[125,430,270]),
  gpu('rx9070','Radeon RX 9070 16GB','PowerColor',17990,1,16,'GDDR6',256,220,300,5,'2× 8-pin',1,[120,420,260]),
  gpu('rx9070xt','Radeon RX 9070 XT 16GB','Sapphire',18490,1,16,'GDDR6',256,304,320,5,'3× 8-pin',1,[140,450,290]),
  gpu('rtx5070ti','GeForce RTX 5070 Ti 16GB','Gigabyte',29990,1,16,'GDDR7',256,300,304,5,'1× 12V-2x6',1,[155,480,310]),
  gpu('rtx5080','GeForce RTX 5080 16GB','MSI',43990,0,16,'GDDR7',256,360,304,5,'1× 12V-2x6',1,[190,560,380]),
  gpu('rtx5090','GeForce RTX 5090 32GB','ASUS',125000,1,32,'GDDR7',512,575,336,5,'1× 12V-2x6',1,[260,700,480]),
  ram('d4-16','Kingston Fury Beast 16 GB (2×8) 3200','Kingston',3990,0,'DDR4',16,3200,16,'2×8','XMP',0),
  ram('d4-32','Corsair Vengeance LPX 32 GB (2×16) 3600','Corsair',8490,0,'DDR4',32,3600,18,'2×16','XMP',0),
  ram('d5-16','Kingston Fury Beast 16 GB (2×8) 5600','Kingston',5990,0,'DDR5',16,5600,36,'2×8','XMP / EXPO',0),
  ram('d5-32-5600','Kingston Fury Beast 32 GB (2×16) 5600','Kingston',11390,1,'DDR5',32,5600,36,'2×16','XMP / EXPO',0),
  ram('d5-32','G.Skill Ripjaws S5 32 GB (2×16) 6000','G.Skill',11490,1,'DDR5',32,6000,36,'2×16','EXPO',0),
  ram('d5-32cl30','Corsair Vengeance 32 GB (2×16) 6000 CL30','Corsair',12190,1,'DDR5',32,6000,30,'2×16','EXPO',0),
  ram('d5-32rgb','Corsair Vengeance RGB 32 GB (2×16) 6400','Corsair',13990,1,'DDR5',32,6400,32,'2×16','XMP',1),
  ram('d5-48','G.Skill Trident Z5 48 GB (2×24) 6000','G.Skill',17990,0,'DDR5',48,6000,30,'2×24','EXPO',1),
  ram('d5-64','Corsair Vengeance 64 GB (2×32) 6000','Corsair',24990,1,'DDR5',64,6000,30,'2×32','EXPO',0),
  ram('d5-96','G.Skill Flare X5 96 GB (2×48) 6000','G.Skill',39990,0,'DDR5',96,6000,36,'2×48','EXPO',0),
  mb('h610m','ASRock H610M-HDV','ASRock',1790,0,'LGA1700','DDR4','mATX','H610',1,0,'1 GbE',4),
  mb('a520','MSI A520M-A PRO','MSI',1990,0,'AM4','DDR4','mATX','A520',1,0,'1 GbE',3),
  mb('b660m','ASRock B660M Pro RS','ASRock',2990,0,'LGA1700','DDR4','mATX','B660',2,0,'1 GbE',4),
  mb('b550','Gigabyte B550 Gaming X V2','Gigabyte',3290,0,'AM4','DDR4','ATX','B550',2,0,'1 GbE',4),
  mb('b650m','ASRock B650M Pro RS','ASRock',3490,0,'AM5','DDR5','mATX','B650',2,0,'2.5 GbE',4),
  mb('b760','MSI PRO B760-P','MSI',4290,0,'LGA1700','DDR5','ATX','B760',3,0,'2.5 GbE',5),
  mb('b650','MSI MAG B650 Tomahawk WiFi','MSI',4690,0,'AM5','DDR5','ATX','B650',3,1,'2.5 GbE',5),
  mb('b860','MSI PRO B860-P WiFi','MSI',5490,0,'LGA1851','DDR5','ATX','B860',3,1,'2.5 GbE',5),
  mb('b850','Gigabyte B850 Aorus Elite WiFi7','Gigabyte',6290,0,'AM5','DDR5','ATX','B850',3,1,'2.5 GbE',5),
  mb('z790','Gigabyte Z790 Aorus Elite','Gigabyte',6990,0,'LGA1700','DDR5','ATX','Z790',4,1,'2.5 GbE',5),
  mb('x870','ASUS TUF Gaming X870-Plus WiFi','ASUS',7990,0,'AM5','DDR5','ATX','X870',4,1,'2.5 GbE',5),
  mb('z890','MSI MAG Z890 Tomahawk WiFi','MSI',8990,0,'LGA1851','DDR5','ATX','Z890',4,1,'2.5 GbE',5),
  mb('x870e','ASUS ROG Strix X870E-E Gaming WiFi','ASUS',10990,0,'AM5','DDR5','ATX','X870E',4,1,'2.5 GbE + 10 GbE',5),
  psu('psu450','Endorfy Vero L5 450 W','Endorfy',1090,0,450,'80+ Bronze',0,'Ne',120,0),
  psu('psu550','Endorfy Vero L5 Bronze 550 W','Endorfy',1390,0,550,'80+ Bronze',0,'Ne',120,0),
  psu('psu650','Corsair RM650e 650 W','Corsair',2190,0,650,'80+ Gold',1,'Plně',135,0),
  psu('psu750','Seasonic Focus GX 750 W','Seasonic',2690,0,750,'80+ Gold',1,'Plně',120,0),
  psu('psu850','be quiet! Pure Power 12 M 850 W','be quiet!',3490,0,850,'80+ Gold',1,'Plně',120,1),
  psu('psu1000','MSI MPG A1000G PCIE5 1000 W','MSI',5490,0,1000,'80+ Gold',1,'Plně',135,1),
  psu('psu1200','Corsair RM1200x Shift 1200 W','Corsair',6990,0,1200,'80+ Gold',1,'Plně',135,1),
  cs('c-mini','Endorfy Ventum 200','Endorfy',1190,0,300,['mATX'],155,'2× 120 mm',1,'Mini tower'),
  cs('c-mid','Fractal Pop Air','Fractal',1690,0,405,['mATX','ATX'],170,'3× 120 mm',1,'Midi tower'),
  cs('c-air','Fractal North','Fractal',2290,0,355,['mATX','ATX'],170,'2× 140 mm',1,'Midi tower'),
  cs('c-bq','be quiet! Pure Base 500DX','be quiet!',2490,0,369,['mATX','ATX'],190,'3× 140 mm',1,'Midi tower'),
  cs('c-xl','Corsair 4000D Airflow','Corsair',2690,0,360,['mATX','ATX'],170,'2× 120 mm',1,'Midi tower'),
  cs('c-lian','Lian Li Lancool 216','Lian Li',2990,0,392,['mATX','ATX'],180,'2× 160 + 1× 140 mm',1,'Midi tower'),
  ssd('ssd-500','Kingston NV3 500 GB','Kingston',2490,0,500,4,5000,3000,200,'TLC, bez DRAM'),
  ssd('ssd-1t3','Kingston NV2 1 TB','Kingston',3290,0,1000,3,3500,2800,320,'TLC, bez DRAM'),
  ssd('ssd-1t4','WD Blue SN5100 1 TB','WD',3690,1,1000,4,5000,4200,600,'TLC, bez DRAM'),
  ssd('ssd-1t4-evo','Samsung 990 EVO Plus 1 TB','Samsung',4790,1,1000,4,7250,6300,600,'TLC, HMB'),
  ssd('ssd-1t4-pro','Samsung 990 PRO 1 TB','Samsung',6499,1,1000,4,7450,6900,600,'TLC, DRAM'),
  ssd('ssd-1t5','Crucial T500 1 TB','Crucial',8990,0,1000,5,10000,9500,600,'TLC, DRAM'),
  ssd('ssd-2t4','WD Blue SN5100 2 TB','WD',5990,1,2000,4,5000,4200,1200,'TLC, bez DRAM'),
  ssd('ssd-2t4-pro','Samsung 990 PRO 2 TB','Samsung',9990,0,2000,4,7450,6900,1200,'TLC, DRAM'),
  ssd('ssd-2t5','Crucial T705 2 TB','Crucial',12990,0,2000,5,14500,12700,1200,'TLC, DRAM'),
  ssd('ssd-4t4','WD Black SN850X 4 TB','WD',14990,0,4000,4,7300,6600,2400,'TLC, DRAM'),
  cpu('r5-7500f','Ryzen 5 7500F','AMD',3990,0,'AM5',6,12,3.7,5.0,32,65,0,5,'DDR5',5,74),
  cpu('r7-5700x','Ryzen 7 5700X','AMD',4990,0,'AM4',8,16,3.4,4.6,32,65,0,4,'DDR4',7,72),
  cpu('i5-12600kf','Core i5-12600KF','Intel',5490,0,'LGA1700',10,16,3.7,4.9,20,125,0,5,'DDR4/DDR5',10,76),
  cpu('i9-14900k','Core i9-14900K','Intel',12290,0,'LGA1700',24,32,3.2,6.0,36,125,1,5,'DDR4/DDR5',10,112),
  cpu('u9-285k','Core Ultra 9 285K','Intel',13490,0,'LGA1851',24,24,3.7,5.7,36,125,1,5,'DDR5',3,115),
  cpu('r9-7950x3d','Ryzen 9 7950X3D','AMD',15990,0,'AM5',16,32,4.2,5.7,128,120,1,5,'DDR5',5,118),
  gpu('arc-b570','Arc B570 10GB','Intel',6490,0,10,'GDDR6',160,150,245,4,'1× 8-pin',1,[66,235,140]),
  gpu('rx9060xt-8','Radeon RX 9060 XT 8GB','Gigabyte',9390,0,8,'GDDR6',128,150,250,5,'1× 8-pin',1,[85,320,190]),
  gpu('rx7800xt','Radeon RX 7800 XT 16GB','Sapphire',14990,0,16,'GDDR6',256,263,300,4,'2× 8-pin',1,[110,400,250]),
  ram('d4-32-3200','Kingston Fury Beast 32 GB (2×16) 3200','Kingston',7490,0,'DDR4',32,3200,16,'2×16','XMP',0),
  ram('d5-16-6000','Kingston Fury Beast 16 GB (2×8) 6000','Kingston',6490,0,'DDR5',16,6000,36,'2×8','EXPO',0),
  ram('d5-64-6400','Corsair Dominator Titanium 64 GB (2×32) 6400','Corsair',26990,0,'DDR5',64,6400,32,'2×32','XMP / EXPO',1),
  mb('b550m','ASRock B550M-HDV','ASRock',2490,0,'AM4','DDR4','mATX','B550',1,0,'1 GbE',4),
  mb('b760m','MSI PRO B760M-E','MSI',3290,0,'LGA1700','DDR5','mATX','B760',2,0,'1 GbE',4),
  mb('b650m-wifi','Gigabyte B650M Gaming Wi-Fi','Gigabyte',4190,0,'AM5','DDR5','mATX','B650',2,1,'2.5 GbE',4),
  psu('psu600','be quiet! System Power 10 600 W','be quiet!',1590,0,600,'80+ Bronze',0,'Ne',120,0),
  psu('psu750b','Endorfy Vero L5 750 W','Endorfy',1890,0,750,'80+ Bronze',0,'Ne',120,0),
  cs('c-q300l','Cooler Master MasterBox Q300L','Cooler Master',1390,0,360,['mATX'],157,'1× 120 mm',1,'Mini tower'),
  cs('c-h5','NZXT H5 Flow','NZXT',2790,0,365,['mATX','ATX'],165,'2× 120 mm',1,'Midi tower'),
  cs('c-meshify','Fractal Meshify 2 Compact','Fractal',3490,0,341,['mATX','ATX'],169,'2× 140 mm',1,'Midi tower'),
  ssd('ssd-1t4-sn770','WD Black SN770 1 TB','WD',4290,0,1000,4,5150,4900,600,'TLC, bez DRAM'),
  ssd('ssd-2t3','Kingston NV2 2 TB','Kingston',5490,0,2000,3,3500,2800,640,'TLC, bez DRAM'),
  ssd('ssd-2t4-kc3000','Kingston KC3000 2 TB','Kingston',8490,0,2000,4,7000,7000,1600,'TLC, DRAM'),
];
export const SPEC = {
  cpu: [['s','Socket'],['n','Jádra','',1],['th','Vlákna','',1],['fb','Základní takt','GHz',1],['f','Boost takt','GHz',1],['l3','L3 cache','MB',1],['tdp','TDP','W',-1],['ig','Integrovaná grafika','yn'],['pcie','PCIe','pcie'],['mem','Paměť'],['nm','Výrobní proces','nm',-1],['sc','Výkon (index)','',1]],
  gpu: [['vram','Paměť VRAM','GB',1],['vt','Typ paměti'],['bus','Sběrnice','bit',1],['tdp','Příkon (TBP)','W',-1],['len','Délka karty','mm',-1],['pcie','PCIe','pcie'],['pw','Napájecí konektor'],['rt','Ray tracing','yn'],['sc','Výkon (index, FPS)','',1]],
  ram: [['t','Typ'],['gb','Kapacita','GB',1],['mhz','Frekvence','MT/s',1],['cl','Latence CL','',-1],['kit','Sada'],['exp','Profil'],['rgb','RGB osvětlení','yn']],
  mb: [['s','Socket'],['t','Paměť'],['ff','Formát'],['chip','Čipset'],['m2','Sloty M.2','',1],['wifi','Wi-Fi','yn'],['lan','Síť'],['pcie','Slot pro grafiku','pcie']],
  psu: [['w','Výkon','W',1],['eff','Účinnost'],['atx3','ATX 3.x','yn'],['mod','Modulární kabeláž'],['fan','Ventilátor','mm',1],['pw12','Konektor 12V-2x6','yn']],
  case: [['type','Typ'],['ff','Podporované desky'],['mg','Max. délka grafiky','mm',1],['ch','Max. výška chladiče','mm',1],['fans','Ventilátory v balení'],['glass','Prosklený bok','yn']],
  ssd: [['gb','Kapacita','GB',1],['pc','Rozhraní','pcie'],['rd','Čtení','MB/s',1],['wr','Zápis','MB/s',1],['tbw','Životnost (TBW)','TB',1],['nand','Paměť / cache']],
};
export const showVal = (v, u) => v === undefined ? '–' : u === 'yn' ? (v ? 'Ano' : 'Ne') : u === 'pcie' ? `PCIe ${v}.0` : Array.isArray(v) ? v.join(' / ') : `${typeof v === 'number' ? v.toLocaleString('cs-CZ') : v}${u ? ' ' + u : ''}`;
export const perf = p => p.sc || p.rd || 0;
export const dn = p => (p.name.toLowerCase().startsWith(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`);
export const BY = Object.fromEntries(PARTS.map(p => [p.id, p]));
export const RETAILERS = [
  ['Alza', q => `https://www.alza.cz/search.htm?exps=${q}`, 0.03],
  ['Datart', q => `https://www.datart.cz/vyhledavani?q=${q}`, 0.0],
  ['Mironet', q => `https://www.mironet.cz/vyhledavani/?string=${q}`, 0.015],
  ['TS Bohemia', q => `https://www.tsbohemia.cz/vyhledavani_c1.html?string=${q}`, 0.005],
  ['CZC.cz', q => `https://www.czc.cz/${q}/hledat`, 0.01],
];
const hs = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export const VERIFIED = [
  { id: 'rx9060xt-16', price: 12490, shop: 'Datart', date: 'říjen 2026', src: 'https://www.datart.cz/graficke-karty-amd-radeon.html', note: 'Nejlevnější RX 9060 XT 16 GB v katalogu Datartu, další kusy stojí 12 790 až 13 490 Kč.' },
  { id: 'rx9070xt', price: 18490, shop: 'Datart', date: 'říjen 2026', src: 'https://www.datart.cz/graficke-karty-amd-radeon.html', note: 'Nejlevnější RX 9070 XT v katalogu Datartu, další kusy stojí 18 690 až 23 990 Kč.' },
  { id: 'rtx5070ti', price: 29990, shop: 'Datart', date: 'říjen 2026', src: 'https://www.datart.cz/graficke-karty-nvidia-rtx-5070-ti.html', note: 'Nejlevnější RTX 5070 Ti v Datartu (další kusy 31 490 Kč). Dostupnost této karty se podle zahraničních médií zhoršuje.' },
  { id: 'd5-32-5600', price: 11390, shop: 'Datart', date: 'říjen 2026', src: 'https://www.datart.cz/pameti-ram-ddr5-32-gb.html', note: 'Nejlevnější sada 32 GB DDR5 v Datartu. Paměti jsou kvůli nedostatku výrazně dražší než loni.' },
  { id: 'ssd-1t4', price: 3690, shop: 'Datart', date: 'říjen 2026', src: 'https://www.datart.cz/ssd-disky-s-kapacitou-1-tb.html', note: 'Nejlevnější 1 TB NVMe PCIe 4.0 SSD v Datartu.' },
  { id: 'mon-odyssey-g5', price: 3490, shop: 'Alza', date: '24. 9. 2026', src: 'https://mobilizujeme.cz/clanky/lepsi-nabidka-neni-herni-monitor-z-alzy-zlevnil-pod-3-500-kc-ma-27-palcu-a-180-hz', note: 'Akční cena na Alze. QHD při 180 Hz, pro plnou frekvenci je potřeba DisplayPort.' },
  { id: 'mon-viewsonic-xg275d1', price: 7799, shop: 'Alza', date: 'září 2026', src: 'https://mobilizujeme.cz/clanky/naslapany-herni-monitor-v-alze-zlevnil-o-40-nabizi-4k-rozliseni-a-az-320-hz', note: 'Zlevněno o 40 %. 4K při 160 Hz, v režimu Full HD až 320 Hz.' },
];
const VPIN = Object.fromEntries(VERIFIED.map(v => [v.id, v]));
const OUT = new Set(['rtx5090','i7-14700kf','d5-96','psu1200','ssd-1t5','b550','r9-9950x3d']);
const cache = new Map();
export const offers = p => {
  const live = LIVE.items?.[p.id]?.shops;
  if (live && Object.keys(live).length) return RETAILERS.filter(([n]) => live[n]).map(([n, u]) => ({ n, price: live[n].price, stock: live[n].stock !== false, url: u(encodeURIComponent(dn(p))), live: true }));
  if (!cache.has(p.id)) cache.set(p.id, RETAILERS.map(([n, u, b]) => {
    const r = hs(p.id + n);
    return { n, price: Math.round(p.price * (1 + b + ((r % 40) - 15) / 1000) / 10) * 10, stock: !OUT.has(p.id) && r % 7 !== 0, url: u(encodeURIComponent(dn(p))) };
  }));
  const list = cache.get(p.id), vp = VPIN[p.id];
  if (!vp) return list;
  return list.map(o => (o.n === vp.shop ? { ...o, price: vp.price, stock: true } : { ...o, price: Math.max(o.price, vp.price) }));
};
export const best = p => { const os = offers(p), s = os.filter(o => o.stock); return (s.length ? s : os).reduce((a, b) => (b.price < a.price ? b : a)); };
export const fmt = n => `${Math.round(n).toLocaleString('cs-CZ')} Kč`;
export const spec = p => ({
  cpu: () => `${p.s} · ${p.n}/${p.th} jader/vláken · ${p.f} GHz · ${p.tdp} W`,
  gpu: () => `${p.vram} GB ${p.vt} · ${p.tdp} W · ${p.len} mm · PCIe ${p.pcie}.0`,
  ram: () => `${p.t} · ${p.gb} GB · ${p.mhz} MT/s · CL${p.cl}`,
  mb: () => `${p.s} · ${p.t} · ${p.ff} · ${p.chip}`,
  psu: () => `${p.w} W · ${p.eff} · ${p.mod} modulární`,
  case: () => `${p.ff.join(' / ')} · karta až ${p.mg} mm · chladič až ${p.ch} mm`,
  ssd: () => `${p.gb >= 1000 ? p.gb / 1000 + ' TB' : p.gb + ' GB'} · PCIe ${p.pc}.0 · ${p.rd} MB/s`,
})[p.cat]();
export const power = o => (o.cpu || o.gpu ? 90 : 0) + (o.cpu?.tdp || 0) + (o.gpu?.tdp || 0);
export const rec = draw => Math.ceil((draw * 1.3) / 50) * 50;
export function check(o) {
  const r = [], { cpu, gpu, ram, mb, psu, case: cs } = o;
  if (cpu && mb) r.push(cpu.s === mb.s ? { l: 'ok', t: `Socket ${cpu.s} sedí` } : { l: 'bad', t: `Socket: procesor ${cpu.s}, deska ${mb.s}` });
  if (ram && mb) r.push(mb.t === 'DDR4' || mb.t === 'DDR5' ? (ram.t === mb.t ? { l: 'ok', t: `${ram.t} je podporována` } : { l: 'bad', t: `Deska potřebuje ${mb.t}, paměť je ${ram.t}` }) : { l: 'ok', t: 'Paměť sedí' });
  if (cpu && ram && !cpu.mem.includes(ram.t)) r.push({ l: 'bad', t: `Procesor podporuje jen ${cpu.mem}` });
  if (psu && (cpu || gpu)) {
    const d = power(o), need = rec(d);
    r.push(psu.w >= need ? { l: 'ok', t: `Zdroj ${psu.w} W stačí (doporučeno ${need} W)` } : psu.w >= d * 1.1 ? { l: 'warn', t: `Zdroj ${psu.w} W je těsný, doporučeno ${need} W` } : { l: 'bad', t: `Zdroj ${psu.w} W je slabý, potřeba ${need} W` });
  }
  if (gpu && cs) r.push(gpu.len <= cs.mg ? { l: 'ok', t: `Karta ${gpu.len} mm se vejde (limit ${cs.mg} mm)` } : { l: 'bad', t: `Karta ${gpu.len} mm je delší než limit skříně ${cs.mg} mm` });
  if (mb && cs) r.push(cs.ff.includes(mb.ff) ? { l: 'ok', t: `Deska ${mb.ff} sedí do skříně` } : { l: 'bad', t: `Skříň nepojme desku ${mb.ff}` });
  if (cpu && gpu) { const q = gpu.sc / cpu.sc; r.push(q > 2.1 ? { l: 'warn', t: `Procesor může brzdit grafiku (odhad −${Math.round((1 - 2.1 / q) * 100)} % výkonu)` } : q < 0.42 ? { l: 'warn', t: 'Procesor je pro tuto grafiku předimenzovaný, část výkonu nevyužiješ' } : { l: 'ok', t: 'Procesor a grafika jsou vyvážené' }); }
  return r.length ? r : [{ l: 'idle', t: 'Vyber díly a Qompify začne kontrolovat kompatibilitu' }];
}
export const TIERS = [
  { id: 't25', label: 'do 25 000 Kč', blurb: 'AM4 s DDR4: nejlevnější cesta, dokud je DDR5 tak drahá.', ids: ['r5-5600','rx7600','d4-16','a520','psu550','c-mini','ssd-1t3'] },
  { id: 't35', label: 'do 35 000 Kč', blurb: 'AM5 platforma s 16 GB grafikou pro Full HD na vysoké.', ids: ['r5-7600','rx9060xt-16','d5-16','b650m','psu650','c-mid','ssd-1t4'] },
  { id: 't50', label: 'do 50 000 Kč', blurb: '32 GB DDR5 a Radeon RX 9070 XT pro 1440p.', ids: ['r5-9600x','rx9070xt','d5-32','b650','psu750','c-air','ssd-1t4'] },
  { id: 't70', label: 'do 70 000 Kč', blurb: 'Nejlepší herní procesor a RTX 5070 Ti.', ids: ['r7-9800x3d','rtx5070ti','d5-32','b650','psu850','c-air','ssd-2t4'] },
];
export const SEEDS = [
  { id: 's1', name: 'Tichá 1440p mašina', by: 'martin_k', likes: 128, ids: ['r5-9600x','rtx5060ti-16','d5-32','b650','psu750','c-bq','ssd-2t4'] },
  { id: 's2', name: 'CS2 za pár korun', by: 'dominik.cz', likes: 86, ids: ['i5-12400f','rx6600','d4-16','b660m','psu450','c-mini','ssd-500'] },
  { id: 's3', name: 'Streamovací monstrum', by: 'lenka_pc', likes: 211, ids: ['r9-9950x','rtx5080','d5-64','x870e','psu1000','c-lian','ssd-4t4'] },
  { id: 's4', name: 'Intel ve čtyřiceti', by: 'jakub.b', likes: 54, ids: ['i5-14600kf','rx9070','d5-32','b760','psu650','c-xl','ssd-1t4'] },
];

const mon = (id,name,brand,price,v,size,res,panel,hz,ms,hdr,tags) => ({ id, cat: 'monitor', name, brand, price, v, size, res, panel, hz, ms, hdr, tags });
export const RES_K = { FHD: 1, QHD: 0.72, UWQHD: 0.62, '4K': 0.42 };
export const MONITORS = [
  mon('mon-aoc-24b3ha2','AOC 24B3HA2','AOC',2490,0,24,'FHD','IPS',100,4,0,['office']),
  mon('mon-msi-272f','MSI MAG 272F X24','MSI',2990,1,27,'FHD','Fast IPS',240,1,0,['esport','gaming']),
  mon('mon-odyssey-g5','Samsung Odyssey G5 27"','Samsung',3490,1,27,'QHD','VA',180,1,0,['gaming']),
  mon('mon-aoc-q27g4zr','AOC Q27G4ZR','AOC',3999,1,27,'QHD','Fast IPS',260,0.5,0,['gaming','esport']),
  mon('mon-aoc-c27g2z3','AOC C27G2Z3 Gaming','AOC',4190,1,27,'FHD','VA',240,0.5,0,['esport']),
  mon('mon-samsung-s6','Samsung ViewFinity S6 27"','Samsung',5990,0,27,'QHD','IPS',100,5,0,['office','work']),
  mon('mon-viewsonic-xg275d1','ViewSonic XG275D1-4K','ViewSonic',7799,1,27,'4K','Fast IPS',160,0.5,1,['gaming','work']),
  mon('mon-lg-27up850n','LG UltraFine 27UP850N','LG',9990,0,27,'4K','IPS',60,5,1,['work']),
  mon('mon-dell-u2724d','Dell UltraSharp U2724D','Dell',10990,0,27,'QHD','IPS Black',120,5,1,['work']),
  mon('mon-gigabyte-mo27q2a','Gigabyte MO27Q2A','Gigabyte',11892,1,27,'QHD','QD-OLED',280,0.03,1,['gaming','esport']),
  mon('mon-msi-321upx','MSI MAG 321UPX QD-OLED','MSI',14391,1,32,'4K','QD-OLED',240,0.03,1,['gaming']),
  mon('mon-aoc-ag276uzd','AOC AGON AG276UZD','AOC',14693,1,27,'4K','QD-OLED',240,0.03,1,['gaming']),
  mon('mon-aoc-ag326ud','AOC AGON AG326UD','AOC',14712,1,32,'4K','QD-OLED',165,0.03,1,['gaming','work']),
  mon('mon-msi-321urxw','MSI MPG 321URXW','MSI',14994,1,32,'4K','QD-OLED',240,0.03,1,['gaming']),
  mon('mon-dell-aw3225qf','Dell Alienware AW3225QF','Dell',18891,1,32,'4K','QD-OLED',240,0.03,1,['gaming']),
  mon('mon-aorus-fo32u2p','Gigabyte AORUS FO32U2P','Gigabyte',18891,1,32,'4K','QD-OLED',240,0.03,1,['gaming','work']),
  mon('mon-philips-32m2n','Philips Evnia 32M2N6901A','Philips',21190,1,32,'4K','QD-OLED',165,0.03,1,['work','gaming']),
];
export const LOOK = { ...BY, ...Object.fromEntries(MONITORS.map(m => [m.id, m])) };

const hcache = new Map();
export const history = p => {
  if (hcache.has(p.id)) return hcache.get(p.id);
  const cur = best(p).price, live = LIVE.items?.[p.id]?.hist, day = 864e5;
  let out;
  if (live && live.length > 2) out = [...live.map(([d, v]) => ({ d, v })), { d: new Date().toISOString().slice(0, 10), v: cur }];
  else {
    let s = [...p.id].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5), v = cur;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296, tr = { ram: 0.0055, ssd: 0.004, gpu: 0.0004 }[p.cat] ?? -0.0002, dip = s % 4 === 0;
    const a = Array(90);
    for (let i = 89; i >= 0; i--) { a[i] = v; v = v / (1 + tr + (rnd() - 0.5) * 0.02); }
    if (dip) for (let i = 83; i < 89; i++) a[i] *= 1.1 + rnd() * 0.1;
    a[89] = cur;
    out = a.map((x, i) => ({ d: new Date(Date.now() - (89 - i) * day).toISOString().slice(0, 10), v: Math.round(x / 10) * 10 }));
  }
  hcache.set(p.id, out); return out;
};
export const deals = () => PARTS.filter(p => offers(p).some(o => o.stock)).map(p => {
  const h = history(p), avg = h.slice(-31, -1).reduce((a, x) => a + x.v, 0) / 30, b = best(p);
  return { p, pr: b.price, shop: b.n, pct: Math.round((1 - b.price / avg) * 100) };
}).filter(x => x.pct >= 3).sort((a, b) => b.pct - a.pct).slice(0, 12);

export function optimize(budget, use, brand) {
  const L = c => PARTS.filter(p => p.cat === c), pr = p => best(p).price;
  const cheap = a => (a.length ? a.reduce((x, y) => (pr(y) < pr(x) ? y : x)) : null);
  const gpus = use === 'office' ? [null] : use === 'work' ? [null, ...L('gpu')] : L('gpu');
  const out = []; let min = Infinity;
  for (const c of L('cpu')) {
    if ((brand && c.brand !== brand) || (use === 'office' && !c.ig)) continue;
    const board = cheap(L('mb').filter(m => m.s === c.s)); if (!board) continue;
    const rams = [16, 32].map(g => cheap(L('ram').filter(r => r.t === board.t && c.mem.includes(r.t) && r.gb >= g && r.gb <= g * 2))).filter(Boolean);
    const ssds = [500, 1000, 2000].map(g => cheap(L('ssd').filter(s => s.gb >= g && s.gb <= g * 2))).filter(Boolean);
    for (const g of gpus) for (const ram of rams) for (const s of ssds) {
      const o = { cpu: c, mb: board, ram, ssd: s }; if (g) o.gpu = g;
      const psu = cheap(L('psu').filter(p => p.w >= rec(power(o)))), cs = cheap(L('case').filter(k => k.ff.includes(board.ff) && (!g || k.mg >= g.len)));
      if (!psu || !cs) continue; o.psu = psu; o.case = cs;
      if (check(o).some(r => r.l === 'bad')) continue;
      const tot = Object.values(o).reduce((a, p) => a + pr(p), 0); min = Math.min(min, tot); if (tot > budget) continue;
      const gs = g ? g.sc : 18, q = g ? g.sc / c.sc : 0;
      const sc = (use === 'gaming' ? 0.72 * gs + 0.28 * c.sc - (q > 2.1 ? 25 : 0) : use === 'work' ? 0.25 * gs + 0.75 * (c.sc + c.th * 0.8) : c.sc * 0.6 - tot / 700) + (ram.gb >= 32 ? (use === 'work' ? 8 : 3) : 0) + (s.gb >= 2000 ? 1.5 : 0) + (s.gb >= 1000 ? 2 : 0);
      out.push({ o, tot, score: sc });
    }
  }
  out.sort((a, b) => b.score - a.score);
  const seen = new Set(), list = [];
  for (const r of out) { const k = r.o.cpu.id + (r.o.gpu?.id || ''); if (seen.has(k)) continue; seen.add(k); list.push(r); if (list.length === 3) break; }
  return { list, min };
}
