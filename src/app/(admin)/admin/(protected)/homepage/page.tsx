import { createClient } from "@/lib/supabase/server";
import { HomepageSectionEditor, HeroTextEditor } from "@/components/admin/site-content-editor";
import { HeroSlideManager } from "@/components/admin/hero-slide-manager";
import { brand } from "@/data/site";

export const metadata = { title: "Homepage Manager" };
export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  let slides: Array<{
    id: string;
    media_id: string;
    media: { id: string; cloudinary_public_id: string; secure_url?: string; public_id?: string; title: string } | null;
  }> = [];

  let formattedSections: Array<{
    id: string;
    section_key: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    enabled: boolean;
  }> = [];

  let settings: {
    id: string;
    brand_name: string;
    photographer_name: string;
    tagline: string | null;
    seo_description: string | null;
  } | null = {
    id: "default-settings",
    brand_name: brand.name,
    photographer_name: brand.photographer,
    tagline: brand.tagline,
    seo_description: brand.supportingText,
  };

  try {
    const supabase = await createClient();
    const [{ data: sections }, { data: heroSlides }, { data: dbSettings }] = await Promise.all([
      supabase.from("homepage_sections").select("id, name, title, subtitle, content, is_enabled, order_index").order("order_index"),
      supabase.from("hero_slides").select("id, media_id, display_order, media:media(id, cloudinary_public_id, secure_url, public_id, title)").eq("published", true).eq("enabled", true).order("display_order").limit(10),
      supabase.from("site_settings").select("id, brand_name, photographer_name, tagline, seo_description").maybeSingle(),
    ]);

    if (dbSettings) {
      settings = dbSettings;
    }

    if (heroSlides && heroSlides.length > 0) {
      slides = heroSlides.map((slide) => ({
        id: slide.id,
        media_id: slide.media_id,
        media: slide.media as unknown as { id: string; cloudinary_public_id: string; secure_url?: string; public_id?: string; title: string } | null,
      }));
    }

    if (sections && sections.length > 0) {
      formattedSections = sections.map((s) => {
        const content = (s.content && typeof s.content === "object" ? s.content : {}) as Record<string, unknown>;
        return {
          id: s.id,
          section_key: s.name,
          title: s.title,
          subtitle: s.subtitle,
          description: (content.description as string) || null,
          enabled: s.is_enabled ?? true,
        };
      });
    }
  } catch (error) {
    console.warn("Could not load homepage data from database, using fallback:", error);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Homepage Content & Text Manager</h1>
        <p className="text-stone text-sm mt-1">Manage hero text, photo slider (1-10 photos), section titles, subheads, descriptions, and section visibility.</p>
      </div>

      {settings && <HeroTextEditor settings={settings} />}

      <HeroSlideManager slides={slides} />

      <div>
        <h2 className="text-xl font-display text-ivory mb-4">Homepage Sections Text & Visibility</h2>
        <div className="flex flex-col gap-6">
          {formattedSections.map((section) => (
            <HomepageSectionEditor key={section.id} section={section} />
          ))}
          {formattedSections.length === 0 && <p className="text-sm text-stone">No homepage sections found in database.</p>}
        </div>
      </div>
    </div>
  );
}
