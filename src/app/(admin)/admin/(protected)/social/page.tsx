import { AdminSectionPage } from "@/components/admin/admin-section-page";

export const metadata = { title: "Social Media" };

export default function SocialPage() {
  return <AdminSectionPage title="Social Media" description="Manage social links used across the site." table="social_links" />;
}
