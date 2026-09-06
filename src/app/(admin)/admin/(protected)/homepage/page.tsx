import { createClient } from "@/lib/supabase/server";
import { HomepageSectionEditor, HeroTextEditor } from "@/components/admin/site-content-editor";
import { HeroSlideManager } from "@/components/admin/hero-slide-manager";

export const metadata = { title: "Homepage Manager" };
export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  const supabase = await createClient();
  const [{ data: sections }, { data: heroSlide }, { data: settings }] = await Promise.all([
    supabase.from("homepage_sections").select("id, section_key, title, subtitle, description, enabled").order("display_order"),
    supabase.from("hero_slides").select("id, media_id, media:media(id, cloudinary_public_id, title)").eq("published", true).eq("enabled", true).order("display_order").limit(1).maybeSingle(),
    supabase.from("site_settings").select("id, brand_name, photographer_name, tagline").maybeSingle(),
  ]);

  const currentMedia = (heroSlide?.media as unknown as { id: string; cloudinary_public_id: string; title: string } | null) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Homepage Content & Text Manager</h1>
        <p className="text-stone text-sm mt-1">Manage hero text, background photo, section titles, subheads, descriptions, and section visibility.</p>
      </div>

      {settings && <HeroTextEditor settings={settings} />}

      <HeroSlideManager currentMedia={currentMedia} />

      <div>
        <h2 className="text-xl font-display text-ivory mb-4">Homepage Sections Text & Visibility</h2>
        <div className="flex flex-col gap-6">
          {(sections ?? []).map((section) => (
            <HomepageSectionEditor key={section.id} section={section} />
          ))}
          {(!sections || sections.length === 0) && <p className="text-sm text-stone">No homepage sections found in database.</p>}
        </div>
      </div>
    </div>
  );
}
