import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  BuildingIcon,
  UsersIcon,
  SearchIcon,
  ChevronDownIcon,
  DownloadIcon,
  EyeOutlineIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Classes | Al-Emaan Model School",
  description: "Browse classes, sections and assigned class teachers.",
};

const classes = [
  { section: "Grade 1 - A", teacher: "Ayesha Khan", students: 22, room: "Room 101" },
  { section: "Grade 1 - B", teacher: "Fatima Noor", students: 20, room: "Room 102" },
  { section: "Grade 2 - A", teacher: "Sara Ali", students: 23, room: "Room 103" },
  { section: "Grade 2 - B", teacher: "Usman Khalid", students: 21, room: "Room 104" },
  { section: "Grade 3 - A", teacher: "Hassan Raza", students: 24, room: "Room 201" },
  { section: "Grade 3 - B", teacher: "Zainab Fatima", students: 22, room: "Room 202" },
  { section: "Grade 4 - A", teacher: "Muhammad Bilal", students: 21, room: "Room 203" },
  { section: "Grade 4 - B", teacher: "Sana Iqbal", students: 22, room: "Room 204" },
  { section: "Grade 5 - A", teacher: "Ayesha Khan", students: 23, room: "Room 301" },
  { section: "Grade 5 - B", teacher: "Ahmad Ali", students: 21, room: "Room 302" },
];

const femaleNames = new Set(["Ayesha Khan", "Fatima Noor", "Sara Ali", "Zainab Fatima", "Sana Iqbal"]);

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ClassesPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Classes" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={BuildingIcon}
            title="Classes"
            subtitle="Browse classes, sections and assigned class teachers"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Classes" }]}
            actionLabel="Add Class"
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={BuildingIcon} iconBg="bg-[#13714C]" label="TOTAL CLASSES" value="24" sub="All Classes" />
            <StatCard icon={UsersIcon} iconBg="bg-[#3AB67D]" label="TOTAL STUDENTS" value="485" sub="Across All Classes" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search class by name or grade..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              All Sections
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-[#13714C]/40 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/10">
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* Classes table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Class / Section</th>
                    <th className="px-3 py-3">Class Teacher</th>
                    <th className="px-3 py-3">Total Students</th>
                    <th className="px-3 py-3">Room</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c, i) => (
                    <tr key={c.section} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3 font-bold text-gray-800">{c.section}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                              femaleNames.has(c.teacher) ? "bg-[#e8608a]" : "bg-[#3AB67D]"
                            }`}
                          >
                            {initials(c.teacher)}
                          </span>
                          <span className="font-medium text-gray-700">{c.teacher}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{c.students}</td>
                      <td className="px-3 py-3 text-gray-600">{c.room}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button aria-label="View" className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20">
                            <EyeOutlineIcon className="h-4 w-4" />
                          </button>
                          <button aria-label="Edit" className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button aria-label="Delete" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Showing 1 to 10 of 24 classes</p>
              <div className="flex items-center gap-1.5">
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">‹</button>
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      p === 1 ? "bg-[#13714C] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">›</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
