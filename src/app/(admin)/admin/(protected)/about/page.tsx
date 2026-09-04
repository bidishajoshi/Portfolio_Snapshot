import { createAdminClient } from "@/lib/supabase/admin";
import { AboutManager } from "@/components/admin/about-manager";

export const metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const supabase = createAdminClient();
  const { data: section } = await supabase
    .from("homepage_sections")
    .select("id, title, subtitle, content")
    .eq("name", "about")
    .maybeSingle();

  const content = (section?.content && typeof section.content === "object" ? section.content : {}) as Record<string, unknown>;
  const mediaId = (content.portrait_media_id as string) || null;

  let publicId: string | null = null;
  if (mediaId) {
    const { data: media } = await supabase
      .from("media")
      .select("cloudinary_public_id")
      .eq("id", mediaId)
      .maybeSingle();
    publicId = media?.cloudinary_public_id || null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">About Himal</h1>
        <p className="text-stone text-sm mt-1">
          Edit the portrait photograph, title, subtitle, and biography shown in the About section of the website.
        </p>
      </div>

      <AboutManager
        initialTitle={section?.title}
        initialSubtitle={section?.subtitle}
        initialBio={typeof content.bio === "string" ? content.bio : Array.isArray(content.bio) ? content.bio.join("\n\n") : null}
        initialMediaId={mediaId}
        initialPublicId={publicId}
      />
    </div>
  );
}

