import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  UsersIcon,
  UserCheckIcon,
  UserXIcon,
  ClockIcon,
  SearchIcon,
  BookIcon,
  ChevronDownIcon,
  EyeOutlineIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  FileTextIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Teachers | Al-Emaan Model School",
  description: "Manage teachers and monitor attendance.",
};

const statCards = [
  { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL TEACHERS", value: "32", sub: "All Staff" },
  { icon: UserCheckIcon, iconBg: "bg-[#3AB67D]", label: "PRESENT TODAY", value: "28", sub: "87.5%" },
  { icon: UserXIcon, iconBg: "bg-[#e0645f]", label: "ABSENT TODAY", value: "2", sub: "6.3%", valueColor: "text-red-600" },
  { icon: ClockIcon, iconBg: "bg-[#3AB67D]", label: "LATE TODAY", value: "2", sub: "6.3%", valueColor: "text-amber-500" },
];

const teachers = [
  { name: "Ayesha Khan", gender: "Female", id: "T001", phone: "03418298314", subject: "Mathematics", classTeacher: "Grade 5-A", arrival: "7:45 AM", status: "On Time" },
  { name: "Ahmad Ali", gender: "Male", id: "T002", phone: "03001234567", subject: "English", classTeacher: "Grade 6-B", arrival: "7:52 AM", status: "On Time" },
  { name: "Sara Noor", gender: "Female", id: "T003", phone: "03211234567", subject: "Science", classTeacher: "Grade 4-A", arrival: "8:12 AM", status: "Late" },
  { name: "Hassan Raza", gender: "Male", id: "T004", phone: "03123456789", subject: "Urdu", classTeacher: "—", arrival: "—", status: "Absent" },
  { name: "Fatima Zahra", gender: "Female", id: "T005", phone: "03453678901", subject: "Computer", classTeacher: "Grade 7-B", arrival: "8:05 AM", status: "On Time" },
  { name: "Usman Khalid", gender: "Male", id: "T006", phone: "03127654321", subject: "Physics", classTeacher: "Grade 8-A", arrival: "7:48 AM", status: "On Time" },
];

const statusStyles: Record<string, string> = {
  "On Time": "bg-green-100 text-green-700",
  Late: "bg-amber-100 text-amber-700",
  Absent: "bg-red-100 text-red-700",
};

const quickLinks = [
  { icon: UsersIcon, title: "Teacher Profile", sub: "View detailed information" },
  { icon: CalendarIcon, title: "Attendance Report", sub: "Daily attendance record" },
  { icon: BookIcon, title: "Subject Allocation", sub: "Manage classes & subjects" },
  { icon: FileTextIcon, title: "Teacher Documents", sub: "View certificates & files" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeachersPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Teachers" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={UsersIcon}
            title="Teachers"
            subtitle="Manage teachers and monitor attendance"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Teachers" }]}
            actionLabel="Add Teacher"
            actionHref="/dashboard/teachers/add"
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teacher by name, ID or phone..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <UsersIcon className="h-4 w-4" />
              All Teachers
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <BookIcon className="h-4 w-4" />
              All Subjects
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Teachers table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Teacher Name</th>
                    <th className="px-3 py-3">Teacher ID</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Subject</th>
                    <th className="px-3 py-3">Class Teacher</th>
                    <th className="px-3 py-3">Arrival Today</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, i) => (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                              t.gender === "Male" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                            }`}
                          >
                            {initials(t.name)}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{t.id}</td>
                      <td className="px-3 py-3 text-gray-600">{t.phone}</td>
                      <td className="px-3 py-3 text-gray-600">{t.subject}</td>
                      <td className="px-3 py-3 text-gray-600">{t.classTeacher}</td>
                      <td className="px-3 py-3 text-gray-600">{t.arrival}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[t.status]}`}>
                          {t.status}
                        </span>
                      </td>
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
              <p className="text-sm text-gray-500">Showing 1 to 6 of 32 teachers</p>
              <div className="flex items-center gap-1.5">
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">‹</button>
                {[1, 2, 3, 4, 5].map((p) => (
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

          {/* Quick links */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ icon: Icon, title, sub }) => (
              <button
                key={title}
                className="flex items-center gap-3 rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4 text-left hover:bg-[#A2E494]/20"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#13714C] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0f4d34]">{title}</p>
                  <p className="truncate text-xs text-gray-500">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
