-- DR DSLR live-schema repair
-- Final clean, idempotent SQL for drifted databases.
-- Safe to run in the Supabase SQL Editor.

-- 0) Legacy settings table cleanup
-- Some drifted databases store site settings as a generic key/value table,
-- which conflicts with the app's required single-row boolean pivot table.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_settings'
      AND column_name = 'key'
  ) THEN
    IF to_regclass('public.site_settings_legacy') IS NOT NULL THEN
      DROP TABLE public.site_settings_legacy CASCADE;
    END IF;

    ALTER TABLE public.site_settings RENAME TO site_settings_legacy;
  END IF;
END $$;

-- 1) Fix the single-row settings table used by the app.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_settings'
      AND column_name = 'id'
      AND data_type <> 'boolean'
  ) THEN
    DELETE FROM public.site_settings
    WHERE ctid NOT IN (
      SELECT min(ctid)
      FROM public.site_settings
    );

    ALTER TABLE public.site_settings
      ALTER COLUMN id DROP DEFAULT;

    ALTER TABLE public.site_settings
      ALTER COLUMN id TYPE boolean
      USING (
        CASE
          WHEN lower(id::text) IN ('true', 't', '1', 'yes', 'y') THEN true
          WHEN lower(id::text) IN ('false', 'f', '0', 'no', 'n') THEN false
          ELSE true
        END
      );

    ALTER TABLE public.site_settings
      ALTER COLUMN id SET DEFAULT true;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CONSTRAINT single_row CHECK (id),
  brand_name text NOT NULL DEFAULT 'DR DSLR',
  photographer_name text NOT NULL DEFAULT 'Himal Shrestha',
  tagline text NOT NULL DEFAULT 'Capturing Moments Beyond Vision',
  logo_media_id uuid,
  favicon_media_id uuid,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  whatsapp_default_message text DEFAULT 'Hello Himal, I would like to inquire about photography for my event.',
  site_url text,
  ga_id text,
  default_og_media_id uuid,
  seo_title text,
  seo_description text,
  footer_text text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  og_title text,
  og_description text,
  canonical_url text
);

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS og_title text,
  ADD COLUMN IF NOT EXISTS og_description text,
  ADD COLUMN IF NOT EXISTS canonical_url text;

INSERT INTO public.site_settings (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'public read site_settings'
  ) THEN
    CREATE POLICY "public read site_settings"
      ON public.site_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_settings'
      AND policyname = 'admin write site_settings'
  ) THEN
    CREATE POLICY "admin write site_settings"
      ON public.site_settings FOR UPDATE
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

-- 2) Media table used by Cloudinary uploads.
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'image',
  folder text NOT NULL DEFAULT 'other',
  title text NOT NULL DEFAULT 'Untitled',
  slug text,
  alt_text text,
  cloudinary_public_id text,
  cloudinary_version text,
  format text,
  bytes bigint,
  width int,
  height int,
  duration numeric,
  tags text[] NOT NULL DEFAULT '{}',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  public_id text,
  secure_url text DEFAULT '',
  resource_type text
);

ALTER TABLE public.media
  ADD COLUMN IF NOT EXISTS kind text,
  ADD COLUMN IF NOT EXISTS folder text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS alt_text text,
  ADD COLUMN IF NOT EXISTS cloudinary_public_id text,
  ADD COLUMN IF NOT EXISTS cloudinary_version text,
  ADD COLUMN IF NOT EXISTS format text,
  ADD COLUMN IF NOT EXISTS bytes bigint,
  ADD COLUMN IF NOT EXISTS width int,
  ADD COLUMN IF NOT EXISTS height int,
  ADD COLUMN IF NOT EXISTS duration numeric,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS public_id text,
  ADD COLUMN IF NOT EXISTS secure_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS resource_type text;

UPDATE public.media
SET title = COALESCE(title, 'Untitled')
WHERE title IS NULL;

UPDATE public.media
SET slug = COALESCE(slug, gen_random_uuid()::text)
WHERE slug IS NULL;

UPDATE public.media
SET public_id = COALESCE(public_id, gen_random_uuid()::text)
WHERE public_id IS NULL;

UPDATE public.media
SET cloudinary_public_id = COALESCE(cloudinary_public_id, gen_random_uuid()::text)
WHERE cloudinary_public_id IS NULL;

