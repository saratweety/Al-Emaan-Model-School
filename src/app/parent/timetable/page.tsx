import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import TimetableView from "@/components/parent/TimetableView";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildTimetable } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "Timetable | Al-Emaan Model School",
  description: "View your children's class timetable.",
};

export default async function ParentTimetablePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const firstChild = children[0];
  const schedule = firstChild?.classId ? await getChildTimetable(firstChild.classId) : { weekday: [], friday: [] };

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Timetable" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <TimetableView students={children} initialChildId={firstChild?.id ?? ""} initialSchedule={schedule} />
        </main>
      </div>
    </div>
  );
}
