import { createClient } from "@/lib/supabase/server";
import { SiteContentEditor } from "@/components/admin/site-content-editor";
import { brand, contact } from "@/data/site";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  let settingsData: Record<string, unknown> = {
    id: "default-settings",
    brand_name: brand.name,
    photographer_name: brand.photographer,
    tagline: brand.tagline,
    contact_email: contact.email,
    contact_phone: contact.phone,
    whatsapp_number: contact.phone,
    footer_text: brand.copyright,
  };

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("*").maybeSingle();
    if (data) {
      settingsData = data as Record<string, unknown>;
    }
  } catch (error) {
    console.warn("Could not load settings from database, using fallback:", error);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Settings</h1>
        <p className="text-stone text-sm mt-1">Manage global site identity and contact settings.</p>
      </div>
      <SiteContentEditor
        table="site_settings"
        record={settingsData}
        fields={[
          { key: "brand_name", label: "Brand name" },
          { key: "photographer_name", label: "Photographer name" },
          { key: "tagline", label: "Tagline" },
          { key: "contact_email", label: "Contact email" },
          { key: "contact_phone", label: "Contact phone" },
          { key: "whatsapp_number", label: "WhatsApp number" },
          { key: "footer_text", label: "Footer text" },
        ]}
      />
    </div>
  );
}
