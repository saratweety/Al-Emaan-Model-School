import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import TimetableView from "@/components/timetable/TimetableView";
import { CalendarIcon, ChevronRightIcon, ChevronDownIcon, PencilIcon } from "@/components/icons";
import { getToday } from "@/lib/school-calendar";
import { getSchoolDaySchedule, type DayType } from "@/lib/timetable-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Timetable | Al-Emaan Model School",
  description: "View and manage the weekly class timetable.",
};

export default async function TimetablePage() {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("academic_sessions")
    .select("id")
    .eq("is_current", true)
    .maybeSingle();

  const today = getToday();
  const dateLabel = today.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const todayDayType: DayType = today.getDay() === 5 ? "friday" : "weekday";

  const [weekdaySchedule, fridaySchedule] = session
    ? await Promise.all([
        getSchoolDaySchedule(session.id, "weekday"),
        getSchoolDaySchedule(session.id, "friday"),
      ])
    : [{ periods: [], classRows: [] }, { periods: [], classRows: [] }];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Timetable" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
                <CalendarIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Link href="/dashboard" className="hover:text-[#13714C] hover:underline">
                    Dashboard
                  </Link>
                  <ChevronRightIcon className="h-3 w-3" />
                  <span className="font-semibold text-[#13714C]">Timetable</span>
                </div>
                <h1 className="mt-0.5 truncate text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Timetable</h1>
                <p className="text-sm text-gray-500">View today&apos;s class schedule for all classes.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <CalendarIcon className="h-4 w-4 text-[#13714C]" />
                Date: {dateLabel}
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
              <Link
                href="/dashboard/timetable/edit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Timetable
              </Link>
            </div>
          </div>

          <TimetableView
            todayLabel={dateLabel}
            todayDayType={todayDayType}
            weekdaySchedule={weekdaySchedule}
            fridaySchedule={fridaySchedule}
            sessionConfigured={Boolean(session)}
          />
        </main>
      </div>
    </div>
  );
}
