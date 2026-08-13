-- Renommage: Apports aux fonds -> Transferts interfonds (comptes deja semes en base)
update public.comptes_syndicat set groupe='Transferts interfonds' where groupe='Apports aux fonds';
update public.comptes_syndicat set nom_compte='Transfert interfonds - FONDS DE PREVOYANCE' where no_compte='5901' and nom_compte like 'Apport%';
update public.comptes_syndicat set nom_compte='Transfert interfonds - FONDS D AUTO-ASSURANCE' where no_compte='5902' and nom_compte like 'Apport%';
update public.comptes_syndicat set nom_compte='Transfert interfonds - fonds de travaux speciaux' where no_compte='5903' and nom_compte like 'Apport%';
select count(*) as comptes_renommes from public.comptes_syndicat where groupe='Transferts interfonds';
