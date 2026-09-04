import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { Images, BookImage, Tags, Star, Mail, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Dashboard" };

async function getCounts() {
  try {
    const supabase = await createClient();

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
    };
  } catch {
    return {
      totalPhotos: 0,
      publishedPhotos: 0,
      featuredPhotos: 0,
      albums: 0,
      featuredAlbums: 0,
      categories: 0,
      unreadInquiries: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  return (
    <div>
      <h1 className="font-display text-3xl text-ivory">Dashboard</h1>
      <p className="text-stone text-sm mt-1">A live snapshot of the studio, pulled straight from the database.</p>

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
