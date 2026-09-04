import { createClient } from "@/lib/supabase/server";
import { ContentMediaManager, type ContentMediaRecord } from "@/components/admin/content-media-manager";
import { ContentEditor, type EditableRecord } from "@/components/admin/content-editor";

export const metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("id, title, slug, description, published, media_id, price_label");
  const services = (data ?? []) as Array<{ id: string; title: string; slug: string; description: string | null; media_id?: string | null; price_label?: string | null; published?: boolean }>;

  const records: ContentMediaRecord[] = services.filter((service) => service.id && service.id.length > 10).map((service) => ({ id: service.id, title: service.title }));
  const editableRecords: EditableRecord[] = services.filter((service) => service.id && service.id.length > 10).map((service) => ({ id: service.id, title: service.title, description: service.description, mediaId: service.media_id ?? null, published: service.published ?? true }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">Services</h1>
        <p className="text-stone text-sm mt-1">Manage the photography services shown on the site.</p>
      </div>

      {services.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-sm">
          <p className="text-sm text-stone">No services yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <div key={service.id} className="rounded-sm border border-border bg-surface px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-ivory">{service.title}</p>
                  <p className="text-xs text-stone-dim mt-1">/{service.slug}</p>
                  {service.description && <p className="text-sm text-stone mt-3">{service.description}</p>}
                </div>
                <span className="shrink-0 text-xs text-stone-dim">
                  {"published" in service && service.published ? "Published" : "Draft"}
                </span>
              </div>
              {"price_label" in service && service.price_label && <p className="text-xs text-gold mt-3">{service.price_label}</p>}
            </div>
          ))}
        </div>
      )}
      <ContentMediaManager content="service" records={records} />
      <ContentEditor content="service" records={editableRecords} canDelete={false} />
    </div>
  );
}
