begin;
create function public.vsv_presence_allowed(p_topic text)returns boolean language sql stable security definer set search_path='' as $$
select public.vsv_active() and array_length(string_to_array(p_topic,':'),1)=4 and split_part(p_topic,':',1)='vsv' and split_part(p_topic,':',2)='doc' and exists(select 1 from public.vsv_documents where kind=split_part(p_topic,':',3) and id=split_part(p_topic,':',4) and not deleted and public.vsv_visible_document(kind,id,payload,auth.uid()))
$$;
revoke all on function public.vsv_presence_allowed(text) from public,anon;
grant execute on function public.vsv_presence_allowed(text) to authenticated,service_role;
do $presence$begin
if to_regclass('realtime.messages')is not null then
execute 'grant select,insert on realtime.messages to authenticated';
execute 'create policy vsv_presence_read on realtime.messages for select to authenticated using(public.vsv_presence_allowed((select realtime.topic())))';
execute 'create policy vsv_presence_track on realtime.messages for insert to authenticated with check(public.vsv_presence_allowed((select realtime.topic())))';
execute 'create policy vsv_presence_read_guard on realtime.messages as restrictive for select to authenticated using((select realtime.topic()) not like ''vsv:doc:%'' or public.vsv_presence_allowed((select realtime.topic())))';
execute 'create policy vsv_presence_track_guard on realtime.messages as restrictive for insert to authenticated with check((select realtime.topic()) not like ''vsv:doc:%'' or public.vsv_presence_allowed((select realtime.topic())))';
end if;end $presence$;
commit;
