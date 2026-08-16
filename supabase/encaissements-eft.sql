-- ============================================================
-- ENCAISSEMENTS v2 : regroupements, avances, fichiers EFT (Desjardins CPA-005)
-- + paiements fournisseurs par EFT + frais NSF par syndicat
-- ============================================================

-- Factures aux copros : envoi + encaissement avec compte de banque
alter table public.factures_copros add column if not exists date_envoi timestamptz;
alter table public.factures_copros add column if not exists compte_bancaire_id uuid;

-- Paiements : compte de banque recu + no de lot d encaissement
alter table public.paiements add column if not exists compte_bancaire_id uuid;
alter table public.paiements add column if not exists lot text default '';

-- Avances (contributions percues d avance - GL 2400/2410)
create table if not exists public.avances_copros (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  unite_id uuid,
  coproprietaire_id uuid,
  montant numeric default 0,
  solde numeric default 0,
  date_encaissement date,
  compte_bancaire_id uuid,
  note text default '',
  applications jsonb default '[]'::jsonb,
  statut text default 'actif',
  created_at timestamptz default now()
);
alter table public.avances_copros enable row level security;
drop policy if exists av_all on public.avances_copros;
create policy av_all on public.avances_copros for all to authenticated using (true) with check (true);

-- Registre des fichiers EFT (debits copros D / credits fournisseurs C)
create table if not exists public.fichiers_eft (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  type_dc text default 'D',
  no_fichier text default '',
  date_fichier date,
  nom_fichier text default '',
  nb_transferts int default 0,
  montant_total numeric default 0,
  contenu text default '',
  confirme_trx timestamptz,
  confirme_acceptation timestamptz,
  confirme_completion timestamptz,
  statut text default 'genere',
  created_at timestamptz default now()
);
alter table public.fichiers_eft enable row level security;
drop policy if exists eft_all on public.fichiers_eft;
create policy eft_all on public.fichiers_eft for all to authenticated using (true) with check (true);

-- Configuration PAP (prelevements copros) PAR SYNDICAT
alter table public.syndicats add column if not exists pap_methode text default 'desjardins';
alter table public.syndicats add column if not exists pap_orig_id text default '';
alter table public.syndicats add column if not exists pap_nom_long text default '';
alter table public.syndicats add column if not exists pap_nom_court text default '';
alter table public.syndicats add column if not exists pap_no_fichier text default '1';
alter table public.syndicats add column if not exists pap_centre text default '81510';
alter table public.syndicats add column if not exists pap_compte_id uuid;

-- Configuration paiements automatises AUX FOURNISSEURS (credits) PAR SYNDICAT
alter table public.syndicats add column if not exists pap_f_methode text default 'desjardins';
alter table public.syndicats add column if not exists pap_f_orig_id text default '';
alter table public.syndicats add column if not exists pap_f_nom_long text default '';
alter table public.syndicats add column if not exists pap_f_nom_court text default '';
alter table public.syndicats add column if not exists pap_f_no_fichier text default '1';
alter table public.syndicats add column if not exists pap_f_compte_id uuid;

-- Frais pour fonds insuffisants (NSF) PAR SYNDICAT
alter table public.syndicats add column if not exists frais_nsf numeric default 0;

-- Coordonnees bancaires des fournisseurs (pour paiements EFT)
alter table public.fournisseurs add column if not exists banque_institution text default '';
alter table public.fournisseurs add column if not exists banque_transit text default '';
alter table public.fournisseurs add column if not exists banque_compte text default '';

notify pgrst, 'reload schema';

-- Logo par syndicat (data URL) - utilise sur les avis, attestations et rapports;
-- si vide, le logo Predictek est utilise
alter table public.syndicats add column if not exists logo_data text default '';
notify pgrst, 'reload schema';