ALTER TABLE public.media
  ALTER COLUMN kind SET DEFAULT 'image',
  ALTER COLUMN folder SET DEFAULT 'other',
  ALTER COLUMN title SET DEFAULT 'Untitled',
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN cloudinary_public_id SET NOT NULL,
  ALTER COLUMN archived SET DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS media_slug_key ON public.media (slug);
CREATE UNIQUE INDEX IF NOT EXISTS media_cloudinary_public_id_key ON public.media (cloudinary_public_id);

-- 3) Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  og_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  featured boolean NOT NULL DEFAULT false
);

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS cover_media_id uuid,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS published boolean,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_media_id uuid,
  ADD COLUMN IF NOT EXISTS featured boolean;

UPDATE public.categories
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

UPDATE public.categories
SET published = COALESCE(published, true)
WHERE published IS NULL;

UPDATE public.categories
SET featured = COALESCE(featured, false)
WHERE featured IS NULL;

ALTER TABLE public.categories
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN published SET DEFAULT true,
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN display_order SET NOT NULL,
  ALTER COLUMN published SET NOT NULL,
  ALTER COLUMN featured SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories (display_order);
CREATE INDEX IF NOT EXISTS idx_categories_published ON public.categories (published);

-- 4) Albums
CREATE TABLE IF NOT EXISTS public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  location text,
  event_date date,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  og_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.albums
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS cover_media_id uuid,
  ADD COLUMN IF NOT EXISTS featured boolean,
  ADD COLUMN IF NOT EXISTS published boolean,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_media_id uuid;

UPDATE public.albums
SET featured = COALESCE(featured, false)
WHERE featured IS NULL;

UPDATE public.albums
SET published = COALESCE(published, false)
WHERE published IS NULL;

UPDATE public.albums
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

ALTER TABLE public.albums
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN published SET DEFAULT false,
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN featured SET NOT NULL,
  ALTER COLUMN published SET NOT NULL,
  ALTER COLUMN display_order SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_albums_category ON public.albums (category_id);
CREATE INDEX IF NOT EXISTS idx_albums_published ON public.albums (published);
CREATE INDEX IF NOT EXISTS idx_albums_featured ON public.albums (featured);
CREATE INDEX IF NOT EXISTS idx_albums_order ON public.albums (display_order);

-- 5) Photos
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES public.media(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text,
  caption text,
  description text,
  alt_text text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  location text,
  shot_date date,
  status text NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  camera text,
  lens text,
  aperture text,
  shutter_speed text,
  iso text,
  show_metadata boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.photos
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS featured boolean,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS camera text,
  ADD COLUMN IF NOT EXISTS lens text,
  ADD COLUMN IF NOT EXISTS aperture text,
  ADD COLUMN IF NOT EXISTS shutter_speed text,
  ADD COLUMN IF NOT EXISTS iso text,
  ADD COLUMN IF NOT EXISTS show_metadata boolean,
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.photos
SET slug = COALESCE(slug, gen_random_uuid()::text)
WHERE slug IS NULL;

UPDATE public.photos
SET status = COALESCE(status, 'draft')
WHERE status IS NULL;

UPDATE public.photos
SET featured = COALESCE(featured, false)
WHERE featured IS NULL;

UPDATE public.photos
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

UPDATE public.photos
SET show_metadata = COALESCE(show_metadata, false)
WHERE show_metadata IS NULL;

ALTER TABLE public.photos
  ALTER COLUMN media_id DROP NOT NULL,
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN show_metadata SET DEFAULT false,
  ALTER COLUMN featured SET NOT NULL,
  ALTER COLUMN display_order SET NOT NULL,
  ALTER COLUMN show_metadata SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS photos_slug_key ON public.photos (slug);
CREATE INDEX IF NOT EXISTS idx_photos_media ON public.photos (media_id);
CREATE INDEX IF NOT EXISTS idx_photos_category ON public.photos (category_id);
CREATE INDEX IF NOT EXISTS idx_photos_status ON public.photos (status);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON public.photos (featured);
CREATE INDEX IF NOT EXISTS idx_photos_order ON public.photos (display_order);

-- 6) Services, testimonials, stories, films
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  price_label text,
  cta_label text DEFAULT 'Request a Quote',
  cta_href text DEFAULT '/contact',
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  featured boolean NOT NULL DEFAULT false
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS media_id uuid,
  ADD COLUMN IF NOT EXISTS price_label text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_href text,
  ADD COLUMN IF NOT EXISTS published boolean,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS featured boolean;

