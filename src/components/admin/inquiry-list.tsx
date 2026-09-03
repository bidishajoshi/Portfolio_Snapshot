"use client";

import { useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteInquiry, setInquiryRead } from "@/lib/actions/inquiries";

type Inquiry = { id: string; name: string; email: string; phone?: string | null; whatsapp?: string | null; event_type?: string | null; event_date?: string | null; location?: string | null; budget?: string | null; message: string; is_read: boolean; created_at: string };

export function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const [items, setItems] = useState(inquiries);
  const [isPending, startTransition] = useTransition();
  const updateRead = (item: Inquiry) => startTransition(async () => { try { await setInquiryRead(item.id, !item.is_read); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: !entry.is_read } : entry)); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update inquiry."); } });
  const remove = (item: Inquiry) => { if (!confirm(`Delete inquiry from ${item.name}?`)) return; startTransition(async () => { try { await deleteInquiry(item.id); setItems((current) => current.filter((entry) => entry.id !== item.id)); toast.success("Inquiry deleted."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete inquiry."); } }); };
  if (items.length === 0) return <div className="py-16 text-center border border-dashed border-border rounded-sm"><p className="text-sm text-stone">No inquiries yet.</p></div>;
  return <div className="flex flex-col gap-3">{items.map((item) => <article key={item.id} className={`rounded-sm border bg-surface p-5 ${item.is_read ? "border-border" : "border-gold/50"}`}><div className="flex items-start justify-between gap-4"><div><h2 className="text-sm text-ivory">{item.name}</h2><a className="text-xs text-gold" href={`mailto:${item.email}`}>{item.email}</a></div><div className="flex gap-3"><button disabled={isPending} onClick={() => updateRead(item)} className="text-stone hover:text-gold" title={item.is_read ? "Mark unread" : "Mark read"}><Check size={16} /></button><button disabled={isPending} onClick={() => remove(item)} className="text-stone hover:text-danger" title="Delete inquiry"><Trash2 size={16} /></button></div></div><div className="mt-4 grid gap-2 text-xs text-stone sm:grid-cols-2">{item.phone && <span>Phone: {item.phone}</span>}{item.whatsapp && <span>WhatsApp: {item.whatsapp}</span>}{item.event_type && <span>Event: {item.event_type}</span>}{item.event_date && <span>Date: {item.event_date}</span>}{item.location && <span>Location: {item.location}</span>}{item.budget && <span>Budget: {item.budget}</span>}</div><p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone">{item.message}</p><p className="mt-4 text-xs text-stone-dim">{new Date(item.created_at).toLocaleString()}</p></article>)}</div>;
}