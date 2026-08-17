import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import AttendanceReview from "@/components/dashboard/AttendanceReview";
import { CheckSquareIcon, DownloadIcon } from "@/components/icons";
import { getToday } from "@/lib/school-calendar";
import { getClasses } from "@/lib/classes-data";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getAttendanceOverview } from "@/lib/attendance-data";

export const metadata: Metadata = {
  title: "Attendance | Al-Emaan Model School",
  description: "Track daily student attendance by class.",
};

export default async function AttendancePage() {
  const [{ classes }, sessionId] = await Promise.all([getClasses(), getCurrentSessionId()]);
  const todayISO = getToday().toISOString().slice(0, 10);

  const overview = sessionId
    ? await getAttendanceOverview(sessionId, todayISO)
    : { classRows: [], totals: { total: 0, present: 0, absent: 0, leave: 0 }, totalPct: "0.0" };

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Attendance" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={CheckSquareIcon}
            title="Attendance"
            subtitle="Track and manage daily student attendance"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attendance" }]}
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
          </div>

          {!sessionId && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              No current academic session is configured — set one to track attendance.
            </div>
          )}

          <AttendanceReview classes={classes} initialDate={todayISO} initialOverview={overview} />
        </main>
      </div>
    </div>
  );
}
