import { createClient } from "@/lib/supabase/server";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Categories from "@/components/Categories";
import Gallery from "@/components/Gallery";
import Albums from "@/components/Albums";
import Stories from "@/components/Stories";
import Services from "@/components/Services";
import Experience from "@/components/Experience";
import Testimonials from "@/components/Testimonials";
import Social from "@/components/Social";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { cloudinaryImageUrl } from "@/lib/cloudinary/url";

// We read site settings just to ensure we don't break the existing build if it relies on it,
// though our components currently use local data to ensure a fully beautiful render out-of-the-box.
export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: dbServices }, { data: dbStories }, { data: dbTestimonials }, { data: dbCategories }, { data: dbAlbums }, { data: dbMedia }, { data: dbPhotos }, { data: dbSocial }] = await Promise.all([
    supabase.from("site_settings").select("brand_name, photographer_name, tagline, contact_email, contact_phone").maybeSingle(),
    supabase.from("services").select("id, title, description").eq("published", true).order("display_order"),
    supabase.from("stories").select("id, title, introduction, location, story_date").eq("published", true).order("display_order"),
    supabase.from("testimonials").select("id, client_name, review, event_type").eq("published", true).order("display_order"),
    supabase.from("categories").select("id, name, slug, description, cover_media_id").eq("published", true).order("display_order"),
    supabase.from("albums").select("id, title, slug, description, location, event_date, cover_media_id").eq("published", true).order("display_order"),
    supabase.from("media").select("id, title, cloudinary_public_id, kind, folder").eq("archived", false),
    supabase.from("photos").select("id, title, media_id, category_id, location, shot_date, status").eq("status", "published").order("display_order"),
    supabase.from("social_links").select("platform, label, url"),
  ]);
  const mediaById = new Map((dbMedia ?? []).map((item) => [item.id, item]));
  const liveCategories = dbCategories?.map((item) => ({ id: item.id, name: item.name, description: item.description, cover: item.cover_media_id && mediaById.has(item.cover_media_id) ? cloudinaryImageUrl(mediaById.get(item.cover_media_id)!.cloudinary_public_id, { width: 1200, height: 800, crop: "fill" }) : "" }));
  const liveAlbums = dbAlbums?.map((item) => ({ id: item.id, title: item.title, slug: item.slug, description: item.description, location: item.location, date: item.event_date ?? "", cover: item.cover_media_id && mediaById.has(item.cover_media_id) ? cloudinaryImageUrl(mediaById.get(item.cover_media_id)!.cloudinary_public_id, { width: 1200, height: 900, crop: "fill" }) : "", photoCount: 0 }));
  const categoryById = new Map((dbCategories ?? []).map((item) => [item.id, item.name]));
  const livePhotos = dbPhotos?.map((item) => {
    const media = mediaById.get(item.media_id);
    return media ? { id: item.id, title: item.title, category: item.category_id ? categoryById.get(item.category_id) ?? "Other" : "Other", image: cloudinaryImageUrl(media.cloudinary_public_id, { width: 1200 }), location: item.location ?? "", date: item.shot_date ?? "" } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main className="flex flex-col min-h-screen relative w-full overflow-x-hidden bg-ink">
      <Navbar />
      <Hero brandOverride={settings ? { name: settings.brand_name, photographer: settings.photographer_name, tagline: settings.tagline } : undefined} />
      <About />
      <Categories categories={liveCategories} />
      <Gallery photos={livePhotos} categories={liveCategories?.map((item) => item.name)} />
      <Albums albums={liveAlbums} />
      <Stories stories={dbStories?.length ? dbStories : undefined} />
      <Services services={dbServices?.length ? dbServices : undefined} />
      <Experience />
      <Testimonials testimonials={dbTestimonials?.length ? dbTestimonials : undefined} />
      <Social socialLinks={dbSocial?.filter((item) => item.platform === "instagram" || item.platform === "facebook").map((item) => ({ ...item, enabled: true }))} />
      <Contact contactOverride={settings ? { email: settings.contact_email, phone: settings.contact_phone } : undefined} />
      <Footer />
    </main>
  );
}
