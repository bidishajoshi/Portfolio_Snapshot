"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { deleteContent, saveContent, type EditableContent } from "@/lib/actions/content";
import type { Media } from "@/types/database";

export interface EditableRecord {
  id: string;
  title: string;
  description?: string | null;
  introduction?: string | null;
  location?: string | null;
  date?: string | null;
  clientName?: string | null;
  review?: string | null;
  eventType?: string | null;
  mediaId?: string | null;
  categoryId?: string | null;
  altText?: string | null;
  published?: boolean;
  featured?: boolean;
}

export function ContentEditor({ content, records, categories = [], canDelete = true }: { content: EditableContent; records: EditableRecord[]; categories?: Array<{ id: string; name: string }>; canDelete?: boolean }) {
  const [editing, setEditing] = useState<EditableRecord | "new" | null>(null);
  const [isPending, startTransition] = useTransition();
  const remove = (record: EditableRecord) => {
    if (!confirm(`Delete ${record.title}?`)) return;
    startTransition(async () => {
      try { await deleteContent(content, record.id); toast.success("Deleted."); window.location.reload(); }
      catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete."); }
    });
  };
  return (
    <>
      <div className="flex justify-end"><Button size="sm" onClick={() => setEditing("new")}><Plus size={14} /> New {content}</Button></div>
      <div className="flex flex-col gap-3">
        {records.map((record) => <div key={record.id} className="flex items-center gap-3 rounded-sm border border-border bg-surface px-4 py-3"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm text-ivory font-medium truncate">{record.title}</p>{record.featured && <span className="rounded-sm bg-gold/10 text-gold text-[10px] uppercase font-bold px-1.5 py-0.5 border border-gold/20">Featured</span>}</div><p className="text-xs text-stone-dim truncate">{record.review || record.description || record.introduction || "No description yet."}</p></div><span className="text-xs text-stone-dim shrink-0">{record.published === false ? "Draft" : "Published"}</span><button className="text-stone hover:text-gold" title={`Edit ${content}`} onClick={() => setEditing(record)}><Pencil size={15} /></button>{canDelete && <button disabled={isPending} className="text-stone hover:text-danger" title={`Delete ${content}`} onClick={() => remove(record)}><Trash2 size={15} /></button>}</div>)}
        {records.length === 0 && <p className="py-12 text-center text-sm text-stone">No {content}s yet. Create one to add text and media.</p>}
      </div>
      {editing && <ContentForm content={content} record={editing === "new" ? null : editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); window.location.reload(); }} isPending={isPending} startTransition={startTransition} />}
    </>
  );
}

function ContentForm({ content, record, categories = [], onClose, onSaved, isPending, startTransition }: { content: EditableContent; record: EditableRecord | null; categories?: Array<{ id: string; name: string }>; onClose: () => void; onSaved: () => void; isPending: boolean; startTransition: React.TransitionStartFunction }) {
  const [title, setTitle] = useState(record?.title ?? "");
  const [description, setDescription] = useState(record?.description ?? "");
  const [introduction, setIntroduction] = useState(record?.introduction ?? "");
  const [location, setLocation] = useState(record?.location ?? "");
  // Date stored as YYYY-MM-DD for date inputs; empty string = no date
  const [date, setDate] = useState(record?.date ?? "");
  const [clientName, setClientName] = useState(record?.clientName ?? "");
  const [review, setReview] = useState(record?.review ?? "");
  const [eventType, setEventType] = useState(record?.eventType ?? "");
  const [media, setMedia] = useState<Media | null>(null);
  const [categoryId, setCategoryId] = useState(record?.categoryId ?? "");
  const [altText, setAltText] = useState(record?.altText ?? "");
  const [published, setPublished] = useState(record?.published ?? true);
  const [featured, setFeatured] = useState(record?.featured ?? (content === "photo" ? true : false));
  const [picker, setPicker] = useState(false);
  const isTestimonial = content === "testimonial";
  const isStory = content === "story";
  const isFilm = content === "film";
  const isPhoto = content === "photo";
  const hasDateField = isStory || isFilm || isPhoto;
  const hasLocationField = isStory || isFilm || isPhoto;
  const hasFeaturedField = isStory || isFilm || content === "album" || isPhoto;
  const hasCategoryField = (isPhoto || isStory) && categories.length > 0;

  const save = () => startTransition(async () => {
    try {
      // Validate date before sending to server — must be YYYY-MM-DD or empty
      const cleanDate = date.trim();
      if (cleanDate && !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        toast.error("Date must be in YYYY-MM-DD format, or leave it blank.");
        return;
      }
      if (isPhoto && !record?.id && !media?.id && !record?.mediaId) {
        toast.error("Please choose or upload a photo.");
        return;
      }
      await saveContent({
        content,
        id: record?.id,
        title: title || clientName,
        description: description || undefined,
        introduction: introduction || undefined,
        location: location || undefined,
        date: cleanDate || undefined,
        clientName: clientName || undefined,
        review: review || undefined,
        eventType: eventType || undefined,
        mediaId: media?.id ?? record?.mediaId ?? null,
        categoryId: categoryId || undefined,
        altText: altText || undefined,
        published,
        featured,
      });
      toast.success("Saved.");
      onSaved();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save."); }
  });

  const mediaFolder = content === "film" ? "film" : content === "story" ? "story" : content === "testimonial" ? "testimonial" : "photo";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm border border-border bg-surface p-6" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-xl text-ivory">{record ? "Edit" : "New"} {content}</p>
          <button onClick={onClose} className="text-stone hover:text-ivory"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-4">
          {isTestimonial ? (
            <>
              <Input label="Client name" value={clientName} onChange={(event) => setClientName(event.target.value)} autoFocus />
              <Input label="Event type (e.g. Wedding, Portrait, Commercial)" value={eventType} onChange={(event) => setEventType(event.target.value)} />
              <Field label="Review" value={review} onChange={setReview} />
            </>
          ) : (
            <>
              <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
              {hasCategoryField && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-stone">Category</label>
                  <select
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="bg-surface border border-border rounded-sm px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-gold"
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Field label={isStory ? "Introduction" : isPhoto ? "Caption" : "Description"} value={isStory ? introduction : description} onChange={isStory ? setIntroduction : setDescription} />
              {hasLocationField && <Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} />}
              {hasDateField && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-stone">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="bg-surface border border-border rounded-sm px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-gold"
                  />
                </div>
              )}
            </>
          )}
          <div>
            <p className="text-sm text-stone mb-2">{isTestimonial ? "Client photo" : "Cover photo"}</p>
            <Button variant="secondary" size="sm" onClick={() => setPicker(true)}>Choose photo</Button>
            {media && <span className="ml-3 text-xs text-gold">{media.title}</span>}
            {!media && record?.mediaId && <span className="ml-3 text-xs text-stone-dim">Photo attached</span>}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-stone">
              <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Published
            </label>
            {hasFeaturedField && (
              <label className="flex items-center gap-2 text-sm text-stone">
                <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured
              </label>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
      {picker && <MediaPicker multiple={false} folder={mediaFolder as never} onSelect={(items) => setMedia(items[0] ?? null)} onClose={() => setPicker(false)} />}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-stone">{label}</label>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="bg-ink border border-border rounded-sm px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-gold resize-none" />
    </div>
  );
}
