"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlbumForm } from "@/components/admin/album-form";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { deleteAlbum, setAlbumMedia } from "@/lib/actions/albums";
import type { Media } from "@/types/database";

type Album = { id: string; title: string; description: string | null; location: string | null; event_date: string | null; cover_media_id: string | null; published: boolean; featured: boolean };

export function AlbumManager({ albums }: { albums: Album[] }) {
  const [items, setItems] = useState(albums);
  const [editing, setEditing] = useState<Album | "new" | null>(null);
  const [mediaAlbum, setMediaAlbum] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const remove = (album: Album) => { if (!confirm(`Delete ${album.title}?`)) return; startTransition(async () => { try { await deleteAlbum(album.id); setItems((current) => current.filter((item) => item.id !== album.id)); toast.success("Album deleted."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete album."); } }); };
  return <><div className="flex justify-end"><button onClick={() => setEditing("new")} className="flex items-center gap-2 rounded-sm bg-cyan-glow px-3 py-2 text-sm text-ink"><Plus size={14} /> New album</button></div><div className="flex flex-col gap-3">{items.map((album) => <div key={album.id} className="flex items-center gap-3 rounded-sm border border-border bg-surface px-4 py-4"><div className="min-w-0 flex-1"><p className="text-sm text-ivory">{album.title}</p><p className="text-xs text-stone-dim">{album.location || "No location"}</p></div><button disabled={pending} onClick={() => setMediaAlbum(album.id)} className="text-xs text-stone hover:text-gold">Add media</button><button disabled={pending} onClick={() => setEditing(album)} className="text-stone hover:text-gold" title="Edit album"><Pencil size={15} /></button><button disabled={pending} onClick={() => remove(album)} className="text-stone hover:text-danger" title="Delete album"><Trash2 size={15} /></button></div>)}{items.length === 0 && <p className="py-12 text-center text-sm text-stone">No albums yet.</p>}</div>{editing && <AlbumForm album={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); window.location.reload(); }} />}{mediaAlbum && <MediaPicker onSelect={(selected: Media[]) => startTransition(async () => { try { await setAlbumMedia(mediaAlbum, selected.map((item) => item.id)); toast.success("Album media updated."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update album media."); } finally { setMediaAlbum(null); } })} onClose={() => setMediaAlbum(null)} />}</>;
}
