-- Predictek - Requetes des coproprietaires (reponse du syndicat)
-- A executer dans Supabase : SQL Editor > New query > coller TOUT > Run
alter table public.tickets add column if not exists reponse text default '';
alter table public.tickets add column if not exists date_reponse timestamptz;
alter table public.tickets add column if not exists date_resolution timestamptz;
select column_name from information_schema.columns
where table_name='tickets' and column_name in ('reponse','date_reponse','date_resolution');

-- Agenda: titre des evenements (reunions)
alter table public.reunions add column if not exists titre text default '';
