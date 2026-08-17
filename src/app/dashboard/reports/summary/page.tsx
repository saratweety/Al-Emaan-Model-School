import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ReportPrintButton from "@/components/dashboard/ReportPrintButton";
import { ArrowLeftIcon, UsersIcon, GraduationCapIcon, BuildingIcon, WalletIcon } from "@/components/icons";
import { getSummaryReport } from "@/lib/reports-data";
import { getCurrentSessionLabel } from "@/lib/school-calendar";

export const metadata: Metadata = { title: "Summary Report | Al-Emaan Model School" };

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function SummaryReportPage() {
  const summary = await getSummaryReport();

  const tiles = [
    { icon: GraduationCapIcon, iconBg: "bg-[#13714C]", label: "Total Students", value: String(summary.totalStudents) },
    { icon: UsersIcon, iconBg: "bg-[#3AB67D]", label: "Total Teachers", value: String(summary.totalTeachers) },
    { icon: BuildingIcon, iconBg: "bg-blue-500", label: "Total Classes", value: String(summary.totalClasses) },
    { icon: WalletIcon, iconBg: "bg-red-500", label: "Students with Pending Fees", value: String(summary.pendingFeeStudents) },
  ];

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
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Summary Report</h1>
            <p className="text-sm text-gray-500">Overall summary for {getCurrentSessionLabel()}.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((t) => (
              <div key={t.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${t.iconBg}`}>
                  <t.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-500">{t.label}</p>
                  <p className="text-xl font-extrabold text-gray-800">{t.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Total Pending Fee Amount</p>
            <p className="text-2xl font-extrabold text-red-600">Rs. {money(summary.pendingFeeAmount)}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
