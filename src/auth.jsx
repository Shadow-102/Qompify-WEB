// Přihlašovací brána + veřejné právní stránky pro nepřihlášené.
import { useEffect, useRef, useState } from 'react';
import logo from './assets/logo.png';
import { REMOTE, signIn, useAuth } from './auth.js';
import { InfoPage, INFO, LegalLinks, CookieNotice } from './legal.jsx';
import App from './App.jsx';
import { Circuit } from './circuit.jsx';
import { Words, Trace, usePointerGlow, useFxPref, FxToggle, ThemeToggle, useThemePref } from './fx.jsx';

const slugOf = () => location.hash.replace(/^#\/?/, '').split('?')[0];
const useSlug = () => { const [s, setS] = useState(slugOf); useEffect(() => { const f = () => setS(slugOf()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []); return s; };
const Brand = () => <a className="brand" href="#/"><img src={logo} alt="" /><span>Qompify</span></a>;

function Login() {
  const [u, setU] = useState(''), [p, setP] = useState(''), [keep, setKeep] = useState(true), [show, setShow] = useState(false), [err, setErr] = useState(''), [busy, setBusy] = useState(false), first = useRef(null);
  useEffect(() => { first.current?.focus(); }, []);
  const submit = async e => { e.preventDefault(); if (busy) return; setBusy(true); const r = await signIn(u, p, keep); if (!r.ok) { setErr(r.error); setP(''); setBusy(false); } };
  const MSG = { invalid: 'Přihlášení se nepodařilo. Zkontroluj údaje a zkus to znovu.', rate: 'Příliš mnoho pokusů. Zkus to za chvíli.', unconfirmed: 'Tento účet ještě není potvrzený.', network: 'Nepodařilo se spojit se serverem. Zkontroluj připojení.', server: 'Server teď neodpovídá. Zkus to za chvíli.' };
  return (
    <main className="lg">
      <section className="lgl">
        <Brand />
        <h1><Words text="Poskládej PC, které nastartuje na první pokus." /></h1><Trace />
        <p>Kontrola kompatibility, ceny z českých e-shopů a sestava s nejlepším poměrem cena/výkon na jednom místě.</p>
      </section>
      <form className="lgf" onSubmit={submit} noValidate aria-labelledby="lgh">
        <h2 id="lgh">Přihlášení</h2>
        <p className="muted">Přístup je zatím jen pro pozvané.</p>
        <label>{REMOTE ? 'E-mail' : 'Uživatelské jméno'}<input ref={first} type={REMOTE ? 'email' : 'text'} value={u} onChange={e => { setU(e.target.value); setErr(''); }} autoComplete="username" autoCapitalize="none" spellCheck="false" aria-invalid={!!err} /></label>
        <label>Heslo
          <span className="pw"><input type={show ? 'text' : 'password'} value={p} onChange={e => { setP(e.target.value); setErr(''); }} autoComplete="current-password" aria-invalid={!!err} aria-describedby={err ? 'lge' : undefined} />
            <button type="button" className="ghost" onClick={() => setShow(s => !s)} aria-pressed={show}>{show ? 'Skrýt' : 'Zobrazit'}</button></span>
        </label>
        {err && <p id="lge" className="lge" role="alert">{MSG[err] || MSG.invalid}</p>}
        <label className="keep"><input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} /> Zůstat přihlášen na tomto zařízení</label>
        <button className="btn lgb" disabled={busy || !u.trim() || !p}>{busy ? 'Přihlašuji…' : 'Přihlásit se'}</button>
      </form>
      <footer className="lgn"><LegalLinks /><div className="lgt"><FxToggle /><ThemeToggle /></div></footer>
    </main>
  );
}

function Public({ slug }) {
  return (
    <div className="app">
      <header className="nav"><div className="navin"><Brand /><a className="who" href="#/">← Zpět na přihlášení</a></div></header>
      <main className="view"><InfoPage slug={slug} /></main>
    </div>
  );
}

export default function Gate() {
  const user = useAuth(), slug = useSlug();
  usePointerGlow(); useFxPref(); useThemePref();
  return (
    <>
      <Circuit />
      {user ? <App /> : INFO.includes(slug) ? <Public slug={slug} /> : <Login />}
      <CookieNotice />
    </>
  );
}
