// DR DSLR — database types
//
// Hand-authored to mirror supabase/migrations exactly. If the schema changes,
// update this file in the same commit. (Once a real Supabase project exists,
// these can be regenerated with `supabase gen types typescript` — but the
// shapes below are already correct so nothing downstream needs to change.)

export type PublishStatus = "draft" | "published" | "hidden";
export type MediaKind = "image" | "video";
export type MediaFolder =
  | "photo"
  | "video"
  | "hero"
  | "profile"
  | "album"
  | "story"
  | "film"
  | "service"
  | "testimonial"
  | "other";
export type FilmVideoSource = "cloudinary" | "youtube" | "vimeo";
export type StoryBlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "image_gallery"
  | "video"
  | "quote"
  | "spacer"
  | "full_width_image";
export type HomepageSectionKey =
  | "hero"
  | "selected_works"
  | "featured_albums"
  | "about"
  | "services"
  | "featured_films"
  | "stories"
  | "latest_work"
  | "night_and_light"
  | "testimonials"
  | "social"
  | "contact_cta";
export type HomepageDisplayMode = "manual" | "automatic";

export interface SiteSettings {
  id: true;
  brand_name: string;
  photographer_name: string;
  tagline: string;
  logo_media_id: string | null;
  favicon_media_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  whatsapp_default_message: string | null;
  site_url: string | null;
  ga_id: string | null;
  default_og_media_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  footer_text: string | null;
  updated_at: string;
}

