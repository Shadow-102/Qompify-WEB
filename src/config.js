// Veřejné údaje projektu Supabase (Supabase → Project Settings → API).
// `anonKey` (nebo nový „publishable“ klíč) je určený pro prohlížeč, klidně leží v repozitáři.
// NIKDY sem nevkládej klíč „service_role“ ani „secret“.
// Dokud jsou obě hodnoty prázdné, běží místní testovací přihlášení (bez zabezpečení). Po vyplnění se přihlašuje e-mailem a heslem přes Supabase.
export const SUPABASE = { url: '', anonKey: '' };
