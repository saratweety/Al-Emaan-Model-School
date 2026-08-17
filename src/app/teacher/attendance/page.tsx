import type { Metadata } from "next";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import AttendanceRoster from "@/components/teacher/AttendanceRoster";
import { CheckSquareIcon, InfoIcon } from "@/components/icons";
import { getTeacherRoster } from "@/lib/teacher-roster";

export const metadata: Metadata = {
  title: "Mark Attendance | Al-Emaan Model School",
  description: "Select a class and mark attendance for your students.",
};

export default async function TeacherAttendancePage() {
  const { roster, error } = await getTeacherRoster();

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="Mark Attendance" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={CheckSquareIcon}
            title="Mark Attendance"
            subtitle="Select a class and mark attendance for the day"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "Mark Attendance" }]}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load your students: {error}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <AttendanceRoster students={roster} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
