"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { saveAlbum } from "@/lib/actions/albums";
import type { Media } from "@/types/database";

export function AlbumForm({ album, onClose, onSaved }: { album: { id?: string; title?: string | null; description?: string | null; location?: string | null; event_date?: string | null; cover_media_id?: string | null; published?: boolean; featured?: boolean } | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(album?.title ?? "");
  const [description, setDescription] = useState(album?.description ?? "");
  const [location, setLocation] = useState(album?.location ?? "");
  const [eventDate, setEventDate] = useState(album?.event_date ?? "");
  const [published, setPublished] = useState(album?.published ?? true);
  const [featured, setFeatured] = useState(album?.featured ?? true);
  const [cover, setCover] = useState<Media | null>(null);
  const [picker, setPicker] = useState(false);
  const [pending, startTransition] = useTransition();
  const save = () => startTransition(async () => { try { if (!title.trim()) throw new Error("Give this album a title."); await saveAlbum({ id: album?.id, title, description, location, eventDate, coverMediaId: cover?.id ?? album?.cover_media_id, published, featured }); toast.success("Album saved."); onSaved(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save album."); } });
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4" onClick={onClose}><div className="w-full max-w-lg rounded-sm border border-border bg-surface p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between mb-5"><p className="font-display text-xl text-ivory">{album ? "Edit album" : "New album"}</p><button onClick={onClose} className="text-stone hover:text-ivory"><X size={18} /></button></div><div className="flex flex-col gap-4"><Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus /><Input label="Location" value={location} onChange={(event) => setLocation(event.target.value)} /><Input label="Date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} /><div><label className="text-sm text-stone">Description</label><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-1.5 w-full resize-none rounded-sm border border-border bg-ink px-3.5 py-2.5 text-sm text-ivory outline-none focus:border-gold" /></div><div className="flex gap-5 text-sm text-stone"><label className="flex items-center gap-2"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Published</label><label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured</label></div><Button variant="secondary" size="sm" onClick={() => setPicker(true)}>Choose cover photo</Button><div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={save} disabled={pending}>Save</Button></div></div></div>{picker && <MediaPicker folder="album" multiple={false} onSelect={(items) => setCover(items[0] ?? null)} onClose={() => setPicker(false)} />}</div>;
}