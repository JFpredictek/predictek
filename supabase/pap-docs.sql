-- Documents PAP de l unite: specimen de cheque + formulaire d adhesion DPA signe
alter table public.unites add column if not exists cheque_doc text default '';
alter table public.unites add column if not exists dpa_doc text default '';
