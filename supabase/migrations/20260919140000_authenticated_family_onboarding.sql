-- Authenticated family onboarding, memberships, invites and cloud state.
create schema if not exists private;

create table if not exists public.app_families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_family_members (
  family_id uuid not null references public.app_families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Membro della famiglia',
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.app_family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.app_families(id) on delete cascade,
  token text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.app_family_state (
  family_id uuid primary key references public.app_families(id) on delete cascade,
  state_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  app_version text not null default '2.4.0'
);

create index if not exists app_family_members_user_id_idx on public.app_family_members(user_id);
create index if not exists app_family_invites_token_idx on public.app_family_invites(token);

alter table public.app_families enable row level security;
alter table public.app_family_members enable row level security;
alter table public.app_family_invites enable row level security;
alter table public.app_family_state enable row level security;

create or replace function private.user_app_family_ids()
returns setof uuid language sql security definer stable set search_path = ''
as $$
  select family_id from public.app_family_members where user_id = (select auth.uid())
$$;

revoke all on function private.user_app_family_ids() from public;
grant usage on schema private to authenticated;

drop policy if exists "app families members can read" on public.app_families;
create policy "app families members can read" on public.app_families
for select to authenticated using (id in (select private.user_app_family_ids()));

drop policy if exists "app family members can read their family membership" on public.app_family_members;
create policy "app family members can read their family membership" on public.app_family_members
for select to authenticated using (family_id in (select private.user_app_family_ids()));

drop policy if exists "app family state members can read" on public.app_family_state;
create policy "app family state members can read" on public.app_family_state
for select to authenticated using (family_id in (select private.user_app_family_ids()));

drop policy if exists "app family state members can insert" on public.app_family_state;
create policy "app family state members can insert" on public.app_family_state
for insert to authenticated with check (family_id in (select private.user_app_family_ids()));

drop policy if exists "app family state members can update" on public.app_family_state;
create policy "app family state members can update" on public.app_family_state
for update to authenticated
using (family_id in (select private.user_app_family_ids()))
with check (family_id in (select private.user_app_family_ids()));

revoke all on public.app_families, public.app_family_members, public.app_family_invites, public.app_family_state from anon, authenticated;
grant select on public.app_families, public.app_family_members to authenticated;
grant select, insert, update on public.app_family_state to authenticated;

create or replace function public.create_app_family(p_name text, p_display_name text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_family uuid;
begin
  if v_user is null then raise exception 'Devi devi essere autenticato'; end if;
  if char_length(trim(coalesce(p_name,''))) < 2 or char_length(trim(p_name)) > 80 then raise exception 'Nome nucleo non valido'; end if;
  insert into public.app_families(name, owner_id) values (trim(p_name), v_user) returning id into v_family;
  insert into public.app_family_members(family_id,user_id,display_name,role)
    values (v_family,v_user,coalesce(nullif(trim(p_display_name),''),'Membro della famiglia'),'owner');
  insert into public.family_profiles(id,display_name,role)
    values (v_user,coalesce(nullif(trim(p_display_name),''),'Membro della famiglia'),'owner')
    on conflict (id) do update set display_name=excluded.display_name, role='owner';
  return v_family;
end;
$$;

create or replace function public.create_app_invite(p_family_id uuid, p_expires_hours integer default 168)
returns text language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_token text;
begin
  if v_user is null then raise exception 'Devi devi essere autenticato'; end if;
  if not exists (select 1 from public.app_family_members where family_id=p_family_id and user_id=v_user and role='owner')
    then raise exception 'Solo il proprietario può creare inviti'; end if;
  if p_expires_hours < 1 or p_expires_hours > 720 then raise exception 'Durata invito non valida'; end if;
  v_token := encode(gen_random_bytes(24),'hex');
  insert into public.app_family_invites(family_id,token,created_by,expires_at)
    values (p_family_id,v_token,v_user,now()+make_interval(hours=>p_expires_hours));
  return v_token;
end;
$$;

create or replace function public.accept_app_invite(p_token text, p_display_name text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_invite public.app_family_invites%rowtype;
begin
  if v_user is null then raise exception 'Devi devi essere autenticato'; end if;
  select * into v_invite from public.app_family_invites
    where token=trim(coalesce(p_token,'')) and expires_at>now()
    order by created_at desc limit 1;
  if not found then raise exception 'Link di invito non valido o scaduto'; end if;
  insert into public.app_family_members(family_id,user_id,display_name,role)
    values (v_invite.family_id,v_user,coalesce(nullif(trim(p_display_name),''),'Membro della famiglia'),'member')
    on conflict (family_id,user_id) do update set display_name=excluded.display_name;
  insert into public.family_profiles(id,display_name,role)
    values (v_user,coalesce(nullif(trim(p_display_name),''),'Membro della famiglia'),'member')
    on conflict (id) do update set display_name=excluded.display_name;
  return v_invite.family_id;
end;
$$;

create or replace function public.get_my_app_family()
returns table(family_id uuid, family_name text, member_role text, display_name text)
language sql security definer stable set search_path = ''
as $$
  select m.family_id,f.name,m.role,m.display_name
  from public.app_family_members m join public.app_families f on f.id=m.family_id
  where m.user_id=(select auth.uid()) order by m.joined_at limit 1
$$;

revoke all on function public.create_app_family(text,text), public.create_app_invite(uuid,integer),
  public.accept_app_invite(text,text), public.get_my_app_family() from public;
grant execute on function public.create_app_family(text,text), public.create_app_invite(uuid,integer),
  public.accept_app_invite(text,text), public.get_my_app_family() to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='app_family_state'
  ) then
    alter publication supabase_realtime add table public.app_family_state;
  end if;
end $$;