UPDATE public.services
SET published = COALESCE(published, true)
WHERE published IS NULL;

UPDATE public.services
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

UPDATE public.services
SET featured = COALESCE(featured, false)
WHERE featured IS NULL;

ALTER TABLE public.services
  ALTER COLUMN published SET DEFAULT true,
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN published SET NOT NULL,
  ALTER COLUMN display_order SET NOT NULL,
  ALTER COLUMN featured SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  review text NOT NULL,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  event_type text,
  event_date date,
  published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  featured boolean NOT NULL DEFAULT false
);

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS client_media_id uuid,
  ADD COLUMN IF NOT EXISTS published boolean,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS featured boolean;

UPDATE public.testimonials
SET published = COALESCE(published, true)
WHERE published IS NULL;

UPDATE public.testimonials
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

UPDATE public.testimonials
SET featured = COALESCE(featured, false)
WHERE featured IS NULL;

ALTER TABLE public.testimonials
  ALTER COLUMN published SET DEFAULT true,
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN published SET NOT NULL,
  ALTER COLUMN display_order SET NOT NULL,
  ALTER COLUMN featured SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  cover_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  introduction text,
  location text,
  story_date date,
  tags text[] NOT NULL DEFAULT '{}',
  related_album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  related_film_id uuid,
  published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  og_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  subtitle text,
  featured boolean NOT NULL DEFAULT false
);

ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS cover_media_id uuid,
  ADD COLUMN IF NOT EXISTS published boolean,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_media_id uuid,
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS featured boolean;

UPDATE public.stories
SET published = COALESCE(published, false)
WHERE published IS NULL;

UPDATE public.stories
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

UPDATE public.stories
SET featured = COALESCE(featured, false)
WHERE featured IS NULL;

ALTER TABLE public.stories
  ALTER COLUMN published SET DEFAULT false,
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN published SET NOT NULL,
  ALTER COLUMN display_order SET NOT NULL,
  ALTER COLUMN featured SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.films (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  introduction text,
  cover_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  video_source text,
  video_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  video_url text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  location text,
  film_date date,
  tags text[] NOT NULL DEFAULT '{}',
  related_album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  related_story_id uuid,
  published boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  og_media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.films
  ADD COLUMN IF NOT EXISTS cover_media_id uuid,
  ADD COLUMN IF NOT EXISTS video_source text,
  ADD COLUMN IF NOT EXISTS video_media_id uuid,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS category_id uuid,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS film_date date,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_album_id uuid,
  ADD COLUMN IF NOT EXISTS related_story_id uuid,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS introduction text,
  ADD COLUMN IF NOT EXISTS featured boolean,
  ADD COLUMN IF NOT EXISTS published boolean,
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS og_media_id uuid;

UPDATE public.films
SET featured = COALESCE(featured, false)
WHERE featured IS NULL;

UPDATE public.films
SET published = COALESCE(published, false)
WHERE published IS NULL;

UPDATE public.films
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

ALTER TABLE public.films
  ALTER COLUMN featured SET DEFAULT false,
  ALTER COLUMN published SET DEFAULT false,
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN featured SET NOT NULL,
  ALTER COLUMN published SET NOT NULL,
  ALTER COLUMN display_order SET NOT NULL;

-- 7) Helper tables used by the CMS
CREATE TABLE IF NOT EXISTS public.about_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL,
  suffix text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.about_stats
  ADD COLUMN IF NOT EXISTS display_order integer;

UPDATE public.about_stats
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

ALTER TABLE public.about_stats
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN display_order SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  heading text,
  subtitle text,
  cta_label text,
  cta_href text,
  display_order integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 6000,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  description text,
  enabled boolean NOT NULL DEFAULT true,
  media_type text NOT NULL DEFAULT 'image'
);

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS display_order integer,
  ADD COLUMN IF NOT EXISTS enabled boolean,
  ADD COLUMN IF NOT EXISTS published boolean,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS media_type text;

UPDATE public.hero_slides
SET display_order = COALESCE(display_order, 0)
WHERE display_order IS NULL;

