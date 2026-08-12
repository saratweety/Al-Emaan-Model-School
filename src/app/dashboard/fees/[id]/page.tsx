import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  ArrowLeftIcon,
  WalletIcon,
  FileTextIcon,
  PlusIcon,
  CalendarIcon,
  GraduationCapIcon,
  UserIcon,
  InfoIcon,
  EyeOutlineIcon,
} from "@/components/icons";
import { getCurrentSessionRange } from "@/lib/school-calendar";

export const metadata: Metadata = {
  title: "Student Fee Record | Al-Emaan Model School",
  description: "View a student's monthly fee record and payment history.",
};

const student = {
  name: "Ahmed Raza",
  admission: "AMS-2022-001",
  cls: "Grade 5-A",
  father: "Ali Raza",
  monthlyFee: "3,000",
  currentDue: "9,000",
  session: getCurrentSessionRange(),
  previousClassDue: { grade: "Grade 4", amount: "6,000" },
};

type MonthStatus = "Paid" | "Pending" | "Partial" | "Upcoming";

const statusMeta: Record<MonthStatus, { dot: string; badge: string; cta: "receipt" | "collect" | "none" }> = {
  Paid: { dot: "bg-[#13714C]", badge: "bg-green-100 text-green-700", cta: "receipt" },
  Pending: { dot: "bg-red-500", badge: "bg-red-100 text-red-700", cta: "collect" },
  Partial: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700", cta: "collect" },
  Upcoming: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-500", cta: "none" },
};

const months: { month: string; year: string; status: MonthStatus }[] = [
  { month: "February", year: "2026", status: "Paid" },
  { month: "March", year: "2026", status: "Paid" },
  { month: "April", year: "2026", status: "Paid" },
  { month: "May", year: "2026", status: "Paid" },
  { month: "June", year: "2026", status: "Pending" },
  { month: "July", year: "2026", status: "Pending" },
  { month: "August", year: "2026", status: "Pending" },
  { month: "September", year: "2026", status: "Upcoming" },
  { month: "October", year: "2026", status: "Upcoming" },
  { month: "November", year: "2026", status: "Upcoming" },
  { month: "December", year: "2026", status: "Upcoming" },
  { month: "January", year: "2027", status: "Upcoming" },
  { month: "February", year: "2027", status: "Upcoming" },
];

const legend = [
  { color: "bg-[#13714C]", label: "Paid" },
  { color: "bg-red-500", label: "Pending" },
  { color: "bg-amber-500", label: "Partial" },
  { color: "bg-gray-400", label: "Upcoming" },
];

const paymentHistory = [
  { date: "05 May 2026", month: "May 2026", amount: "3,000", paid: "3,000", method: "Cash", receipt: "R-2026-1456", by: "Admin" },
  { date: "07 April 2026", month: "April 2026", amount: "3,000", paid: "3,000", method: "Cash", receipt: "R-2026-1322", by: "Admin" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function StudentFeeRecordPage({ params }: { params: Promise<{ id: string }> }) {
  await params;

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Fees" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/fees"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Fees
          </Link>

          {/* Student header */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-lg font-bold text-white">
              {initials(student.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-extrabold text-[#0f4d34] sm:text-xl">{student.name}</h1>
              <p className="text-sm text-gray-500">Admission No: {student.admission}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <GraduationCapIcon className="h-4 w-4 text-[#13714C]" />
                  {student.cls}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-[#13714C]" />
                  Father: {student.father}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-[#F4F6F5] px-4 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#13714C]">
                  <WalletIcon className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-wide text-gray-500">MONTHLY FEE</p>
                  <p className="text-sm font-extrabold text-[#0f4d34]">Rs. {student.monthlyFee}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e0645f]">
                  <FileTextIcon className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-wide text-gray-500">CURRENT DUE</p>
                  <p className="text-sm font-extrabold text-red-600">Rs. {student.currentDue}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
                <PlusIcon className="h-4 w-4" />
                Collect Fee
              </button>
            </div>
          </div>

          {/* Session / previous due banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#0f4d34]">
              <CalendarIcon className="h-4 w-4" />
              Session: {student.session}
            </p>
            <p className="flex items-center gap-2 rounded-xl bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700">
              <InfoIcon className="h-4 w-4" />
              Previous Class Due ({student.previousClassDue.grade}): Rs. {student.previousClassDue.amount}
            </p>
          </div>

          {/* Monthly fee record */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold tracking-wide text-[#0f4d34]">MONTHLY FEE RECORD</h2>
              <div className="flex flex-wrap items-center gap-4">
                {legend.map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
              {months.map((m) => {
                const meta = statusMeta[m.status];
                return (
                  <div key={`${m.month}-${m.year}`} className="rounded-xl border border-gray-100 bg-[#F4F6F5] p-3">
                    <p className="text-sm font-bold text-gray-700">{m.month}</p>
                    <p className="text-xs text-gray-400">{m.year}</p>
                    <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {m.status}
                    </span>
                    <p className="mt-2 text-sm font-bold text-gray-700">Rs. {student.monthlyFee}</p>
                    {meta.cta === "receipt" && (
                      <button className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#13714C] hover:underline">
                        <FileTextIcon className="h-3 w-3" />
                        Receipt
                      </button>
                    )}
                    {meta.cta === "collect" && (
                      <button className="mt-1.5 w-full rounded-lg bg-[#13714C] px-2 py-1 text-xs font-semibold text-white hover:brightness-110">
                        Collect
                      </button>
                    )}
                    {meta.cta === "none" && <p className="mt-2 text-xs text-gray-300">—</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment history */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-sm font-bold tracking-wide text-[#0f4d34]">PAYMENT HISTORY</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">Date</th>
                    <th className="px-3 py-3">Month</th>
                    <th className="px-3 py-3">Amount (Rs.)</th>
                    <th className="px-3 py-3">Paid (Rs.)</th>
                    <th className="px-3 py-3">Method</th>
                    <th className="px-3 py-3">Receipt No.</th>
                    <th className="px-3 py-3">Received By</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((p) => (
                    <tr key={p.receipt} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-600">{p.date}</td>
                      <td className="px-3 py-3 text-gray-600">{p.month}</td>
                      <td className="px-3 py-3 text-gray-600">{p.amount}</td>
                      <td className="px-3 py-3 font-semibold text-green-600">{p.paid}</td>
                      <td className="px-3 py-3 text-gray-600">{p.method}</td>
                      <td className="px-3 py-3 text-gray-600">{p.receipt}</td>
                      <td className="px-3 py-3 text-gray-600">{p.by}</td>
                      <td className="px-3 py-3">
                        <button aria-label="View receipt" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                          <EyeOutlineIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-center text-sm text-gray-500">
              Showing 1 to {paymentHistory.length} of {paymentHistory.length} records
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
