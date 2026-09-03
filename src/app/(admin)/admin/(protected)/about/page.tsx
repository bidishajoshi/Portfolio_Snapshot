import { AdminSectionPage } from "@/components/admin/admin-section-page";

export const metadata = { title: "About" };

export default function AboutPage() {
  return <AdminSectionPage title="About" description="Manage your profile, experience, equipment, and awards." table="about_content" />;
}
