import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ReportPrintButton from "@/components/dashboard/ReportPrintButton";
import { ArrowLeftIcon } from "@/components/icons";
import { getTeacherReport } from "@/lib/reports-data";

export const metadata: Metadata = { title: "Teacher Report | Al-Emaan Model School" };

export default async function TeacherReportPage() {
  const rows = await getTeacherReport();

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
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Teacher Report</h1>
            <p className="text-sm text-gray-500">All teachers with their qualifications and class/subject assignments.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-gray-500">No teachers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">Teacher ID</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Qualification</th>
                      <th className="px-3 py-3">Specialization</th>
                      <th className="rounded-r-xl px-3 py-3">Assignments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.teacherCode} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 text-gray-600">{r.teacherCode}</td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{r.fullName}</td>
                        <td className="px-3 py-3 text-gray-600">{r.qualification ?? "—"}</td>
                        <td className="px-3 py-3 text-gray-600">{r.specializationSubject ?? "—"}</td>
                        <td className="px-3 py-3 text-gray-600">{r.assignments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-sm text-gray-500">Total: {rows.length} teachers</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
