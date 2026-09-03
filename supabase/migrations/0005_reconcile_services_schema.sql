-- Add the CMS fields required to edit and attach media to services.
-- Run this in Supabase SQL Editor after 0004.

alter table services add column if not exists media_id uuid;
alter table services add column if not exists price_label text;
alter table services add column if not exists cta_label text default 'Request a Quote';
alter table services add column if not exists cta_href text default '/contact';
alter table services add column if not exists published boolean not null default true;
alter table services add column if not exists display_order integer not null default 0;