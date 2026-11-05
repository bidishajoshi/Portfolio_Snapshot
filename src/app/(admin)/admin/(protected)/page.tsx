import { createClient } from "@/lib/supabase/server";
import { getCloudinary } from "@/lib/cloudinary/config";
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

async function getCloudinaryFallbackCount(): Promise<number> {
  try {
    const cloudinary = getCloudinary();
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: "dr-dslr",
      max_results: 100,
    });
    return res.resources?.length || 0;
  } catch {
    return 0;
  }
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

    // Quick connectivity check
    const { error: pingError } = await supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (pingError) {
      console.warn("DASHBOARD SUPABASE QUERY ERROR:", pingError.message);
      const cCount = await getCloudinaryFallbackCount();
      return {
        ...zeroCounts,
        totalPhotos: cCount,
        publishedPhotos: cCount,
        featuredPhotos: Math.min(3, cCount),
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

    const dbTotal = totalPhotos.count ?? 0;
    // If DB is empty, check Cloudinary
    const finalTotal = dbTotal > 0 ? dbTotal : await getCloudinaryFallbackCount();

    return {
      totalPhotos: finalTotal,
      publishedPhotos: publishedPhotos.count ?? finalTotal,
      featuredPhotos: featuredPhotos.count ?? Math.min(3, finalTotal),
      albums: albums.count ?? 0,
      featuredAlbums: featuredAlbums.count ?? 0,
      categories: categories.count ?? 0,
      unreadInquiries: unreadInquiries.count ?? 0,
      supabaseOnline: true,
    };
  } catch (err) {
    console.error("DASHBOARD SUPABASE UNREACHABLE:", err instanceof Error ? err.message : String(err));
    const cCount = await getCloudinaryFallbackCount();
    return {
      ...zeroCounts,
      totalPhotos: cCount,
      publishedPhotos: cCount,
      featuredPhotos: Math.min(3, cCount),
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
          <p className="text-amber-400 font-semibold text-sm">⚠ Supabase Database Project is Paused or Offline</p>
          <p className="text-amber-300/80 text-xs mt-1">
            Your photos are safely stored in Cloudinary ({counts.totalPhotos} photos detected), but your Supabase database project is currently paused (due to free tier inactivity).
            To restore full database functionality, log in to{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-amber-200 hover:text-white"
            >
              supabase.com/dashboard
            </a>
            , select project <strong>eyrwzaapdhjljaxnuzek</strong> and click <strong>&quot;Resume project&quot;</strong>.
          </p>
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
