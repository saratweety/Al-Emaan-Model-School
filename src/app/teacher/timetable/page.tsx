import type { Metadata } from "next";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import MyTimetableView from "@/components/teacher/MyTimetableView";
import { CalendarIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getTeacherSchedule } from "@/lib/timetable-data";

export const metadata: Metadata = {
  title: "My Timetable | Al-Emaan Model School",
  description: "View your weekly teaching schedule.",
};

export default async function TeacherTimetablePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionId = await getCurrentSessionId();
  const schedule =
    sessionId && user ? await getTeacherSchedule(sessionId, user.id) : { weekday: [], friday: [] };

  const hasSchedule = schedule.weekday.length > 0 || schedule.friday.length > 0;

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="My Timetable" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={CalendarIcon}
            title="My Timetable"
            subtitle="Your weekly teaching schedule across assigned classes"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "My Timetable" }]}
          />

          {hasSchedule ? (
            <MyTimetableView weekday={schedule.weekday} friday={schedule.friday} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A2E494]/25 text-[#13714C]">
                <CalendarIcon className="h-7 w-7" />
              </span>
              <p className="text-base font-bold text-[#0f4d34]">No timetable published yet</p>
              <p className="max-w-sm text-sm text-gray-500">
                Your weekly teaching schedule will appear here once the principal sets it up.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
