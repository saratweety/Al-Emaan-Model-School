"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { saveMarks } from "@/app/teacher/results/actions";
import { gradeFor } from "@/lib/grading";
import type { TeacherRosterStudent } from "@/lib/teacher-roster";
import { ChevronDownIcon, PencilIcon, SaveIcon, StarIcon, AwardIcon, UsersIcon, ClockIcon } from "@/components/icons";

export type TestOption = {
  id: string;
  classId: string;
  className: string;
  name: string;
  maxMarks: number;
  examDate: string | null;
};

export type MarkRow = { exam_id: string; student_id: string; marks: number; updated_at: string };

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function ResultsBoard({
  tests,
  roster,
  marks,
  initialExamId,
}: {
  tests: TestOption[];
  roster: TeacherRosterStudent[];
  marks: MarkRow[];
  initialExamId?: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const validInitial = initialExamId && tests.some((t) => t.id === initialExamId) ? initialExamId : tests[0]?.id ?? "";
  const [selectedExamId, setSelectedExamId] = useState(validInitial);
  const [mode, setMode] = useState<"view" | "edit">(initialExamId ? "edit" : "view");
  const [localMarks, setLocalMarks] = useState<Record<string, string>>({});
  const [seededForExamId, setSeededForExamId] = useState(selectedExamId);

  const selectedExam = tests.find((t) => t.id === selectedExamId) ?? tests[0];
  const examRoster = useMemo(
    () => roster.filter((s) => s.classId === selectedExam?.classId),
    [roster, selectedExam]
  );
  const marksForExam = useMemo(() => {
    const map: Record<string, { marks: number; updated_at: string }> = {};
    for (const m of marks.filter((m) => m.exam_id === selectedExamId)) {
      map[m.student_id] = { marks: m.marks, updated_at: m.updated_at };
    }
    return map;
  }, [marks, selectedExamId]);

  if (selectedExamId !== seededForExamId) {
    setSeededForExamId(selectedExamId);
    const seeded: Record<string, string> = {};
    for (const s of examRoster) {
      if (marksForExam[s.id] !== undefined) seeded[s.id] = String(marksForExam[s.id].marks);
    }
    setLocalMarks(seeded);
  }

  if (!selectedExam) return null;

  const entered = examRoster.filter((s) => marksForExam[s.id] !== undefined).length;
  const pending = examRoster.length - entered;
  const lastSaved = Object.values(marksForExam).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];

  const percentages = examRoster
    .map((s) => marksForExam[s.id])
    .filter((m): m is { marks: number; updated_at: string } => m !== undefined)
    .map((m) => (m.marks / selectedExam.maxMarks) * 100);
  const classAverage = percentages.length ? percentages.reduce((a, b) => a + b, 0) / percentages.length : 0;
  const highest = percentages.length ? Math.max(...percentages) : 0;
  const lowest = percentages.length ? Math.min(...percentages) : 0;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const entries = Object.entries(localMarks)
      .filter(([, v]) => v.trim() !== "")
      .map(([student_id, v]) => ({ student_id, marks: Number(v) }));

    if (entries.length === 0) {
      showToast("Enter at least one mark.", "error");
      return;
    }

    startTransition(async () => {
      const result = await saveMarks(selectedExamId, entries);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Results saved.", "success");
      setMode("view");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setMode("view");
              }}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-semibold text-[#13714C] outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.className} — {t.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">
            Total Marks: <span className="font-semibold text-gray-700">{selectedExam.maxMarks}</span>
          </span>
          {selectedExam.examDate && (
            <span className="text-sm text-gray-500">
              Test Date:{" "}
              <span className="font-semibold text-gray-700">
                {new Date(selectedExam.examDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </span>
          )}
        </div>

        {mode === "view" ? (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Results
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("view")}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>

      {mode === "view" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3AB67D]">
              <UsersIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Total Students</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{examRoster.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500">
              <StarIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Class Average</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{percentages.length ? `${classAverage.toFixed(1)}%` : "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500">
              <AwardIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Highest Score</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{percentages.length ? `${highest.toFixed(0)}%` : "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500">
              <AwardIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Lowest Score</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{percentages.length ? `${lowest.toFixed(0)}%` : "—"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#3AB67D]">
              <UsersIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Total Students</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{examRoster.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500">
              <PencilIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Marks Entered</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{entered}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500">
              <ClockIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Pending</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{pending}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500">
              <SaveIcon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">Last Saved</p>
              <p className="text-sm font-extrabold text-[#0f4d34]">{lastSaved ? fmtDateTime(lastSaved.updated_at) : "—"}</p>
            </div>
          </div>
        </div>
      )}

      <form id="results-form" onSubmit={handleSave} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {examRoster.length === 0 ? (
          <p className="text-center text-sm font-semibold text-gray-500">No students found for this class.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Roll No.</th>
                  <th className="px-3 py-3">Student Name</th>
                  <th className="px-3 py-3">Obtained Marks (/{selectedExam.maxMarks})</th>
                  <th className="px-3 py-3">Percentage</th>
                  <th className="px-3 py-3">Grade</th>
                  <th className="rounded-r-xl px-3 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {examRoster.map((s, i) => {
                  const rawValue = mode === "edit" ? localMarks[s.id] : marksForExam[s.id]?.marks?.toString();
                  const numeric = rawValue !== undefined && rawValue !== "" ? Number(rawValue) : null;
                  const pct = numeric !== null ? (numeric / selectedExam.maxMarks) * 100 : null;
                  const band = pct !== null ? gradeFor(pct) : null;

                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5 text-gray-600">{s.rollNumber ?? "—"}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-800">{s.full_name}</td>
                      <td className="px-3 py-2.5">
                        {mode === "edit" ? (
                          <input
                            type="number"
                            min={0}
                            max={selectedExam.maxMarks}
                            placeholder="Enter marks"
                            value={localMarks[s.id] ?? ""}
                            onChange={(e) => setLocalMarks((m) => ({ ...m, [s.id]: e.target.value }))}
                            className="w-24 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                          />
                        ) : (
                          <span className="text-gray-700">{numeric ?? "—"}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{pct !== null ? `${pct.toFixed(0)}%` : "—"}</td>
                      <td className="px-3 py-2.5">
                        {band ? (
                          <span className="rounded-md bg-[#A2E494]/25 px-2 py-1 text-xs font-bold text-[#0f4d34]">{band.grade}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{band ? band.remark : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {mode === "edit" && examRoster.length > 0 && (
          <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <SaveIcon className="h-4 w-4" />
              {isPending ? "Saving..." : "Save Results"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
