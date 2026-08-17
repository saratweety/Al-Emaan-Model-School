"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import { deleteExam } from "@/app/dashboard/exams/actions";
import { EyeOutlineIcon, TrashIcon } from "@/components/icons";
import type { ExamRow } from "@/lib/exams-data";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ExamsBoard({ exams }: { exams: ExamRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingDelete, setPendingDelete] = useState<ExamRow | null>(null);

  function handleDelete() {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deleteExam(pendingDelete.id);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Exam removed.", "success");
      setPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      {exams.length === 0 ? (
        <p className="p-6 text-center text-sm font-semibold text-gray-500">
          No exams yet. Use &quot;Add Exam&quot; to schedule the first one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                <th className="rounded-l-xl px-3 py-3">#</th>
                <th className="px-3 py-3">Exam Name</th>
                <th className="px-3 py-3">Class</th>
                <th className="px-3 py-3">Subject</th>
                <th className="px-3 py-3">Teacher</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Marks</th>
                <th className="px-3 py-3">Status</th>
                <th className="rounded-r-xl px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e, i) => (
                <tr key={e.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-3 font-semibold text-gray-800">{e.name}</td>
                  <td className="px-3 py-3 text-gray-600">{e.className}</td>
                  <td className="px-3 py-3 text-gray-600">{e.subjectName ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-600">{e.teacherName}</td>
                  <td className="px-3 py-3 text-gray-600">{formatDate(e.examDate)}</td>
                  <td className="px-3 py-3 text-gray-600">
                    {e.enteredCount}/{e.totalStudents}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        e.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {e.isPublished ? "Published" : "Unpublished"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/results?examId=${e.id}`}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <EyeOutlineIcon className="h-3.5 w-3.5" />
                        View Result
                      </Link>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => setPendingDelete(e)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Remove exam"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Removing..." : "Remove"}
            </button>
          </>
        }
      >
        {pendingDelete
          ? `Remove "${pendingDelete.name}" for ${pendingDelete.className}? This also removes any marks entered.`
          : ""}
      </Modal>
    </div>
  );
}
