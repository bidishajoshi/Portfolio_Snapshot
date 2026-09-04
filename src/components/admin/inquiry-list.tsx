"use client";

import { useState, useTransition } from "react";
import { Check, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { deleteInquiry, setInquiryRead, setInquiryStatus } from "@/lib/actions/inquiries";
import WhatsappIcon from "@/components/icons/WhatsappIcon";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  subject?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  location?: string | null;
  budget?: string | null;
  message: string;
  is_read: boolean;
  status?: "new" | "read" | "replied" | "completed" | null;
  created_at: string;
};

export function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const [items, setItems] = useState(inquiries);
  const [isPending, startTransition] = useTransition();

  const updateRead = (item: Inquiry) =>
    startTransition(async () => {
      try {
        await setInquiryRead(item.id, !item.is_read);
        setItems((current) =>
          current.map((entry) => (entry.id === item.id ? { ...entry, is_read: !entry.is_read } : entry))
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update inquiry.");
      }
    });

  const remove = (item: Inquiry) => {
    if (!confirm(`Delete inquiry from ${item.name}?`)) return;
    startTransition(async () => {
      try {
        await deleteInquiry(item.id);
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        toast.success("Inquiry deleted.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not delete inquiry.");
      }
    });
  };

  const getWhatsAppChatUrl = (item: Inquiry) => {
    const rawNumber = item.phone || item.whatsapp;
    if (!rawNumber) {
      return `https://wa.me/9779844437665?text=${encodeURIComponent(
        `Hi ${item.name}, regarding your inquiry for ${item.event_type || item.subject || "photography"}...`
      )}`;
    }
    const cleanNumber = rawNumber.replace(/[^0-9]/g, "");
    const formatted = cleanNumber.length === 10 ? `977${cleanNumber}` : cleanNumber;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(
      `Hi ${item.name}, thank you for contacting DR DSLR regarding your inquiry.`
    )}`;
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-border rounded-xl">
        <p className="text-sm text-stone">No inquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const isNew = item.status === "new" || (!item.is_read && item.status !== "replied" && item.status !== "completed");
        return (
          <article
            key={item.id}
            className={`rounded-xl border bg-surface/80 p-6 backdrop-blur-sm transition-all duration-300 ${
              isNew ? "border-cyan-glow/40 shadow-sm shadow-cyan-glow/5" : "border-border"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-ivory">{item.name}</h2>
                  {isNew && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20 uppercase tracking-wider">
                      New
                    </span>
                  )}
                  {item.status && item.status !== "new" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-stone bg-surface-raised border border-border uppercase tracking-wider">
                      {item.status}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                  <a className="text-cyan-glow hover:underline" href={`mailto:${item.email}`}>
                    {item.email}
                  </a>
                  {item.phone && <span className="text-stone">Tel: {item.phone}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                <a
                  href={getWhatsAppChatUrl(item)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Open WhatsApp chat with client"
                >
                  <WhatsappIcon size={14} />
                  <span>WhatsApp</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>

                <select
                  value={item.status ?? (item.is_read ? "read" : "new")}
                  disabled={isPending}
                  onChange={(event) => {
                    const status = event.target.value as Inquiry["status"];
                    if (!status) return;
                    startTransition(async () => {
                      try {
                        await setInquiryStatus(item.id, status);
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, status, is_read: status !== "new" } : entry
                          )
                        );
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Could not update status.");
                      }
                    });
                  }}
                  className="rounded-md border border-border bg-ink px-2.5 py-1.5 text-xs text-stone outline-none focus:border-gold"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="completed">Completed</option>
                </select>

                <button
                  disabled={isPending}
                  onClick={() => updateRead(item)}
                  className="p-1.5 text-stone hover:text-gold rounded transition-colors"
                  title={item.is_read ? "Mark unread" : "Mark read"}
                >
                  <Check size={16} />
                </button>

                <button
                  disabled={isPending}
                  onClick={() => remove(item)}
                  className="p-1.5 text-stone hover:text-danger rounded transition-colors"
                  title="Delete inquiry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-stone sm:grid-cols-3 bg-ink/40 p-3 rounded-lg border border-border/40">
              {item.subject && <div><span className="text-stone-dim">Subject:</span> {item.subject}</div>}
              {item.event_type && <div><span className="text-stone-dim">Event:</span> {item.event_type}</div>}
              {item.event_date && <div><span className="text-stone-dim">Date:</span> {item.event_date}</div>}
              {item.location && <div><span className="text-stone-dim">Location:</span> {item.location}</div>}
              {item.budget && <div><span className="text-stone-dim">Budget:</span> {item.budget}</div>}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-surface border border-border/50">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ivory/90">{item.message}</p>
            </div>

            <p className="mt-3 text-[11px] text-stone-dim font-mono">{new Date(item.created_at).toLocaleString()}</p>
          </article>
        );
      })}
    </div>
  );
}