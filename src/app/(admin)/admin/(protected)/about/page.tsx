import { createAdminClient } from "@/lib/supabase/admin";
import { AboutManager } from "@/components/admin/about-manager";
import { aboutContent as fallbackAbout } from "@/data/site";

export const metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  let title = fallbackAbout.title;
  let subtitle = fallbackAbout.subtitle;
  let bio = fallbackAbout.bio.join("\n\n");
  let mediaId: string | null = null;
  let publicId: string | null = fallbackAbout.portrait;

  try {
    const supabase = createAdminClient();
    const { data: section } = await supabase
      .from("homepage_sections")
      .select("id, title, subtitle, content")
      .eq("name", "about")
      .maybeSingle();

    if (section) {
      if (section.title) title = section.title;
      if (section.subtitle) subtitle = section.subtitle;
      const content = (section.content && typeof section.content === "object" ? section.content : {}) as Record<string, unknown>;
      if (typeof content.bio === "string" && content.bio.trim()) {
        bio = content.bio;
      } else if (Array.isArray(content.bio) && content.bio.length > 0) {
        bio = content.bio.join("\n\n");
      }
      mediaId = (content.portrait_media_id as string) || null;

      if (mediaId) {
        const { data: media } = await supabase
          .from("media")
          .select("cloudinary_public_id, secure_url, public_id")
          .eq("id", mediaId)
          .maybeSingle();
        const found = media?.secure_url || media?.cloudinary_public_id || media?.public_id;
        if (found) publicId = found;
      }
    }
  } catch (error) {
    console.warn("Could not load about section from database, using fallback:", error);
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
        initialTitle={title}
        initialSubtitle={subtitle}
        initialBio={bio}
        initialMediaId={mediaId}
        initialPublicId={publicId}
      />
    </div>
  );
}
