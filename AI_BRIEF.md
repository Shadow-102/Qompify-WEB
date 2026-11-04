# QOMPIFY — PROJECT BRIEF AND STANDING INSTRUCTIONS FOR AI

> **How to use this file.** Paste it as the first message of a new AI chat (or attach it next to the project zip). It tells the AI what Qompify is, how the code is organised, what has already been built and broken, how to test and deploy, and how to behave. State of the project: **4. 11. 2026, package version 2.1.0, zip release v13**.

---

## 0. STANDING INSTRUCTIONS (read first, obey always)

You are the **lead engineer and product partner** of Qompify, a Czech PC-building site. The owner is a non-professional developer who works on a Mac, deploys with Terminal (or GitHub Desktop) and writes informal English with typos. Interpret intent generously, state your assumption in one line, and build. Ask at most **one** clarifying question, and only when the answer truly changes what you build.

**Every reply that changes files MUST:**

1. **Deliver the full project as a zip** (`qompify-vN.zip`, top folder `qompify/`, without `node_modules`), never loose snippets. Bump `package.json` version and append to the README changelog.
2. **Rebuild `docs/`** (`npm run build` or the esbuild command in §12). The live site serves the prebuilt `docs/app.js` and `docs/app.css`. If you change `src/` but not `docs/`, **nothing changes online**.
3. **Test before delivering** (§12) and report honestly what was tested and what was not. Never claim Safari or real-device testing unless you did it.
4. **Always show the deploy steps** (§13), in this order, every single time: Terminal block, GitHub Desktop variant, the check URL, and the `git pull --rebase` line.
5. **State limits honestly**: which prices are verified vs estimated, which data is simulated, what you did not do, and any interpretation you made.
6. **End with 3 to 8 ideas for what to add next** (§16), prioritised, not repeated from the previous reply unless still the best.

**Hard rules:**

- **UI language is Czech** with full diacritics (ě š č ř ž ý á í é ů ú ď ť ň). Never use the Theovd font for body text (it has no diacritics).
- **Never invent prices, sources, dates, benchmarks or deals.** Anchor to a named Czech shop or article with a date, or label it `odhad` (estimate). See §9.
- **No new heavy dependencies.** The pipeline is plain React 18 + esbuild, no network at build time on the owner's side beyond `npm install`. If a library is not installable in your sandbox, write a dependency-free port (precedent: BellToggle, JellyRadio, §10).
- **Keep the v2 design system** (§3): flat ceramic background, graphite + one cobalt accent, hairlines, one bold element (the odometer total). Motion only where it answers an action.
- **Do not break existing features.** Run the regression checklist (§12) after every change.
- **Reply in the language the owner writes in (English)**, UI strings in Czech.

---

## 1. PROJECT SNAPSHOT

| Item | Value |
|---|---|
| Name | **Qompify** (also seen as "Qompify-WEB") |
| What | Czech PC building, price comparison and live compatibility validator |
| Live site | `https://shadow-102.github.io/Qompify-WEB/` |
| Repo | `https://github.com/Shadow-102/Qompify-WEB` (branch `main`) |
| Owner's local folder | `~/Downloads/qompify` (Mac) |
| Hosting | GitHub Pages, **Deploy from a branch → `main` → `/ (root)`** (also works with `/docs`) |
| Stack | React 18 (client only), esbuild bundle, plain CSS, no backend, no router lib |
| Output | Prebuilt, committed `docs/app.js` + `docs/app.css`; root `index.html` loads `./docs/*` |
| Persistence | Browser `localStorage` only (saved builds, price alerts) |
| Size | 101 parts (24 CPU, 17 GPU, 13 RAM, 16 boards, 9 PSU, 9 cases, 13 SSD), 17 monitors, 9 games, 5 shops, 9 tabs (incl. O nás) + 6 legal pages, 2 articles |
| Languages | UI Czech; code and comments mostly Czech/English mixed |

**One-sentence pitch:** *Pick parts, Qompify checks socket, memory, PSU and clearance live, estimates performance, finds the lowest Czech price, explains why each part was chosen, and exports the build as a PDF.*

---

## 2. VISION AND PRODUCT PRINCIPLES

**Vision.** The most trustworthy, fastest, best-looking PC builder for the Czech market. Not a generic global tool: it speaks Czech, compares Czech e-shops (Alza, Datart, Mironet, TS Bohemia, CZC.cz), knows Czech VAT-inclusive pricing, warranty rules (24 months statutory, 14-day distance withdrawal) and the local market swings (the 2025–2026 RAM/SSD/GPU price surge driven by AI demand).

**Who it serves.** Czech first-time builders who need compatibility safety, value shoppers who want the best FPS per koruna, enthusiasts who want detailed specs and comparisons.

**Principles (use these to decide trade-offs):**

1. **Trust over flash.** A wrong price or fake deal is worse than a missing one. Verified vs estimate is always visible.
2. **Instant feedback.** Every part choice immediately updates compatibility badges, power meter, total price and (via the assistant) the explanation.
3. **Depth on demand.** Simple by default, full specs on hover or in the compare view ("hover concept everywhere").
4. **Static and cheap.** Runs on GitHub Pages: no server, no accounts, no API keys in the client.
5. **Honest estimates.** FPS numbers are modelled, history is simulated until live feeds exist. Say so in the UI and in replies.
6. **Local-first privacy.** Saved builds and alerts never leave the browser.

**Non-goals (for now):** user accounts, server-side storage, real e-commerce checkout, laptops/phones, non-Czech markets.

---

## 3. BRAND AND DESIGN SYSTEM (v2.1, "ceramic / graphite / cobalt" + circuit board + liquid glass)

History: v1 glacier/ASCII look was retired in v2.0 ("minimalistic but premium"). v2.1 added, on the owner's request, a **motherboard-circuit background**, **liquid glass** and livelier motion, while staying minimal. Do not bring back the ASCII canvas or gradients behind text.

**Palette (CSS variables at the top of `styles.css`)**

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F5F6F8` | page background, flat cool ceramic white (deliberately not cream) |
| `--ink` | `#15181F` | text and the one dark block: the build summary `.card.sum` |
| `--mu` | `#5A6170` | secondary text (AA on paper) |
| `--line` / `--line2` | `#E2E5EB` / `#CBD0DA` | hairlines, input borders |
| `--accent` | `#2447E0` | the only accent: buttons, links, bars, focus, copper traces |
| status | ok `#16754F`, warn `#8F5C00`, bad `#B3321F` (+ `-s` tints) | badges, FPS tones |

**Typography.** Manrope only (variable 400–800, **self-hosted**, see Fonts), tight display tracking, tabular numerals. **Theovd** only for the "Qompify" wordmark and the PDF header.

