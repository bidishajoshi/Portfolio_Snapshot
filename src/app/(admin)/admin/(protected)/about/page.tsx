import { createClient } from "@/lib/supabase/server";
import { SiteContentEditor } from "@/components/admin/site-content-editor";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const { data } = await (await createClient()).from("about_content").select("*").maybeSingle();
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">About</h1><p className="text-stone text-sm mt-1">Edit the profile content shown on the portfolio.</p></div>{data ? <SiteContentEditor table="about_content" record={data} fields={[{ key: "introduction", label: "Introduction" }, { key: "journey", label: "Journey" }]} /> : <p className="text-sm text-stone">No About content found.</p>}</div>;
}
