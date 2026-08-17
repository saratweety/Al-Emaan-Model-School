"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/dashboard/StatCard";
import { setExamPublished, fetchExamResult } from "@/app/dashboard/exams/actions";
import { ClipboardListIcon, UsersIcon, GraduationCapIcon, AwardIcon, StarIcon, EyeOutlineIcon, InfoIcon } from "@/components/icons";
import type { ExamRow, ExamResultDetail, ResultsOverview as ResultsOverviewData } from "@/lib/exams-data";

const rankStyles: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-gray-300 text-white",
  3: "bg-orange-400 text-white",
};

export default function ResultsOverview({
  exams,
  overview,
  initialExamId,
}: {
  exams: ExamRow[];
  overview: ResultsOverviewData;
  initialExamId?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [viewExamId, setViewExamId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ExamResultDetail | null>(null);
  const [loadingDetail, startDetailTransition] = useTransition();

  function openResult(examId: string) {
    startDetailTransition(async () => {
      setViewExamId(examId);
      const { detail: d, error } = await fetchExamResult(examId);
      if (error) showToast(error, "error");
      setDetail(d);
    });
  }

  useEffect(() => {
    if (initialExamId && exams.some((e) => e.id === initialExamId)) {
      startDetailTransition(async () => {
        setViewExamId(initialExamId);
        const { detail: d, error } = await fetchExamResult(initialExamId);
        if (error) showToast(error, "error");
        setDetail(d);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePublish(exam: ExamRow) {
    startTransition(async () => {
      const result = await setExamPublished(exam.id, !exam.isPublished);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast(exam.isPublished ? "Result unpublished." : "Result published.", "success");
      router.refresh();
    });
  }

  const statCards = [
    { icon: ClipboardListIcon, iconBg: "bg-[#13714C]", label: "TOTAL EXAMS", value: String(overview.totalExams), sub: "This Session" },
    { icon: UsersIcon, iconBg: "bg-blue-500", label: "PUBLISHED RESULTS", value: String(overview.publishedCount), sub: "This Session" },
    { icon: GraduationCapIcon, iconBg: "bg-amber-500", label: "STUDENTS PASSED", value: `${overview.overallPassPct}%`, sub: "Overall Pass %" },
    { icon: AwardIcon, iconBg: "bg-purple-500", label: "TOP PERFORMERS", value: String(overview.topPerformers.length), sub: "Students" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Results table */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f4d34]">Results Overview</h2>
          {exams.length === 0 ? (
            <p className="p-6 text-center text-sm font-semibold text-gray-500">No exams yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Exam Name</th>
                    <th className="px-3 py-3">Class</th>
                    <th className="px-3 py-3">Marks Entered</th>
                    <th className="px-3 py-3">Pass %</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e, i) => (
                    <tr key={e.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5 font-bold text-gray-800">{e.name}</td>
                      <td className="px-3 py-2.5 text-gray-600">{e.className}</td>
                      <td className="px-3 py-2.5 text-gray-600">
                        {e.enteredCount}/{e.totalStudents}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-bold text-green-700">{e.passPct}{e.passPct !== "—" ? "%" : ""}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            e.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {e.isPublished ? "Published" : "Unpublished"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openResult(e.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            <EyeOutlineIcon className="h-3.5 w-3.5" />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePublish(e)}
                            disabled={isPending || e.totalStudents === 0 || e.enteredCount < e.totalStudents}
                            title={e.enteredCount < e.totalStudents ? "All marks must be entered before publishing" : undefined}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              e.isPublished
                                ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                : "bg-gradient-to-r from-[#3AB67D] to-[#13714C] text-white hover:brightness-110"
                            }`}
                          >
                            {e.isPublished ? "Unpublish" : "Publish"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
              <StarIcon className="h-4 w-4 text-amber-400" />
              Top Performers (Published)
            </h2>
            {overview.topPerformers.length === 0 ? (
              <p className="text-sm text-gray-500">No published results yet.</p>
            ) : (
              <ul className="space-y-3">
                {overview.topPerformers.map((s, i) => (
                  <li key={s.studentId} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        rankStyles[i + 1] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{s.fullName}</p>
                      <p className="text-xs text-gray-400">{s.className}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                      {s.averagePct}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
              <InfoIcon className="h-4 w-4" />
              Important Note
            </h2>
            <p className="text-sm text-gray-600">
              Parents can only see a result once it&apos;s published, and marks must be fully entered before you can
              publish.
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={viewExamId !== null}
        onClose={() => {
          setViewExamId(null);
          setDetail(null);
        }}
        title={detail?.exam.name ? `${detail.exam.name} — ${detail.exam.className}` : "Result"}
      >
        {loadingDetail ? (
          <p className="py-4 text-center text-sm text-gray-400">Loading…</p>
        ) : !detail || detail.students.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No students found for this class.</p>
        ) : (
          <ul className="max-h-96 space-y-2 overflow-y-auto">
            {detail.students.map((s) => (
              <li key={s.studentId} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{s.fullName}</p>
                  <p className="text-xs text-gray-400">{s.rollNumber ?? "—"}</p>
                </div>
                <div className="shrink-0 text-right">
                  {s.marks !== null ? (
                    <>
                      <p className="text-sm font-bold text-gray-800">
                        {s.marks}/{detail.exam.maxMarks} ({s.percentage?.toFixed(0)}%)
                      </p>
                      <p className="text-xs font-semibold text-[#13714C]">
                        {s.grade} — {s.remark}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs font-semibold text-gray-400">Not entered</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
