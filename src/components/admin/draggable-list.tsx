"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DraggableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, dragHandle: React.ReactNode) => React.ReactNode;
  className?: string;
}

/**
 * Real drag-and-drop reordering using the native HTML5 DnD API (no extra
 * dependency needed). Order is optimistically updated in the UI, then
 * persisted via `onReorder`, which callers wire to a server action that
 * writes display_order (spec section 61).
 */
export function DraggableList<T>({ items, getId, onReorder, renderItem, className }: DraggableListProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Keep local state in sync when the parent's items change (e.g. after fetch).
  if (items !== localItems && items.map(getId).join() !== localItems.map(getId).join()) {
    // Only resync when the underlying set/order actually differs, to avoid
    // fighting an in-progress drag.
    if (!draggingId) setLocalItems(items);
  }

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const current = [...localItems];
    const fromIndex = current.findIndex((i) => getId(i) === draggingId);
    const toIndex = current.findIndex((i) => getId(i) === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setLocalItems(current);
    onReorder(current.map(getId));
    setDraggingId(null);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {localItems.map((item) => {
        const id = getId(item);
        return (
          <div
            key={id}
            draggable
            onDragStart={() => setDraggingId(id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(id)}
            onDragEnd={() => setDraggingId(null)}
            className={cn(
              "transition-opacity",
              draggingId === id && "opacity-40"
            )}
          >
            {renderItem(
              item,
              <span className="cursor-grab active:cursor-grabbing text-stone-dim hover:text-stone">
                <GripVertical size={16} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
