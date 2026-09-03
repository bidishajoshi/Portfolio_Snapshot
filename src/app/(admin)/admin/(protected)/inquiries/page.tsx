import { listInquiries } from "@/lib/actions/inquiries";
import { InquiryList } from "@/components/admin/inquiry-list";

export const metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  const inquiries = await listInquiries();
  return <div className="flex flex-col gap-8"><div><h1 className="font-display text-3xl text-ivory">Inquiries</h1><p className="text-stone text-sm mt-1">Review booking requests and contact visitors directly.</p></div><InquiryList inquiries={inquiries} /></div>;
}
