import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import FeeMonthsGrid, { type FeeMonthCell } from "@/components/fees/FeeMonthsGrid";
import {
  ArrowLeftIcon,
  WalletIcon,
  FileTextIcon,
  CalendarIcon,
  GraduationCapIcon,
  UserIcon,
  InfoIcon,
} from "@/components/icons";
import { getSessionMonths, getCurrentSessionRange } from "@/lib/school-calendar";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export const metadata: Metadata = {
  title: "Student Fee Record | Al-Emaan Model School",
  description: "View a student's monthly fee record and payment history.",
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

export default async function StudentFeeRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = await params;

  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, admission_no, father_name, monthly_fee")
    .eq("id", studentId)
    .single();

  const { data: enrollment } = sessionId
    ? await supabase
        .from("student_enrollments")
        .select("classes(name)")
        .eq("student_id", studentId)
        .eq("session_id", sessionId)
        .maybeSingle<{ classes: { name: string } | null }>()
    : { data: null };

  const { data: feeRecords } = sessionId
    ? await supabase
        .from("student_fee_records")
        .select("id, month_date, amount_due, amount_paid, status")
        .eq("student_id", studentId)
        .eq("session_id", sessionId)
        .returns<{ id: string; month_date: string; amount_due: number; amount_paid: number; status: "paid" | "pending" | "partial" }[]>()
    : { data: [] };

  const { data: paymentHistory } = await supabase
    .from("fee_payments")
    .select("id, amount, payment_date, method, profiles(full_name), student_fee_records!inner(month_date, student_id)")
    .eq("student_fee_records.student_id", studentId)
    .order("payment_date", { ascending: false })
    .returns<
      {
        id: string;
        amount: number;
        payment_date: string;
        method: string;
        profiles: { full_name: string } | null;
        student_fee_records: { month_date: string };
      }[]
    >();

  if (studentError || !student) {
    return (
      <div className="flex h-screen bg-[#F4F6F5]">
        <Sidebar active="Fees" />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6">
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load this student&apos;s fee record.
            </div>
          </main>
        </div>
      </div>
    );
  }

  const recordsByMonth = new Map((feeRecords ?? []).map((r) => [r.month_date, r]));

  const MONTH_NAMES_LOWER = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];

  const months: FeeMonthCell[] = getSessionMonths().map((m) => {
    const [monthName, year] = m.value.split("-");
    const monthIndex = MONTH_NAMES_LOWER.indexOf(monthName);
    const monthDate = `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
    const record = recordsByMonth.get(monthDate);
    return {
      key: m.value,
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      year,
      status: record ? record.status : "not_generated",
      amountDue: record ? Number(record.amount_due) : Number(student.monthly_fee),
      amountPaid: record ? Number(record.amount_paid) : 0,
      feeRecordId: record?.id ?? null,
    };
  });

  const totalDue = (feeRecords ?? []).reduce(
    (sum, r) => sum + (r.status !== "paid" ? Number(r.amount_due) - Number(r.amount_paid) : 0),
    0
  );

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
              {initials(student.full_name)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-extrabold text-[#0f4d34] sm:text-xl">{student.full_name}</h1>
              <p className="text-sm text-gray-500">Admission No: {student.admission_no}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <GraduationCapIcon className="h-4 w-4 text-[#13714C]" />
                  {enrollment?.classes?.name ?? "Unassigned"}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-[#13714C]" />
                  Father: {student.father_name}
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
                  <p className="text-sm font-extrabold text-[#0f4d34]">Rs. {money(Number(student.monthly_fee))}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e0645f]">
                  <FileTextIcon className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-wide text-gray-500">CURRENT DUE</p>
                  <p className="text-sm font-extrabold text-red-600">Rs. {money(totalDue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session / due banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#0f4d34]">
              <CalendarIcon className="h-4 w-4" />
              Session: {getCurrentSessionRange()}
            </p>
            {totalDue > 0 && (
              <p className="flex items-center gap-2 rounded-xl bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700">
                <InfoIcon className="h-4 w-4" />
                Total Pending Due: Rs. {money(totalDue)}
              </p>
            )}
          </div>

          <FeeMonthsGrid months={months} />

          {/* Payment history */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-sm font-bold tracking-wide text-[#0f4d34]">PAYMENT HISTORY</h2>
            {!paymentHistory || paymentHistory.length === 0 ? (
              <p className="p-6 text-center text-sm font-semibold text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">Date</th>
                      <th className="px-3 py-3">Month</th>
                      <th className="px-3 py-3">Amount (Rs.)</th>
                      <th className="px-3 py-3">Method</th>
                      <th className="rounded-r-xl px-3 py-3">Received By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 text-gray-600">
                          {new Date(p.payment_date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-3 text-gray-600">
                          {new Date(p.student_fee_records.month_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </td>
                        <td className="px-3 py-3 font-semibold text-green-600">{money(Number(p.amount))}</td>
                        <td className="px-3 py-3 text-gray-600 capitalize">{p.method.replace("_", " ")}</td>
                        <td className="px-3 py-3 text-gray-600">{p.profiles?.full_name ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
