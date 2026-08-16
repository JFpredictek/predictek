-- Predictek - CORRECTIF table tickets (demandes du portail invisibles)
-- La table tickets n avait PAS la colonne coproprietaire_id: chaque demande
-- soumise par le portail echouait silencieusement (0 ticket enregistre).
-- DEJA EXECUTE le 2026-08-16 via le SQL Editor - conserve ici pour reference.

alter table public.tickets add column if not exists coproprietaire_id uuid;
alter table public.tickets add column if not exists reponse text;
alter table public.tickets add column if not exists date_reponse date;
alter table public.tickets add column if not exists date_resolution date;

notify pgrst, 'reload schema';

-- Verification
select column_name from information_schema.columns
where table_name='tickets'
  and column_name in ('coproprietaire_id','reponse','date_reponse','date_resolution','categorie','donnees');

-- Assignation des tickets (CRM): a un gestionnaire, a un membre du CA ou a tout le CA
alter table public.tickets add column if not exists assigne_nom text default '';
alter table public.tickets add column if not exists assigne_courriel text default '';
alter table public.tickets add column if not exists assigne_type text default '';
notify pgrst, 'reload schema';

-- Termes de paiement et escompte fournisseur sur les factures
alter table public.factures add column if not exists terme_paiement text default 'net30';
alter table public.factures add column if not exists escompte_pct numeric default 0;
alter table public.factures add column if not exists escompte_jours int default 0;
notify pgrst, 'reload schema';

-- Repertoire fournisseurs: personne contact, licence RBQ, nos TPS/TVQ
alter table public.fournisseurs add column if not exists contact text default '';
alter table public.fournisseurs add column if not exists rbq text default '';
alter table public.fournisseurs add column if not exists no_tps text default '';
alter table public.fournisseurs add column if not exists no_tvq text default '';
notify pgrst, 'reload schema';

-- Suivi des invitations: date et heure d envoi de l invitation
alter table public.usagers add column if not exists invite_le timestamptz;
notify pgrst, 'reload schema';

-- Historique des tickets (evolution: reponses, statuts, assignations - date/heure/usager)
alter table public.tickets add column if not exists historique jsonb;
-- Table des votes d approbation (si absente) + politiques
create table if not exists public.approbations_ca (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid, membre_nom text default '', decision text default '',
  commentaire text default '', date_decision timestamptz default now()
);
alter table public.approbations_ca enable row level security;
drop policy if exists "apc_sel" on public.approbations_ca;
drop policy if exists "apc_mod" on public.approbations_ca;
create policy "apc_sel" on public.approbations_ca for select to authenticated using (true);
create policy "apc_mod" on public.approbations_ca for all to authenticated
  using (public.est_gestion() or public.mon_role() = 'ca')
  with check (public.est_gestion() or public.mon_role() = 'ca');
notify pgrst, 'reload schema';

-- Budget: statut brouillon / approuve par le CA (avant de confirmer les cotisations)
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid, annee_debut text, created_at timestamptz default now()
);
alter table public.budgets add column if not exists statut text default 'brouillon';
alter table public.budgets add column if not exists approuve_par text default '';
alter table public.budgets add column if not exists date_approbation timestamptz;
alter table public.budgets add column if not exists annee_debut text;
alter table public.budgets enable row level security;
drop policy if exists "bud_sel" on public.budgets;
drop policy if exists "bud_mod" on public.budgets;
create policy "bud_sel" on public.budgets for select to authenticated using (true);
create policy "bud_mod" on public.budgets for all to authenticated using (public.est_gestion()) with check (public.est_gestion());
notify pgrst, 'reload schema';
