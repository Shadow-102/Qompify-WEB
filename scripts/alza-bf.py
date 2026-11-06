# Vytvoří src/alzabf.json z exportu „Alza_BF_2026_Hlidac_shopu.xlsx“ (list „Všechny produkty“): jen PC hardware, kompaktní záznamy.
# Spuštění:  python3 scripts/alza-bf.py cesta/k/Alza_BF_2026_Hlidac_shopu.xlsx   (potřebuje pandas + openpyxl)
import sys, re, json, pandas as pd
src = sys.argv[1] if len(sys.argv) > 1 else 'Alza_BF_2026_Hlidac_shopu.xlsx'
df = pd.read_excel(src, sheet_name='Všechny produkty')
df.columns = ['name','url','bf','alza_orig','alza_disc','ref','reftype','disc','diff','verdict','last','lastdate','avail','rating','reviews','state','check']
n = df.name.fillna('')
NOT = re.compile(r'Surface|Copilot|pouzdro|Case|XS\d{4}|Expansion|Laptop|Notebook|notebook|OMEN 1\d|Alza ?GameBox|AlzaPC|HAL3000|Počítač|počítač|Gaming PC|All-in-One|\bAIO\b|IdeaCentre|zbran|Skříň na|skříňka|Protein|Beggs|tepelné čerpadlo|LG (RHX|WHX|F4X)|Chladič|Utěsň|LIQUI|Sonax|Autoprofi|Portable Solar|Power Bank|powerbank|nabíječ|Nabíječ|AlzaPower|BigBlue|Bloody|A4tech|Vention|Gwendy|Teddies|OXE|KIS |YALE|zámek')
def has(p): return n.str.contains(p, regex=True, na=False)
cats = {
 'gpu':  has(r'GeForce RTX|Radeon RX \d|Intel Arc B\d') & ~has(r'\('),
 'cpu':  has(r'^AMD Ryzen \d|^Intel Core (Ultra )?[3579]'),
 'ram':  has(r'\bDDR[45]\b') & ~has(r'SO-?DIMM|Notebook'),
 'ssd':  (has(r'Samsung 99\d|Samsung 98\d|WD[ _]?BLACK SN\d+|Kingston NV\d|Crucial (P\d|T\d{3})|Patriot P\d{3}|Lexar NM\d+|Corsair MP\d{3}|SK hynix') | (has(r'\bSSD\b|NVMe') & ~has(r'Portable|externí|[Bb]ox|dock|Dock|adapter|enclosure|Enclosure|AXAGON|ORICO|kabel|Rámeček|Kit pro'))) ,
 'psu': has(r'^Seasonic|^Fractal Design Ion|^be quiet! (Pure|Straight|System|Dark)|^Corsair (RM|HX|CX)|^MSI MAG A\d{3}|^Endorfy Vero|ATX 3\.[01]') & ~has(r'Notebook|adapt'),
 'case': has(r'^Fractal Design (?!Ion)|^NZXT H|^Lian Li|^Endorfy (Signum|Ventum|Regnum|Arx)|^be quiet! (Pure Base|Shadow Base|Light Base)'),
 'cooler': has(r'^Noctua|^Arctic Liquid|^DeepCool|^Thermalright|^be quiet! (Dark Rock|Pure Rock|Silent Loop)|^Endorfy (Fera|Fortis|Navis)'),
 'hdd': has(r'^Seagate (BarraCuda|IronWolf)|^WD (Blue|Red|Purple|Black)|^Toshiba (P300|N300|X300)'),
 'mb':   has(r'^(ASROCK|ASRock|ASUS|MSI|GIGABYTE|Gigabyte) .*\b(A620|B650E?|B850|X870E?|X670E?|B840|Z790|Z890|B760|B860|H610|B550|X570|A520|B450)\b') & ~has(r'Portable|Solar|Alzapower'),
 'monitor': has(r'UltraGear|Odyssey|UltraSharp|ViewFinity|MOBIUZ|ZOWIE|Evnia|Optix|MPG \d|MAG \d{3}|ROG Swift|TUF Gaming VG|AGON|G-Master|Predator X|Nitro (XV|VG)|Alienware AW|Legion R\d|ThinkVision|Philips \d{2}M\d|Smart Monitor|Gigabyte (M|GS|AORUS)\w* ?\d|ViewSonic (VX|XG)|Xiaomi (Monitor|G\d)|HyperX Omen 27|OMEN 27|OMEN 25') & n.str.match(r'^\d{2}(,\d)?["”]') & ~has(r'OLED\d{2}\b|QE\d{2}|Smart TV|Google TV|webOS|\d{2}(QNED|NANO|UT|UR)\d'),
 'periph': has(r'^(Logitech|Razer|SteelSeries|HyperX|ROCCAT|Trust GXT|Endorfy|Corsair|Glorious|Genesis|Cooler Master) ') & ~has(r'OMEN|Laptop|Notebook') & has(r'[Mm]yš|[Kk]lávesnice|[Hh]eadset|[Ss]luchátka|Mouse|Keyboard|Headset|Mousepad|G\d{3}|Viper|DeathAdder|BlackWidow|Kraken|Cloud (II|III|Alpha|Core|Stinger)|Arctis|Apex|Rival|Aerox|Prime|Superlight|K\d{2}|M\d{2}'),
}
out = []
for c, m in cats.items():
    d = df[m & ~n.str.contains(NOT, regex=True, na=False)].copy(); d['cat'] = c; out.append(d)
hw = pd.concat(out).drop_duplicates('url')
hw = hw[hw.bf.notna() & hw.ref.notna()]
vcode = {'Podle nás sleva':'s','Na slevě se shodneme':'a','Podle nás bez slevy':'n','Podle nás zdraženo':'z'}
rows = []
for r in hw.itertuples():
    rows.append([r.name, r.url.replace('https://www.alza.cz/',''), int(r.bf), int(r.ref), round(float(r.disc),2), int(r.diff), vcode.get(r.verdict,'?'), 'm' if str(r.reftype).startswith('Min') else 'b',
                 None if pd.isna(r.alza_orig) else int(r.alza_orig), None if pd.isna(r.rating) else float(r.rating), None if pd.isna(r.reviews) else int(r.reviews), 1 if str(r.avail).startswith('Skladem') else 0, r.cat, None if pd.isna(r.check) else int(r.check)])
json.dump(rows, open('src/alzabf.json','w',encoding='utf8'), ensure_ascii=False, separators=(',',':'))
print(len(rows), 'záznamů'); print(hw.cat.value_counts().to_dict())
