import { createAdminClient } from "@/lib/supabase/admin";

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

// Force-dynamic ensures the public site always reflects the latest Supabase data after admin saves
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createAdminClient();
  const [
    { data: settings },
    { data: dbServices },
    { data: dbStories },
    { data: dbTestimonials },
    { data: dbCategories },
    { data: dbAlbums },
    { data: dbMedia },
    { data: dbPhotos },
    { data: dbSocial },
    { data: heroSlide },
    { data: dbAlbumMedia },
    { data: aboutSection },
    { data: homepageSections },
  ] = await Promise.all([
    supabase.from("site_settings").select("brand_name, photographer_name, tagline, contact_email, contact_phone, whatsapp_number, seo_description").maybeSingle(),
    supabase.from("services").select("id, title, description").eq("published", true).order("display_order"),
    supabase.from("stories").select("id, title, slug, introduction, location, story_date, cover_media_id, subtitle, tags").eq("published", true).order("display_order"),
    supabase.from("testimonials").select("id, client_name, review, rating, event_type, client_media_id").eq("published", true).order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug, description, cover_media_id").eq("published", true).order("display_order"),
    supabase.from("albums").select("id, title, slug, description, location, event_date, cover_media_id, featured, is_featured").order("display_order"),
    supabase.from("media").select("id, title, cloudinary_public_id, secure_url, public_id, kind, folder, bytes, width, height, format").eq("archived", false),
    supabase.from("photos").select("id, title, media_id, category_id, location, photo_date, status").eq("status", "published").order("display_order"),
    supabase.from("social_links").select("platform, label, url, enabled").eq("enabled", true),
    supabase.from("hero_slides").select("id, media:media(cloudinary_public_id, secure_url, public_id)").eq("published", true).eq("enabled", true).order("display_order").limit(10),
    supabase.from("album_media").select("album_id"),
    supabase.from("homepage_sections").select("name, title, subtitle, content, is_enabled").eq("name", "about").maybeSingle(),
    supabase.from("homepage_sections").select("id, name, title, subtitle, content, is_enabled").order("order_index"),
  ]);

  const sectionsMap = new Map((homepageSections ?? []).map((s) => [s.name, s]));
  const getSec = (key: string) => {
    const sec = sectionsMap.get(key) || sectionsMap.get(key.replace(/_/g, ""));
    if (!sec) return null;
    const content = (sec.content && typeof sec.content === "object" ? sec.content : {}) as Record<string, unknown>;
    return {
      ...sec,
      description: (content.description as string) || null,
    };
  };
  const isEnabled = (key: string) => {
    const sec = getSec(key);
    return sec ? (sec.is_enabled ?? true) : true;
  };

  const heroSec = getSec("hero");
  const selectedWorksSec = getSec("selected_works");
  const albumsSec = getSec("featured_albums");
  const aboutSec = getSec("about");
  const servicesSec = getSec("services");
  const storiesSec = getSec("stories");
  const experienceSec = getSec("latest_work");
  const testimonialsSec = getSec("testimonials");
  const socialSec = getSec("social");
  const contactSec = getSec("contact_cta");

  const mediaById = new Map((dbMedia ?? []).map((item) => [item.id, item]));
  const getMediaUrlOrId = (m?: { secure_url?: string | null; cloudinary_public_id?: string | null; public_id?: string | null } | null) =>
    m ? (m.cloudinary_public_id || m.public_id || m.secure_url || "") : "";

  const liveCategories = dbCategories?.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    cover: item.cover_media_id && mediaById.has(item.cover_media_id)
      ? cloudinaryImageUrl(getMediaUrlOrId(mediaById.get(item.cover_media_id)), { width: 1200, height: 800, crop: "fill" })
      : "",
  }));

  const albumMediaCounts = new Map<string, number>();
  for (const link of dbAlbumMedia ?? []) {
    albumMediaCounts.set(link.album_id, (albumMediaCounts.get(link.album_id) ?? 0) + 1);
  }

  const featuredAlbums = dbAlbums?.filter((a) => a.featured || a.is_featured) ?? [];
  const albumsToShow = featuredAlbums.length > 0 ? featuredAlbums : (dbAlbums ?? []);
  const liveAlbums = albumsToShow.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    location: item.location,
    date: item.event_date ?? "",
    cover: item.cover_media_id && mediaById.has(item.cover_media_id)
      ? cloudinaryImageUrl(getMediaUrlOrId(mediaById.get(item.cover_media_id)), { width: 1200, height: 900, crop: "fill" })
      : "",
    photoCount: albumMediaCounts.get(item.id) ?? 0,
  }));

  const categoryById = new Map((dbCategories ?? []).map((item) => [item.id, item.name]));
  const livePhotos = dbPhotos?.map((item) => {
    const media = mediaById.get(item.media_id);
    return media
      ? {
          id: item.id,
          title: item.title,
          category: item.category_id ? categoryById.get(item.category_id) ?? "Other" : "Other",
          image: cloudinaryImageUrl(getMediaUrlOrId(media), { width: 1200 }),
          location: item.location ?? "",
          date: item.photo_date ?? "",
        }
      : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const isBrokenLegacy = (m?: any) => {
    if (!m) return true;
    const raw = getMediaUrlOrId(m);
    return raw.includes("res.cloudinary.com/ohapodix") && (raw.includes("/dr-dslr/photo/") || raw.includes("WhatsApp%20Image") || raw.includes("ChatGPT%20Image"));
  };

  const photoMediaIds = new Set((dbPhotos ?? []).map((p) => p.media_id));
  const directPhotos = (dbMedia ?? [])
    .filter((m) => m.folder === "photo" && m.kind === "image" && !photoMediaIds.has(m.id) && !isBrokenLegacy(m))
    .map((m) => ({
      id: m.id,
      title: m.title,
      category: "Portfolio",
      image: cloudinaryImageUrl(getMediaUrlOrId(m), { width: 1200 }),
      location: "",
      date: "",
    }));

  const allGalleryPhotos = [...(livePhotos ?? []).filter((p) => !p.image.includes("ohapodix/image/upload/v178843")), ...directPhotos];

  const liveStories = dbStories?.map((story) => {
    const media = story.cover_media_id ? mediaById.get(story.cover_media_id) : null;
    const storyCat = story.subtitle || (story.tags && story.tags.length > 0 ? story.tags[0] : null);
    return {
      id: story.id,
      title: story.title,
      slug: story.slug ?? story.title.toLowerCase().replace(/\s+/g, "-"),
      introduction: story.introduction ?? "",
      location: story.location ?? "",
      story_date: story.story_date ?? null,
      cover: media ? cloudinaryImageUrl(getMediaUrlOrId(media), { width: 1400, height: 900, crop: "fill" }) : "",
      category: storyCat,
    };
  });

  const liveTestimonials = dbTestimonials?.map((item) => {
    const media = item.client_media_id ? mediaById.get(item.client_media_id) : null;
    return {
      id: item.id,
      client_name: item.client_name,
      review: item.review,
      rating: item.rating ?? 5,
      event_type: item.event_type,
      avatar: media ? cloudinaryImageUrl(getMediaUrlOrId(media), { width: 200, height: 200, crop: "fill" }) : null,
    };
  });

  // Dynamic About section resolution
  const aboutContentObj = (aboutSection?.content && typeof aboutSection.content === "object" ? aboutSection.content : {}) as Record<string, unknown>;
  const aboutPortraitMediaId = (aboutContentObj.portrait_media_id as string) || null;
  let aboutPortraitUrl: string | null = null;
  if (aboutPortraitMediaId && mediaById.has(aboutPortraitMediaId)) {
    aboutPortraitUrl = cloudinaryImageUrl(getMediaUrlOrId(mediaById.get(aboutPortraitMediaId)), { width: 1200, height: 1600, crop: "fill" });
  } else {
    const profileMedia = (dbMedia ?? []).find((m) => m.folder === "profile" && m.kind === "image");
    if (profileMedia) {
      aboutPortraitUrl = cloudinaryImageUrl(getMediaUrlOrId(profileMedia), { width: 1200, height: 1600, crop: "fill" });
    } else {
      aboutPortraitUrl = "/images/placeholder/portrait.jpg";
    }
  }

  const heroSlideImages = (heroSlide ?? [])
    .map((slide) => {
      const media = (slide as any).media as { cloudinary_public_id?: string; secure_url?: string; public_id?: string } | null;
      return getMediaUrlOrId(media);
    })
    .filter((url): url is string => Boolean(url));

  const directHeroMedia = (dbMedia ?? [])
    .filter((m) => m.folder === "hero" && m.kind === "image")
    .map((m) => getMediaUrlOrId(m))
    .filter(Boolean);

  const combinedHero = Array.from(new Set([...heroSlideImages, ...directHeroMedia]));
  const heroImages = combinedHero.length > 0 ? combinedHero : ["/images/placeholder/hero.jpg"];

  // Curated social photos: use valid portfolio/album uploads, excluding broken legacy 404s
  const validSocialImages = (dbMedia ?? [])
    .filter((item) => item.kind === "image" && !isBrokenLegacy(item) && (item.folder === "photo" || item.folder === "album"));

  const directSocialPhotos = validSocialImages.slice(0, 4).map((item) => ({
    id: item.id,
    publicId: getMediaUrlOrId(item),
    title: item.title,
  }));

  const fallbackSocialPhotos = [
    { id: "s1", publicId: "/images/placeholder/hero.jpg", title: "DR DSLR Moments" },
    { id: "s2", publicId: "/images/placeholder/portrait.jpg", title: "DR DSLR Portraits" },
    { id: "s3", publicId: "/images/placeholder/hero.jpg", title: "DR DSLR Stories" },
    { id: "s4", publicId: "/images/placeholder/portrait.jpg", title: "DR DSLR Travels" },
  ];

  const socialPhotos = directSocialPhotos.length >= 4
    ? directSocialPhotos
    : [...directSocialPhotos, ...fallbackSocialPhotos].slice(0, 4);

  return (
    <main className="flex flex-col min-h-screen relative w-full overflow-x-hidden bg-ink">
      <Navbar />
      {isEnabled("hero") && (
        <Hero
          brandOverride={settings ? { name: settings.brand_name, photographer: settings.photographer_name, tagline: settings.tagline, supportingText: heroSec?.description || settings?.seo_description } : undefined}
          backgroundImages={heroImages}
        />
      )}
      {isEnabled("about") && (
        <About
          portrait={aboutPortraitUrl}
          title={aboutSec?.title}
          subtitle={aboutSec?.subtitle}
          bio={typeof aboutContentObj.bio === "string" ? aboutContentObj.bio : Array.isArray(aboutContentObj.bio) ? aboutContentObj.bio : null}
        />
      )}
      {isEnabled("selected_works") && <Categories categories={liveCategories} title={selectedWorksSec?.subtitle} subtitle={selectedWorksSec?.title} />}
      {isEnabled("selected_works") && <Gallery photos={allGalleryPhotos} categories={liveCategories?.map((item) => item.name)} title={selectedWorksSec?.title} subtitle={selectedWorksSec?.subtitle} description={selectedWorksSec?.description} />}
      {isEnabled("featured_albums") && <Albums albums={liveAlbums} title={albumsSec?.title} subtitle={albumsSec?.subtitle} description={albumsSec?.description} />}
      {isEnabled("stories") && <Stories stories={liveStories ?? []} title={storiesSec?.title} subtitle={storiesSec?.subtitle} description={storiesSec?.description} />}
      {isEnabled("services") && <Services services={dbServices ?? []} title={servicesSec?.title} subtitle={servicesSec?.subtitle} description={servicesSec?.description} />}
      {isEnabled("latest_work") && <Experience title={experienceSec?.title} subtitle={experienceSec?.subtitle} description={experienceSec?.description} />}
      {isEnabled("testimonials") && <Testimonials testimonials={liveTestimonials ?? []} title={testimonialsSec?.title} subtitle={testimonialsSec?.subtitle} description={testimonialsSec?.description} />}
      {isEnabled("social") && <Social socialLinks={dbSocial ?? []} photos={socialPhotos} title={socialSec?.title} subtitle={socialSec?.subtitle} description={socialSec?.description} />}
      {isEnabled("contact_cta") && <Contact contactOverride={settings ? { email: settings.contact_email, phone: settings.contact_phone } : undefined} title={contactSec?.title} subtitle={contactSec?.subtitle} description={contactSec?.description} />}
      <Footer
        socialLinks={dbSocial ?? []}
        brandOverride={settings ? { name: settings.brand_name, tagline: settings.tagline } : undefined}
      />
    </main>
  );
}

