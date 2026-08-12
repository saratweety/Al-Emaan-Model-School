import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import MonthFilter from "@/components/dashboard/MonthFilter";
import {
  WalletIcon,
  FileTextIcon,
  UsersIcon,
  GraduationCapIcon,
  SearchIcon,
  ChevronDownIcon,
  EyeOutlineIcon,
  MoreVerticalIcon,
  InfoIcon,
  XIcon,
} from "@/components/icons";
import { getSessionMonths, getCurrentMonthValue } from "@/lib/school-calendar";

export const metadata: Metadata = {
  title: "Fees | Al-Emaan Model School",
  description: "Track fee collection and manage student payments.",
};

const students = [
  { name: "Ahmed Raza", admission: "AMS-2022-001", father: "Ali Raza", cls: "Grade 5", status: "Pending", current: "3,000", previousDue: "3,000", monthsPending: 1, gender: "b" },
  { name: "Fatima Noor", admission: "AMS-2022-002", father: "Ahmad Noor", cls: "Grade 4", status: "Paid", current: "3,000", previousDue: "0", monthsPending: 0, gender: "g" },
  { name: "Hassan Ali", admission: "AMS-2021-045", father: "Raza Ali", cls: "Grade 6", status: "Pending", current: "3,000", previousDue: "6,000", monthsPending: 2, gender: "b" },
  { name: "Ayesha Khan", admission: "AMS-2022-010", father: "Bilal Khan", cls: "Grade 3", status: "Paid", current: "3,000", previousDue: "0", monthsPending: 0, gender: "g" },
  { name: "Muhammad Hamza", admission: "AMS-2021-032", father: "Usman Khan", cls: "Grade 2", status: "Pending", current: "3,000", previousDue: "9,000", monthsPending: 3, gender: "b" },
  { name: "Zainab Fatima", admission: "AMS-2021-019", father: "Faisal Mehmood", cls: "Grade 1", status: "Paid", current: "3,000", previousDue: "0", monthsPending: 0, gender: "g" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-red-100 text-red-700",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; month?: string }>;
}) {
  const { status, month } = await searchParams;
  const statusFilter = status === "pending" ? "Pending" : status === "paid" ? "Paid" : null;
  const pendingOnly = statusFilter === "Pending";
  const visibleStudents = statusFilter ? students.filter((s) => s.status === statusFilter) : students;

  const sessionMonths = getSessionMonths();
  const selectedMonthValue = month ?? getCurrentMonthValue();
  const selectedMonth = sessionMonths.find((m) => m.value === selectedMonthValue) ?? sessionMonths[sessionMonths.length - 1];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Fees" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={WalletIcon}
            title="Fees Management"
            subtitle="Track fee collection and manage student payments"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fees" }]}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <MonthFilter months={sessionMonths} value={selectedMonthValue} />
            <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <GraduationCapIcon className="h-4 w-4 text-[#13714C]" />
              Class Wise
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <UsersIcon className="h-4 w-4 text-[#13714C]" />
              Sibling Wise
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
              <WalletIcon className="h-4 w-4" />
              Collect Fee
            </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={WalletIcon} iconBg="bg-[#13714C]" label={`THIS MONTH (${selectedMonth.label.toUpperCase()})`} value="Rs. 42,000" sub="Total Fee" />
            <StatCard
              icon={FileTextIcon}
              iconBg="bg-blue-500"
              label="COLLECTED"
              value="Rs. 420,000"
              sub="This Session"
              href="/dashboard/fees?status=paid"
            />
            <StatCard
              icon={FileTextIcon}
              iconBg="bg-[#e0645f]"
              label="PENDING"
              value="Rs. 86,000"
              valueColor="text-red-600"
              sub="This Session"
              href="/dashboard/fees?status=pending"
            />
            <StatCard icon={UsersIcon} iconBg="bg-purple-500" label="TOTAL STUDENTS" value="126" sub="All Classes" />
          </div>

          {statusFilter && (
            <div
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
                statusFilter === "Pending" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
              }`}
            >
              <p
                className={`flex items-center gap-2 text-sm font-semibold ${
                  statusFilter === "Pending" ? "text-red-700" : "text-green-700"
                }`}
              >
                <InfoIcon className="h-4 w-4 shrink-0" />
                Showing {visibleStudents.length} student{visibleStudents.length === 1 ? "" : "s"} with{" "}
                {statusFilter === "Pending" ? "pending fees" : "fees collected"} for {selectedMonth.label}.
              </p>
              <Link
                href="/dashboard/fees"
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-opacity-80 ${
                  statusFilter === "Pending" ? "border-red-200 text-red-700 hover:bg-red-100" : "border-green-200 text-green-700 hover:bg-green-100"
                }`}
              >
                <XIcon className="h-3.5 w-3.5" />
                Clear Filter
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student by name, admission no. or roll no..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                />
              </div>

              {/* Fees table */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                        <th className="rounded-l-xl px-3 py-3">#</th>
                        <th className="px-3 py-3">Student Name</th>
                        <th className="px-3 py-3">Father Name</th>
                        <th className="px-3 py-3">Class</th>
                        <th className="px-3 py-3">Current Month ({selectedMonth.label})</th>
                        <th className="px-3 py-3">Previous Due</th>
                        {pendingOnly && <th className="px-3 py-3">Months Pending</th>}
                        <th className="rounded-r-xl px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((s, i) => (
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
                              <div>
                                <p className="font-semibold text-gray-800">{s.name}</p>
                                <p className="text-xs text-gray-400">{s.admission}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-600">{s.father}</td>
                          <td className="px-3 py-3 text-gray-600">{s.cls}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[s.status]}`}>
                              {s.status}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">Rs. {s.current}</p>
                          </td>
                          <td className={`px-3 py-3 font-semibold ${s.previousDue === "0" ? "text-green-600" : "text-red-600"}`}>
                            Rs. {s.previousDue}
                          </td>
                          {pendingOnly && (
                            <td className="px-3 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                  s.monthsPending >= 3
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {s.monthsPending} Month{s.monthsPending === 1 ? "" : "s"}
                              </span>
                            </td>
                          )}
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/dashboard/fees/${s.admission}`}
                                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                              >
                                <EyeOutlineIcon className="h-3.5 w-3.5" />
                                View
                              </Link>
                              <button aria-label="More actions" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50">
                                <MoreVerticalIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    {statusFilter
                      ? `Showing ${visibleStudents.length} of ${visibleStudents.length} ${statusFilter.toLowerCase()} students`
                      : "Showing 1 to 6 of 126 students"}
                  </p>
                  {!statusFilter && (
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
                      <span className="px-1.5 text-xs text-gray-400">…</span>
                      <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                        21
                      </button>
                      <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">›</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Side info panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <InfoIcon className="h-4 w-4" />
                  About This Page
                </h2>
                <p className="text-sm text-gray-500">
                  View students&apos; monthly fee status. Click &quot;View&quot; to see monthly fee details and
                  payment history.
                </p>
              </div>

              <div className="rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4">
                <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <InfoIcon className="h-4 w-4" />
                  Note
                </h2>
                <p className="text-sm text-gray-600">Session: February 2026 to February 2027</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
