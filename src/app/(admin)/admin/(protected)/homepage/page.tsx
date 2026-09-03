import { createClient } from "@/lib/supabase/server";
import { HomepageSectionEditor } from "@/components/admin/site-content-editor";

export const metadata = { title: "Homepage" };

export default async function HomepagePage() {
  const { data } = await (await createClient()).from("homepage_sections").select("id, section_key, title, subtitle, description, enabled").order("display_order");
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">Homepage</h1><p className="text-stone text-sm mt-1">Edit homepage section text and visibility.</p></div><div className="flex flex-col gap-3">{(data ?? []).map((section) => <div key={section.id}><p className="mb-1 text-xs uppercase text-stone-dim">{section.section_key}</p><HomepageSectionEditor section={section} /></div>)}{(!data || data.length === 0) && <p className="text-sm text-stone">No homepage sections found.</p>}</div></div>;
}
