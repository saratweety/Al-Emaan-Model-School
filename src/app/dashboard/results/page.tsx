import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  ClipboardListIcon,
  UsersIcon,
  GraduationCapIcon,
  AwardIcon,
  StarIcon,
  BuildingIcon,
  CalendarIcon,
  ChevronDownIcon,
  SearchIcon,
  EyeOutlineIcon,
  InfoIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Results | Al-Emaan Model School",
  description: "View and publish exam results by class and term.",
};

const statCards = [
  { icon: ClipboardListIcon, iconBg: "bg-[#13714C]", label: "TOTAL EXAMS", value: "8", sub: "This Session" },
  { icon: UsersIcon, iconBg: "bg-blue-500", label: "PUBLISHED RESULTS", value: "6", sub: "This Session" },
  { icon: GraduationCapIcon, iconBg: "bg-amber-500", label: "STUDENTS PASSED", value: "98%", sub: "Overall Pass %" },
  { icon: AwardIcon, iconBg: "bg-purple-500", label: "TOP PERFORMERS", value: "24", sub: "Students" },
];

const results = [
  { exam: "Mid Term Exam", cls: "Grade 1", term: "Term 1", total: 45, published: "10 Aug 2026", pass: 96 },
  { exam: "Mid Term Exam", cls: "Grade 2", term: "Term 1", total: 42, published: "10 Aug 2026", pass: 97 },
  { exam: "Quarterly Exam", cls: "Grade 3", term: "Term 1", total: 40, published: "20 Jul 2026", pass: 95 },
  { exam: "Quarterly Exam", cls: "Grade 4", term: "Term 1", total: 38, published: "20 Jul 2026", pass: 92 },
  { exam: "Quarterly Exam", cls: "Grade 5", term: "Term 1", total: 36, published: "20 Jul 2026", pass: 97 },
  { exam: "Mid Term Exam", cls: "Grade 6", term: "Term 1", total: 34, published: "20 Jul 2026", pass: 94 },
  { exam: "Final Term Exam", cls: "Grade 1", term: "Term 2", total: 45, published: "05 May 2026", pass: 98 },
  { exam: "Final Term Exam", cls: "Grade 2", term: "Term 2", total: 42, published: "05 May 2026", pass: 97 },
];

const topPerformers = [
  { name: "Ayesha Khan", cls: "Grade 5-A", pct: "96.4%", rank: 1 },
  { name: "Ahmed Raza", cls: "Grade 4-B", pct: "95.8%", rank: 2 },
  { name: "Zain Ali", cls: "Grade 3-A", pct: "94.7%", rank: 3 },
  { name: "Fatima Noor", cls: "Grade 5-B", pct: "94.2%", rank: 4 },
  { name: "Hassan Ali", cls: "Grade 2-A", pct: "93.6%", rank: 5 },
];

const rankStyles: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-gray-300 text-white",
  3: "bg-orange-400 text-white",
};

export default function ResultsPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Results" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={ClipboardListIcon}
            title="Results"
            subtitle="View and publish exam results by class and term"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Results" }]}
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
              <CalendarIcon className="h-4 w-4 text-[#13714C]" />
              All Exams
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <ClipboardListIcon className="h-4 w-4 text-[#13714C]" />
              All Terms
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
              <SearchIcon className="h-4 w-4" />
              View Result
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Results table */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f4d34]">
                Results Overview
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">#</th>
                      <th className="px-3 py-3">Exam Name</th>
                      <th className="px-3 py-3">Class</th>
                      <th className="px-3 py-3">Term</th>
                      <th className="px-3 py-3">Total Students</th>
                      <th className="px-3 py-3">Published On</th>
                      <th className="px-3 py-3">Pass %</th>
                      <th className="rounded-r-xl px-3 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={`${r.exam}-${r.cls}-${r.term}`} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-gray-800">{r.exam}</td>
                        <td className="px-3 py-2.5 text-gray-600">{r.cls}</td>
                        <td className="px-3 py-2.5 text-gray-600">{r.term}</td>
                        <td className="px-3 py-2.5 text-gray-600">{r.total}</td>
                        <td className="px-3 py-2.5 text-gray-600">{r.published}</td>
                        <td className="px-3 py-2.5">
                          <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                            {r.pass}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                            <EyeOutlineIcon className="h-3.5 w-3.5" />
                            View Result
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Showing 1 to {results.length} of {results.length} results</p>
                <div className="flex items-center gap-1.5">
                  <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">‹</button>
                  <button className="rounded-lg bg-[#13714C] px-3 py-1.5 text-xs font-semibold text-white">1</button>
                  <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">›</button>
                </div>
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <StarIcon className="h-4 w-4 text-amber-400" />
                  Top Performers (Overall)
                </h2>
                <ul className="space-y-3">
                  {topPerformers.map((s) => (
                    <li key={s.name} className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          rankStyles[s.rank] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.cls}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        {s.pct}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  View All Top Performers
                </button>
              </div>

              <div className="rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4">
                <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <InfoIcon className="h-4 w-4" />
                  Important Note
                </h2>
                <p className="text-sm text-gray-600">
                  Click on &quot;View Result&quot; to see class wise or student wise detailed results.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
