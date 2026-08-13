-- Predictek - FACTURATION CLIENTS (Predictek facture ses syndicats clients)
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run
-- Acces reserve aux ADMINISTRATEURS Predictek (donnees d entreprise, pas de syndicat).

create table if not exists public.facturation_tarifs (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid unique,
  mode text default 'par_unite',            -- par_unite | forfait
  tarif_unite numeric default 0,            -- $ par unite par mois
  forfait numeric default 0,                -- $ forfait mensuel
  actif boolean default true,
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists public.factures_clients (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  client_nom text default '',
  no_facture text unique,
  periode text,                             -- YYYY-MM
  date_facture date,
  date_echeance date,
  description text default '',
  nb_unites int default 0,
  tarif numeric default 0,
  sous_total numeric default 0,
  tps numeric default 0,
  tvq numeric default 0,
  total numeric default 0,
  statut text default 'brouillon',          -- brouillon | envoyee | payee | annulee
  date_paiement date,
  created_at timestamptz default now()
);

alter table public.facturation_tarifs enable row level security;
alter table public.factures_clients enable row level security;
drop policy if exists "ft_adm" on public.facturation_tarifs;
drop policy if exists "fc_adm" on public.factures_clients;
create policy "ft_adm" on public.facturation_tarifs for all to authenticated
  using (public.mon_role() = 'admin') with check (public.mon_role() = 'admin');
create policy "fc_adm" on public.factures_clients for all to authenticated
  using (public.mon_role() = 'admin') with check (public.mon_role() = 'admin');

-- Verification
select t.tablename, count(p.policyname) as politiques
from pg_tables t left join pg_policies p on p.tablename = t.tablename
where t.tablename in ('facturation_tarifs','factures_clients') group by t.tablename;
