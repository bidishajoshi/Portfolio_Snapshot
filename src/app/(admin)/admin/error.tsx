"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6 text-center">
      <div className="max-w-md w-full p-8 border border-border rounded-xl bg-surface/60 backdrop-blur-md shadow-2xl">
        <h2 className="text-2xl font-display text-ivory mb-2">Admin Portal Notice</h2>
        <p className="text-sm text-stone mb-6">
          {error.message || "An issue occurred while loading admin data. Supabase may be paused or configuring."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()} size="sm">
            Try again
          </Button>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-200 px-3.5 py-1.5 text-xs bg-surface-raised text-ivory border border-border hover:border-stone-dim"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
