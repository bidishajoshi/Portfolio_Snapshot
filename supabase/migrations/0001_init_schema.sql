-- DR DSLR — Initial schema
-- Single-admin photography portfolio + CMS
-- Media binaries live in Cloudinary; this schema stores metadata + relationships only.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- =========================================================================
-- ENUMS
-- =========================================================================

create type publish_status as enum ('draft', 'published', 'hidden');
create type media_kind as enum ('image', 'video');
create type media_folder as enum (
  'photo', 'video', 'hero', 'profile', 'album', 'story', 'film', 'service', 'testimonial', 'other'
);
create type film_video_source as enum ('cloudinary', 'youtube', 'vimeo');
create type story_block_type as enum (
  'heading', 'paragraph', 'image', 'image_gallery', 'video', 'quote', 'spacer', 'full_width_image'
);
create type homepage_section_key as enum (
  'hero', 'selected_works', 'featured_albums', 'about', 'services',
  'featured_films', 'stories', 'latest_work', 'night_and_light',
  'testimonials', 'social', 'contact_cta'
);
create type homepage_display_mode as enum ('manual', 'automatic');

-- =========================================================================
-- UTILITY: updated_at trigger
-- =========================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================================================
-- SITE SETTINGS  (single row — global config the admin controls)
-- =========================================================================

