// Kořen aplikace: pozadí, globální efekty a cookie lišta kolem App.
import App from './App.jsx';
import { Circuit } from './circuit.jsx';
import { CookieNotice } from './legal.jsx';
import { usePointerGlow, useFxPref, useThemePref } from './fx.jsx';

export default function Root() {
  usePointerGlow(); useFxPref(); useThemePref();
  return (
    <>
      <Circuit />
      <App />
      <CookieNotice />
    </>
  );
}
