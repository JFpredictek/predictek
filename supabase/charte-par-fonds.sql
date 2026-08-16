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

-- Contributions speciales disponibles dans CHAQUE fonds (4130 operation, 4135 prevoyance,
-- 4140 auto-assurance, 4145 travaux speciaux; les fonds personnalises recoivent le leur a la creation)
insert into public.comptes_syndicat (syndicat_id, no_compte, nom_compte, type_compte, groupe, actif, fonds)
select s.id, v.no, v.nom, 'revenu', 'Revenus - Contributions', true, v.fonds
from public.syndicats s
cross join (values
  ('4135','Contributions speciales - fonds de prevoyance','prevoyance'),
  ('4140','Contributions speciales - fonds d auto-assurance','assurance'),
  ('4145','Contributions speciales - fonds de travaux speciaux','special')
) as v(no,nom,fonds)
where not exists (select 1 from public.comptes_syndicat c where c.syndicat_id = s.id and c.no_compte = v.no);

-- Approbation du budget par TOUS les membres du CA (liste des approbations)
alter table public.budgets add column if not exists approbations jsonb;
notify pgrst, 'reload schema';
