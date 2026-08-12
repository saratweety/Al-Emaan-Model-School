import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  AwardIcon,
  ClockIcon,
  CheckSquareIcon,
  ClipboardListIcon,
  BuildingIcon,
  ChevronDownIcon,
  EyeOutlineIcon,
  PencilIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Exams | Al-Emaan Model School",
  description: "Create and manage exams for each class.",
};

const statCards = [
  { icon: AwardIcon, iconBg: "bg-[#13714C]", label: "TOTAL EXAMS", value: "8", sub: "This Session" },
  { icon: ClockIcon, iconBg: "bg-amber-500", label: "UPCOMING", value: "2", sub: "Not Started" },
  { icon: CheckSquareIcon, iconBg: "bg-blue-500", label: "ONGOING", value: "1", sub: "In Progress" },
  { icon: ClipboardListIcon, iconBg: "bg-[#3AB67D]", label: "COMPLETED", value: "5", sub: "Results Published" },
];

const exams = [
  { name: "Mid Term Exam", cls: "Grade 1 - Grade 8", start: "10 Oct 2026", end: "20 Oct 2026", status: "Upcoming" },
  { name: "Class Test - Chapter 4", cls: "Grade 5", start: "18 Aug 2026", end: "18 Aug 2026", status: "Upcoming" },
  { name: "Monthly Test - August", cls: "All Classes", start: "11 Aug 2026", end: "14 Aug 2026", status: "Ongoing" },
  { name: "Quarterly Exam", cls: "Grade 3 - Grade 6", start: "20 Jul 2026", end: "28 Jul 2026", status: "Completed" },
  { name: "Final Term Exam", cls: "Grade 1 - Grade 2", start: "01 May 2026", end: "10 May 2026", status: "Completed" },
  { name: "Mid Term Exam", cls: "Grade 1 - Grade 8", start: "10 Mar 2026", end: "18 Mar 2026", status: "Completed" },
];

const statusStyles: Record<string, string> = {
  Upcoming: "bg-amber-100 text-amber-700",
  Ongoing: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

export default function ExamsPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Exams" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={AwardIcon}
            title="Exams"
            subtitle="Create and manage exams for each class"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exams" }]}
            actionLabel="Add Exam"
            actionHref="/dashboard/exams/add"
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <BuildingIcon className="h-4 w-4 text-[#13714C]" />
              All Classes
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <ClockIcon className="h-4 w-4 text-[#13714C]" />
              All Status
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Exams table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Exam Name</th>
                    <th className="px-3 py-3">Class</th>
                    <th className="px-3 py-3">Start Date</th>
                    <th className="px-3 py-3">End Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e, i) => (
                    <tr key={`${e.name}-${e.start}`} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3 font-semibold text-gray-800">{e.name}</td>
                      <td className="px-3 py-3 text-gray-600">{e.cls}</td>
                      <td className="px-3 py-3 text-gray-600">{e.start}</td>
                      <td className="px-3 py-3 text-gray-600">{e.end}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[e.status]}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                            <EyeOutlineIcon className="h-3.5 w-3.5" />
                            View
                          </button>
                          <button aria-label="Edit" className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-500">Showing 1 to {exams.length} of {exams.length} exams</p>
          </div>
        </main>
      </div>
    </div>
  );
}
