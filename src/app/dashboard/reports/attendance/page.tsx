import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ReportPrintButton from "@/components/dashboard/ReportPrintButton";
import { ArrowLeftIcon } from "@/components/icons";
import { getAttendanceReport } from "@/lib/reports-data";
import { getClasses } from "@/lib/classes-data";
import { getToday } from "@/lib/school-calendar";

export const metadata: Metadata = { title: "Student Attendance Report | Al-Emaan Model School" };

const STATUS_LABEL: Record<string, string> = { present: "Present", absent: "Absent", leave: "Leave", late: "Late" };

export default async function AttendanceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; from?: string; to?: string }>;
}) {
  const { classes } = await getClasses();
  const { class: classId, from, to } = await searchParams;

  const todayStr = getToday().toISOString().slice(0, 10);
  const fromDate = from || todayStr;
  const toDate = to || todayStr;
  const selectedClassId = classId || "";

  const rows = await getAttendanceReport(selectedClassId || null, fromDate, toDate);

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
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Student Attendance Report</h1>
            <p className="text-sm text-gray-500">Attendance records for a selected class and date range.</p>
          </div>

          <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm print:hidden">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Class</label>
              <select
                name="class"
                defaultValue={selectedClassId}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">From</label>
              <input
                type="date"
                name="from"
                defaultValue={fromDate}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">To</label>
              <input
                type="date"
                name="to"
                defaultValue={toDate}
                className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
              />
            </div>
            <button type="submit" className="rounded-xl bg-[#13714C] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
              Apply
            </button>
          </form>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {rows.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-gray-500">No attendance records for this range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">Date</th>
                      <th className="px-3 py-3">Admission No.</th>
                      <th className="px-3 py-3">Student</th>
                      <th className="rounded-r-xl px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 text-gray-600">
                          {new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-3 text-gray-600">{r.admissionNo}</td>
                        <td className="px-3 py-3 font-semibold text-gray-800">{r.studentName}</td>
                        <td className="px-3 py-3 text-gray-600">{STATUS_LABEL[r.status] ?? r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-sm text-gray-500">Total: {rows.length} records</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
