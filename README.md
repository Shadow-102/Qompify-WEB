# Qompify

Stavitel PC, srovnávač cen, kontrola kompatibility, optimalizátor rozpočtu a články (React).

## Nasazení (GitHub Pages)
Hotový web je ve složce `docs/`, kořenový `index.html` ho načítá. Settings → Pages → Deploy from a branch → main → / (root).

## Úpravy kódu
    npm install
    npm run build      # přegeneruje docs/app.js a docs/app.css
Pak commit a push. Díly a ceny: `src/data.js`.

## Živé ceny
1. Do `scripts/feeds.json` vlož URL XML feedů (formát Heureka / Zboží.cz) z affiliate sítě obchodů.
   Chceš-li URL skrýt, ulož celé JSON pole do GitHub secretu `FEEDS_JSON`.
2. `npm run prices && npm run build` (ručně), nebo nech běžet denní workflow `.github/workflows/prices.yml`.
3. Špatně spárovaný díl oprav v `scripts/overrides.json`: `{ "id-dilu": ["klíčová", "slova"] }`.
Skript zapisuje `src/prices.json` včetně historie cen; graf cen ji použije, jakmile má víc než 2 dny dat.

## Živé ceny (volitelné)
1. Vyplň `scripts/feeds.json` URL XML feedů (formát Heureka / Zboží.cz) nebo je ulož do GitHub secretu `FEEDS_JSON`
   (Settings → Secrets and variables → Actions) jako stejné JSON pole.
2. Ručně: `npm install && npm run prices && npm run build`, pak commit a push.
3. Automaticky: workflow `.github/workflows/prices.yml` běží denně v 5:00 UTC, aktualizuje `src/prices.json`, přebuilduje `docs/` a commitne.
4. Díly se párují podle názvu; pro problémové kusy přidej klíčová slova do `scripts/overrides.json` (`{"id-dilu": ["ryzen","9800x3d"]}`).
Historie cen se skládá z denních záznamů; dokud nejsou aspoň 3 dny, graf používá simulovaná data.

## Novinky ve verzi 1.3
- Ceny přepsané podle českých e-shopů (10/2026). Díly s `v=1` v `src/data.js` mají cenu ověřenou, ostatní jsou odhad.
  Ověřené nabídky (`VERIFIED` v `src/data.js`) se přibijí k danému obchodu a ukazují se v pruhu „Nejlepší nabídky“ se zdrojem.
- Karta s parametry při najetí myší na díl (atribut `data-part="id-dílu"` na libovolném prvku).
- Export PDF každé sestavy (`src/pdf.js`, bez knihoven): tlačítko „Stáhnout PDF“ u každé sestavy.
- Články: text a interaktivní komponenty se střídají; slovníčky parametrů.

## Verze 1.4
- Horní lišta: záložky se zalamují místo ořezávání (Komunita je vždy vidět), štítek počtu je zarovnaný.
- Odstraněn trojúhelníkový obrazec na pozadí, tmavší spodek gradientu a tmavé panely pod texty článků kvůli čitelnosti.
- Porovnat: široké okno, seznam všech dílů včetně monitorů, filtr značky, řazení, až 5 dílů vedle sebe.
- Asistent sestavy (`src/assistant.jsx`): vysvětluje, proč jsou v sestavě dané díly, z dat katalogu a cen. Otevře se i tlačítkem „Proč tyto díly?“.
