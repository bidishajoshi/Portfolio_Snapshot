-- DR DSLR website CMS completeness migration.
-- Additive only: preserves existing tables and rows.
-- Run this once in Supabase SQL Editor after migration 0010.

-- Shared SEO/content fields used by public sections.
alter table site_settings add column if not exists og_title text;
alter table site_settings add column if not exists og_description text;
alter table site_settings add column if not exists canonical_url text;

alter table categories add column if not exists featured boolean not null default false;
alter table albums add column if not exists featured boolean not null default false;
alter table photos add column if not exists featured boolean not null default false;
alter table services add column if not exists featured boolean not null default false;
alter table stories add column if not exists featured boolean not null default false;
alter table testimonials add column if not exists featured boolean not null default false;

-- Hero media and editable slide content.
alter table hero_slides add column if not exists description text;
alter table hero_slides add column if not exists enabled boolean not null default true;
alter table hero_slides add column if not exists media_type text not null default 'image';

-- About statistics are stored as repeatable editable rows.
create table if not exists about_stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  suffix text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Contact and inquiry workflow.
alter table inquiries add column if not exists subject text;
alter table inquiries add column if not exists status text not null default 'new';
alter table inquiries add column if not exists replied_at timestamptz;
alter table inquiries add column if not exists completed_at timestamptz;
alter table inquiries add column if not exists location text;
alter table inquiries add column if not exists service_id uuid;

-- Social links remain limited to the platforms already supported by the site.
alter table social_links add column if not exists enabled boolean not null default true;
alter table social_links add column if not exists placement text not null default 'footer';
alter table social_links add column if not exists display_order integer not null default 0;

-- Rich story content and direct reusable media are already modeled by story_blocks/story_media.
-- Add a stable content subtitle and featured flag without replacing existing story rows.
alter table stories add column if not exists subtitle text;

-- Keep media relationships reusable and searchable.
-- Some live databases are partially migrated and may be missing the columns that the CMS depends on.
alter table categories add column if not exists display_order integer not null default 0;
alter table categories add column if not exists published boolean not null default true;
alter table albums add column if not exists display_order integer not null default 0;
alter table albums add column if not exists published boolean not null default false;
alter table photos add column if not exists status text not null default 'draft';
alter table photos add column if not exists display_order integer not null default 0;
alter table services add column if not exists display_order integer not null default 0;
alter table services add column if not exists published boolean not null default true;
alter table stories add column if not exists display_order integer not null default 0;
alter table stories add column if not exists published boolean not null default false;
alter table testimonials add column if not exists display_order integer not null default 0;
alter table testimonials add column if not exists published boolean not null default true;
alter table hero_slides add column if not exists display_order integer not null default 0;
alter table hero_slides add column if not exists enabled boolean not null default true;
alter table about_stats add column if not exists display_order integer not null default 0;

create index if not exists idx_media_folder_kind on media (folder, kind);
create index if not exists idx_photos_published_order on photos (status, display_order);
create index if not exists idx_albums_published_order on albums (published, display_order);
create index if not exists idx_stories_published_order on stories (published, display_order);
create index if not exists idx_services_published_order on services (published, display_order);
create index if not exists idx_testimonials_published_order on testimonials (published, display_order);
create index if not exists idx_hero_slides_enabled_order on hero_slides (enabled, display_order);
create index if not exists idx_about_stats_order on about_stats (display_order);

-- Add missing foreign keys only when the columns/tables are available and the constraint is absent.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_about_stats') THEN
    -- about_stats has no parent row; this branch intentionally does nothing.
    NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_hero_slides_media') THEN
    ALTER TABLE hero_slides ADD CONSTRAINT fk_hero_slides_media FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS for the new statistics table follows the existing About policy pattern.
alter table about_stats enable row level security;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public read about_stats') THEN
    CREATE POLICY "public read about_stats" ON about_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin all about_stats') THEN
    CREATE POLICY "admin all about_stats" ON about_stats FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;

-- Prevent invalid inquiry workflow values.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_status_check') THEN
    ALTER TABLE inquiries ADD CONSTRAINT inquiries_status_check CHECK (status IN ('new', 'read', 'replied', 'completed'));
  END IF;
END $$;
