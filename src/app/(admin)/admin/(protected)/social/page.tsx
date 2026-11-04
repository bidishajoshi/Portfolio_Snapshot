import { createClient } from "@/lib/supabase/server";
import { SocialManager } from "@/components/admin/social-manager";
import { socialLinks as fallbackSocials } from "@/data/site";

export const metadata = { title: "Social Media" };

export default async function SocialPage() {
  let links: Array<{ id: string; platform: string; label: string; url: string; enabled: boolean }> = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("social_links").select("id, platform, label, url");
    if (data && data.length > 0) {
      links = data.map((item) => ({ ...item, enabled: true }));
    }
  } catch (error) {
    console.warn("Could not load social links from database, using fallback:", error);
  }

  if (links.length === 0) {
    links = fallbackSocials.map((s, idx) => ({
      id: `fallback-social-${idx}`,
      platform: s.platform,
      label: s.platform,
      url: s.url,
      enabled: s.enabled,
    }));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Social Media</h1>
        <p className="text-stone text-sm mt-1">Manage Instagram, TikTok, WhatsApp, and Facebook links.</p>
      </div>
      <SocialManager links={links} />
    </div>
  );
}
