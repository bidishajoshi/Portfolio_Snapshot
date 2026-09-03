-- DR DSLR — Row Level Security
--
-- Model: exactly one admin (a Supabase Auth user whose id exists in admin_profile).
-- Public (anon) role: read-only, and only for published/enabled content.
-- Authenticated admin: full read/write on everything.
-- Inquiries: public can INSERT (submit the contact form) but never SELECT/UPDATE/DELETE.

-- ---------------------------------------------------------------------
-- Helper: is the current request authenticated as the admin?
-- ---------------------------------------------------------------------

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_profile where id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------

alter table site_settings enable row level security;
alter table media enable row level security;
alter table categories enable row level security;
alter table albums enable row level security;
alter table photos enable row level security;
alter table album_photos enable row level security;
alter table services enable row level security;
alter table testimonials enable row level security;
alter table films enable row level security;
alter table film_media enable row level security;
alter table stories enable row level security;
alter table story_blocks enable row level security;
alter table story_block_media enable row level security;
alter table story_media enable row level security;
alter table homepage_sections enable row level security;
alter table homepage_gallery_items enable row level security;
alter table hero_slides enable row level security;
alter table about_content enable row level security;
alter table about_experience enable row level security;
alter table about_skills enable row level security;
alter table about_equipment enable row level security;
alter table about_awards enable row level security;
alter table social_links enable row level security;
alter table inquiries enable row level security;
alter table admin_profile enable row level security;

-- ---------------------------------------------------------------------
-- site_settings: public can read, only admin can write
-- ---------------------------------------------------------------------

create policy "public read site_settings" on site_settings for select using (true);
create policy "admin write site_settings" on site_settings for update using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- media: public can read non-archived assets (needed to render published
-- content); only admin can insert/update/delete. Archived assets are
-- hidden from anon so half-deleted media never leaks publicly.
-- ---------------------------------------------------------------------

create policy "public read media" on media for select using (archived = false);
create policy "admin all media" on media for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------

create policy "public read published categories" on categories for select using (published = true);
create policy "admin all categories" on categories for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- albums
-- ---------------------------------------------------------------------

create policy "public read published albums" on albums for select using (published = true);
create policy "admin all albums" on albums for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- photos
-- ---------------------------------------------------------------------

create policy "public read published photos" on photos for select using (status = 'published');
create policy "admin all photos" on photos for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- album_photos: public can read a link only if BOTH the album and the
-- photo it references are published. Admin sees/manages everything.
-- ---------------------------------------------------------------------

create policy "public read published album_photos" on album_photos for select using (
  exists (select 1 from albums a where a.id = album_id and a.published = true)
  and exists (select 1 from photos p where p.id = photo_id and p.status = 'published')
);
create policy "admin all album_photos" on album_photos for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- services / testimonials
-- ---------------------------------------------------------------------

create policy "public read published services" on services for select using (published = true);
create policy "admin all services" on services for all using (is_admin()) with check (is_admin());

create policy "public read published testimonials" on testimonials for select using (published = true);
create policy "admin all testimonials" on testimonials for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- films
-- ---------------------------------------------------------------------

create policy "public read published films" on films for select using (published = true);
create policy "admin all films" on films for all using (is_admin()) with check (is_admin());

create policy "public read film_media of published films" on film_media for select using (
  exists (select 1 from films f where f.id = film_id and f.published = true)
);
create policy "admin all film_media" on film_media for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- stories
-- ---------------------------------------------------------------------

create policy "public read published stories" on stories for select using (published = true);
create policy "admin all stories" on stories for all using (is_admin()) with check (is_admin());

create policy "public read story_blocks of published stories" on story_blocks for select using (
  exists (select 1 from stories s where s.id = story_id and s.published = true)
);
create policy "admin all story_blocks" on story_blocks for all using (is_admin()) with check (is_admin());

create policy "public read story_block_media of published stories" on story_block_media for select using (
  exists (
    select 1 from story_blocks sb
    join stories s on s.id = sb.story_id
    where sb.id = story_block_id and s.published = true
  )
);
create policy "admin all story_block_media" on story_block_media for all using (is_admin()) with check (is_admin());

create policy "public read story_media of published stories" on story_media for select using (
  exists (select 1 from stories s where s.id = story_id and s.published = true)
);
create policy "admin all story_media" on story_media for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- homepage
-- ---------------------------------------------------------------------

create policy "public read enabled homepage_sections" on homepage_sections for select using (enabled = true);
create policy "admin all homepage_sections" on homepage_sections for all using (is_admin()) with check (is_admin());

create policy "public read homepage_gallery_items" on homepage_gallery_items for select using (
  exists (select 1 from homepage_sections s where s.id = section_id and s.enabled = true)
);
create policy "admin all homepage_gallery_items" on homepage_gallery_items for all using (is_admin()) with check (is_admin());

create policy "public read published hero_slides" on hero_slides for select using (published = true);
create policy "admin all hero_slides" on hero_slides for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- about page
-- ---------------------------------------------------------------------

create policy "public read about_content" on about_content for select using (true);
create policy "admin write about_content" on about_content for update using (is_admin()) with check (is_admin());

create policy "public read about_experience" on about_experience for select using (true);
create policy "admin all about_experience" on about_experience for all using (is_admin()) with check (is_admin());

create policy "public read about_skills" on about_skills for select using (true);
create policy "admin all about_skills" on about_skills for all using (is_admin()) with check (is_admin());

create policy "public read about_equipment" on about_equipment for select using (true);
create policy "admin all about_equipment" on about_equipment for all using (is_admin()) with check (is_admin());

create policy "public read about_awards" on about_awards for select using (true);
create policy "admin all about_awards" on about_awards for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- social links
-- ---------------------------------------------------------------------

create policy "public read enabled social_links" on social_links for select using (enabled = true);
create policy "admin all social_links" on social_links for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- inquiries: public can submit, nobody but admin can read/update/delete
-- ---------------------------------------------------------------------

create policy "public can submit inquiries" on inquiries for insert with check (true);
create policy "admin read inquiries" on inquiries for select using (is_admin());
create policy "admin update inquiries" on inquiries for update using (is_admin()) with check (is_admin());
create policy "admin delete inquiries" on inquiries for delete using (is_admin());

-- ---------------------------------------------------------------------
-- admin_profile: only the admin can see their own row; no public access
-- ---------------------------------------------------------------------

create policy "admin reads own profile" on admin_profile for select using (auth.uid() = id);
