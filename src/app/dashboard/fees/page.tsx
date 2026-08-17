import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import MonthFilter from "@/components/dashboard/MonthFilter";
import GenerateFeesButton from "@/components/fees/GenerateFeesButton";
import ClassFilter from "@/components/fees/ClassFilter";
import {
  WalletIcon,
  FileTextIcon,
  UsersIcon,
  SearchIcon,
  InfoIcon,
  XIcon,
  PhoneIcon,
} from "@/components/icons";
import { getSessionMonths, getCurrentMonthValue, monthValueToISODate } from "@/lib/school-calendar";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getClasses } from "@/lib/classes-data";

export const metadata: Metadata = {
  title: "Fees | Al-Emaan Model School",
  description: "Track fee collection and manage student payments.",
};

type FeeStatus = "paid" | "pending" | "partial" | "not generated";

const statusStyles: Record<FeeStatus, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
  "not generated": "bg-gray-100 text-gray-500",
};

const statusLabels: Record<FeeStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  partial: "Partial",
  "not generated": "Not Generated",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; month?: string; class?: string }>;
}) {
  const { status, month, class: classFilter } = await searchParams;
  const statusFilter: "pending" | "paid" | null = status === "pending" ? "pending" : status === "paid" ? "paid" : null;

  const sessionMonths = getSessionMonths();
  const selectedMonthValue = month ?? getCurrentMonthValue();
  const selectedMonth = sessionMonths.find((m) => m.value === selectedMonthValue) ?? sessionMonths[sessionMonths.length - 1];
  const selectedMonthDate = monthValueToISODate(selectedMonthValue);

  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();
  const { classes: allClasses } = await getClasses();

  const { data: enrollments } = sessionId
    ? await supabase
        .from("student_enrollments")
        .select(
          "student_id, students(id, full_name, admission_no, father_name, gender, monthly_fee, contact_number), classes(name)"
        )
        .eq("session_id", sessionId)
        .eq("status", "active")
        .returns<
          {
            student_id: string;
            students: {
              id: string;
              full_name: string;
              admission_no: string;
              father_name: string;
              gender: string | null;
              monthly_fee: number;
              contact_number: string | null;
            } | null;
            classes: { name: string } | null;
          }[]
        >()
    : { data: [] };

  const { data: allRecords } = sessionId
    ? await supabase
        .from("student_fee_records")
        .select("student_id, month_date, amount_due, amount_paid, status")
        .eq("session_id", sessionId)
        .returns<{ student_id: string; month_date: string; amount_due: number; amount_paid: number; status: FeeStatus }[]>()
    : { data: [] };

  const records = allRecords ?? [];
  const monthRecords = records.filter((r) => r.month_date === selectedMonthDate);
  const recordsByStudent = new Map(monthRecords.map((r) => [r.student_id, r]));

  const previousDueByStudent = new Map<string, number>();
  const monthsPendingByStudent = new Map<string, number>();
  for (const r of records) {
    if (r.month_date < selectedMonthDate && r.status !== "paid") {
      const due = Number(r.amount_due) - Number(r.amount_paid);
      previousDueByStudent.set(r.student_id, (previousDueByStudent.get(r.student_id) ?? 0) + due);
      monthsPendingByStudent.set(r.student_id, (monthsPendingByStudent.get(r.student_id) ?? 0) + 1);
    }
  }

  const thisMonthTotal = monthRecords.reduce((sum, r) => sum + Number(r.amount_due), 0);
  const collectedThisSession = records.reduce((sum, r) => sum + Number(r.amount_paid), 0);
  const pendingThisSession = records.reduce(
    (sum, r) => sum + (r.status !== "paid" ? Number(r.amount_due) - Number(r.amount_paid) : 0),
    0
  );

  const allRows = (enrollments ?? [])
    .filter((e): e is typeof e & { students: NonNullable<(typeof e)["students"]> } => e.students !== null)
    .map((e) => {
      const record = recordsByStudent.get(e.student_id);
      const feeStatus: FeeStatus = record ? record.status : "not generated";
      return {
        studentId: e.students.id,
        name: e.students.full_name,
        admission: e.students.admission_no,
        father: e.students.father_name,
        contact: e.students.contact_number,
        cls: e.classes?.name ?? "Unknown Class",
        gender: e.students.gender === "female" ? "g" : "b",
        status: feeStatus,
        current: record ? Number(record.amount_due) : Number(e.students.monthly_fee),
        previousDue: previousDueByStudent.get(e.student_id) ?? 0,
        monthsPending: monthsPendingByStudent.get(e.student_id) ?? 0,
      };
    });

  const pendingOnly = statusFilter === "pending";
  let visibleStudents = statusFilter
    ? allRows.filter((r) => (statusFilter === "paid" ? r.status === "paid" : r.status === "pending" || r.status === "partial"))
    : allRows;

  if (classFilter) {
    visibleStudents = visibleStudents.filter((r) => r.cls === classFilter);
  }

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
            <GenerateFeesButton monthValue={selectedMonthValue} monthLabel={selectedMonth.label} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ClassFilter classes={allClasses.map((c) => c.name)} value={classFilter ?? ""} />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={WalletIcon} iconBg="bg-[#13714C]" label={`THIS MONTH (${selectedMonth.label.toUpperCase()})`} value={`Rs. ${money(thisMonthTotal)}`} sub="Total Fee" />
            <StatCard
              icon={FileTextIcon}
              iconBg="bg-blue-500"
              label="COLLECTED"
              value={`Rs. ${money(collectedThisSession)}`}
              sub="This Session"
              href="/dashboard/fees?status=paid"
            />
            <StatCard
              icon={FileTextIcon}
              iconBg="bg-[#e0645f]"
              label="PENDING"
              value={`Rs. ${money(pendingThisSession)}`}
              valueColor="text-red-600"
              sub="This Session"
              href="/dashboard/fees?status=pending"
            />
            <StatCard icon={UsersIcon} iconBg="bg-purple-500" label="TOTAL STUDENTS" value={String(allRows.length)} sub="All Classes" />
          </div>

          {statusFilter && (
            <div
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
                statusFilter === "pending" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
              }`}
            >
              <p
                className={`flex items-center gap-2 text-sm font-semibold ${
                  statusFilter === "pending" ? "text-red-700" : "text-green-700"
                }`}
              >
                <InfoIcon className="h-4 w-4 shrink-0" />
                Showing {visibleStudents.length} student{visibleStudents.length === 1 ? "" : "s"} with{" "}
                {statusFilter === "pending" ? "pending fees" : "fees collected"} for {selectedMonth.label}.
              </p>
              <Link
                href="/dashboard/fees"
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-opacity-80 ${
                  statusFilter === "pending" ? "border-red-200 text-red-700 hover:bg-red-100" : "border-green-200 text-green-700 hover:bg-green-100"
                }`}
              >
                <XIcon className="h-3.5 w-3.5" />
                Clear Filter
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student by name, admission no. or roll no..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              {visibleStudents.length === 0 ? (
                <p className="p-6 text-center text-sm font-semibold text-gray-500">
                  {sessionId ? "No students found for this view." : "No current academic session is configured."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                        <th className="rounded-l-xl px-3 py-3">#</th>
                        <th className="px-3 py-3">Student Name</th>
                        <th className="px-3 py-3">Father Name</th>
                        <th className="px-3 py-3">Contact</th>
                        <th className="px-3 py-3">Class</th>
                        <th className="px-3 py-3">Current Month ({selectedMonth.label})</th>
                        <th className="px-3 py-3">Previous Due</th>
                        {pendingOnly && <th className="px-3 py-3">Months Pending</th>}
                        <th className="rounded-r-xl px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((s, i) => (
                        <tr key={s.studentId} className="border-b border-gray-50 last:border-0">
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
                          <td className="px-3 py-3">
                            {s.contact ? (
                              <a
                                href={`tel:${s.contact}`}
                                className="flex items-center gap-1.5 font-semibold text-[#13714C] hover:underline"
                              >
                                <PhoneIcon className="h-3.5 w-3.5" />
                                {s.contact}
                              </a>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-gray-600">{s.cls}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[s.status]}`}>
                              {statusLabels[s.status]}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">Rs. {money(s.current)}</p>
                          </td>
                          <td className={`px-3 py-3 font-semibold ${s.previousDue === 0 ? "text-green-600" : "text-red-600"}`}>
                            Rs. {money(s.previousDue)}
                          </td>
                          {pendingOnly && (
                            <td className="px-3 py-3">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                  s.monthsPending >= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {s.monthsPending} Month{s.monthsPending === 1 ? "" : "s"}
                              </span>
                            </td>
                          )}
                          <td className="px-3 py-3">
                            <Link
                              href={`/dashboard/fees/${s.studentId}`}
                              className="flex w-fit items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:brightness-110"
                            >
                              <WalletIcon className="h-3.5 w-3.5" />
                              Collect Fee
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="mt-4 text-sm text-gray-500">
                Showing {visibleStudents.length} of {allRows.length} students
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
