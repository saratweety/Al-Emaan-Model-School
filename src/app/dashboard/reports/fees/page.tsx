import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ReportPrintButton from "@/components/dashboard/ReportPrintButton";
import { ArrowLeftIcon } from "@/components/icons";
import { getFeeReport } from "@/lib/reports-data";
import { getSessionMonths, getCurrentMonthValue, monthValueToISODate } from "@/lib/school-calendar";

export const metadata: Metadata = { title: "Fee Report | Al-Emaan Model School" };

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
};

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function FeeReportPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams;
  const months = getSessionMonths();
  const selectedMonthValue = month ?? getCurrentMonthValue();
  const monthDate = monthValueToISODate(selectedMonthValue);

  const rows = await getFeeReport(monthDate);
  const totalDue = rows.reduce((sum, r) => sum + r.amountDue, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.amountPaid, 0);

  return (
    <div className="flex h-screen bg-[#F4F6F5] print:h-auto print:bg-white">
      <Sidebar active="Reports" />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />
        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Link href="/dashboard/reports" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Reports
            </Link>
            <ReportPrintButton />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Fee Report</h1>
            <p className="text-sm text-gray-500">Fee collection details for a selected month.</p>
          </div>

          <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm print:hidden">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Month</label>
              <select
                name="month"
                defaultValue={selectedMonthValue}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="rounded-xl bg-[#13714C] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Apply
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Total Due</p>
              <p className="text-xl font-extrabold text-gray-800">Rs. {money(totalDue)}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">Total Collected</p>
              <p className="text-xl font-extrabold text-green-700">Rs. {money(totalPaid)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-gray-500">No fee records for this month.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">Admission No.</th>
                      <th className="px-3 py-3">Student</th>
                      <th className="px-3 py-3">Class</th>
                      <th className="px-3 py-3">Due</th>
                      <th className="px-3 py-3">Paid</th>
                      <th className="rounded-r-xl px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 text-gray-600">{r.admissionNo}</td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{r.studentName}</td>
                        <td className="px-3 py-3 text-gray-600">{r.className}</td>
                        <td className="px-3 py-3 text-gray-600">Rs. {money(r.amountDue)}</td>
                        <td className="px-3 py-3 text-gray-600">Rs. {money(r.amountPaid)}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[r.status] ?? ""}`}>
                            {r.status}
                          </span>
                        </td>
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
