// Přihlašovací brána + veřejné právní stránky pro nepřihlášené.
import { useEffect, useRef, useState } from 'react';
import logo from './assets/logo.png';
import { AUTH, signIn, useAuth } from './auth.js';
import { InfoPage, INFO, LegalLinks, CookieNotice } from './legal.jsx';
import App from './App.jsx';

const slugOf = () => location.hash.replace(/^#\/?/, '').split('?')[0];
const useSlug = () => { const [s, setS] = useState(slugOf); useEffect(() => { const f = () => setS(slugOf()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []); return s; };
const Brand = () => <a className="brand" href="#/"><img src={logo} alt="" /><span>Qompify</span></a>;

function Login() {
  const [u, setU] = useState(''), [p, setP] = useState(''), [keep, setKeep] = useState(true), [show, setShow] = useState(false), [err, setErr] = useState(false), first = useRef(null);
  useEffect(() => { first.current?.focus(); }, []);
  const submit = e => { e.preventDefault(); if (!signIn(u, p, keep)) { setErr(true); setP(''); } };
  const fill = () => { setU(AUTH.hint.user); setP(AUTH.hint.pass); setErr(false); };
  return (
    <main className="lg">
      <section className="lgl">
        <Brand />
        <h1>Poskládej PC, které nastartuje na první pokus.</h1>
        <p>Kontrola kompatibility, ceny z českých e-shopů a sestava s nejlepším poměrem cena/výkon na jednom místě.</p>
      </section>
      <form className="lgf" onSubmit={submit} noValidate aria-labelledby="lgh">
        <h2 id="lgh">Přihlášení</h2>
        <p className="muted">Qompify je zatím ve zkušebním provozu.</p>
        <label>Uživatelské jméno<input ref={first} value={u} onChange={e => { setU(e.target.value); setErr(false); }} autoComplete="username" autoCapitalize="none" spellCheck="false" aria-invalid={err} /></label>
        <label>Heslo
          <span className="pw"><input type={show ? 'text' : 'password'} value={p} onChange={e => { setP(e.target.value); setErr(false); }} autoComplete="current-password" aria-invalid={err} aria-describedby={err ? 'lge' : undefined} />
            <button type="button" className="ghost" onClick={() => setShow(s => !s)} aria-pressed={show}>{show ? 'Skrýt' : 'Zobrazit'}</button></span>
        </label>
        {err && <p id="lge" className="lge" role="alert">Jméno nebo heslo nesedí. Zkontroluj je a zkus to znovu.</p>}
        <label className="keep"><input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} /> Zůstat přihlášen na tomto zařízení</label>
        <button className="btn lgb" disabled={!u.trim() || !p}>Přihlásit se</button>
        {AUTH.hint && <p className="lgh muted">Testovací přístup: uživatel <b>{AUTH.hint.user}</b>, heslo <b>{AUTH.hint.pass}</b>. <button type="button" className="qlg-link" onClick={fill}>Vyplnit</button></p>}
      </form>
      <footer className="lgn"><LegalLinks /></footer>
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
  return (
    <>
      {user ? <App /> : INFO.includes(slug) ? <Public slug={slug} /> : <Login />}
      <CookieNotice />
    </>
  );
}
