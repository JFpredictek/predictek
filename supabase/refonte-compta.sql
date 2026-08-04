-- Predictek - Refonte comptabilite
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run

-- 1) Table des soldes d ouverture par syndicat
--    (le bouton "Sauvegarder les soldes" ecrivait dans une table inexistante)
create table if not exists public.syndicats_soldes (
  syndicat_id uuid primary key references public.syndicats(id) on delete cascade,
  solde_op numeric default 0,
  solde_prev numeric default 0,
  solde_ass numeric default 0,
  date_ouverture date,
  budget_annuel numeric default 0,
  cotisation_moyenne numeric default 0,
  updated_at timestamptz default now()
);

alter table public.syndicats_soldes enable row level security;
drop policy if exists "lect" on public.syndicats_soldes;
drop policy if exists "ecr" on public.syndicats_soldes;
create policy "lect" on public.syndicats_soldes for select to authenticated
  using (public.acces_syndicat(syndicat_id::text));
create policy "ecr" on public.syndicats_soldes for all to authenticated
  using (public.est_gestion() and public.acces_syndicat(syndicat_id::text))
  with check (public.est_gestion());

-- Verification
select tablename, policyname, cmd from pg_policies
where tablename = 'syndicats_soldes';
