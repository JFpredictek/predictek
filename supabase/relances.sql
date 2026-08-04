-- Predictek - Moteur de relances automatiques
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run

-- 1) Donnees d assurance par coproprietaire (deja presentes dans l Excel d import)
alter table public.coproprietaires add column if not exists assurance_police text;
alter table public.coproprietaires add column if not exists assurance_exp date;

-- 2) Registre des relances envoyees (anti-doublon + tracabilite)
create table if not exists public.relances_envoyees (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  coproprietaire_id uuid,
  type text,
  cle text unique,
  courriel text,
  sujet text,
  statut text default 'envoyee',
  detail text,
  created_at timestamptz default now()
);

alter table public.relances_envoyees enable row level security;
drop policy if exists "lect" on public.relances_envoyees;
drop policy if exists "adm" on public.relances_envoyees;
create policy "lect" on public.relances_envoyees for select to authenticated
  using (public.acces_syndicat(syndicat_id::text));
create policy "adm" on public.relances_envoyees for all to authenticated
  using (public.mon_role() = 'admin') with check (public.mon_role() = 'admin');

-- Verification
select 'relances_envoyees' as table_creee, count(*) as politiques
from pg_policies where tablename = 'relances_envoyees';