**Circuit background (`circuit.jsx`).** A deterministic 1600×1000 SVG scene (CPU socket with LGA pads, 4 RAM slots, VRM row, chipset, M.2, PCIe, parallel 45° trace buses via `offsetPoly`, silkscreen labels) drawn at ~8 % opacity, fixed behind everything (`.pcb`, z-index 0; `.app`/`.lg` are z-index 1). On top: 11 **signal pulses** (CSS `transform` keyframes generated from the trace geometry, so they run on the compositor) and a **cursor lens** (`.pcb-lens`: a 380 px masked window that follows the pointer with a lerp and shows the same art in cobalt via `<use href="#pcb-art">`; lens + inner svg get opposite `translate3d` so the art stays registered). Hidden on touch (`hover:none`) and with reduced motion (no pulses).

**Liquid glass.** Real `backdrop-filter` only on a few floating surfaces: `.nav`, `.lgf` (login), `.panel` (sheet), `.modal`, and dark glass on `.tray/.toast/.qlg-cookie/.hcard`. Chromium additionally gets **refraction** (`html.rf`, SVG `feDisplacementMap` filter `#lg-ref` with an edge displacement map) which bends the circuit at the glass edge; Safari/Firefox get the plain frosted blur. Cards use faux glass (translucent white, specular `--rim`, pointer-following sheen via `--mx/--my` set by `usePointerGlow`) with **no** backdrop-filter, because 100 blurred cards in the catalog would be too slow. The active tab is a glass **lens pill** (`.ink`) that slides with an overshoot spring (`--spring`), positioned by `Tabs` from `offsetLeft/Top/Width/Height`.

**Motion.** Hero words rise one by one (`Words`), a circuit **trace mark** draws itself under titles (`Trace`), first three children of `.view` fade-rise (never the big grids), odometer digits roll with a soft overshoot, springs on tray/toast/modal. Only `transform`/`opacity` (width only on tiny contained bars). No scroll-reveal observers. `prefers-reduced-motion` disables it. **Effects switch** (footer, `FxToggle`, key `qompify.fx.v1`) adds `html.lite`, which removes pulses, lens and all backdrop blur; `prefers-reduced-transparency` does the same.

**Measured (headless, software rendering, no GPU):** flat v2.0 had 4 frames > 20 ms in a tab-switch + scroll + pointer workload; v2.1 with circuit + glass has about 54 (median still 16.7 ms), mostly backdrop blur and the live background. Real GPUs should be better but that was not measured. Check this again after any new glass/background effect.

**Fonts.** `docs/fonts.css` declares Manrope from `docs/fonts/manrope-latin(-ext).woff2`, created by `npm run fonts` (`scripts/get-fonts.mjs`, needs internet, run once, commit). Until then the system font is used. **Never add Google Fonts links back** (GDPR).

**Login (test gate).** `src/auth.js` + `src/auth.jsx` (Gate is the root component): username `test`, password `test`, session key `qompify.session.v1` (30 days; localStorage if "Zůstat přihlášen", else sessionStorage). The hash lives in the bundle, so this is a UI gate, not security (GitHub Pages has no server). Legal pages stay public. Real accounts need a backend.

**Operator identification.** The standalone "Provozovatel" page was removed in v2.1 on request. The legally required operator details (`LEGAL` in `legal.jsx`) now show in the O nás page (`Who`) and as a one-line `OperatorLine` in the footer and on the login screen. Keep them there; fill the `LEGAL` object.

---

## 4. ARCHITECTURE

```
 Browser (static files from GitHub Pages)
 ├─ index.html ──loads──► docs/app.css + docs/app.js   (esbuild bundle of src/)
 │
 ├─ React tree
 │   App (hash router, global state: sel, saved, alerts, cmp tray, toast)
 │    ├─ nav + banner (price-alert hits) + hint
 │    ├─ page:  Builder | Optimizer | ComparePage | Benchmarks | Tiers | Catalog | Articles | Community | InfoPage (O nás + legal)
 │    ├─ Compare modal (detail/compare of 1–3 parts) + compare tray
 │    ├─ HoverLayer (global delegated hover/focus cards via [data-part])
 │    └─ Toast
 │
 ├─ data.js  = the "database" and all pure logic (parts, prices, checks, optimizer, history, fps)
 ├─ prices.json = optional live price overlay written by scripts/update-prices.mjs
 └─ localStorage: qompify.saved.v1, qompify.alerts.v1
```

**Key architecture decisions and why**

| Decision | Reason |
|---|---|
| **esbuild, not Vite** | Vite builds on GitHub Actions kept failing/blanking (cache without lockfile, wrong Pages source). Prebuilding to `docs/` and committing it removes CI as a failure point and works with both `/(root)` and `/docs` Pages sources. |
| **Hash routing** (`#/page?param=…`) | Works on GitHub Pages with no server rewrites, survives reloads, deep-linkable. |
| **State in `App`, logic in `data.js`** | `data.js` is pure and importable in Node (via esbuild bundling) for tests. UI state is small. |
| **No state library / router lib** | Keep the bundle small and the project readable. |
| **`localStorage` only** | No backend. Alerts only evaluate when the site is opened. |
| **Dependency-free ports of React Bits components** | `motion` and `@hugeicons/*` could not be installed in the build sandbox; ports keep props/behaviour/CSS verbatim, add no npm packages. |
| **Canvas→JPEG→PDF** | No PDF library or font embedding needed; perfect Czech diacritics; clickable links via annotations. |
| **Rule-based assistant** | A static site cannot hold an LLM key. All explanations are computed from catalog data. |
| **Simulated shop prices + history** | No feed access yet. Anchored to a base price and verified pins; the live pipeline overrides when configured. |

**Build pipeline (the only one that matters):**

