import type { Metadata } from "next";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import NoticesList from "@/components/teacher/NoticesList";
import { BellIcon, InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { markNoticesSeen } from "@/lib/notice-reads";
import type { NoticeRow } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "Notices | Al-Emaan Model School",
  description: "Important announcements and updates from the principal.",
};

export default async function TeacherNoticesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) await markNoticesSeen(user.id);

  const { data } = await supabase
    .from("notices")
    .select("id, title, description, notice_type, publish_date")
    .in("audience", ["everyone", "teachers"])
    .order("publish_date", { ascending: false })
    .returns<{ id: string; title: string; description: string; notice_type: string; publish_date: string }[]>();

  const notices: NoticeRow[] = (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    noticeType: n.notice_type,
    publishDate: new Date(n.publish_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="Notices" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={BellIcon}
            title="Notices"
            subtitle="Important announcements and updates from the principal"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "Notices" }]}
          />

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Notices are created and published by the principal. You&apos;ll see school announcements here once any are published.
          </div>

          <NoticesList notices={notices} />
        </main>
      </div>
    </div>
  );
}
