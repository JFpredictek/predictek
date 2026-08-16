-- Predictek - CHARTE COMPTABLE PAR FONDS
-- Chaque compte GL porte son fonds (colonne comptes_syndicat.fonds):
--   operation | prevoyance | assurance | special | <slug d un fonds personnalise>
-- Le budget, les etats et la comptabilite par fonds s organisent sur cette etiquette.
-- Les fonds PERSONNALISES crees par un syndicat recoivent automatiquement leurs
-- comptes GL de base (contributions, transfert interfonds, depenses) via l application.
-- DEJA EXECUTE le 2026-08-16 - conserve pour reference (idempotent).

update public.comptes_syndicat set fonds='prevoyance'
 where type_compte='prevoyance' or no_compte like '7%'
    or no_compte in ('4120','4520','5901','1112','1530','3200');
update public.comptes_syndicat set fonds='assurance'
 where no_compte in ('4160','4550','5902','1114','1550','3110','3500','5290','4660');
update public.comptes_syndicat set fonds='special'
 where no_compte in ('5903','1115','3400');
update public.comptes_syndicat set fonds='operation'
 where fonds is null or fonds='';
notify pgrst, 'reload schema';

select fonds, count(*) from comptes_syndicat group by fonds order by fonds;
