import { AdminSectionPage } from "@/components/admin/admin-section-page";

export const metadata = { title: "Homepage" };

export default function HomepagePage() {
  return <AdminSectionPage title="Homepage" description="Manage the sections and featured content on the homepage." table="homepage_sections" />;
}
