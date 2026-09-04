import { createClient } from "@/lib/supabase/server";
import { HomepageSectionEditor } from "@/components/admin/site-content-editor";
import { HeroSlideManager } from "@/components/admin/hero-slide-manager";

export const metadata = { title: "Homepage" };
export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  const supabase = await createClient();
  const [{ data: sections }, { data: heroSlide }] = await Promise.all([
    supabase.from("homepage_sections").select("id, section_key, title, subtitle, description, enabled").order("display_order"),
    supabase.from("hero_slides").select("id, media_id, media:media(id, cloudinary_public_id, title)").eq("published", true).eq("enabled", true).order("display_order").limit(1).maybeSingle(),
  ]);

  const currentMedia = (heroSlide?.media as unknown as { id: string; cloudinary_public_id: string; title: string } | null) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Homepage</h1>
        <p className="text-stone text-sm mt-1">Manage the hero background photo and homepage section visibility.</p>
      </div>

      <HeroSlideManager currentMedia={currentMedia} />

      <div>
        <h2 className="text-lg font-display text-ivory mb-3">Sections</h2>
        <div className="flex flex-col gap-3">
          {(sections ?? []).map((section) => (
            <div key={section.id}>
              <p className="mb-1 text-xs uppercase text-stone-dim">{section.section_key}</p>
              <HomepageSectionEditor section={section} />
            </div>
          ))}
          {(!sections || sections.length === 0) && <p className="text-sm text-stone">No homepage sections found.</p>}
        </div>
      </div>
    </div>
  );
}

