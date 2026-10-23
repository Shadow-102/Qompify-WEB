# Qompify

Stavitel PC, srovnávač cen a kontrola kompatibility pro český trh (React + Vite).

## Spuštění
    npm install
    npm run dev

## Nasazení na GitHub Pages
1. Nahraj repozitář na GitHub (větev `main`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Každý push na `main` spustí `.github/workflows/deploy.yml`.

## Úpravy
- Díly a ceny: `src/data.js` (demo data, ceny v e-shopech se odvozují deterministicky).
- Affiliate odkazy: pole `RETAILERS` v `src/data.js`.
- Pozadí: `src/GradientASCII.jsx` lze nahradit originálem z React Bits
  (`npx shadcn@latest add @react-bits/GradientASCII-JS-CSS`), props `colors`, `shape`, `characters`, `lightMode`.
