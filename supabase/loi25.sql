-- Predictek - Loi 25 + champs urgence
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run

-- 1) Champs de contact d urgence des coproprietaires (editables a l onboarding)
alter table public.coproprietaires add column if not exists urg_nom text;
alter table public.coproprietaires add column if not exists urg_lien text;
alter table public.coproprietaires add column if not exists urg_tel text;

-- 2) Registre des incidents de confidentialite (obligation Loi 25)
create table if not exists public.registre_incidents (
  id uuid primary key default gen_random_uuid(),
  date_incident date,
  description text,
  renseignements_vises text,
  personnes_touchees integer default 0,
  risque_prejudice text default 'faible',
  mesures_prises text,
  avis_cai boolean default false,
  avis_personnes boolean default false,
  statut text default 'ouvert',
  cree_par text,
  created_at timestamptz default now()
);

alter table public.registre_incidents enable row level security;
drop policy if exists "adm" on public.registre_incidents;
create policy "adm" on public.registre_incidents for all to authenticated
  using (public.mon_role() = 'admin') with check (public.mon_role() = 'admin');

-- Verification
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'registre_incidents';
