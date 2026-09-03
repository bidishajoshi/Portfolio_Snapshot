-- Reconcile content tables used by the admin editors.
-- Run in Supabase SQL Editor after 0005.

alter table services add column if not exists media_id uuid;
alter table services add column if not exists price_label text;
alter table services add column if not exists cta_label text default 'Request a Quote';
alter table services add column if not exists cta_href text default '/contact';
alter table services add column if not exists published boolean not null default true;
alter table services add column if not exists display_order integer not null default 0;

alter table stories add column if not exists cover_media_id uuid;
alter table stories add column if not exists published boolean not null default false;
alter table stories add column if not exists display_order integer not null default 0;
alter table stories add column if not exists seo_title text;
alter table stories add column if not exists seo_description text;
alter table stories add column if not exists og_media_id uuid;

alter table testimonials add column if not exists client_media_id uuid;
alter table testimonials add column if not exists published boolean not null default true;
alter table testimonials add column if not exists display_order integer not null default 0;

create table if not exists films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  introduction text,
  cover_media_id uuid,
  video_source text,
  video_media_id uuid,
  video_url text,
  location text,
  film_date date,
  tags text[] not null default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists film_media (
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references films(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  section text not null default 'gallery',
  caption text,
  display_order integer not null default 0,
  unique (film_id, media_id, section)
);

create index if not exists idx_film_media_film on film_media (film_id, section, display_order);
