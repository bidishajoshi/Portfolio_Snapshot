"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Star,
  Plus,
  Mail,
  Calendar,
  Pencil,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import {
  toggleTestimonialPublished,
  deleteTestimonial,
  saveTestimonialAdmin,
} from "@/lib/actions/testimonials";
import type { Testimonial } from "@/types/database";

export function ReviewsManager({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all");
  const [isPending, startTransition] = useTransition();

  // Editing / Create Modal State
  const [editModal, setEditModal] = useState<Partial<Testimonial> | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formReview, setFormReview] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formEventType, setFormEventType] = useState("");
  const [formPublished, setFormPublished] = useState(true);

  const pendingCount = items.filter((i) => !i.published).length;
  const publishedCount = items.filter((i) => i.published).length;

  const filteredItems = items.filter((item) => {
    if (filter === "pending") return !item.published;
    if (filter === "published") return item.published;
    return true;
  });

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, published: nextStatus } : i))
    );

    startTransition(async () => {
      try {
        await toggleTestimonialPublished(id, nextStatus);
        toast.success(
          nextStatus ? "Review published to public site." : "Review hidden from public site."
        );
      } catch (err) {
        toast.error("Failed to update status.");
        setItems(initialTestimonials);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the review by "${name}"?`)) return;

    setItems((prev) => prev.filter((i) => i.id !== id));

    startTransition(async () => {
      try {
        await deleteTestimonial(id);
        toast.success("Review deleted.");
      } catch (err) {
        toast.error("Failed to delete review.");
        setItems(initialTestimonials);
      }
    });
  };

  const openEditModal = (item?: Testimonial) => {
    if (item) {
      setEditModal(item);
      setFormName(item.client_name);
      setFormEmail(item.email || "");
      setFormReview(item.review);
      setFormRating(item.rating ?? 5);
      setFormEventType(item.event_type || "");
      setFormPublished(item.published);
    } else {
      setEditModal({});
      setFormName("");
      setFormEmail("");
      setFormReview("");
      setFormRating(5);
      setFormEventType("");
      setFormPublished(true);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveTestimonialAdmin({
          id: editModal?.id,
          client_name: formName,
          email: formEmail || null,
          review: formReview,
          rating: formRating,
          event_type: formEventType || null,
          published: formPublished,
        });
        toast.success(editModal?.id ? "Review updated." : "New review created.");
        setEditModal(null);
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar with Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filter === "all"
                ? "bg-ivory text-ink shadow"
                : "bg-surface text-stone hover:text-ivory border border-border"
            }`}
          >
            All Reviews ({items.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === "pending"
                ? "bg-amber-500 text-ink shadow font-bold"
                : "bg-surface text-amber-400 hover:bg-amber-500/10 border border-amber-500/30"
            }`}
          >
            <Clock size={13} />
            Pending Approval ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filter === "published"
                ? "bg-emerald-500 text-ink shadow font-bold"
                : "bg-surface text-stone hover:text-ivory border border-border"
            }`}
          >
            Published ({publishedCount})
          </button>
        </div>

        <button
          onClick={() => openEditModal()}
          className="px-4 py-2 bg-gold hover:bg-yellow text-ink font-semibold rounded-md text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      {/* Reviews List Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl bg-surface/30">
          <p className="text-stone text-sm">No client reviews found in this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-5 bg-surface flex flex-col justify-between transition-all ${
                item.published
                  ? "border-border/80"
                  : "border-amber-500/40 bg-amber-500/[0.02]"
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-ivory text-base">{item.client_name}</h4>
                      {item.published ? (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock size={11} /> Pending Moderation
                        </span>
                      )}
                    </div>
                    {item.email && (
                      <p className="text-stone-dim text-xs flex items-center gap-1 mt-0.5">
                        <Mail size={12} /> {item.email}
                      </p>
                    )}
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={
                          s <= (item.rating ?? 5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-stone-dim/30"
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-stone text-sm leading-relaxed mb-4 italic">
                  &quot;{item.review}&quot;
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-dim font-mono mb-4">
                  {item.event_type && (
                    <span className="bg-surface-raised px-2 py-1 rounded border border-border/50 text-ivory/80">
                      {item.event_type}
                    </span>
                  )}
                  {item.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-2">
                <button
                  onClick={() => handleTogglePublish(item.id, item.published)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    item.published
                      ? "bg-stone/10 hover:bg-stone/20 text-stone hover:text-ivory"
                      : "bg-emerald-500 text-ink hover:bg-emerald-400 font-bold"
                  }`}
                >
                  {item.published ? (
                    <>
                      <EyeOff size={13} /> Unpublish
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} /> Approve & Publish
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded text-stone hover:text-gold hover:bg-surface-raised transition-colors cursor-pointer"
                    title="Edit Review"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.client_name)}
                    className="p-1.5 rounded text-stone hover:text-danger hover:bg-surface-raised transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <h3 className="font-display text-xl text-ivory mb-4">
              {editModal.id ? "Edit Review / Testimonial" : "Create Testimonial"}
            </h3>

            <form onSubmit={handleSaveModal} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-semibold">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded border border-border bg-ink px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full rounded border border-border bg-ink px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-semibold">
                    Rating (1-5 Stars)
                  </label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full rounded border border-border bg-ink px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-semibold">
                    Event / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wedding, Portrait"
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value)}
                    className="w-full rounded border border-border bg-ink px-3 py-2 text-sm text-ivory outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-stone mb-1 font-semibold">
                  Review Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formReview}
                  onChange={(e) => setFormReview(e.target.value)}
                  className="w-full rounded border border-border bg-ink px-3 py-2 text-sm text-ivory outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="published_check"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="published_check" className="text-sm text-ivory cursor-pointer">
                  Publish on Website
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 rounded text-xs text-stone hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-gold hover:bg-yellow text-ink font-semibold rounded text-xs uppercase tracking-wider"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
