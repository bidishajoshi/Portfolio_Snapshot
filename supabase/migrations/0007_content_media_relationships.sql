-- Complete media relationships for content editors.
-- Run after 0006 in Supabase SQL Editor.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_services_media') THEN
    ALTER TABLE services ADD CONSTRAINT fk_services_media FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stories_cover_media') THEN
    ALTER TABLE stories ADD CONSTRAINT fk_stories_cover_media FOREIGN KEY (cover_media_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_testimonials_client_media') THEN
    ALTER TABLE testimonials ADD CONSTRAINT fk_testimonials_client_media FOREIGN KEY (client_media_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_films_cover_media') THEN
    ALTER TABLE films ADD CONSTRAINT fk_films_cover_media FOREIGN KEY (cover_media_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_films_video_media') THEN
    ALTER TABLE films ADD CONSTRAINT fk_films_video_media FOREIGN KEY (video_media_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_services_media ON services (media_id);
CREATE INDEX IF NOT EXISTS idx_stories_cover_media ON stories (cover_media_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_client_media ON testimonials (client_media_id);
