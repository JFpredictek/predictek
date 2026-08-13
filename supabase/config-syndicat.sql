-- Configuration du syndicat: avis d assurance + approbation des factures PAR PALIERS
alter table public.syndicats add column if not exists ass_avis_avant1 int default 90;
alter table public.syndicats add column if not exists ass_avis_avant2 int default 30;
alter table public.syndicats add column if not exists ass_avis_apres int default 15;
alter table public.syndicats add column if not exists ass_nc_auto boolean default false;
alter table public.syndicats add column if not exists ass_nc_delai int default 30;
alter table public.syndicats add column if not exists approb_seuil numeric default 0;
alter table public.syndicats add column if not exists approb_requises int default 1;
alter table public.syndicats add column if not exists approb_paliers text default '[{"max":1000,"nb":1},{"max":5000,"nb":2},{"max":10000,"nb":3}]';
alter table public.syndicats add column if not exists approb_nb_max int default 3;
notify pgrst, 'reload schema';
select column_name from information_schema.columns where table_name='syndicats' and (column_name like 'ass_avis%' or column_name like 'approb%' or column_name='ass_nc_auto' or column_name='ass_nc_delai') order by 1;
