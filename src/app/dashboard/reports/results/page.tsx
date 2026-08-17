import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ReportPrintButton from "@/components/dashboard/ReportPrintButton";
import { ArrowLeftIcon } from "@/components/icons";
import { getResultReport } from "@/lib/reports-data";
import { getAllExams } from "@/lib/exams-data";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { gradeFor } from "@/lib/grading";

export const metadata: Metadata = { title: "Result Report | Al-Emaan Model School" };

export default async function ResultReportPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const sessionId = await getCurrentSessionId();
  const exams = await getAllExams(sessionId);
  const { exam: examId } = await searchParams;
  const selectedExamId = examId || exams[0]?.id || "";
  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const rows = selectedExamId ? await getResultReport(selectedExamId) : [];

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
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Result Report</h1>
            <p className="text-sm text-gray-500">Exam results for a selected exam and class.</p>
          </div>

          {exams.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm font-semibold text-gray-500 shadow-sm">
              No exams have been created yet.
            </div>
          ) : (
            <>
              <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm print:hidden">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Exam</label>
                  <select
                    name="exam"
                    defaultValue={selectedExamId}
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
                  >
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {e.className}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="rounded-xl bg-[#13714C] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
                  Apply
                </button>
              </form>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                {!selectedExam?.isPublished ? (
                  <p className="py-8 text-center text-sm font-semibold text-gray-500">This exam&apos;s results aren&apos;t published yet.</p>
                ) : rows.length === 0 ? (
                  <p className="py-8 text-center text-sm font-semibold text-gray-500">No marks entered for this exam.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                          <th className="rounded-l-xl px-3 py-3">#</th>
                          <th className="px-3 py-3">Admission No.</th>
                          <th className="px-3 py-3">Student</th>
                          <th className="px-3 py-3">Marks</th>
                          <th className="px-3 py-3">Percentage</th>
                          <th className="rounded-r-xl px-3 py-3">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className="border-b border-gray-50 last:border-0">
                            <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-3 text-gray-600">{r.admissionNo}</td>
                            <td className="px-3 py-3 font-semibold text-gray-800">{r.studentName}</td>
                            <td className="px-3 py-3 text-gray-600">
                              {r.marks} / {r.maxMarks}
                            </td>
                            <td className="px-3 py-3 text-gray-600">{r.percentage}%</td>
                            <td className="px-3 py-3 font-semibold text-[#13714C]">{gradeFor(r.percentage).grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
