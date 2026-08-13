-- Predictek - COMPTABILITE DE L ENTREPRISE (distincte des syndicats)
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run

create table if not exists public.predictek_comptes (
  id uuid primary key default gen_random_uuid(),
  no_compte text unique,
  nom_compte text default '',
  type_compte text default 'depense',   -- actif | passif | capitaux | revenu | depense
  groupe text default '',
  actif boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.predictek_journal (
  id uuid primary key default gen_random_uuid(),
  date_transaction date,
  no_compte text,
  description text default '',
  debit numeric default 0,
  credit numeric default 0,
  reference text default '',
  source text default 'manuel',         -- manuel | facturation | paie
  created_at timestamptz default now()
);

alter table public.predictek_comptes enable row level security;
alter table public.predictek_journal enable row level security;
drop policy if exists "pc_adm" on public.predictek_comptes;
drop policy if exists "pj_adm" on public.predictek_journal;
create policy "pc_adm" on public.predictek_comptes for all to authenticated
  using (public.mon_role() = 'admin') with check (public.mon_role() = 'admin');
create policy "pj_adm" on public.predictek_journal for all to authenticated
  using (public.mon_role() = 'admin') with check (public.mon_role() = 'admin');

-- Verification
select t.tablename, count(p.policyname) as politiques
from pg_tables t left join pg_policies p on p.tablename = t.tablename
where t.tablename in ('predictek_comptes','predictek_journal') group by t.tablename;

-- Depenses fournisseurs de l entreprise (avec document et compte de depense)
create table if not exists public.predictek_depenses (
  id uuid primary key default gen_random_uuid(),
  fournisseur text default '',
  no_facture text default '',
  date_facture date,
  sous_total numeric default 0,
  tps numeric default 0,
  tvq numeric default 0,
  total numeric default 0,
  no_compte text default '5900',
  statut text default 'a_payer',        -- a_payer | payee
  date_paiement date,
  fichier text default '',
  notes text default '',
  created_at timestamptz default now()
);
alter table public.predictek_depenses enable row level security;
drop policy if exists "pd_adm" on public.predictek_depenses;
create policy "pd_adm" on public.predictek_depenses for all to authenticated
  using (public.mon_role() = 'admin') with check (public.mon_role() = 'admin');

-- Comptabilite PAR FONDS des syndicats: rattachement compte GL -> fonds
alter table public.comptes_syndicat add column if not exists fonds text default 'operation';
update public.comptes_syndicat set fonds='prevoyance' where fonds='operation' and (type_compte='prevoyance' or no_compte in ('4120','4520','5902','1112','1530'));
update public.comptes_syndicat set fonds='assurance' where fonds='operation' and no_compte in ('8200','8201','4160','4550','5903','1114');

-- Regles d approbation des factures (par syndicat)
alter table public.syndicats add column if not exists approb_seuil numeric default 1000;
alter table public.syndicats add column if not exists approb_requises int default 1;
