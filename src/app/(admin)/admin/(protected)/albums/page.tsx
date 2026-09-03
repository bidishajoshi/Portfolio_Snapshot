import { AdminSectionPage } from "@/components/admin/admin-section-page";

export const metadata = { title: "Albums" };

export default function AlbumsPage() {
  return <AdminSectionPage title="Albums" description="Organize photographs into published collections." table="albums" />;
}
