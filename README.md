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

## Verze 1.4.1
- Přidán `AI_BRIEF.md`: kompletní popis projektu, struktury kódu, procesu vývoje, nasazení a nápadů pro AI asistenta (vložit do prvního promptu nové konverzace).

## Verze 1.5.0
- **Asistent:** nový výpočet nejlepšího poměru cena/výkon (`src/value.js`). Z kompatibilních sestav v rozpočtu vybere tu s nejvyšším výkonem na korunu, která má aspoň 85 % výkonu nejrychlejší sestavy. Napiš „nejlepší sestava za 30 000 Kč“ nebo se zeptej „je moje sestava výhodná?“. Na vše, čemu nerozumí, odpoví „S touto žádostí neumím pomoci“. Hlavička ukazuje, že je ve velmi rané beta verzi.
- **Nová záložka O nás** a právní stránky (`src/legal.jsx`): Ochrana údajů, Podmínky použití, Vrácení a reklamace, Cookies a úložiště, Moje data (export a smazání dat), Provozovatel. Cookie oznámení a odkazy v patičce.
- **Doplňte své údaje** v objektu `LEGAL` na začátku `src/legal.jsx` (jméno, IČO, adresa, e-mail). Dokud chybí, stránka Provozovatel zobrazuje upozornění.
- **Poctivost dat:** ukázkové sestavy v Komunitě už nemají vymyšlené autory ani počty srdíček, simulované „slevy“ v nabídkách jsou označené „Simulace“, grafy historie a ceny obchodů mají poznámku o simulaci, z patičky zmizelo tvrzení o provizi (žádné partnerské odkazy zatím nemáme).
- `optimize()` navíc vrací `all` (všechny kompatibilní kombinace v rozpočtu). Ostatní chování beze změny.

## Verze 2.0.0
- **Nový design:** minimalistický a prémiový, bez pozadí s ASCII a bez gradientů. Keramicky bílá, grafitová a jeden modrý akcent, vlasové linky místo karet, Manrope. Jediný výrazný prvek je tmavý souhrn sestavy s plynule se přetáčející cenou (odometr).
- **Plynulé animace:** pohybují se jen `transform` a `opacity`, pryč jsou blur filtry, scroll-reveal, lesk na tlačítkách a posuny karet. Cena se už nepřekresluje Reactem každý snímek. Posuvné podtržení záložek. Respektuje „omezit pohyb“ v systému.
- **Písmo Manrope přímo s webem:** odkazy na Google Fonts jsou pryč z obou `index.html`. Jednorázově spusť `npm run fonts` (stáhne `docs/fonts/*.woff2` a vytvoří `docs/fonts.css`) a výsledek commitni. Do té doby web použije systémové písmo.
- **Přihlášení (zkušební):** uživatel `test`, heslo `test`. Ověřuje se v prohlížeči, takže jde jen o hradlo v rozhraní, ne o zabezpečení. Právní stránky zůstávají veřejné. Odhlášení je v horní liště.
- Právní texty aktualizovány (přihlášení, klíč `qompify.session.v1`, písmo bez třetích stran).

