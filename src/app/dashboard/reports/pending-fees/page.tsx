import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ReportPrintButton from "@/components/dashboard/ReportPrintButton";
import { ArrowLeftIcon } from "@/components/icons";
import { getPendingFeeReport } from "@/lib/reports-data";

export const metadata: Metadata = { title: "Pending Fee Report | Al-Emaan Model School" };

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function PendingFeeReportPage() {
  const rows = await getPendingFeeReport();
  const totalPending = rows.reduce((sum, r) => sum + r.amountPending, 0);

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
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Pending Fee Report</h1>
            <p className="text-sm text-gray-500">Students with pending fees this session, sorted by months owed.</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Total Pending Amount</p>
            <p className="text-xl font-extrabold text-red-600">Rs. {money(totalPending)}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-gray-500">No pending fees. Everyone is paid up.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">Admission No.</th>
                      <th className="px-3 py-3">Student</th>
                      <th className="px-3 py-3">Class</th>
                      <th className="px-3 py-3">Months Pending</th>
                      <th className="rounded-r-xl px-3 py-3">Amount Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 text-gray-600">{r.admissionNo}</td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{r.studentName}</td>
                        <td className="px-3 py-3 text-gray-600">{r.className}</td>
                        <td className="px-3 py-3 text-gray-600">{r.monthsPending}</td>
                        <td className="px-3 py-3 font-semibold text-red-600">Rs. {money(r.amountPending)}</td>
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
