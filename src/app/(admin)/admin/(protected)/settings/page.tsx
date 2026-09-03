import { AdminSectionPage } from "@/components/admin/admin-section-page";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return <AdminSectionPage title="Settings" description="Manage global site identity and contact settings." table="site_settings" />;
}
