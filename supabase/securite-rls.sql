-- Predictek - Activation de la securite niveau ligne (RLS)
-- A executer dans Supabase : SQL Editor > New query > coller > Run
--
-- Effet : la cle publique (anon) seule ne donne plus AUCUN acces aux donnees.
-- Seuls les utilisateurs CONNECTES (via Supabase Auth) peuvent lire/ecrire.
-- C est la protection minimale requise. Un raffinement par role/syndicat
-- pourra etre ajoute ensuite (phase 2).

do $$
declare
  t text;
  tables text[] := array[
    'syndicats','usagers','coproprietaires','paiements','reunions',
    'prelevements','carnet_entretien','historique','fournisseurs',
    'bons_travail','documents','factures','budgets','budget_lignes',
    'journal','employes','tickets','membres_ca','approbations_ca'
  ];
begin
  foreach t in array tables loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "acces_authentifie" on public.%I', t);
      execute format(
        'create policy "acces_authentifie" on public.%I for all to authenticated using (true) with check (true)',
        t
      );
      raise notice 'RLS active sur: %', t;
    else
      raise notice 'Table absente (ignoree): %', t;
    end if;
  end loop;
end $$;

-- Verification : toutes les tables listees doivent afficher rowsecurity = true
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
