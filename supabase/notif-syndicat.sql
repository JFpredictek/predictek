-- Predictek - Centre de notifications GERE PAR SYNDICAT
-- Chaque syndicat peut activer/desactiver ses relances automatiques.
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run

alter table public.syndicats add column if not exists relances_actives boolean default true;

notify pgrst, 'reload schema';

-- Verification
select column_name from information_schema.columns
where table_name = 'syndicats' and column_name = 'relances_actives';
