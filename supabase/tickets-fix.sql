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
