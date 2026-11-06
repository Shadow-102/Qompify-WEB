-- Spusť jednou v Supabase → SQL Editor. Vytvoří prázdnou tabulku, na kterou se pravidelně ptá workflow „Supabase keepalive“,
-- aby se projekt na bezplatném tarifu nepozastavil po týdnu bez aktivity.
create table if not exists public.keepalive (id int primary key default 1);
insert into public.keepalive (id) values (1) on conflict do nothing;
alter table public.keepalive enable row level security;
create policy "keepalive_public_read" on public.keepalive for select using (true);
