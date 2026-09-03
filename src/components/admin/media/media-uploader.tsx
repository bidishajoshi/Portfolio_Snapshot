"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, RotateCcw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { uploadFileToCloudinary, titleFromFilename } from "@/lib/cloudinary/upload-client";
import type { MediaFolder, Media } from "@/types/database";

interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export function MediaUploader({
  folder,
  onUploaded,
}: {
  folder: MediaFolder;
  onUploaded?: (media: Media) => void;
}) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: QueueItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        title: titleFromFilename(file.name),
        status: "pending" as const,
        progress: 0,
      }));
    setItems((prev) => [...newItems, ...prev]);
  }, []);

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const uploadOne = async (item: QueueItem) => {
    updateItem(item.id, { status: "uploading", progress: 0, error: undefined });
    try {
      const result = await uploadFileToCloudinary(item.file, {
        folder,
        title: item.title || titleFromFilename(item.file.name),
        onProgress: (p) => updateItem(item.id, { progress: p }),
      });
      updateItem(item.id, { status: "done", progress: 100 });
      onUploaded?.(result.media);
    } catch (err) {
      updateItem(item.id, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed.",
      });
    }
  };

  const uploadAll = async () => {
    const pending = items.filter((it) => it.status === "pending" || it.status === "error");
    if (pending.length === 0) return;
    // Upload with limited concurrency so 30+ drags don't flood the browser.
    const concurrency = 3;
    let index = 0;
    async function worker() {
      while (index < pending.length) {
        const item = pending[index++];
        await uploadOne(item);
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));
    const failures = items.filter((it) => it.status === "error").length;
    if (failures === 0) toast.success("All photos uploaded.");
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-6 py-12 text-center cursor-pointer transition-colors",
          dragActive ? "border-gold bg-gold/5" : "border-border hover:border-stone-dim"
        )}
      >
        <UploadCloud size={28} strokeWidth={1.5} className="text-stone" />
        <p className="text-sm text-ivory">Drag photos here, or click to browse</p>
        <p className="text-xs text-stone-dim">Upload as many as you like — JPG, PNG, WebP, or video</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone">{items.length} photo(s) in this batch</p>
            <Button size="sm" onClick={uploadAll}>
              Upload all
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-sm border border-border bg-surface p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-sm object-cover"
                />
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    disabled={item.status === "uploading" || item.status === "done"}
                    placeholder="Name this photo"
                    className="w-full bg-transparent text-sm text-ivory border-b border-border focus:border-gold outline-none pb-0.5 disabled:opacity-60"
                  />
                  <div className="flex items-center gap-2 text-xs">
                    {item.status === "pending" && <span className="text-stone-dim">Ready to upload</span>}
                    {item.status === "uploading" && (
                      <span className="flex items-center gap-1.5 text-stone">
                        <Loader2 size={12} className="animate-spin" /> {item.progress}%
                      </span>
                    )}
                    {item.status === "done" && (
                      <span className="flex items-center gap-1.5 text-gold">
                        <CheckCircle2 size={12} /> Uploaded
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="flex min-w-0 items-start gap-1.5 text-danger" title={item.error}>
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        <span className="truncate">{item.error || "Upload failed."}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {item.status === "error" && (
                    <button
                      onClick={() => uploadOne(item)}
                      className="text-stone hover:text-gold"
                      title="Retry"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  {item.status !== "uploading" && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone hover:text-danger"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
