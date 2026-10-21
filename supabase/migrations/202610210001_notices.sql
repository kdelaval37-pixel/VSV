-- Migration additive : mêmes tables, versions, RLS, droits et transactions.
-- Aucun document existant modifié ; aucun mouvement ni envoi déclenché.
begin;
alter table public.vsv_documents drop constraint vsv_documents_kind_check;
alter table public.vsv_documents add constraint vsv_documents_kind_check
 check (kind in ('projects','meetings','pvs','reviews','convocations','invitations'));
comment on table public.vsv_documents is 'Documents partagés versionnés ; inclut convocations et invitations. Écriture via vsv-api exclusivement.';
commit;
