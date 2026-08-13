-- Predictek - AVIS DE NON-CONFORMITE (violations du reglement de l immeuble)
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run

create table if not exists public.avis_conformite (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  unite text default '',
  coproprietaire_id uuid,
  destinataire_nom text default '',
  objet text default '',
  description text default '',
  article_reglement text default '',
  niveau text default 'avis',            -- avis | rappel | infraction
  avis_parent_id uuid,
  date_avis date,
  echeance date,
  statut text default 'emis',            -- emis | corrige | infraction_emise | annule
  montant_penalite numeric,
  date_correction date,
  notes text default '',
  created_at timestamptz default now()
);

alter table public.avis_conformite enable row level security;
drop policy if exists "avc_sel" on public.avis_conformite;
drop policy if exists "avc_mod" on public.avis_conformite;
create policy "avc_sel" on public.avis_conformite for select to authenticated
  using (public.acces_syndicat(syndicat_id::text));
create policy "avc_mod" on public.avis_conformite for all to authenticated
  using (public.est_gestion()) with check (public.est_gestion());

-- Verification
select 'avis_conformite' as table_creee, count(*) as politiques
from pg_policies where tablename = 'avis_conformite';

-- Factures emises aux coproprietaires (frais, penalites d infraction, refacturation)
create table if not exists public.factures_copros (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  unite_id uuid,
  unite text default '',
  coproprietaire_id uuid,
  destinataire_nom text default '',
  no_facture text,
  type_frais text default 'frais',      -- frais | infraction | refacturation
  description text default '',
  montant numeric default 0,
  date_facture date,
  date_echeance date,
  statut text default 'emise',          -- emise | payee | annulee
  date_paiement date,
  created_at timestamptz default now()
);
alter table public.factures_copros enable row level security;
drop policy if exists "fcp_sel" on public.factures_copros;
drop policy if exists "fcp_mod" on public.factures_copros;
create policy "fcp_sel" on public.factures_copros for select to authenticated
  using (public.acces_syndicat(syndicat_id::text));
create policy "fcp_mod" on public.factures_copros for all to authenticated
  using (public.est_gestion()) with check (public.est_gestion());