create table site_settings (
  id boolean primary key default true constraint single_row check (id),
  brand_name text not null default 'DR DSLR',
  photographer_name text not null default 'Himal Shrestha',
  tagline text not null default 'Capturing Moments Beyond Vision',
  logo_media_id uuid,
  favicon_media_id uuid,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  whatsapp_default_message text default 'Hello Himal, I would like to inquire about photography for my event.',
  site_url text,
  ga_id text,
  default_og_media_id uuid,
  seo_title text,
  seo_description text,
  footer_text text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (true);

create trigger trg_site_settings_updated
  before update on site_settings
  for each row execute function set_updated_at();

-- =========================================================================
-- MEDIA  (single source of truth for every Cloudinary asset)
-- =========================================================================

create table media (
  id uuid primary key default gen_random_uuid(),
  kind media_kind not null default 'image',
  folder media_folder not null default 'other',

  -- human-facing
  title text not null,
  slug text not null unique,
  alt_text text,

  -- cloudinary (internal — never shown to admin as raw data in the UI)
  cloudinary_public_id text not null unique,
  cloudinary_version text,
  format text,
  bytes bigint,
  width int,
  height int,
  duration numeric, -- seconds, for video

  -- housekeeping
  tags text[] not null default '{}',
  archived boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_media_folder on media (folder);
create index idx_media_kind on media (kind);
create index idx_media_archived on media (archived);
create index idx_media_tags on media using gin (tags);
create index idx_media_title_trgm on media using gin (title gin_trgm_ops);

create trigger trg_media_updated
  before update on media
  for each row execute function set_updated_at();

alter table site_settings
  add constraint fk_site_settings_logo foreign key (logo_media_id) references media(id) on delete set null,
  add constraint fk_site_settings_favicon foreign key (favicon_media_id) references media(id) on delete set null,
  add constraint fk_site_settings_og foreign key (default_og_media_id) references media(id) on delete set null;

-- =========================================================================
-- CATEGORIES
-- =========================================================================

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_media_id uuid references media(id) on delete set null,
  display_order int not null default 0,
  published boolean not null default true,
  seo_title text,
  seo_description text,
  og_media_id uuid references media(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_categories_order on categories (display_order);
create index idx_categories_published on categories (published);

create trigger trg_categories_updated
  before update on categories
  for each row execute function set_updated_at();

-- =========================================================================
-- ALBUMS
-- =========================================================================

create table albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  location text,
  event_date date,
  category_id uuid references categories(id) on delete set null,
  cover_media_id uuid references media(id) on delete set null,
  featured boolean not null default false,
  published boolean not null default false,
  display_order int not null default 0,
  seo_title text,
  seo_description text,
  og_media_id uuid references media(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_albums_category on albums (category_id);
create index idx_albums_published on albums (published);
create index idx_albums_featured on albums (featured);
create index idx_albums_order on albums (display_order);

create trigger trg_albums_updated
  before update on albums
  for each row execute function set_updated_at();

-- =========================================================================
-- PHOTOS
-- =========================================================================

create table photos (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references media(id) on delete cascade,

  title text not null,
  slug text not null unique,
  caption text,
  description text,
  alt_text text,

  category_id uuid references categories(id) on delete set null,
  location text,
  shot_date date,

  status publish_status not null default 'draft',
  featured boolean not null default false,
  display_order int not null default 0,

  -- optional EXIF-style metadata, shown publicly only if show_metadata = true
  camera text,
  lens text,
  aperture text,
  shutter_speed text,
  iso text,
  show_metadata boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_photos_media on photos (media_id);
create index idx_photos_category on photos (category_id);
create index idx_photos_status on photos (status);
create index idx_photos_featured on photos (featured);
create index idx_photos_order on photos (display_order);
create index idx_photos_created on photos (created_at desc);

create trigger trg_photos_updated
  before update on photos
  for each row execute function set_updated_at();

-- Junction: which albums a photo belongs to (many-to-many, ordered per album)
create table album_photos (
  album_id uuid not null references albums(id) on delete cascade,
  photo_id uuid not null references photos(id) on delete cascade,
  display_order int not null default 0,
  caption_override text,
  primary key (album_id, photo_id)
);

create index idx_album_photos_album on album_photos (album_id, display_order);
create index idx_album_photos_photo on album_photos (photo_id);

-- =========================================================================
-- SERVICES
-- =========================================================================

create table services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  media_id uuid references media(id) on delete set null,
  price_label text, -- optional, freeform e.g. "Starting at NPR 45,000"
  cta_label text default 'Request a Quote',
  cta_href text default '/contact',
  published boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_order on services (display_order);
create index idx_services_published on services (published);

create trigger trg_services_updated
  before update on services
  for each row execute function set_updated_at();

-- =========================================================================
-- TESTIMONIALS
-- =========================================================================

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_media_id uuid references media(id) on delete set null,
  review text not null,
  rating smallint check (rating between 1 and 5),
  event_type text,
  event_date date,
  published boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_testimonials_order on testimonials (display_order);
create index idx_testimonials_published on testimonials (published);

create trigger trg_testimonials_updated
  before update on testimonials
  for each row execute function set_updated_at();

-- =========================================================================
-- FILMS
-- =========================================================================

create table films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  introduction text,
  cover_media_id uuid references media(id) on delete set null,

  video_source film_video_source,
  video_media_id uuid references media(id) on delete set null, -- when source = cloudinary
  video_url text, -- when source = youtube / vimeo

  category_id uuid references categories(id) on delete set null,
  location text,
  film_date date,
  tags text[] not null default '{}',

  related_album_id uuid references albums(id) on delete set null,
  related_story_id uuid, -- fk added after stories table exists

  published boolean not null default false,
  featured boolean not null default false,
  display_order int not null default 0,

  seo_title text,
  seo_description text,
  og_media_id uuid references media(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_films_published on films (published);
create index idx_films_featured on films (featured);
create index idx_films_order on films (display_order);
create index idx_films_tags on films using gin (tags);

create trigger trg_films_updated
  before update on films
  for each row execute function set_updated_at();

-- Additional videos/photos attached to a film (gallery + behind-the-scenes)
create table film_media (
  id uuid primary key default gen_random_uuid(),
  film_id uuid not null references films(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  section text not null default 'gallery' check (section in ('gallery', 'behind_the_scenes', 'additional_video')),
  caption text,
  display_order int not null default 0,
  unique (film_id, media_id, section)
);

create index idx_film_media_film on film_media (film_id, section, display_order);

-- =========================================================================
-- STORIES  (editorial journal entries, ordered content blocks)
-- =========================================================================

create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_media_id uuid references media(id) on delete set null,
  introduction text,
  location text,
  story_date date,
  tags text[] not null default '{}',

  related_album_id uuid references albums(id) on delete set null,
  related_film_id uuid references films(id) on delete set null,

  published boolean not null default false,
  display_order int not null default 0,

  seo_title text,
  seo_description text,
  og_media_id uuid references media(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_stories_published on stories (published);
create index idx_stories_order on stories (display_order);
create index idx_stories_tags on stories using gin (tags);

create trigger trg_stories_updated
  before update on stories
  for each row execute function set_updated_at();

-- Ordered content blocks that make up a story's body
create table story_blocks (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  block_type story_block_type not null,
  display_order int not null default 0,

  -- content varies by block_type; keep it simple + queryable rather than one big jsonb blob
  text_content text,          -- heading / paragraph / quote text
  heading_level smallint check (heading_level between 1 and 3), -- for 'heading' blocks
  media_id uuid references media(id) on delete set null,        -- 'image' / 'video' / 'full_width_image'
  caption text,

  created_at timestamptz not null default now()
);

create index idx_story_blocks_story on story_blocks (story_id, display_order);

-- Gallery-type blocks can reference multiple media items (image_gallery)
create table story_block_media (
  story_block_id uuid not null references story_blocks(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  display_order int not null default 0,
  caption text,
  primary key (story_block_id, media_id)
);

-- All media used anywhere in a story (flat index — powers "unlimited story media" + reuse checks)
create table story_media (
  story_id uuid not null references stories(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  display_order int not null default 0,
  caption text,
  primary key (story_id, media_id)
);

create index idx_story_media_story on story_media (story_id, display_order);

alter table films
  add constraint fk_films_related_story foreign key (related_story_id) references stories(id) on delete set null;

-- =========================================================================
-- HOMEPAGE  (CMS-controlled sections + curated/automatic galleries)
-- =========================================================================

create table homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key homepage_section_key not null unique,
  enabled boolean not null default true,
  display_order int not null default 0,
  title text,
  subtitle text,
  description text,
  display_mode homepage_display_mode not null default 'manual',
  cta_label text,
  cta_href text,
  updated_at timestamptz not null default now()
);

create index idx_homepage_sections_order on homepage_sections (display_order);

create trigger trg_homepage_sections_updated
  before update on homepage_sections
  for each row execute function set_updated_at();

-- Manually curated items within a homepage section (e.g. Selected Works photo picks)
create table homepage_gallery_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references homepage_sections(id) on delete cascade,
  -- exactly one of these should be set, matching the section's content type
  photo_id uuid references photos(id) on delete cascade,
  album_id uuid references albums(id) on delete cascade,
  film_id uuid references films(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint one_target_only check (
    (case when photo_id is not null then 1 else 0 end) +
    (case when album_id is not null then 1 else 0 end) +
    (case when film_id is not null then 1 else 0 end) +
    (case when story_id is not null then 1 else 0 end) = 1
  )
);

create index idx_homepage_gallery_section on homepage_gallery_items (section_id, display_order);

-- Hero slides (Hero is homepage_sections but has its own rich slide list)
create table hero_slides (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references media(id) on delete cascade,
  heading text,
  subtitle text,
  cta_label text,
  cta_href text,
  display_order int not null default 0,
  duration_ms int not null default 6000,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_hero_slides_order on hero_slides (display_order);
create index idx_hero_slides_published on hero_slides (published);

create trigger trg_hero_slides_updated
  before update on hero_slides
  for each row execute function set_updated_at();

-- =========================================================================
-- ABOUT PAGE (single row of CMS-controlled content + repeatable sub-items)
-- =========================================================================

create table about_content (
  id boolean primary key default true constraint single_row check (id),
  profile_media_id uuid references media(id) on delete set null,
  introduction text,
  journey text,
  updated_at timestamptz not null default now()
);

insert into about_content (id) values (true);

create trigger trg_about_content_updated
  before update on about_content
  for each row execute function set_updated_at();

create table about_experience (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text,
  description text,
  start_date date,
  end_date date,
  display_order int not null default 0
);

create table about_skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  proficiency smallint check (proficiency between 1 and 100),
  display_order int not null default 0
);

create table about_equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  media_id uuid references media(id) on delete set null,
  display_order int not null default 0
);

create table about_awards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  award_date date,
  description text,
  media_id uuid references media(id) on delete set null,
  display_order int not null default 0
);

-- =========================================================================
-- SOCIAL LINKS
-- =========================================================================

create table social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null, -- instagram, facebook, tiktok, youtube, whatsapp, messenger, viber, email, phone
  label text,
  url text not null,
  enabled boolean not null default true,
  placement text not null default 'footer' check (placement in ('header', 'footer', 'contact', 'floating')),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_social_links_order on social_links (display_order);
create index idx_social_links_enabled on social_links (enabled);

create trigger trg_social_links_updated
  before update on social_links
  for each row execute function set_updated_at();

-- =========================================================================
-- INQUIRIES (contact / request a quote)
-- =========================================================================

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  whatsapp text,
  event_type text,
  event_date date,
  location text,
  budget text,
  service_id uuid references services(id) on delete set null,
  message text not null,
  is_read boolean not null default false,
  -- lightweight anti-spam / audit trail
  honeypot_triggered boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index idx_inquiries_read on inquiries (is_read);
create index idx_inquiries_created on inquiries (created_at desc);

-- =========================================================================
-- ADMIN PROFILE  (mirrors the single Supabase Auth user; not a role system)
create table admin_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Himal Shrestha',
  created_at timestamptz not null default now()
);

