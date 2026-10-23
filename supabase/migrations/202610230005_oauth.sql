begin;
create table public.vsv_connector_tokens(id text primary key check(id='google'),cipher text not null,sender text not null,connected_by uuid not null references auth.users(id),connected_at timestamptz not null default now());
create table public.vsv_oauth_states(id uuid primary key,actor uuid not null references auth.users(id),cipher text not null,expires_at timestamptz not null,used_at timestamptz);
alter table public.vsv_connector_tokens enable row level security;
alter table public.vsv_oauth_states enable row level security;
revoke all on public.vsv_connector_tokens,public.vsv_oauth_states from public,anon,authenticated;
grant all on public.vsv_connector_tokens,public.vsv_oauth_states to service_role;
create function public.vsv_consume_oauth(p_id uuid)returns jsonb language plpgsql security definer set search_path='' as $$declare result jsonb;begin
 update public.vsv_oauth_states set used_at=now()where id=p_id and used_at is null and expires_at>now()returning to_jsonb(vsv_oauth_states.*)into result;
 return result;end$$;
revoke all on function public.vsv_consume_oauth(uuid) from public,anon,authenticated;
grant execute on function public.vsv_consume_oauth(uuid) to service_role;
commit;