UPDATE public.hero_slides
SET enabled = COALESCE(enabled, true)
WHERE enabled IS NULL;

UPDATE public.hero_slides
SET published = COALESCE(published, true)
WHERE published IS NULL;

UPDATE public.hero_slides
SET media_type = COALESCE(media_type, 'image')
WHERE media_type IS NULL;

ALTER TABLE public.hero_slides
  ALTER COLUMN display_order SET DEFAULT 0,
  ALTER COLUMN enabled SET DEFAULT true,
  ALTER COLUMN published SET DEFAULT true,
  ALTER COLUMN media_type SET DEFAULT 'image',
  ALTER COLUMN display_order SET NOT NULL,
  ALTER COLUMN enabled SET NOT NULL,
  ALTER COLUMN published SET NOT NULL,
  ALTER COLUMN media_type SET NOT NULL;

-- 8) Admin profile safety check
CREATE TABLE IF NOT EXISTS public.admin_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Himal Shrestha',
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_profile (id, display_name)
SELECT u.id, 'Himal Shrestha'
FROM auth.users u
WHERE u.email = 'admin@drdslr.com'
ON CONFLICT (id) DO NOTHING;

-- 9) Indexes expected by the app
CREATE INDEX IF NOT EXISTS idx_media_folder_kind ON public.media (folder, kind);
CREATE INDEX IF NOT EXISTS idx_media_archived ON public.media (archived);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories (display_order);
CREATE INDEX IF NOT EXISTS idx_categories_published ON public.categories (published);
CREATE INDEX IF NOT EXISTS idx_albums_category ON public.albums (category_id);
CREATE INDEX IF NOT EXISTS idx_albums_published ON public.albums (published);
CREATE INDEX IF NOT EXISTS idx_albums_featured ON public.albums (featured);
CREATE INDEX IF NOT EXISTS idx_albums_order ON public.albums (display_order);
CREATE INDEX IF NOT EXISTS idx_photos_media ON public.photos (media_id);
CREATE INDEX IF NOT EXISTS idx_photos_category ON public.photos (category_id);
CREATE INDEX IF NOT EXISTS idx_photos_status ON public.photos (status);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON public.photos (featured);
CREATE INDEX IF NOT EXISTS idx_photos_order ON public.photos (display_order);
CREATE INDEX IF NOT EXISTS idx_photos_published_order ON public.photos (status, display_order);
CREATE INDEX IF NOT EXISTS idx_services_order ON public.services (display_order);
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services (published);
CREATE INDEX IF NOT EXISTS idx_services_published_order ON public.services (published, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON public.testimonials (display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials (published);
CREATE INDEX IF NOT EXISTS idx_testimonials_published_order ON public.testimonials (published, display_order);
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories (published);
CREATE INDEX IF NOT EXISTS idx_stories_order ON public.stories (display_order);
CREATE INDEX IF NOT EXISTS idx_stories_published_order ON public.stories (published, display_order);
CREATE INDEX IF NOT EXISTS idx_films_published ON public.films (published);
CREATE INDEX IF NOT EXISTS idx_films_featured ON public.films (featured);
CREATE INDEX IF NOT EXISTS idx_films_order ON public.films (display_order);
CREATE INDEX IF NOT EXISTS idx_about_stats_order ON public.about_stats (display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON public.hero_slides (display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_published ON public.hero_slides (published);
CREATE INDEX IF NOT EXISTS idx_hero_slides_enabled_order ON public.hero_slides (enabled, display_order);

CREATE TABLE IF NOT EXISTS public.album_media (
  album_id uuid NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  media_id uuid NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  caption text,
  PRIMARY KEY (album_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_album_media_album ON public.album_media (album_id, display_order);

ALTER TABLE public.album_media ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'album_media'
      AND policyname = 'public read published album_media'
  ) THEN
    CREATE POLICY "public read published album_media"
      ON public.album_media FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.albums
          WHERE albums.id = album_media.album_id
            AND albums.published = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'album_media'
      AND policyname = 'admin all album_media'
  ) THEN
    CREATE POLICY "admin all album_media"
      ON public.album_media FOR ALL USING (is_admin()) WITH CHECK (is_admin());
  END IF;
END $$;

-- End of final repair SQL
