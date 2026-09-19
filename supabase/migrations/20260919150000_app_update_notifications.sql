create table if not exists public.app_updates (
  id text primary key,
  version text not null,
  commit_sha text not null,
  commit_message text not null default '',
  commit_url text not null,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint app_updates_current_id check (id = 'current')
);

alter table public.app_updates enable row level security;

drop policy if exists "Public can read current app update" on public.app_updates;
create policy "Public can read current app update"
on public.app_updates
for select
to anon, authenticated
using (id = 'current');

grant select on public.app_updates to anon, authenticated;

create or replace function public.publish_app_update(
  p_token text,
  p_version text,
  p_commit_sha text,
  p_commit_message text,
  p_commit_url text
)
returns public.app_updates
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token constant text := 'u1mDvx2xSa5xCYx-WfOMCXLFIMRJz6AdWN5YQTY-2j4';
  v_row public.app_updates;
begin
  if p_token is null or p_token <> v_token then
    raise exception 'invalid update publisher token';
  end if;

  if p_version is null or p_commit_sha is null or p_commit_url is null then
    raise exception 'invalid update payload';
  end if;

  insert into public.app_updates (
    id, version, commit_sha, commit_message, commit_url, updated_at
  ) values (
    'current',
    left(p_version, 32),
    left(p_commit_sha, 64),
    left(coalesce(p_commit_message, ''), 500),
    left(p_commit_url, 500),
    timezone('utc', now())
  )
  on conflict (id) do update set
    version = excluded.version,
    commit_sha = excluded.commit_sha,
    commit_message = excluded.commit_message,
    commit_url = excluded.commit_url,
    updated_at = excluded.updated_at
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.publish_app_update(text, text, text, text, text) from public;
grant execute on function public.publish_app_update(text, text, text, text, text) to anon, authenticated;
