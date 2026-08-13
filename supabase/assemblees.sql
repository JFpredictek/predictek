-- Module Assemblees (AGA/AGE): assemblees, presences/procurations, votes ponderes
create table if not exists assemblees (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid not null,
  type text default 'AGA',
  date_assemblee date,
  heure text,
  lieu text,
  mode text default 'presentiel',
  lien_visio text,
  ordre_du_jour text,
  statut text default 'planifiee',
  quorum_requis int default 50,
  convocation_envoyee_le timestamptz,
  created_at timestamptz default now()
);
alter table assemblees enable row level security;
drop policy if exists asb_sel on assemblees; create policy asb_sel on assemblees for select to authenticated using (public.acces_syndicat(syndicat_id::text));
drop policy if exists asb_mod on assemblees; create policy asb_mod on assemblees for all to authenticated using (public.est_gestion()) with check (public.est_gestion());

create table if not exists assemblees_presences (
  id uuid primary key default gen_random_uuid(),
  assemblee_id uuid not null,
  syndicat_id uuid not null,
  unite_id uuid,
  coproprietaire_id uuid,
  fraction numeric default 0,
  present boolean default false,
  procuration_a text default '',
  created_at timestamptz default now(),
  unique(assemblee_id, unite_id)
);
alter table assemblees_presences enable row level security;
drop policy if exists asp_sel on assemblees_presences; create policy asp_sel on assemblees_presences for select to authenticated using (public.acces_syndicat(syndicat_id::text));
drop policy if exists asp_mod on assemblees_presences; create policy asp_mod on assemblees_presences for all to authenticated using (public.est_gestion()) with check (public.est_gestion());

create table if not exists assemblees_votes (
  id uuid primary key default gen_random_uuid(),
  assemblee_id uuid not null,
  syndicat_id uuid not null,
  resolution text,
  majorite_requise numeric default 50,
  pour numeric default 0,
  contre numeric default 0,
  abstention numeric default 0,
  adopte boolean default false,
  created_at timestamptz default now()
);
alter table assemblees_votes enable row level security;
drop policy if exists asv_sel on assemblees_votes; create policy asv_sel on assemblees_votes for select to authenticated using (public.acces_syndicat(syndicat_id::text));
drop policy if exists asv_mod on assemblees_votes; create policy asv_mod on assemblees_votes for all to authenticated using (public.est_gestion()) with check (public.est_gestion());

insert into config_publique (cle, valeur) values ('delai_convocation_jours','15') on conflict (cle) do nothing;
