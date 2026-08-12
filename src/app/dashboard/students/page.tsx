import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  UsersIcon,
  UserIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  EyeOutlineIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Students | Al-Emaan Model School",
  description: "Browse and manage the student list.",
};

const statCards = [
  { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL STUDENTS", value: "485", sub: "All Classes" },
  { icon: UserIcon, iconBg: "bg-[#3AB67D]", label: "BOYS", value: "268", sub: "55.26%" },
  { icon: UserIcon, iconBg: "bg-[#e8608a]", label: "GIRLS", value: "217", sub: "44.74%" },
  { icon: ShieldCheckIcon, iconBg: "bg-[#13714C]", label: "PRESENT TODAY", value: "441", sub: "90.72%" },
  { icon: GraduationCapIcon, iconBg: "bg-[#3AB67D]", label: "NEW THIS MONTH", value: "12", sub: "New Admissions" },
];

const students = [
  { name: "Ali Raza", admission: "AEMS-0012", roll: "12", cls: "5", father: "Raza Ahmed", phone: "0312-3456789", gender: "b" },
  { name: "Ayesha Fatima", admission: "AEMS-0013", roll: "13", cls: "5", father: "Fatima Noor", phone: "0314-2345678", gender: "g" },
  { name: "Ahmed Hassan", admission: "AEMS-0014", roll: "14", cls: "5", father: "Hassan Ali", phone: "0300-1234567", gender: "b" },
  { name: "Zara Noor", admission: "AEMS-0015", roll: "15", cls: "5", father: "Noor Ullah", phone: "0311-9876543", gender: "g" },
  { name: "Hassan Ali", admission: "AEMS-0016", roll: "16", cls: "6", father: "Ali Imran", phone: "0321-4567890", gender: "b" },
  { name: "Maryam Khan", admission: "AEMS-0017", roll: "17", cls: "6", father: "Kashif Khan", phone: "0333-7654321", gender: "g" },
  { name: "Usman Khalid", admission: "AEMS-0018", roll: "18", cls: "6", father: "Khalid Mehmood", phone: "0305-1122334", gender: "b" },
  { name: "Laiba Tariq", admission: "AEMS-0019", roll: "19", cls: "6", father: "Tariq Mahmood", phone: "0322-3344556", gender: "g" },
  { name: "Muhammad Bilal", admission: "AEMS-0020", roll: "20", cls: "7", father: "Bilal Ahmed", phone: "0334-5566778", gender: "b" },
  { name: "Sana Fatima", admission: "AEMS-0021", roll: "21", cls: "7", father: "Shahid Hussain", phone: "0316-7788990", gender: "g" },
];

const pages = [1, 2, 3, 4, 5, "...", 49, 50];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function StudentsPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Students" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={GraduationCapIcon}
            title="Students"
            subtitle="Manage student records and enrollment"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Students" }]}
            actionLabel="Add Student"
            actionHref="/dashboard/students/add"
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                placeholder="Search student by name, admission no. or roll no..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <GraduationCapIcon className="h-4 w-4" />
              All Classes
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <ShieldCheckIcon className="h-4 w-4" />
              All Status
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <Link
              href="/dashboard/students/promote"
              className="flex items-center gap-2 rounded-xl border border-[#13714C]/30 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
            >
              <GraduationCapIcon className="h-4 w-4" />
              Promote Students
            </Link>
          </div>

          {/* Students table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Student Name</th>
                    <th className="px-3 py-3">Admission No.</th>
                    <th className="px-3 py-3">Roll No.</th>
                    <th className="px-3 py-3">Class</th>
                    <th className="px-3 py-3">Father Name</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.admission} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                              s.gender === "b" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                            }`}
                          >
                            {initials(s.name)}
                          </span>
                          <span className="font-semibold text-gray-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{s.admission}</td>
                      <td className="px-3 py-3 text-gray-600">{s.roll}</td>
                      <td className="px-3 py-3 text-gray-600">{s.cls}</td>
                      <td className="px-3 py-3 text-gray-600">{s.father}</td>
                      <td className="px-3 py-3 text-gray-600">{s.phone}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button aria-label="View" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                            <EyeOutlineIcon className="h-4 w-4" />
                          </button>
                          <button aria-label="Edit" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button aria-label="Delete" className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50">
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
              <p className="text-sm text-gray-500">Showing 1 to 10 of 485 students</p>

              <div className="flex items-center gap-1.5">
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">«</button>
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">‹</button>
                {pages.map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1.5 text-xs text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        p === 1 ? "bg-[#13714C] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">›</button>
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">»</button>
              </div>

              <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                10 per page
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
