import { createClient } from "@/lib/supabase/server";
import { SocialManager } from "@/components/admin/social-manager";

export const metadata = { title: "Social Media" };

export default async function SocialPage() {
  const { data } = await (await createClient()).from("social_links").select("id, platform, label, url, enabled").order("display_order");
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">Social Media</h1><p className="text-stone text-sm mt-1">Manage Instagram, Facebook, and other social links.</p></div><SocialManager links={data ?? []} /></div>;
}