export interface Media {
  id: string;
  kind: MediaKind;
  folder: MediaFolder;
  title: string;
  slug: string;
  alt_text: string | null;
  cloudinary_public_id: string;
  public_id?: string;
  secure_url?: string;
  resource_type?: MediaKind;
  cloudinary_version: string | null;
  format: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  tags: string[];
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_media_id: string | null;
  display_order: number;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_media_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
  category_id: string | null;
  cover_media_id: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  og_media_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  media_id: string;
  title: string;
  slug: string;
  caption: string | null;
  description: string | null;
  alt_text: string | null;
  category_id: string | null;
  location: string | null;
  photo_date: string | null;
  status: PublishStatus;
  featured: boolean;
  display_order: number;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  shutter_speed: string | null;
  iso: string | null;
  show_metadata: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlbumPhoto {
  album_id: string;
  photo_id: string;
  display_order: number;
  caption_override: string | null;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  media_id: string | null;
  price_label: string | null;
  cta_label: string | null;
  cta_href: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_media_id: string | null;
  review: string;
  rating: number | null;
  event_type: string | null;
  event_date: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Film {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  introduction: string | null;
  cover_media_id: string | null;
  video_source: FilmVideoSource | null;
  video_media_id: string | null;
  video_url: string | null;
  category_id: string | null;
  location: string | null;
  film_date: string | null;
  tags: string[];
  related_album_id: string | null;
  related_story_id: string | null;
  published: boolean;
  featured: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  og_media_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilmMedia {
  id: string;
  film_id: string;
  media_id: string;
  section: "gallery" | "behind_the_scenes" | "additional_video";
  caption: string | null;
  display_order: number;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  cover_media_id: string | null;
  introduction: string | null;
  location: string | null;
  story_date: string | null;
  tags: string[];
  related_album_id: string | null;
  related_film_id: string | null;
  published: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  og_media_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryBlock {
  id: string;
  story_id: string;
  block_type: StoryBlockType;
  display_order: number;
  text_content: string | null;
  heading_level: number | null;
  media_id: string | null;
  caption: string | null;
  created_at: string;
}

export interface StoryBlockMedia {
  story_block_id: string;
  media_id: string;
  display_order: number;
  caption: string | null;
}

export interface StoryMedia {
  story_id: string;
  media_id: string;
  display_order: number;
  caption: string | null;
}

export interface HomepageSection {
  id: string;
  section_key: HomepageSectionKey;
  enabled: boolean;
  display_order: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  display_mode: HomepageDisplayMode;
  cta_label: string | null;
  cta_href: string | null;
  updated_at: string;
}

export interface HomepageGalleryItem {
  id: string;
  section_id: string;
  photo_id: string | null;
  album_id: string | null;
  film_id: string | null;
  story_id: string | null;
  display_order: number;
  created_at: string;
}

export interface HeroSlide {
  id: string;
  media_id: string;
  heading: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  display_order: number;
  duration_ms: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutContent {
  id: true;
  profile_media_id: string | null;
  introduction: string | null;
  journey: string | null;
  updated_at: string;
}

export interface AboutExperience {
  id: string;
  title: string;
  organization: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  display_order: number;
}

export interface AboutSkill {
  id: string;
  name: string;
  proficiency: number | null;
  display_order: number;
}

export interface AboutEquipment {
  id: string;
  name: string;
  category: string | null;
  media_id: string | null;
  display_order: number;
}

export interface AboutAward {
  id: string;
  title: string;
  issuer: string | null;
  award_date: string | null;
  description: string | null;
  media_id: string | null;
  display_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string | null;
  url: string;
  enabled: boolean;
  placement: "header" | "footer" | "contact" | "floating";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  event_type: string | null;
  event_date: string | null;
  location: string | null;
  budget: string | null;
  service_id: string | null;
  message: string;
  is_read: boolean;
  honeypot_triggered: boolean;
  ip_hash: string | null;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  display_name: string;
  created_at: string;
}

// Minimal Supabase `Database` generic shape — enough for the typed client
// helpers in src/lib/supabase to give real autocomplete + type checking.
export interface Database {
  public: {
    Tables: {
      site_settings: { Row: SiteSettings; Insert: Partial<SiteSettings>; Update: Partial<SiteSettings> };
      media: { Row: Media; Insert: Partial<Media>; Update: Partial<Media> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      albums: { Row: Album; Insert: Partial<Album>; Update: Partial<Album> };
      photos: { Row: Photo; Insert: Partial<Photo>; Update: Partial<Photo> };
      album_photos: { Row: AlbumPhoto; Insert: Partial<AlbumPhoto>; Update: Partial<AlbumPhoto> };
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> };
      testimonials: { Row: Testimonial; Insert: Partial<Testimonial>; Update: Partial<Testimonial> };
      films: { Row: Film; Insert: Partial<Film>; Update: Partial<Film> };
      film_media: { Row: FilmMedia; Insert: Partial<FilmMedia>; Update: Partial<FilmMedia> };
      stories: { Row: Story; Insert: Partial<Story>; Update: Partial<Story> };
      story_blocks: { Row: StoryBlock; Insert: Partial<StoryBlock>; Update: Partial<StoryBlock> };
      story_block_media: { Row: StoryBlockMedia; Insert: Partial<StoryBlockMedia>; Update: Partial<StoryBlockMedia> };
      story_media: { Row: StoryMedia; Insert: Partial<StoryMedia>; Update: Partial<StoryMedia> };
      homepage_sections: { Row: HomepageSection; Insert: Partial<HomepageSection>; Update: Partial<HomepageSection> };
      homepage_gallery_items: { Row: HomepageGalleryItem; Insert: Partial<HomepageGalleryItem>; Update: Partial<HomepageGalleryItem> };
      hero_slides: { Row: HeroSlide; Insert: Partial<HeroSlide>; Update: Partial<HeroSlide> };
      about_content: { Row: AboutContent; Insert: Partial<AboutContent>; Update: Partial<AboutContent> };
      about_experience: { Row: AboutExperience; Insert: Partial<AboutExperience>; Update: Partial<AboutExperience> };
      about_skills: { Row: AboutSkill; Insert: Partial<AboutSkill>; Update: Partial<AboutSkill> };
      about_equipment: { Row: AboutEquipment; Insert: Partial<AboutEquipment>; Update: Partial<AboutEquipment> };
      about_awards: { Row: AboutAward; Insert: Partial<AboutAward>; Update: Partial<AboutAward> };
      social_links: { Row: SocialLink; Insert: Partial<SocialLink>; Update: Partial<SocialLink> };
      inquiries: { Row: Inquiry; Insert: Partial<Inquiry>; Update: Partial<Inquiry> };
      admin_profile: { Row: AdminProfile; Insert: Partial<AdminProfile>; Update: Partial<AdminProfile> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
