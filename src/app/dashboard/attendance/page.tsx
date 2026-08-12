import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import DonutChart from "@/components/dashboard/DonutChart";
import {
  UsersIcon,
  ShieldCheckIcon,
  XCircleIcon,
  CalendarIcon,
  CheckSquareIcon,
  DownloadIcon,
  SearchIcon,
  GraduationCapIcon,
  ChevronDownIcon,
} from "@/components/icons";
import { formatShortDate, getToday } from "@/lib/school-calendar";

export const metadata: Metadata = {
  title: "Attendance | Al-Emaan Model School",
  description: "Track daily student attendance by class.",
};

const statCards = [
  { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL STUDENTS", value: "485", sub: "All Students" },
  { icon: ShieldCheckIcon, iconBg: "bg-[#3AB67D]", label: "PRESENT TODAY", value: "441", sub: "90.9%" },
  { icon: XCircleIcon, iconBg: "bg-[#e0645f]", label: "ABSENT TODAY", value: "26", sub: "5.4%", valueColor: "text-red-600" },
  { icon: CalendarIcon, iconBg: "bg-[#4a90e2]", label: "LEAVE TODAY", value: "0", sub: "0%", valueColor: "text-blue-600" },
];

const attendanceByClass = [
  { section: "Grade 1 - A", grade: "Grade 1", total: 22, present: 20, absent: 2, leave: 0, pct: "90.9%" },
  { section: "Grade 1 - B", grade: "Grade 1", total: 20, present: 18, absent: 2, leave: 0, pct: "90.0%" },
  { section: "Grade 2 - A", grade: "Grade 2", total: 23, present: 21, absent: 2, leave: 0, pct: "91.3%" },
  { section: "Grade 2 - B", grade: "Grade 2", total: 21, present: 19, absent: 2, leave: 0, pct: "90.5%" },
  { section: "Grade 3 - A", grade: "Grade 3", total: 24, present: 21, absent: 3, leave: 0, pct: "87.5%" },
  { section: "Grade 3 - B", grade: "Grade 3", total: 22, present: 20, absent: 2, leave: 0, pct: "90.9%" },
  { section: "Grade 4 - A", grade: "Grade 4", total: 21, present: 19, absent: 2, leave: 0, pct: "90.5%" },
  { section: "Grade 4 - B", grade: "Grade 4", total: 22, present: 20, absent: 2, leave: 0, pct: "90.9%" },
  { section: "Grade 5 - A", grade: "Grade 5", total: 23, present: 21, absent: 2, leave: 0, pct: "91.3%" },
  { section: "Grade 5 - B", grade: "Grade 5", total: 21, present: 19, absent: 2, leave: 0, pct: "90.5%" },
];

const totals = attendanceByClass.reduce(
  (acc, row) => ({
    total: acc.total + row.total,
    present: acc.present + row.present,
    absent: acc.absent + row.absent,
    leave: acc.leave + row.leave,
  }),
  { total: 0, present: 0, absent: 0, leave: 0 }
);
const totalPct = ((totals.present / totals.total) * 100).toFixed(1);

export default function AttendancePage() {
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
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* Search + class filter */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student by name, admission no. or roll no..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <GraduationCapIcon className="h-4 w-4" />
              All Classes
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Date selector + export */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              <CalendarIcon className="h-4 w-4 text-[#13714C]" />
              {formatShortDate(getToday())} (Today)
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Attendance by class */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f4d34]">
                Attendance by Class
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">#</th>
                      <th className="px-3 py-3">Class / Section</th>
                      <th className="px-3 py-3">Grade</th>
                      <th className="px-3 py-3">Total Students</th>
                      <th className="px-3 py-3">Present</th>
                      <th className="px-3 py-3">Absent</th>
                      <th className="px-3 py-3">Leave</th>
                      <th className="rounded-r-xl px-3 py-3">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceByClass.map((row, i) => (
                      <tr key={row.section} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-gray-800">{row.section}</td>
                        <td className="px-3 py-2.5 text-gray-600">{row.grade}</td>
                        <td className="px-3 py-2.5 text-gray-600">{row.total}</td>
                        <td className="px-3 py-2.5 font-semibold text-[#13714C]">{row.present}</td>
                        <td className="px-3 py-2.5 font-semibold text-red-600">{row.absent}</td>
                        <td className="px-3 py-2.5 font-semibold text-blue-600">{row.leave}</td>
                        <td className="px-3 py-2.5 font-bold text-gray-800">{row.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F4F6F5] font-bold text-gray-800">
                      <td className="rounded-l-xl px-3 py-3" colSpan={3}>
                        TOTAL
                      </td>
                      <td className="px-3 py-3">{totals.total}</td>
                      <td className="px-3 py-3 text-[#13714C]">{totals.present}</td>
                      <td className="px-3 py-3 text-red-600">{totals.absent}</td>
                      <td className="px-3 py-3 text-blue-600">{totals.leave}</td>
                      <td className="rounded-r-xl px-3 py-3">{totalPct}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Overview donut */}
            <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 self-start text-sm font-bold uppercase tracking-wide text-[#0f4d34]">
                Attendance Overview (Today)
              </h2>
              <DonutChart
                centerValue={String(totals.total)}
                centerLabel="Total Students"
                segments={[
                  { value: totals.present, color: "#13714C" },
                  { value: totals.absent, color: "#ef4444" },
                  { value: totals.leave, color: "#3b82f6" },
                ]}
              />
              <ul className="mt-5 w-full space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#13714C]" /> Present
                  </span>
                  <span className="font-semibold text-gray-800">
                    {totals.present} ({totalPct}%)
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Absent
                  </span>
                  <span className="font-semibold text-gray-800">
                    {totals.absent} ({(100 - Number(totalPct)).toFixed(1)}%)
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Leave
                  </span>
                  <span className="font-semibold text-gray-800">{totals.leave} (0%)</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
