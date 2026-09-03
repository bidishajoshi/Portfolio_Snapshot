import { createClient } from "@/lib/supabase/server";
import { SiteContentEditor } from "@/components/admin/site-content-editor";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { data } = await (await createClient()).from("site_settings").select("*").maybeSingle();
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">Settings</h1><p className="text-stone text-sm mt-1">Manage global site identity and contact settings.</p></div>{data ? <SiteContentEditor table="site_settings" record={data} fields={[{ key: "brand_name", label: "Brand name" }, { key: "photographer_name", label: "Photographer name" }, { key: "tagline", label: "Tagline" }, { key: "contact_email", label: "Contact email" }, { key: "contact_phone", label: "Contact phone" }, { key: "whatsapp_number", label: "WhatsApp number" }, { key: "footer_text", label: "Footer text" }]} /> : <p className="text-sm text-stone">No site settings found.</p>}</div>;
}
