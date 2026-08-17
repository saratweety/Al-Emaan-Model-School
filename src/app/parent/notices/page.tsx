import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import NoticesView from "@/components/parent/NoticesView";
import { getNoticesForParent } from "@/lib/parent-data";
import { markNoticesSeen } from "@/lib/notice-reads";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Notices | Al-Emaan Model School",
  description: "Important announcements from the school.",
};

export default async function ParentNoticesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const notices = await getNoticesForParent();
  if (user) await markNoticesSeen(user.id);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Notices" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <NoticesView notices={notices} />
        </main>
      </div>
    </div>
  );
}
