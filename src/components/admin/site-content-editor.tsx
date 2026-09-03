"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateHomepageSection, updateSiteContent } from "@/lib/actions/site-content";

export function SiteContentEditor({ table, record, fields }: { table: "site_settings" | "about_content"; record: Record<string, unknown>; fields: Array<{ key: string; label: string }> }) {
  const [values, setValues] = useState(record);
  const [pending, startTransition] = useTransition();
  const save = () => startTransition(async () => { try { await updateSiteContent(table, record.id as boolean | string, values); toast.success("Saved."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save."); } });
  return <div className="flex flex-col gap-4 rounded-sm border border-border bg-surface p-5">{fields.map((field) => <div key={field.key}><Input label={field.label} value={String(values[field.key] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} /></div>)}<div className="flex justify-end"><Button size="sm" onClick={save} disabled={pending}>{pending ? "Saving..." : "Save"}</Button></div></div>;
}

export function HomepageSectionEditor({ section }: { section: { id: string; title: string | null; subtitle: string | null; description: string | null; enabled: boolean } }) {
  const [values, setValues] = useState(section);
  const [pending, startTransition] = useTransition();
  const save = () => startTransition(async () => { try { await updateHomepageSection(section.id, { title: values.title || null, subtitle: values.subtitle || null, description: values.description || null, enabled: values.enabled }); toast.success("Section saved."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save section."); } });
  return <div className="grid gap-3 rounded-sm border border-border bg-surface p-4 md:grid-cols-[1fr_1fr_2fr_auto]"><Input label="Title" value={values.title ?? ""} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} /><Input label="Subtitle" value={values.subtitle ?? ""} onChange={(event) => setValues((current) => ({ ...current, subtitle: event.target.value }))} /><Input label="Description" value={values.description ?? ""} onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))} /><div className="flex items-end gap-2"><label className="flex items-center gap-2 pb-2 text-xs text-stone"><input type="checkbox" checked={values.enabled} onChange={(event) => setValues((current) => ({ ...current, enabled: event.target.checked }))} /> On</label><Button size="sm" onClick={save} disabled={pending}>Save</Button></div></div>;
}