```bash
npx esbuild src/main.jsx --bundle --minify --target=es2020 \
  --outfile=docs/app.js --loader:.png=dataurl --loader:.ttf=dataurl \
  --jsx=automatic --define:process.env.NODE_ENV='"production"'
```
esbuild also emits `docs/app.css` (all imported CSS). `--target=es2020` (not `safari14`: esbuild's safari14 destructuring transform is buggy). Root `index.html` references `./docs/app.css` and `./docs/app.js`; `docs/index.html` references `./app.*`. Both contain a **boot message** ("Načítání Qompify…") and a global `error` listener that prints `Chyba: …` into the page, so a failure is never a silent blank screen.

---

## 5. REPOSITORY MAP (every file)

```
qompify/
├─ index.html                 Root entry. Loads ./docs/app.css + ./docs/app.js. Czech meta, Manrope link, boot/error script.
├─ AI_BRIEF.md                This file.
├─ README.md                  Deploy + feed instructions + changelog (keep updated).
├─ package.json               v1.4.1. scripts: build, dev (esbuild --watch), prices. deps: react@18, react-dom@18; dev: esbuild@0.24
├─ .gitignore                 node_modules, dist, .DS_Store
├─ .github/workflows/
│   └─ prices.yml             Daily 05:00 UTC + manual: npm install → npm run prices → npm run build → commit "Update prices". Needs repo "Workflow permissions: Read and write". NOTE: it pushes to main and can cause "rejected (fetch first)" on the owner's pushes. Delete or disable until feeds exist.
├─ scripts/
│   ├─ update-prices.mjs      Reads XML feeds (Heureka/Zboží <SHOPITEM>, PRODUCTNAME, PRICE_VAT, DELIVERY_DATE), matches parts by name tokens (whole-word, so "5600" ≠ "5600X"), writes src/prices.json. FEEDS_JSON env/secret overrides feeds.json. Tested only against a fake local feed.
│   ├─ feeds.json             Placeholders "VLOZ_URL_XML_FEEDU" for Alza, Datart, Mironet, TS Bohemia, CZC.cz
│   └─ overrides.json         { "part-id": ["token", ...] } to force matching tokens
├─ docs/                      PREBUILT SITE (committed!)  app.js, app.css, index.html, favicon.png, .nojekyll
└─ src/
    ├─ main.jsx               createRoot(App) + imports styles.css
    ├─ App.jsx        (~330)  Router, global state, Builder, Sheet (part picker), Tiers, Catalog, Community, Share, Footer, hook useRoute, Tabs (sliding underline), arrow-key nav, alert banner
    ├─ extra.jsx      (~420)  PriceChart, CompareTable, Compare (modal), ComparePage, PdfBtn, DealsBar, HoverLayer, Optimizer, Articles (MonitorArticle, PartsArticle + calculators + glossaries), Offers, Badge, Head, AlertBox
    ├─ data.js        (~270)  THE DATABASE + pure logic: PARTS, SPEC, MONITORS, RETAILERS, VERIFIED, offers/best/history/deals, check/power/rec, GAMES/fpsAt, optimize, TIERS, SEEDS
    ├─ bench.jsx      (~50)   Benchmarks tab (resolution + graphics level via JellyRadio, GPU ranking, per-game sensitivity table)
    ├─ assistant.jsx  (~170)  Build assistant: intent routing in answer() (unknown → "S touto žádostí neumím pomoci"), parseBudget, why(), upgrades(), savings(), valueReply(), evaluateCurrent(), <Assistant/> (beta header)
    ├─ value.js       (~40)   bestValue(budget,use,brand): best price/performance (≥85 % of top perf, max perf per Kč), avgFps, totalOf. Pure, testable in Node.
    ├─ legal.jsx/.css         O nás + legal pages (routes onas, ochrana-udaju, podminky, vraceni, cookies, moje-data, provozovatel), CookieNotice, LegalLinks, LEGAL config (owner must fill name/IČO/address/e-mail). Classes prefixed qlg-.
    ├─ pdf.js         (~80)   downloadBuildPdf(title, ids): canvas A4 → JPEG → hand-written PDF with link annotations
    ├─ spring.js      (~15)   runSpring() physics animator, uiSpring(bounce), reduced()
    ├─ BellToggle.jsx/.css    Dependency-free port of React Bits BellToggle (price alert button)
    ├─ JellyRadio.jsx/.css    Dependency-free port of React Bits JellyRadio (resolution/graphics/panel selectors; "Off" item deliberately removed)
    ├─ price.jsx      Odometer price (digit columns, transform only)
    ├─ circuit.jsx    Motherboard background, pulses, cursor lens, glass refraction filter
    ├─ fx.jsx         Words (heading rise), Trace (drawn mark), usePointerGlow, FxToggle/useFxPref
    ├─ auth.js / auth.jsx / sha256.js   Test login gate (Gate is the root component in main.jsx), session logic, pure-JS SHA-256
    ├─ prices.json            {"updated":null,"items":{}}  live overlay; items[id]={shops:{Shop:{price,stock}},hist:[[date,price]...]}
    ├─ styles.css     (~250 lines, dense)  All site CSS, rewritten in v2 (tokens → shell → components → pages → login → reduced-motion). Later rules win; check for class-name clashes (see §11)
    └─ assets/logo.png, theovd.ttf   Logo (transparent PNG cropped from owner's upload), brand font
```

**Component/function index**

- `App.jsx`: `useRoute`, `Tabs`, `Share`, `Sheet`, `Builder`, `Tiers`, `Catalog`, `Community`, `Footer`, default `App`; helpers `linkOf`, `parse`, `objs`, `total`, `selOf`, `load`.
- `extra.jsx`: `Badge`, `Head`, `Offers`, `PriceChart`, `AlertBox`, `CompareTable`, `Compare`, `ComparePage`, `PdfBtn`, `DealsBar`, `HoverLayer`, `parseAsk`, `Optimizer`, `Glossary`, `Prose`, `PanelPicker`, `PpiCalc`, `MotionDemo`, `MonitorArticle`, `LatencyCalc`, `PsuCalc`, `PartsArticle`, `Articles`; data consts `MON_ROWS`, `MON_GLOSS`, `PART_GLOSS`, `ARTICLES`, `PANELS`, `PAN`, `RESPTS`.
- `data.js` exports: `CATS, GFX, GAMES, fpsEff, fpsAt, PARTS, SPEC, showVal, perf, dn, BY, RETAILERS, VERIFIED, offers, best, fmt, spec, power, rec, check, TIERS, SEEDS, RES_K, MONITORS, LOOK, history, deals, optimize`.

---

## 6. DATA MODEL AND CORE LOGIC (`src/data.js`)

### 6.1 Parts
Built with positional helper functions (`cpu(...)`, `gpu(...)`, …). `id` is the stable key (used in URLs, alerts, saved builds, feed matching). **Never rename an id** without migrating saved data.

| cat | fields (after `id,cat,name,brand,price,v`) |
|---|---|
| `cpu` | `s` socket, `n` cores, `th` threads, `fb` base GHz, `f` boost GHz, `l3` MB, `tdp` W, `ig` iGPU 0/1, `pcie` gen, `mem` "DDR5"/"DDR4/DDR5", `nm` nm, `sc` relative performance index |
| `gpu` | `vram` GB, `vt` GDDR6/7, `bus` bit, `tdp` W, `len` mm, `pcie`, `pw` connector text ("1× 12V-2x6"), `rt`, `fps` (legacy array), `sc` (= `fps[0]`, the performance index) |
| `ram` | `t` DDR4/5, `gb`, `mhz`, `cl`, `kit` "2×16", `exp` XMP/EXPO, `rgb` |
| `mb` | `s` socket, `t` DDR type, `ff` mATX/ATX, `chip`, `m2` slots, `wifi`, `lan`, `pcie` |
| `psu` | `w`, `eff` "80+ Gold", `atx3`, `mod` ("Plně"/"Ne"), `fan` mm, `pw12` native 12V-2x6 |
| `case` | `mg` max GPU mm, `ff` array of boards, `ch` max cooler mm, `fans`, `glass`, `type` |
| `ssd` | `gb`, `pc` PCIe gen, `rd`/`wr` MB/s, `tbw`, `nand` |

`price` = anchor price in CZK incl. VAT. `v` = **1 verified**, **0 estimate** (drives "ověřená cena"/"orientační cena" labels everywhere). `SPEC[cat]` lists display rows `[key,label,unit,dir]` (`dir` 1 higher-better, −1 lower-better, 0 neutral; `unit` may be `'yn'` or `'pcie'`). `showVal(v,u)` formats. `dn(p)` avoids duplicated brand ("MSI MSI…"). `spec(p)` returns a one-line summary and **must stay lazy** (see bug #1 in §11).

`MONITORS` use `cat:'monitor'`, fields `size,res(FHD|QHD|UWQHD|4K),panel,hz,ms,hdr,tags[gaming|esport|work|office]`. `LOOK = {...BY, ...monitors}` resolves any id.

### 6.2 Prices, shops, stock
- `RETAILERS = [Alza, Datart, Mironet, TS Bohemia, CZC.cz]` with search-URL builders (Datart/Mironet/TS Bohemia patterns are best guesses; affiliate IDs would be added here).
- `offers(p)` precedence: **(1)** live `prices.json` shops for that id; else **(2)** simulated per-shop price = `price × (1 + shopBias + ((hash%40)−15)/1000)` rounded to 10, stock `= !OUT.has(id) && hash%7 !== 0`; then **(3)** `VERIFIED` pinning: the named shop gets the exact verified price (in stock) and every other shop is clamped to `≥` that price.
- `OUT` = parts shown as out of stock everywhere (RTX 5090 etc. to reflect scarcity).
- `best(p)` = cheapest in-stock offer (falls back to cheapest overall). **All totals use `best()`.**
- `VERIFIED[]` = `{id, price, shop, date, src, note}` (7 entries, §9). They also drive the "Ověřeno" cards in the deals bar.

### 6.3 History and deals
`history(p)` returns 90 `{d,v}` points. Real `prices.json` history is used if it has > 2 points, else a deterministic seeded simulation: backward random walk with category trends (RAM rising, SSD rising, GPU slightly rising, others slightly falling) and for ~25% of parts a recent 10–20% dip. `deals()` = parts ≥ 3% below the average of the last 30 days, top 12. The deals bar shows 7 verified + 7 computed drops. **Computed drops come from simulated history until live feeds accumulate real history; the UI says so.**

### 6.4 Compatibility (`check(o)`, `o = {cpu,gpu,ram,mb,psu,case}`)
| Rule | Result |
|---|---|
| `cpu.s === mb.s` | ok / **bad** |
| `mb.t === ram.t` and `cpu.mem` includes `ram.t` | ok / **bad** |
| PSU: `draw = cpu.tdp + gpu.tdp + 90` (if cpu or gpu), `need = ceil(draw×1.3/50)×50` | `psu.w ≥ need` ok; `≥ draw×1.1` **warn**; else **bad** |
| `gpu.len ≤ case.mg` | ok / **bad** |
| `case.ff` includes `mb.ff` | ok / **bad** |
| Bottleneck `q = gpu.sc / cpu.sc` | `q > 2.1` **warn** ("−X % výkonu" estimate = `1 − 2.1/q`), `q < 0.42` warn (oversized CPU), else ok |
| nothing selected | `idle` |

`power(o)`, `rec(draw)` are exported and reused by the PDF, assistant, PSU calculator.

### 6.5 Performance model
`GAMES = [name, note, k, lv[4]]`; `k` is the FPS multiplier at 1080p **Vysoké**, `lv = [Nízké, Střední, Vysoké, Ultra]` multipliers (differs per game: esports barely change, Alan Wake 2 / Wukong change a lot). `RES_K = {FHD:1, QHD:.72, UWQHD:.62, '4K':.42}`.
`fpsAt(g,c,gi,res,li) = round(min(g.sc·k·lv[li]·RES_K[res], c.sc·2.1·k))`; `fpsEff(g,c,k)` is the legacy 1080p form. All FPS in the UI/PDF/assistant are **model estimates, not measurements** and labelled so.

### 6.6 Optimizer (`optimize(budget, use, brand)`, UI "Na míru")
Text parser `parseAsk` (in `extra.jsx`): digits → budget (`35 000 Kč`, `45k`, `<1000` ×1000; regex `k(?!č)` so "Kč" is **not** a thousands suffix); keywords → `use` (`gaming` default, `work` for práce/tvorba/střih/render, `office` for kancelář/škola); `intel`/`amd|ryzen` → brand filter.
Algorithm: for every CPU (brand-filtered; office requires iGPU) pick the cheapest board of that socket; try RAM variants (16 GB and 32 GB, cheapest valid), SSD variants (500 GB, 1 TB, 2 TB); loop all GPUs (none for office, optional for work); PSU = cheapest with `w ≥ rec(power)`; case = cheapest that fits board + GPU; reject any `check()` **bad**; keep totals ≤ budget. Score: gaming `0.72·gpu.sc + 0.28·cpu.sc − 25 if bottleneck`; work `0.25·gpu + 0.75·(cpu.sc + 0.8·threads)`; office `0.6·cpu.sc − total/700`; bonuses `+3` (`+8` work) for 32 GB, `+1.5` for 2 TB, `+2` for ≥1 TB. Returns top 3 with distinct CPU+GPU plus `min` (cheapest possible, for the "not possible" message).

### 6.7 Presets
`TIERS` (ready builds, all validated compatible): `t25` AM4/DDR4 (Ryzen 5 5600 + RX 7600), `t35` (Ryzen 5 7600 + RX 9060 XT 16 GB), `t50` (Ryzen 5 9600X + RX 9070 XT, 32 GB DDR5), `t70` (Ryzen 7 9800X3D + RTX 5070 Ti). `SEEDS` = 4 fake community builds (likes are local-only).

---

## 7. FEATURE CATALOGUE

**Tabs (`NAV`, order matters for ←/→ navigation)**

| Route | Label | What it does |
|---|---|---|
| `#/builder` (default) | Stavitel PC | 7 slots; slide-in part picker with ✔ recommended tag, incompatible parts dimmed with reason, per-row **Detail** and **Porovnat**; live badges; power meter (draw vs PSU); animated total; save build; copy link; **PDF**; price-compare card; **deals bar**; **build assistant** |
| `#/namiru` | Na míru | Budget optimizer (type "35 000 Kč, gaming"), chips with examples, 3 results with FPS, badges, open in builder, save, PDF, **"Proč tyto díly?"** |
| `#/porovnat` | Porovnat | Wide page: category chips incl. **Monitory**, search, brand filter, sort (price/perf), up to **5** items, full spec table with winner highlighting, verdict chips, price history charts, alert boxes, offers |
| `#/benchmarky` | Benchmarky | JellyRadio **resolution** (1080p/1440p/Ultrawide/4K) and **graphics level** (Nízké…Ultra, **no "Off"**); game + CPU selects; ranked GPU bars with FPS/1000 Kč; per-game sensitivity table |
| `#/sestavy` | Sestavy | 4 ready builds with 9-game FPS meters and FPS per 1 000 Kč; open, save, PDF, "Proč tyto díly?" |
| `#/katalog` | Katalog | 101 parts; filters: category, search, max price (cap 140 000 Kč so the RTX 5090 shows), stock only, VRAM, TDP, PCIe; per-part Detail / Porovnat / Ceny |
| `#/clanky` | Články | Article list; article opens **only after click** (`?a=monitory` or `?a=parametry`), "← Všechny články" back link |
| `#/onas` | O nás | Goal of the web, beta notice, how prices/FPS are produced (verified vs estimate vs simulated). Legal pages share the same layout (`INFO` in legal.jsx), linked from the footer |
| `#/komunita` | Komunita | Saved builds (delete, PDF, copy link), watched prices (alerts), seeded community builds with local likes. **Only "Kopírovat odkaz" + PDF sharing; Reddit/Discord/TikTok were removed on request.** Seed builds are labelled "Ukázkové" (no fake authors/likes, since v11) |

**Cross-cutting features**

- **Detail/compare modal** (`Compare`): 1–3 parts from catalog, picker, deals or tray. Rows: lowest price, all SPEC rows, "Pro tvou sestavu" (compat + price/performance delta vs the part currently in that slot), price history chart, **alert**, offers, add to build.
- **Compare tray**: floating bar when parts are ticked; switching category resets the selection; max 3 in tray.
- **Hover cards everywhere** (`HoverLayer`): any element with `data-part="<id>"` (optional `data-note`) shows a fixed-position glass card with spec rows, price + shop, mini price chart, deal note. Delegated `mouseover/focusin`, hides on scroll/keydown, 90 ms hide delay. Currently wired in: slots, picker rows, catalog cards, ready-build part lists, optimizer lists, compare picklist, deals cards, monitor list, assistant part headings. **To add it somewhere new, just add `data-part`.**
- **Price alerts**: BellToggle ("Upozorni mě" → "Cenu hlídáme") + target input; stored in `qompify.alerts.v1`; banner "Cena klesla…" when `best() ≤ target`; list under Komunita → Hlídané ceny. **Evaluated only when the site is opened** (no push/email).
- **Deals bar** (main page): 7 verified deals with "Ověřeno" chip, shop, date and "Zdroj" link, then price drops vs 30-day average.
- **PDF export** (`pdf.js`): A4, glacier header + logo + Theovd wordmark, table of parts with specs, prices and the cheapest shop (clickable), total, compatibility list (coloured dots, max 7), power estimate, FPS block (skipped if no space), footer disclaimer + link back to the build. Buttons: builder, Sestavy, Na míru, Komunita.
- **Build assistant** (`assistant.jsx`): rule-based chat. Intents: explain all, per-part (cpu/gpu/ram/deska/zdroj/skříň/ssd), upgrades (parses amount, default 5 000 Kč), savings, games/FPS, bottleneck, compatibility. Replies are computed from the catalog (ranks, alternatives, headroom %, clearance mm). Typing indicator, staged bubbles. `?ask=1` makes it auto-explain once.
- **Keyboard**: **← / →** cycle tabs (reads `location.hash` at press time, ignores inputs/selects/textareas/radiogroups/modals). Esc closes sheets/modals.
- **Deep links**: `#/builder?b=id1,id2,…` loads a build; `&ask=1` also opens the assistant; `#/clanky?a=monitory`.
- **Articles**: *Jaký monitor koupit v roce 2026* (text → graph alternating; GPU/FPS-by-resolution bars, PPI calculator, 60/144/240 Hz motion demo, panel picker with JellyRadio, price-vs-Hz scatter, ranked monitor list with offers/history, tips, 12-term glossary) and *Co znamenají parametry PC dílů* (memory-latency calculator, PSU-sizing calculator, 16-term glossary).
- **Scroll reveal**, **toast**, **tween total**, **reduced-motion** support.

---

## 8. ROUTES, URL PARAMETERS, STORAGE

| Thing | Format |
|---|---|
| Route | `#/<page>` where page ∈ `builder, namiru, porovnat, benchmarky, sestavy, katalog, clanky, komunita` |
| `b` | comma-separated part ids → loads the builder slots (`parse()` ignores unknown ids) |
| `ask` | any value → assistant explains once |
| `a` | article id (`monitory`, `parametry`) |
| `qompify.saved.v1` | `[{id:Date.now(), name, ids:[...], at:"dd. mm. yyyy"}]` |
| `qompify.alerts.v1` | `{ "<partOrMonitorId>": {target: number} }` |

---

## 9. PRICING: METHOD, SOURCES, CURRENT FACTS

**Rules:** every part has `v` (1/0). A price may be `v=1` only if it was seen on a named Czech shop or Czech price site. Verified entries that appear as deals live in `VERIFIED` with `shop`, `date`, `src`. Everything else says "orientační cena / odhad ceny". Conversions from EU prices use ≈24.3 CZK/EUR and are `v=0`.

**Research findings the owner saw as "real" (Oct 2026):**

- **RTX 5090**: street price in Czechia **≈ 125 000 Kč** (Cnews, 18. 9. 2026; Alza had only a few models in stock). Older Alza listings at 83–101 k are stale/sold out. Set to 125 000, marked `v=1`, shown out of stock (`OUT`). *The original demo price of 74 990 was wrong and the owner flagged it.*
- **Datart (Oct 2026)**: RX 9070 XT from **18 490**, RX 9070 17 990, RX 9060 XT 16 GB from **12 490**, RTX 5070 Ti **29 990** (next 31 490), RTX 5050 10 590; RTX 5060 ≈ 11 090 (Czech e-shop); 32 GB DDR5 kits **11 390–16 990**; 1 TB PCIe 4.0 NVMe **3 690**, 2 TB **5 990**.
- **Zboží.cz** "od" prices: Ryzen 7 9800X3D **10 260**, Ryzen 5 9600X **4 498**, Ryzen 5 5600 **3 090**.
- **EU CPU prices (Jul–Aug 2026)** converted (`v=0`): 7800X3D ≈ 8 790, Core Ultra 7 265K ≈ 7 490, Ultra 9 285K ≈ 13 490, Ultra 5 245K ≈ 4 990, 9950X3D ≈ 17 490, i9-14900K ≈ 12 290.
- **Estimates (`v=0`)**: RTX 5080 43 990 (Datart listing, model mapping uncertain), RTX 5070 21 990, RTX 5060 Ti 16 GB 17 490 / 8 GB 12 990, RX 9060 XT 8 GB 9 390, older/other GPUs, boards, PSUs, cases, most RAM/SSD variants.
- **Monitor deals (Alza)**: Samsung Odyssey G5 27" QHD 180 Hz **3 490** (24. 9. 2026), ViewSonic XG275D1-4K **7 799** (Sept 2026); other monitor prices come from May 2026 articles (some with promo codes) or are estimates. They can be stale.
- **Market context**: RAM, SSD and GPU prices rose through 2026 (memory shortage, AI demand); NVIDIA RTX 50 Super reportedly delayed; a retail leak claims RTX 5090/5080 16 GB discontinuation in Jan 2027 (**rumour, unverified**).

**VERIFIED list (id → price @ shop, date):** `rx9060xt-16` 12 490 @Datart (říjen 2026), `rx9070xt` 18 490 @Datart, `rtx5070ti` 29 990 @Datart, `d5-32-5600` 11 390 @Datart, `ssd-1t4` 3 690 @Datart, `mon-odyssey-g5` 3 490 @Alza (24. 9. 2026), `mon-viewsonic-xg275d1` 7 799 @Alza (září 2026).

**Keeping prices true:** re-research quarterly or after big news; update `price`/`v` in `data.js` (a small python regex patch by id is the safest way, see §14); add dated entries to `VERIFIED`; or configure live feeds (§15) and let `prices.json` override.

---

## 10. DEVELOPMENT HISTORY (what happened, in order)

> Zip releases v1…v10; `package.json` 1.0.0 → 1.4.1.

1. **v1 — first build.** Master prompt from the owner: Czech PC builder, brand palette, mandatory GradientASCII background, 5 areas (builder, P2P tiers, catalog, community/saved builds, footer), GitHub Pages deploy. Built with **Vite + React + GitHub Actions**. The official GradientASCII source was not retrievable (React Bits page only shows an install command) → wrote an **own WebGL implementation** with the same props. Attached React Bits **SwipeRow** doc was *not* used (not requested). 49 demo parts, simulated shops.
2. **Deployment saga.** Owner uploaded files flat via web UI (no `src/`, no `.github`) → fix by terminal push. `git push` failed: **GitHub rejects account passwords; owner uses a passkey** → solved with `brew install gh`, `gh auth login` (browser/Touch ID), `gh auth setup-git`, then `git push -u origin main --force`. Actions build failed: `setup-node` `cache: npm` without a lockfile → removed; Pages source was still "Deploy from a branch /root" so GitHub served raw source → **white screen** (browsers cannot run `/src/main.jsx`).
3. **v2 — crash fix + look.** `spec()` built text for all 7 categories eagerly (`p.ff.join` crashed on non-case parts) → every screen that showed a part **unmounted React** ("dark-blue fullscreen"). Fixed by lazy functions. Switched to **Manrope** (Czech diacritics), used the gradient sampled from the owner's Claude screenshot, deduped brand names, raised price slider.
4. **v3/v4 — robust hosting.** Still white screen → pivoted: **prebuilt `docs/` committed**, root `index.html` loads it, Vite and the build workflow **removed**, esbuild only, `es2020`, boot/error message added.
5. **v5 — data and compare.** 78 detailed parts with spec sheets, Detail/Compare modal, tray, rebuilt presets; **real Czech prices** researched (RAM/SSD far above the old demo numbers), `v` flags, shops → Alza/Datart/Mironet/TS Bohemia/CZC.
6. **v6 — intelligence.** Price history charts + alerts, bottleneck check, budget optimizer, live-price script + workflow, 9 games, monitor article, deals bar, Compare tab, removed Reddit/Discord/TikTok. Bug: optimizer read "35 000 Kč" as 35 million (`k` in "Kč").
7. **v7 — interaction.** Dependency-free ports of React Bits **BellToggle** and **JellyRadio**, Benchmarks tab, per-game graphics multipliers, click-to-open articles with glossaries, +23 parts (101), ←/→ tab navigation.
8. **v8 — truth, polish, export.** Price research overhaul (RTX 5090 → 125 000, AMD cheaper, etc.), glacier gradient, hover cards everywhere, verified deals pinned to shops, **PDF export**, articles rewritten as alternating text + interactive components, calculators.
9. **v9 — fixes + assistant.** Top bar wraps (Komunita was clipped ≤1024px), readability (darker bottom, dark prose panels), removed the ice-shard SVG, wide Compare tab with monitors, **build assistant**.
10. **v10 — documentation.** Added this `AI_BRIEF.md` so any AI session knows the project, the file structure, the process and the deploy routine; softened one unverifiable deal note.

11. **v11 — assistant + legal.** Best price/performance logic (`value.js`), "can't help" fallback, beta header, new O nás tab and legal pages/cookie notice/data deletion (`legal.jsx`), honesty fixes (fake community authors/likes removed, simulated deals labelled "Simulace", chart and offer notes, footer no longer claims commissions).

12. **v12 (2.0.0) — redesign + login + fonts.** Full visual redesign (§3), ASCII background and all blur/reveal/shimmer effects removed, odometer total, sliding tab underline, test login gate, Manrope self-hosting pipeline (`npm run fonts`), legal texts updated for login/session/fonts.

13. **v13 (2.1.0) — circuit + glass.** Motherboard background with pulses and cursor lens, liquid glass (with Chromium refraction), glass tab lens, word-rise headings, trace marks, spring motion, effects switch, Provozovatel page removed (details moved to O nás + footer).

---

## 11. BUG / LESSON LOG (do not repeat these)

| # | Symptom | Cause | Fix / rule |
|---|---|---|---|
| 1 | Whole app blank after opening any part | `spec()` evaluated all category templates eagerly | Keep category formatters lazy (functions); test every page with real parts |
| 2 | White screen on Pages | Pages served raw `index.html` (source) | Always ship prebuilt `docs/`; root `index.html` must load `./docs/*` |
| 3 | `npm ci`/cache failed on CI | no lockfile | Don't use `cache: npm`; avoid CI builds for the site |
| 4 | Push rejected "fetch first" | the daily **prices workflow** committed to `main` | `git pull --rebase -X theirs origin main` before push; disable workflow until feeds exist |
| 5 | Password auth failed | GitHub dropped passwords; passkey account | `gh auth login` + `gh auth setup-git` |
| 6 | Optimizer budget ×1000 | regex took the "K" of "Kč" as thousands | `k(?!č)` |
| 7 | RTX 5090 missing in catalog | price slider cap 80 000 < 125 000 | cap 140 000; re-check caps when prices change |
| 8 | Arrow keys skipped tabs when pressed fast | stale `page` closure | read `location.hash` in the handler |
| 9 | Fps bars broke / bars huge | `.bar` HTML class reused for an SVG `<rect>` | unique class names (`.sbar`); **grep for clashes before adding classes** |
| 10 | Assistant headings right-aligned | `.mp` already styled for monitor price | renamed `.mhead` |
| 11 | Jelly chip had boxy outline | global `:focus-visible` outline beat the component's | `.jelly-radio__chip:focus-visible, .bell-toggle__button:focus-visible{outline:none}` |
| 12 | CSS rule truncated | greedy regex removal of `.shards path{…}` consumed the tail of a line | prefer exact-string replaces with assertions; build with warnings visible |
| 13 | PDF block overlapped footer | fixed spacing | tighter rows, `slice(0,7)` checks, skip FPS block if `y > H−330` |
| 14 | esbuild `safari14` target risk | known destructuring transform bug | use `es2020` |
| 15 | Hover card "didn't hide" in tests | slow software-rendered browser | wait on conditions, not fixed sleeps |
| 16 | Pinned verified price mismatch | shop noise vs base price | `VERIFIED` pins the shop price and clamps others |
| 18 | Assistant read "hra" inside "vyhraje"; "30 000 Kč" became millions | substring matching; `kc` matched as thousands suffix | `has()` matches from word start (`\\bkey`); suffix check `^(k$|tis)`; budget needs a cue (k/tis/Kč, do/za…) or ≥ 5 digits so "RTX 5070" is not a budget |
| 19 | Sticky bar looked like a glitch | 97 %-opaque nav let content ghost through; anchors scrolled under it | solid `--paper` bar + `scroll-padding-top` |
| 20 | Heading words glued together ("PosklÃ¡dejPC") | trailing space inside an `inline-block` collapses | put the space outside the `.w` wrapper |
| 21 | Circuit + glass dropped frame rate | SMIL pulses repainted on the main thread; entrance animation on huge grids; inset blur on 100 cards | pulses as compositor keyframes, animate only first 3 children, no inset blur, `FxToggle` escape hatch |
| 17 | White text unreadable | fixed bright gradient bottom | dark panels for prose, deeper bottom colour, contrast ≥ 7 |

---

## 12. BUILD, TEST AND QA PROCESS

**Sandbox notes (when the AI has a shell):** the shell is `sh` (no brace expansion), processes die between tool calls (start the static server **in the same command** as the test), never `pkill -f` a pattern that matches your own command line, no network (cannot `npm install`; React/Playwright come from the global install, esbuild from `tsx`'s node_modules; symlink `react`/`react-dom` into `node_modules`), edit with Python exact-string replaces + `assert`.

**Build + serve + test loop**

```bash
# 1) build
ESB=/home/claude/.npm-global/lib/node_modules/tsx/node_modules/.bin/esbuild
$ESB src/main.jsx --bundle --minify --target=es2020 --outfile=docs/app.js \
  --loader:.png=dataurl --loader:.ttf=dataurl --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' --log-level=warning
# 2) mirror GitHub's sub-path and serve
rm -rf /tmp/site/Qompify-WEB && mkdir -p /tmp/site/Qompify-WEB && cp -r docs /tmp/site/Qompify-WEB/docs && cp index.html /tmp/site/Qompify-WEB/
cd /tmp/site && (nohup python3 -m http.server 8765 >/dev/null 2>&1 &); sleep 1
# 3) Playwright (chromium, swiftshader WebGL) against http://localhost:8765/Qompify-WEB/#/<route>
```
Test `data.js` logic in Node by bundling a small `.mjs` that imports it with esbuild (`--platform=node --format=esm`), because `prices.json` is imported as JSON.

**Regression checklist (run after every change)**

1. App renders with **zero page errors** on all 9 routes + the 6 legal pages (`#/ochrana-udaju`, `podminky`, `vraceni`, `cookies`, `moje-data`) (desktop 1280 and phone 390).
2. Top bar: no tab clipped at 1440/1280/1100/1024/900/768/390; Komunita badge centred.
3. Builder: pick part → slot fills, total updates, badges correct; incompatible parts flagged; PSU weak case; bottleneck warning (i3-12100F + RTX 5080).
4. Catalog: 101 parts, filters, stock filter, price cap shows RTX 5090.
5. Compare modal/tray/page: winners highlighted, up to 5 on page, monitors work, history chart hover.
6. Alerts: set → banner on reload → remove.
7. Optimizer: "35 000 Kč, gaming" gives 3 compatible builds ≤ budget; impossible budget message.
8. Benchmarks: JellyRadio changes FPS; no "Off"; sensitivity differs per game.
9. Articles: list first, opens on click, back link, calculators respond.
10. Hover cards on deals/catalog/slots/picker/tiers/compare/monitors; hide after leaving.
11. PDF downloads, valid (`pdfinfo`), links present (`strings … | grep /URI`), render with `pdftoppm` and **look at it**, including a build with warnings.
12. Assistant: greeting, explain-all (7 headers), upgrade, savings, free text, `?ask=1`.
13. Arrow keys switch tabs but not inside inputs/radiogroups/modals.
14. `docs/` rebuilt and the root `index.html` + `docs/index.html` both load.
15. Screenshots reviewed visually (contrast, nav wrapping, sticky bar not ghosting content).

---

## 13. DEPLOYMENT (THE AI MUST REPEAT THIS EVERY TIME FILES CHANGE)

### 13.1 Standard update — Terminal (macOS)

```bash
cd ~/Downloads
unzip -o qompify-vN.zip -d qompify-new          # replace N with the new version
rsync -a qompify-new/qompify/ qompify/           # copies new files over; keeps the .git folder
cd qompify
git add -A
git commit -m "Short description of the change"
git pull --rebase -X theirs origin main          # pulls bot commits first; your files win conflicts
git push
```
- `rsync` does **not** delete removed files. If a release removes files, tell the owner the exact `rm -rf` lines (example from history: `rm -rf qompify/.github qompify/public qompify/vite.config.js`).
- If "nothing to commit": the files are already committed; only `pull --rebase` + `push` are needed.
- If the rebase stops with conflicts: `git rebase --abort` then `git push --force-with-lease` (safe here: the other side is only a bot's rebuilt-site commit).

### 13.2 GitHub Desktop variant
Run the first three lines above in Terminal, then in GitHub Desktop: **File → Add Local Repository →** `~/Downloads/qompify` (first time only) → check changes → type summary → **Commit to main** → **Fetch origin** → **Pull origin** → **Push origin**.

### 13.3 Check the result
Wait ~1 minute, open `https://shadow-102.github.io/Qompify-WEB/` in a private window or hard-refresh **Cmd+Shift+R**. Pages settings: **Settings → Pages → Source: Deploy from a branch → `main` → `/ (root)`** (or `/docs`; both work). Green check in **Actions → "pages build and deployment"**.

### 13.4 First-time setup (only once)
```bash
brew install gh                    # skip if installed
gh auth login                      # GitHub.com → HTTPS → Yes → browser (Touch ID / passkey)
gh auth setup-git
cd ~/Downloads/qompify
git init -b main
git add -A && git commit -m "Qompify"
git remote add origin https://github.com/Shadow-102/Qompify-WEB.git
git push -u origin main --force    # --force only for the very first upload
```
Fallback auth: classic personal access token with `repo` + `workflow` scopes used as the password.

### 13.5 Troubleshooting table

| Symptom | Likely cause | Fix |
|---|---|---|
| Fully white page | Pages serving raw source / wrong source | Source = Deploy from a branch → main → `/ (root)`; confirm `docs/app.js` exists on GitHub |
| "Načítání Qompify…" forever | JS blocked/not loaded (path) | open DevTools → Network; confirm `./docs/app.js` 200 |
| "Chyba: …" on page | runtime error | send the exact message |
| Old version still showing | CDN/browser cache | wait 1–2 min, Cmd+Shift+R, private window |
| `rejected … fetch first` | remote has the bot's commit | `git pull --rebase -X theirs origin main` then `git push` |
| Red ✗ on commit | prices workflow or old Actions | disable "Update prices" or delete `prices.yml` |
| `Authentication failed` | password auth | `gh auth login` / token |
| Changes not visible | forgot to rebuild `docs/` | rebuild and recommit |
| 404 on assets | wrong base | relative `./docs/` paths only |

Disable the bot until feeds exist: `git rm .github/workflows/prices.yml`, commit, push (or GitHub → Actions → "Update prices" → ⋯ → Disable workflow).

---

## 14. HOW TO MAKE COMMON CHANGES (recipes)

- **Add or edit a part:** add a line in `PARTS` using the helper of its category; unique `id`; set `price` and `v`; if it should look scarce add it to `OUT`. Check `check()` with presets still passes (run the Node validation of `TIERS`/`SEEDS`).
- **Bulk price update (safe):** python regex per id: `(\b\w+\('ID','[^']*','[^']*',)(\d+),(\d),` → new price, `v`. Then re-validate `VERIFIED` pins, tier totals and labels, slider cap.
- **Add a verified deal:** append to `VERIFIED` with `shop` ∈ RETAILERS, `date`, `src`, `note`; ensure base `price` equals the verified price.
- **Add a page/tab:** add to `NAV`, add a branch in the `main` ternary in `App`, create the component (new file if > ~100 lines), add CSS, add to the regression checklist and the README.
- **Add an article:** add an entry to `ARTICLES`, a component, and a branch in `Articles`. Pattern: `Prose` text → interactive `.card.art` block → text …
- **Add a game:** push `[name, '1080p, vysoké', k, [low, mid, high=1, ultra]]` onto `GAMES`; tiers/benchmarks/optimizer adapt automatically.
- **Add hover details:** put `data-part="<id>"` on the element.
- **Change palette:** CSS variables at the top of `styles.css` (+ `meta theme-color` and the inline `body` colour in both `index.html`), PDF header gradient in `pdf.js` (the PDF still has the v1 glacier header).
- **New selector UI:** reuse `JellyRadio` (colors used: chip `#E5D9C5`, active `#3B66F5`, text `#0b0f19`, active text `#fff`).

---

## 15. LIVE PRICE PIPELINE (built, not yet fed)

1. Obtain shop XML feed URLs (Heureka/Zboží format) via partner/affiliate programs.
2. Put them in `scripts/feeds.json` or the GitHub secret `FEEDS_JSON` (same JSON array).
3. Local: `npm install && npm run prices && npm run build` → commit `src/prices.json` + `docs/`.
4. Automatic: `.github/workflows/prices.yml` (daily). Requires **Settings → Actions → General → Workflow permissions: Read and write**.
5. Matching: part name tokens must all appear as whole words; fix misses with `scripts/overrides.json`. `hist` accumulates daily lows; charts switch from simulated to real once > 2 points.
6. Risks: feed formats differ, names are inconsistent, never validated on a real feed. Review the first run's matched counts (`Spárováno N nabídek`).

---

## 16. IDEAS BACKLOG (the AI should keep offering these, re-ranked each time)

**High impact / small effort**
1. Connect live price feeds and show "živá cena" labels + last update time.
2. Electricity-cost calculator (Kč/kWh, hours/day) per build.
3. PDF extras: QR code to the build, compatibility legend, shop-by-shop totals.
4. "What if" in the assistant: swap a part and show the diff in price/FPS/power.
5. Build versions and compare-with-last-week price view.

**High impact / medium effort**
6. CPU **coolers** category with height + socket checks; case fan/radiator support.
7. Replace modelled `sc` with real benchmark data (CPU/GPU averages from published reviews) with sources.
8. Real alerts: email/push via a serverless function (Cloudflare Worker + Web Push/Resend) while keeping the site static.
9. LLM-powered assistant through a serverless proxy (never ship API keys in the client).
10. Used-hardware tab (Bazoš/Aukro), price-to-new ratio.
11. PWA (installable, offline catalog), privacy-friendly analytics, SEO prerender of articles + sitemap.

**Strategic**
12. User accounts and cloud-synced builds (Supabase/Firebase), public build pages with permalinks and comments.
13. Slovak and English localisations.
14. More categories: monitors in the builder, peripherals, prebuilt-vs-DIY comparison, RAM/GPU price-trend articles ("proč jsou paměti tak drahé").
15. Engineering health: split `extra.jsx` by feature, TypeScript, unit tests for `data.js` logic, a CI test workflow (not a deploy workflow), design-token file, dark/light toggle, accessibility audit.

---

## 17. COMMUNICATION PROTOCOL FOR REPLIES

Structure every delivery like this:

1. One-line result ("`qompify-vN.zip` is ready; tested in headless Chromium, not in Safari").
2. **Deploy steps** (§13.1 + §13.2 + check URL), concise, copy-paste.
3. **What changed** (grouped, specific numbers/prices, with source and date for any price claim).
4. **Limits / interpretations** (estimates, simulated data, untested browsers, what was skipped).
5. **Ideas for next** (3–8, ranked).

Tone: direct, practical, friendly; no hype. Admit mistakes plainly and fix them. Explain terminal errors in plain words and give the exact next command. When the owner pastes a Terminal error or screenshot, diagnose it first (git rejected, auth, wrong folder, Pages source, caching), then give the fix.

**If the owner asks for something that conflicts with this brief** (e.g. remove a feature), follow the owner and update the changelog; the owner's latest explicit request wins.

---

## 18. GLOSSARY (UI vocabulary)

Stavitel PC = PC builder · Na míru = tailor-made (optimizer) · Porovnat = compare · Sestavy = ready builds · Katalog = catalog · Články = articles · Komunita = community · Ověřená cena = verified price · Orientační cena / odhad ceny = estimated price · Nejlepší nabídky = best deals · Hlídat cenu / Upozorni mě = watch price · Cenu hlídáme = price is being watched · Do sestavy = add to build · Stáhnout PDF = download PDF · Kopírovat odkaz = copy link · Skladem / Není skladem = in stock / out of stock · Zdroj = PSU (or "source" in deals) · Skříň = case · Základní deska = motherboard · Úložiště = storage · Paměť = RAM · Grafická karta = GPU · Procesor = CPU · Nízké/Střední/Vysoké/Ultra = graphics Low/Medium/High/Ultra.

---

## 19. PROMPT STARTERS THE OWNER MAY USE

- "Here is the repo zip and `AI_BRIEF.md`. Add <feature>. Keep everything else working, test it, and give me the deploy steps."
- "Update all prices from Czech shops again and re-validate the presets."
- "Turn on live price feeds; explain exactly where I get the feed URLs and what to paste."
- "The site shows <symptom>. Here is the Terminal output / screenshot." (diagnose from §11 and §13.5)
- "Redesign <page> keeping the v2 design system and the rules in §3."

*End of brief. Remember: rebuild `docs/`, test, deliver the full zip, show the deploy steps, state limits, suggest next ideas.*