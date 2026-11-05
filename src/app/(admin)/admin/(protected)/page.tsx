import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { Images, BookImage, Tags, Star, Mail, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Dashboard" };

interface DashboardCounts {
  totalPhotos: number;
  publishedPhotos: number;
  featuredPhotos: number;
  albums: number;
  featuredAlbums: number;
  categories: number;
  unreadInquiries: number;
  supabaseOnline: boolean;
  supabaseError?: string;
}

async function getCounts(): Promise<DashboardCounts> {
  const zeroCounts = {
    totalPhotos: 0,
    publishedPhotos: 0,
    featuredPhotos: 0,
    albums: 0,
    featuredAlbums: 0,
    categories: 0,
    unreadInquiries: 0,
  };

  try {
    const supabase = await createClient();

    // Quick connectivity check — if the project is paused, this will throw
    const { error: pingError } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (pingError) {
      console.warn("DASHBOARD SUPABASE QUERY ERROR:", pingError.message);
      return {
        ...zeroCounts,
        supabaseOnline: false,
        supabaseError: pingError.message,
      };
    }

    const [
      totalPhotos,
      publishedPhotos,
      featuredPhotos,
      albums,
      featuredAlbums,
      categories,
      unreadInquiries,
    ] = await Promise.all([
      supabase.from("photos").select("id", { count: "exact", head: true }),
      supabase.from("photos").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("photos").select("id", { count: "exact", head: true }).eq("featured", true),
      supabase.from("albums").select("id", { count: "exact", head: true }),
      supabase.from("albums").select("id", { count: "exact", head: true }).eq("featured", true),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]);

    return {
      totalPhotos: totalPhotos.count ?? 0,
      publishedPhotos: publishedPhotos.count ?? 0,
      featuredPhotos: featuredPhotos.count ?? 0,
      albums: albums.count ?? 0,
      featuredAlbums: featuredAlbums.count ?? 0,
      categories: categories.count ?? 0,
      unreadInquiries: unreadInquiries.count ?? 0,
      supabaseOnline: true,
    };
  } catch (err) {
    console.error("DASHBOARD SUPABASE UNREACHABLE:", err instanceof Error ? err.message : String(err));
    return {
      ...zeroCounts,
      supabaseOnline: false,
      supabaseError: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  return (
    <div>
      <h1 className="font-display text-3xl text-ivory">Dashboard</h1>
      <p className="text-stone text-sm mt-1">A live snapshot of the studio, pulled straight from the database.</p>

      {!counts.supabaseOnline && (
        <div className="mt-6 p-4 rounded-lg border border-amber-500/40 bg-amber-500/10">
          <p className="text-amber-400 font-semibold text-sm">⚠ Database Offline</p>
          <p className="text-amber-300/80 text-xs mt-1">
            Supabase project is unreachable (likely paused due to inactivity on the free tier).
            Go to{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-amber-200 hover:text-white"
            >
              supabase.com/dashboard
            </a>
            {" "}→ select your project → click <strong>&quot;Resume project&quot;</strong>.
            Once resumed, refresh this page.
          </p>
          {counts.supabaseError && (
            <p className="text-amber-400/60 text-[11px] mt-2 font-mono">{counts.supabaseError}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <DashboardCard icon={Images} label="Total Photos" value={counts.totalPhotos} href="/admin/media" />
        <DashboardCard icon={CheckCircle2} label="Published Photos" value={counts.publishedPhotos} href="/admin/media" />
        <DashboardCard icon={Star} label="Featured Photos" value={counts.featuredPhotos} href="/admin/media" />
        <DashboardCard icon={BookImage} label="Albums" value={counts.albums} href="/admin/albums" />
        <DashboardCard icon={Star} label="Featured Albums" value={counts.featuredAlbums} href="/admin/albums" />
        <DashboardCard icon={Tags} label="Categories" value={counts.categories} href="/admin/categories" />
        <DashboardCard
          icon={Mail}
          label="Unread Inquiries"
          value={counts.unreadInquiries}
          href="/admin/inquiries"
          highlight={counts.unreadInquiries > 0}
        />
      </div>
    </div>
  );
}
