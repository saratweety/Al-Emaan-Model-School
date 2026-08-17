import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import AttendanceView from "@/components/parent/AttendanceView";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildAttendanceMonth } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "Attendance | Al-Emaan Model School",
  description: "View your child's daily attendance record.",
};

export default async function ParentAttendancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const days = children[0] ? await getChildAttendanceMonth(children[0].id, year, month) : [];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Attendance" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <AttendanceView
            students={children}
            initialChildId={children[0]?.id ?? ""}
            initialYear={year}
            initialMonth={month}
            initialDays={days}
          />
        </main>
      </div>
    </div>
  );
}
