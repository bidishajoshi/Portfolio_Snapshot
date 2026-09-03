import { AdminSectionPage } from "@/components/admin/admin-section-page";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <AdminSectionPage title="Analytics" description="Review site activity and portfolio performance." table="analytics_events" />;
}
