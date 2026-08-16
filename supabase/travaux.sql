-- Predictek - Demande d autorisation de travaux (formulaire officiel du portail)
-- La demande devient un ticket (categorie 'travaux') avec les donnees structurees du formulaire.
-- DEJA EXECUTE le 2026-08-16 via le SQL Editor - conserve ici pour reference.

alter table public.tickets add column if not exists categorie text default '';
alter table public.tickets add column if not exists donnees jsonb;

notify pgrst, 'reload schema';

-- Verification
select column_name from information_schema.columns
where table_name = 'tickets' and column_name in ('categorie','donnees');
