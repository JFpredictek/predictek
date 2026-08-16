-- Predictek - Etudes reglementaires PAR SYNDICAT + document de location sur l unite
-- DEJA EXECUTE le 2026-08-16 via le SQL Editor - conserve ici pour reference.

-- Intervalles des etudes (assurance, prevoyance) propres a chaque syndicat
-- (Configuration du syndicat). La date de la derniere etude/validation existait deja
-- (etude_assurance_date, etude_prevoyance_date) et est maintenant editable au meme endroit.
alter table public.syndicats add column if not exists etude_assurance_ans int;
alter table public.syndicats add column if not exists etude_prevoyance_ans int;

-- Piece jointe de location sur l unite: bail (location long terme)
-- ou formulaire d autorisation (location court terme)
alter table public.unites add column if not exists location_doc text;

notify pgrst, 'reload schema';

-- Verification
select column_name from information_schema.columns
where (table_name='syndicats' and column_name like 'etude%ans')
   or (table_name='unites' and column_name='location_doc');
