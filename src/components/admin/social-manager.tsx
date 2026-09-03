"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteSocialLink, saveSocialLink } from "@/lib/actions/social";

type LinkRecord = { id: string; platform: string; label: string | null; url: string; enabled: boolean };

export function SocialManager({ links }: { links: LinkRecord[] }) {
  const [items, setItems] = useState(links);
  const [editing, setEditing] = useState<LinkRecord | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const remove = (item: LinkRecord) => { if (!confirm(`Delete ${item.platform}?`)) return; startTransition(async () => { try { await deleteSocialLink(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); toast.success("Link deleted."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete link."); } }); };
  return <><div className="flex justify-end"><Button size="sm" onClick={() => setEditing("new")}><Plus size={14} /> New link</Button></div><div className="flex flex-col gap-3">{items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-sm border border-border bg-surface px-4 py-3"><div className="min-w-0 flex-1"><p className="text-sm text-ivory">{item.label || item.platform}</p><p className="truncate text-xs text-stone-dim">{item.url}</p></div><span className="text-xs text-stone-dim">{item.enabled ? "Enabled" : "Hidden"}</span><button disabled={pending} onClick={() => setEditing(item)} className="text-stone hover:text-gold" title="Edit link"><Pencil size={15} /></button><button disabled={pending} onClick={() => remove(item)} className="text-stone hover:text-danger" title="Delete link"><Trash2 size={15} /></button></div>)}{items.length === 0 && <p className="py-12 text-center text-sm text-stone">No social links yet.</p>}</div>{editing && <SocialForm link={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={(saved) => { setItems((current) => editing === "new" ? [...current, { ...saved, id: saved.id }] : current.map((item) => item.id === saved.id ? { ...item, ...saved } : item)); setEditing(null); }} pending={pending} startTransition={startTransition} />}</>;
}

function SocialForm({ link, onClose, onSaved, pending, startTransition }: { link: LinkRecord | null; onClose: () => void; onSaved: (link: LinkRecord) => void; pending: boolean; startTransition: React.TransitionStartFunction }) {
  const [platform, setPlatform] = useState(link?.platform ?? "instagram");
  const [label, setLabel] = useState(link?.label ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const save = () => startTransition(async () => { try { await saveSocialLink({ id: link?.id, platform, label, url }); onSaved({ id: link?.id ?? crypto.randomUUID(), platform, label: label || null, url, enabled: true }); toast.success("Link saved."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save link."); } });
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4" onClick={onClose}><div className="w-full max-w-lg rounded-sm border border-border bg-surface p-6" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><p className="font-display text-xl text-ivory">{link ? "Edit" : "New"} social link</p><button onClick={onClose} className="text-stone hover:text-ivory"><X size={18} /></button></div><div className="flex flex-col gap-4"><Input label="Platform" value={platform} onChange={(event) => setPlatform(event.target.value)} /><Input label="Label" value={label} onChange={(event) => setLabel(event.target.value)} /><Input label="URL" type="url" value={url} onChange={(event) => setUrl(event.target.value)} /><div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" onClick={save} disabled={pending || !url}>Save</Button></div></div></div></div>;
}
