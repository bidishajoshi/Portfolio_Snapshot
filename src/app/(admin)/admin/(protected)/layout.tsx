import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-suspenders: middleware already redirects unauthenticated
  // visitors, but every server-rendered admin page re-verifies here too,
  // since middleware is UX, not the security boundary (spec section 58).
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-ink">
      <AdminNav adminName={session.profile.display_name} />
      <main className="flex-1 min-w-0 px-6 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
