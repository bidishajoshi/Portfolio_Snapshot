"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, RotateCcw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { uploadFileToCloudinary, titleFromFilename } from "@/lib/cloudinary/upload-client";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/validation/media";
import type { MediaFolder, Media } from "@/types/database";

interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  loadedBytes: number;
  totalBytes: number;
  progressFormatted?: string;
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
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const validFiles: File[] = [];
    const tooLargeFiles: string[] = [];
    const invalidFormatFiles: string[] = [];

    Array.from(files).forEach((f) => {
      // Check format
      const validFormat =
        f.type.startsWith("image/") ||
        f.type.startsWith("video/") ||
        /\.(jpg|jpeg|png|webp|gif|tiff|tif|bmp|heic|heif|avif|mp4|mov|webm)$/i.test(f.name);

      if (!validFormat) {
        invalidFormatFiles.push(f.name);
        return;
      }

      // Check size (50 MB limit per individual file)
      if (f.size > MAX_FILE_SIZE_BYTES) {
        const fileSizeMb = (f.size / (1024 * 1024)).toFixed(1);
        tooLargeFiles.push(`${f.name} (${fileSizeMb} MB)`);
      } else {
        validFiles.push(f);
      }
    });

    if (invalidFormatFiles.length > 0) {
      toast.error(
        `Unsupported format (allowed: JPG, PNG, WebP, HEIC, TIFF, AVIF): ${invalidFormatFiles.slice(0, 2).join(", ")}${
          invalidFormatFiles.length > 2 ? ` and ${invalidFormatFiles.length - 2} more` : ""
        }`
      );
    }

    if (tooLargeFiles.length > 0) {
      toast.error(
        `File exceeds maximum size of ${MAX_FILE_SIZE_MB} MB: ${tooLargeFiles.slice(0, 3).join(", ")}${
          tooLargeFiles.length > 3 ? ` and ${tooLargeFiles.length - 3} more` : ""
        }. Each photo must be 50 MB or less.`
      );
    }

    const newItems: QueueItem[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      title: titleFromFilename(file.name),
      status: "pending" as const,
      progress: 0,
      loadedBytes: 0,
      totalBytes: file.size,
      progressFormatted: `0 MB / ${(file.size / (1024 * 1024)).toFixed(1)} MB (0%)`,
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
    updateItem(item.id, {
      status: "uploading",
      progress: 0,
      loadedBytes: 0,
      error: undefined,
      progressFormatted: `0 MB / ${(item.file.size / (1024 * 1024)).toFixed(1)} MB (0%)`,
    });

    try {
      const result = await uploadFileToCloudinary(item.file, {
        folder,
        title: item.title || titleFromFilename(item.file.name),
        onProgress: (p) => {
          if (typeof p === "number") {
            const loaded = Math.round((p / 100) * item.file.size);
            updateItem(item.id, {
              progress: p,
              loadedBytes: loaded,
              progressFormatted: `${(loaded / (1024 * 1024)).toFixed(1)} MB / ${(item.file.size / (1024 * 1024)).toFixed(1)} MB (${p}%)`,
            });
          } else {
            updateItem(item.id, {
              progress: p.percent,
              loadedBytes: p.loadedBytes,
              totalBytes: p.totalBytes,
              progressFormatted: `${p.loadedMb} MB / ${p.totalMb} MB (${p.percent}%)`,
            });
          }
        },
      });

      updateItem(item.id, {
        status: "done",
        progress: 100,
        loadedBytes: item.file.size,
        progressFormatted: `${(item.file.size / (1024 * 1024)).toFixed(1)} MB / ${(item.file.size / (1024 * 1024)).toFixed(1)} MB (100%)`,
      });

      onUploaded?.(result.media);
      return true;
    } catch (err) {
      updateItem(item.id, {
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed.",
      });
      return false;
    }
  };

  const uploadAll = async () => {
    const pending = items.filter((it) => it.status === "pending" || it.status === "error");
    if (pending.length === 0) return;

    setIsBatchUploading(true);
    // Limit concurrency to 2 parallel streams for high-res 50 MB files
    const concurrency = 2;
    let index = 0;

    async function worker() {
      while (index < pending.length) {
        const item = pending[index++];
        if (item) {
          await uploadOne(item);
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));
    setIsBatchUploading(false);

    const failures = items.filter((it) => it.status === "error").length;
    if (failures === 0) {
      toast.success("All photos uploaded successfully!");
    } else {
      toast.error(`${failures} upload(s) failed. You can click retry.`);
    }
  };

  // Batch stats
  const totalBatchBytes = items.reduce((sum, it) => sum + it.file.size, 0);
  const totalLoadedBytes = items.reduce((sum, it) => sum + (it.status === "done" ? it.file.size : it.loadedBytes), 0);
  const totalBatchMb = (totalBatchBytes / (1024 * 1024)).toFixed(1);
  const totalLoadedMb = (totalLoadedBytes / (1024 * 1024)).toFixed(1);
  const batchPercent = totalBatchBytes > 0 ? Math.min(100, Math.round((totalLoadedBytes / totalBatchBytes) * 100)) : 0;
  const doneCount = items.filter((it) => it.status === "done").length;

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
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all",
          dragActive
            ? "border-cyan-glow bg-cyan-glow/10 scale-[0.99]"
            : "border-border hover:border-cyan-glow/50 bg-surface/50"
        )}
      >
        <UploadCloud size={32} strokeWidth={1.5} className="text-cyan-glow animate-pulse" />
        <p className="text-sm font-medium text-ivory">Drag & drop high-resolution photos here, or click to browse</p>
        <p className="text-xs text-stone">
          Maximum <span className="text-cyan-glow font-semibold">50 MB per photo</span> &bull; Unlimited batch total &bull; JPG, PNG, WebP, HEIC, TIFF
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/tiff,image/heic,image/heif,image/avif,image/*,video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface">
          {/* Total Batch Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ivory">
                  Batch: {doneCount} of {items.length} uploaded
                </span>
                <span className="text-xs font-mono text-cyan-glow">
                  ({totalLoadedMb} MB / {totalBatchMb} MB &bull; {batchPercent}%)
                </span>
              </div>
              <div className="w-full sm:w-72 h-2 bg-ink rounded-full overflow-hidden mt-1.5 border border-border">
                <div
                  className="h-full bg-gradient-to-r from-cyan-glow to-blue-500 transition-all duration-300"
                  style={{ width: `${batchPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={isBatchUploading}
                onClick={() => setItems([])}
                className="text-xs text-stone hover:text-danger"
              >
                Clear list
              </Button>
              <Button
                size="sm"
                onClick={uploadAll}
                disabled={isBatchUploading || doneCount === items.length}
                className="bg-cyan-glow text-ink hover:bg-cyan-glow/90 font-semibold"
              >
                {isBatchUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" /> Uploading Batch...
                  </>
                ) : (
                  `Upload All (${items.length - doneCount} pending)`
                )}
              </Button>
            </div>
          </div>

          {/* Queue Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {items.map((item) => {
              const fileMb = (item.file.size / (1024 * 1024)).toFixed(1);
              return (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-border bg-ink/60 p-3 hover:border-cyan-glow/40 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md object-cover border border-border"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                        disabled={item.status === "uploading" || item.status === "done"}
                        placeholder="Photo title"
                        className="w-full bg-transparent text-xs font-medium text-ivory border-b border-transparent hover:border-border focus:border-cyan-glow outline-none pb-0.5 truncate disabled:opacity-75"
                      />
                      <div className="text-[11px] text-stone-dim flex items-center gap-1.5 mt-0.5">
                        <span>{fileMb} MB</span>
                        <span>&bull;</span>
                        <span className="uppercase">{item.file.name.split(".").pop()}</span>
                      </div>
                    </div>

                    {/* Status & Progress Bar */}
                    <div className="flex flex-col gap-1 mt-1.5">
                      {item.status === "pending" && (
                        <span className="text-[11px] text-stone-dim">Ready for upload</span>
                      )}

                      {item.status === "uploading" && (
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-glow mb-1">
                            <span className="flex items-center gap-1">
                              <Loader2 size={11} className="animate-spin" />
                              {item.progressFormatted || `${item.progress}%`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-ink rounded-full overflow-hidden border border-border">
                            <div
                              className="h-full bg-cyan-glow transition-all duration-200"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {item.status === "done" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 size={12} /> Uploaded ({fileMb} MB)
                        </span>
                      )}

                      {item.status === "error" && (
                        <span className="flex min-w-0 items-start gap-1 text-[11px] text-danger" title={item.error}>
                          <AlertCircle size={12} className="mt-0.5 shrink-0" />
                          <span className="truncate">{item.error || "Upload failed."}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-between items-end shrink-0 pl-1">
                    {item.status !== "uploading" && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone hover:text-danger p-1 rounded transition-colors"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    )}
                    {item.status === "error" && (
                      <button
                        onClick={() => uploadOne(item)}
                        className="text-cyan-glow hover:text-ivory p-1 rounded transition-colors"
                        title="Retry upload"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
