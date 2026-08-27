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

-- Lignes visees par un fichier EFT (pour encaisser exactement ces lignes a la completion)
alter table public.fichiers_eft add column if not exists refs jsonb default '[]'::jsonb;
notify pgrst, 'reload schema';

-- ============================================================
-- Vague 2: soldes d ouverture, bons de travaux (PO + envoi), chauffe-eau
-- ============================================================

-- SOLDES D OUVERTURE de tous les comptes GL (recevoir PAR UNITE, payer PAR FOURNISSEUR)
create table if not exists public.soldes_ouverture (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  no_compte text default '',
  nom_compte text default '',
  sens text default 'debit',
  montant numeric default 0,
  unite_id uuid,
  unite text default '',
  fournisseur text default '',
  date_solde date,
  note text default '',
  statut text default 'actif',
  created_at timestamptz default now()
);
alter table public.soldes_ouverture enable row level security;
drop policy if exists so_all on public.soldes_ouverture;
create policy so_all on public.soldes_ouverture for all to authenticated using (true) with check (true);

-- Bons de travaux: trace d envoi au fournisseur (comme les invitations)
alter table public.bons_travail add column if not exists envoye_le timestamptz;
alter table public.bons_travail add column if not exists envoye_a text default '';

-- Duree de vie des chauffe-eaux PAR SYNDICAT (avis avec les memes delais que l assurance)
alter table public.syndicats add column if not exists ce_duree_vie_ans int default 12;

notify pgrst, 'reload schema';

-- Photos / pieces jointes des bons de travaux
alter table public.bons_travail add column if not exists photos jsonb default '[]'::jsonb;
notify pgrst, 'reload schema';

-- Reparation table bons_travail (colonnes manquantes du formulaire - cause de
-- "Could not find the 'cout_estime' column") - EXECUTE le 2026-08-17
alter table public.bons_travail add column if not exists cout_estime numeric;
alter table public.bons_travail add column if not exists cout_final numeric;
alter table public.bons_travail add column if not exists date_debut date;
alter table public.bons_travail add column if not exists date_fin date;
alter table public.bons_travail add column if not exists no_bon text default '';
alter table public.bons_travail add column if not exists notes text default '';
alter table public.bons_travail add column if not exists priorite text default 'normale';
alter table public.bons_travail add column if not exists statut text default 'nouveau';
alter table public.bons_travail add column if not exists fournisseur_nom text default '';
alter table public.bons_travail add column if not exists unite text default '';
alter table public.bons_travail add column if not exists description text default '';
notify pgrst, 'reload schema';

-- ============================================================
-- CONCILIATION BANCAIRE (releve televerse + rapprochement automatique
-- par compte de banque, par mois)
-- ============================================================
create table if not exists public.conciliations (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  compte_bancaire_id uuid,
  mois text default '',
  fichier text default '',
  solde_debut numeric default 0,
  solde_fin numeric default 0,
  nb_transactions int default 0,
  nb_apparies int default 0,
  nb_ecarts int default 0,
  transactions jsonb default '[]'::jsonb,
  resultat jsonb default '{}'::jsonb,
  statut text default 'ecarts',
  date_conciliation timestamptz,
  created_at timestamptz default now()
);
alter table public.conciliations enable row level security;
drop policy if exists conc_all on public.conciliations;
create policy conc_all on public.conciliations for all to authenticated using (true) with check (true);
notify pgrst, 'reload schema';

-- ============================================================
-- COMPTES DE BANQUE MULTIPLES (ex: comptes a interet eleve)
-- + soldes d ouverture geres dans le module Soldes d ouverture
-- ============================================================
alter table public.comptes_bancaires add column if not exists nom text default '';
alter table public.comptes_bancaires add column if not exists actif boolean default true;
-- Retire la contrainte "un seul compte par fonds"
do $$ declare r record; begin
  for r in select conname from pg_constraint where conrelid='public.comptes_bancaires'::regclass and contype='u' loop
    execute 'alter table public.comptes_bancaires drop constraint '||quote_ident(r.conname);
  end loop;
end $$;
notify pgrst, 'reload schema';

-- ============================================================
-- Vague: suppression de documents, releve mensuel, compte par defaut
-- ============================================================
-- Suppression logique des documents (polices d assurance retirees, etc.)
alter table public.documents add column if not exists statut text default 'actif';
-- Jour d envoi automatique du releve de compte mensuel des copros (0 = desactive, 1-28)
alter table public.syndicats add column if not exists releve_jour int default 0;
-- Compte de banque PAR DEFAUT (Encaisse)
alter table public.comptes_bancaires add column if not exists par_defaut boolean default false;
notify pgrst, 'reload schema';

-- ============================================================
-- GESTION DOCUMENTAIRE PAR ACCES: arborescence de dossiers (comme
-- l explorateur Windows) + niveau d acces PAR DOSSIER + types de
-- documents geres dans la Configuration
-- ============================================================
create table if not exists public.dossiers_documents (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  parent_id uuid,
  nom text default '',
  acces_ca boolean default true,
  acces_copro text default 'non',
  ordre int default 0,
  statut text default 'actif',
  created_at timestamptz default now()
);
alter table public.dossiers_documents enable row level security;
drop policy if exists dd_all on public.dossiers_documents;
create policy dd_all on public.dossiers_documents for all to authenticated using (true) with check (true);

create table if not exists public.types_documents (
  id uuid primary key default gen_random_uuid(),
  syndicat_id uuid,
  nom text default '',
  statut text default 'actif',
  created_at timestamptz default now()
);
alter table public.types_documents enable row level security;
drop policy if exists td_all on public.types_documents;
create policy td_all on public.types_documents for all to authenticated using (true) with check (true);

-- Chaque document peut etre classe dans un dossier et rattache a un type
alter table public.documents add column if not exists dossier_id uuid;
alter table public.documents add column if not exists type_id uuid;
notify pgrst, 'reload schema';

-- Ordre d affichage des comptes de banque (reordonnancement par glisser-deposer)
alter table public.comptes_bancaires add column if not exists ordre int default 0;
notify pgrst, 'reload schema';

-- Bibliotheque documentaire INTERNE Predictek, separee des bibliotheques des syndicats
alter table public.dossiers_documents add column if not exists espace text default 'syndicat';
notify pgrst, 'reload schema';
