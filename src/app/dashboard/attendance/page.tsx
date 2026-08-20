import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import MonthFilter from "@/components/dashboard/MonthFilter";
import AttendanceClassFilter from "@/components/dashboard/AttendanceClassFilter";
import MonthlyAttendanceGrid from "@/components/dashboard/MonthlyAttendanceGrid";
import { CheckSquareIcon, UsersIcon, ShieldCheckIcon, XCircleIcon, ClockIcon, FileAlertIcon } from "@/components/icons";
import { getSessionMonths, getCurrentMonthValue, monthValueToISODate, dateToMonthValue } from "@/lib/school-calendar";
import { getClasses } from "@/lib/classes-data";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getMonthlyAttendanceGrid, getLatestAttendanceMonth } from "@/lib/attendance-data";

export const metadata: Metadata = {
  title: "Attendance | Al-Emaan Model School",
  description: "View and monitor students' daily attendance for the selected month.",
};

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; class?: string }>;
}) {
  const { month, class: classId } = await searchParams;

  const [{ classes }, sessionId] = await Promise.all([getClasses(), getCurrentSessionId()]);
  const sessionMonths = getSessionMonths();

  let defaultMonthValue = getCurrentMonthValue();
  if (!month && sessionId) {
    const latestMonthISO = await getLatestAttendanceMonth(sessionId);
    if (latestMonthISO) {
      const [y, m] = latestMonthISO.split("-").map(Number);
      defaultMonthValue = dateToMonthValue(new Date(y, m - 1, 1));
    }
  }

  const selectedMonthValue = month ?? defaultMonthValue;
  const selectedMonth = sessionMonths.find((m) => m.value === selectedMonthValue) ?? sessionMonths[sessionMonths.length - 1];
  const selectedMonthDate = monthValueToISODate(selectedMonthValue);

  const grid = sessionId
    ? await getMonthlyAttendanceGrid(sessionId, selectedMonthDate, classId || null)
    : { days: [], rows: [], totals: { totalStudents: 0, present: 0, absent: 0, late: 0, presentPct: "0.0", absentPct: "0.0", latePct: "0.0", continuousAbsentCount: 0 } };

  const { totals } = grid;

  const statCards = [
    { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL STUDENTS", value: String(totals.totalStudents), sub: "All Classes" },
    { icon: ShieldCheckIcon, iconBg: "bg-[#3AB67D]", label: "PRESENT", value: String(totals.present), sub: `${totals.presentPct}%` },
    { icon: XCircleIcon, iconBg: "bg-[#e0645f]", label: "ABSENT", value: String(totals.absent), valueColor: "text-red-600" as const, sub: `${totals.absentPct}%` },
    { icon: ClockIcon, iconBg: "bg-amber-500", label: "LATE", value: String(totals.late), sub: `${totals.latePct}%` },
    {
      icon: FileAlertIcon,
      iconBg: "bg-red-500",
      label: "CONTINUOUS ABSENT (2+ DAYS)",
      value: String(totals.continuousAbsentCount),
      valueColor: "text-red-600" as const,
      sub: "Students",
    },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Attendance" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={CheckSquareIcon}
            title="Attendance Overview"
            subtitle="View and monitor students' daily attendance for the selected month."
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attendance" }]}
          />

          {!sessionId && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              No current academic session is configured — set one to track attendance.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MonthFilter months={sessionMonths} value={selectedMonthValue} />
            <AttendanceClassFilter classes={classes} value={classId ?? ""} />
          </div>

          <MonthlyAttendanceGrid grid={grid} monthLabel={selectedMonth.label} />
        </main>
      </div>
    </div>
  );
}
