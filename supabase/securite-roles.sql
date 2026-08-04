-- Predictek - Phase 3: permissions par ROLE et par SYNDICAT
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run
-- Remplace la politique globale "acces_authentifie" par des regles fines:
--   admin          -> acces complet
--   gestionnaire   -> ses syndicats assignes (fiche usagers; syndicat_id vide = tous)
--   ca             -> lecture de son syndicat + approbation de factures
--   coproprietaire -> lecture de son syndicat + creation de tickets
--   tables sensibles (paies, employes, etc.) -> admin uniquement

-- ============ 1) Fonctions utilitaires ============

create or replace function public.mon_role() returns text
language sql stable as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '')
$$;

create or replace function public.est_gestion() returns boolean
language sql stable as $$
  select public.mon_role() in ('admin','gestionnaire')
$$;

-- security definer: peut lire usagers sans etre bloque par la RLS de usagers
create or replace function public.acces_syndicat(sid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.mon_role() = 'admin'
    or exists (
      select 1 from public.usagers u
      where u.auth_id = auth.uid()
        and coalesce(u.actif, true)
        and (u.syndicat_id is null or u.syndicat_id::text = sid)
    )
$$;

-- ============ 2) Politiques par table ============

do $$
declare
  r record;
  p record;
  a_sid boolean;
begin
  for r in
    select t.table_name as tn
    from information_schema.tables t
    where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
  loop
    execute format('alter table public.%I enable row level security', r.tn);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = r.tn loop
      execute format('drop policy %I on public.%I', p.policyname, r.tn);
    end loop;

    select exists (
      select 1 from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = r.tn and c.column_name = 'syndicat_id'
    ) into a_sid;

    if r.tn = 'usagers' then
      execute 'create policy "lect" on public.usagers for select to authenticated using (public.mon_role() = ''admin'' or auth_id = auth.uid())';
      execute 'create policy "ecr" on public.usagers for all to authenticated using (public.mon_role() = ''admin'') with check (public.mon_role() = ''admin'')';

    elsif r.tn = 'historique' then
      execute 'create policy "lect" on public.historique for select to authenticated using (public.est_gestion())';
      execute 'create policy "ins" on public.historique for insert to authenticated with check (true)';
      execute 'create policy "adm" on public.historique for delete to authenticated using (public.mon_role() = ''admin'')';

    elsif r.tn = 'syndicats' then
      execute 'create policy "lect" on public.syndicats for select to authenticated using (public.acces_syndicat(id::text))';
      execute 'create policy "ins" on public.syndicats for insert to authenticated with check (public.est_gestion())';
      execute 'create policy "maj" on public.syndicats for update to authenticated using (public.est_gestion() and public.acces_syndicat(id::text)) with check (public.est_gestion())';
      execute 'create policy "suppr" on public.syndicats for delete to authenticated using (public.mon_role() = ''admin'')';

    elsif r.tn in ('predictek_entreprise','paies','departements','employes','emails_entrants') then
      execute format('create policy "adm" on public.%I for all to authenticated using (public.mon_role() = ''admin'') with check (public.mon_role() = ''admin'')', r.tn);

    elsif r.tn = 'approbations_ca' then
      execute 'create policy "tous_ca" on public.approbations_ca for all to authenticated using (public.mon_role() in (''admin'',''gestionnaire'',''ca'')) with check (public.mon_role() in (''admin'',''gestionnaire'',''ca''))';

    elsif r.tn = 'tickets' and a_sid then
      execute 'create policy "lect" on public.tickets for select to authenticated using (public.acces_syndicat(syndicat_id::text))';
      execute 'create policy "ins" on public.tickets for insert to authenticated with check (public.acces_syndicat(syndicat_id::text))';
      execute 'create policy "maj" on public.tickets for update to authenticated using (public.est_gestion() and public.acces_syndicat(syndicat_id::text)) with check (public.est_gestion())';
      execute 'create policy "suppr" on public.tickets for delete to authenticated using (public.est_gestion() and public.acces_syndicat(syndicat_id::text))';

    elsif r.tn = 'factures' and a_sid then
      execute 'create policy "lect" on public.factures for select to authenticated using (public.acces_syndicat(syndicat_id::text))';
      execute 'create policy "ins" on public.factures for insert to authenticated with check (public.est_gestion() and public.acces_syndicat(syndicat_id::text))';
      execute 'create policy "maj" on public.factures for update to authenticated using ((public.est_gestion() or public.mon_role() = ''ca'') and public.acces_syndicat(syndicat_id::text)) with check (public.est_gestion() or public.mon_role() = ''ca'')';
      execute 'create policy "suppr" on public.factures for delete to authenticated using (public.est_gestion() and public.acces_syndicat(syndicat_id::text))';

    elsif a_sid then
      execute format('create policy "lect" on public.%I for select to authenticated using (public.acces_syndicat(syndicat_id::text))', r.tn);
      execute format('create policy "ins" on public.%I for insert to authenticated with check (public.est_gestion() and public.acces_syndicat(syndicat_id::text))', r.tn);
      execute format('create policy "maj" on public.%I for update to authenticated using (public.est_gestion() and public.acces_syndicat(syndicat_id::text)) with check (public.est_gestion())', r.tn);
      execute format('create policy "suppr" on public.%I for delete to authenticated using (public.est_gestion() and public.acces_syndicat(syndicat_id::text))', r.tn);

    else
      execute format('create policy "gestion" on public.%I for all to authenticated using (public.est_gestion()) with check (public.est_gestion())', r.tn);
    end if;

    raise notice 'Politiques appliquees: % (syndicat_id: %)', r.tn, a_sid;
  end loop;
end $$;

-- ============ 3) Verification ============
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
