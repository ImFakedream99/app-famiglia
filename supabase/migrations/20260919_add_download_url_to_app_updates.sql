alter table public.app_updates
  add column if not exists download_url text;
