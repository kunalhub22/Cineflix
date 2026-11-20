-- CineFlix database setup. Run in Supabase SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  release_year integer,
  genre text,
  poster_url text,
  video_url text not null,
  mime_type text default 'video/mp4',
  is_premium boolean not null default false,
  published boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.billing_events (
  stripe_event_id text primary key,
  event_type text not null,
  stripe_customer_id text,
  subscription_status text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.billing_events enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

drop policy if exists "Profiles readable by owner" on public.profiles;
create policy "Profiles readable by owner" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile" on public.profiles for insert to authenticated with check (id = auth.uid() and role = 'user');
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published movies are public" on public.movies;
create policy "Published movies are public" on public.movies for select using (published = true or public.is_admin());
drop policy if exists "Admins insert movies" on public.movies;
create policy "Admins insert movies" on public.movies for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins update movies" on public.movies;
create policy "Admins update movies" on public.movies for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins delete movies" on public.movies;
create policy "Admins delete movies" on public.movies for delete to authenticated using (public.is_admin());

-- Create buckets named "media" (private recommended for premium content) and "posters".
-- For this starter, posters are public. Video URLs are public only if the media bucket is public.
-- Do not use public buckets for paid/private videos in production; use signed URLs after entitlement checks.

-- Automatically create a basic profile for new signups.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id,email,role) values(new.id,new.email,'user')
  on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- After creating your own account, promote it from the SQL Editor:
-- update public.profiles set role='admin' where email='YOUR_EMAIL_ADDRESS';


-- Starter upload policies. Create the two buckets in Storage first.
drop policy if exists "Admins upload CineFlix media" on storage.objects;
create policy "Admins upload CineFlix media" on storage.objects
for insert to authenticated with check (
  bucket_id in ('media','posters') and public.is_admin()
);
drop policy if exists "Admins update CineFlix media" on storage.objects;
create policy "Admins update CineFlix media" on storage.objects
for update to authenticated using (
  bucket_id in ('media','posters') and public.is_admin()
) with check (
  bucket_id in ('media','posters') and public.is_admin()
);
drop policy if exists "Admins delete CineFlix media" on storage.objects;
create policy "Admins delete CineFlix media" on storage.objects
for delete to authenticated using (
  bucket_id in ('media','posters') and public.is_admin()
);
