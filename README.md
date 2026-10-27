# Qompify

Stavitel PC, srovnávač cen a kontrola kompatibility pro český trh (React).

## Nasazení (GitHub Pages)
Hotový web je commitnutý ve složce `docs/` a kořenový `index.html` ho načítá, takže funguje
jak se zdrojem **Deploy from a branch → main → / (root)**, tak **/docs**. Žádný GitHub Actions není potřeba.

## Úpravy kódu
    npm install
    npm run build      # přegeneruje docs/app.js a docs/app.css
Pak commit a push. Díly a ceny: `src/data.js`, affiliate odkazy: `RETAILERS` v `src/data.js`.
