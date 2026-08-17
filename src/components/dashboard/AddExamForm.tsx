"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { createExam } from "@/app/dashboard/exams/actions";
import { AwardIcon, XIcon, SaveIcon, InfoIcon } from "@/components/icons";
import type { SchoolClass } from "@/lib/classes-data";

export type Assignment = {
  classId: string;
  teacherId: string;
  teacherName: string;
  subjectId: string | null;
  subjectName: string;
};

export default function AddExamForm({ classes, assignments }: { classes: SchoolClass[]; assignments: Assignment[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [assignmentKey, setAssignmentKey] = useState("");
  const [name, setName] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [examDate, setExamDate] = useState("");
  const [saving, setSaving] = useState(false);

  const classAssignments = useMemo(() => assignments.filter((a) => a.classId === classId), [assignments, classId]);
  const selected = classAssignments.find((a) => `${a.teacherId}|${a.subjectId ?? ""}` === assignmentKey);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const assignment = selected ?? classAssignments[0];
    if (!assignment) {
      showToast("No teacher is assigned to this class yet.", "error");
      return;
    }

    const formData = new FormData();
    formData.set("class_id", classId);
    formData.set("teacher_id", assignment.teacherId);
    formData.set("subject_id", assignment.subjectId ?? "");
    formData.set("name", name);
    formData.set("max_marks", maxMarks);
    formData.set("exam_date", examDate);

    setSaving(true);
    const result = await createExam(formData);
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Exam scheduled.", "success");
    router.push("/dashboard/exams");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <AwardIcon className="h-4 w-4" />
          Exam Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Exam Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mid Term Exam 2026"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setAssignmentKey("");
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Teacher &amp; Subject <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={assignmentKey}
              onChange={(e) => setAssignmentKey(e.target.value)}
              disabled={classAssignments.length === 0}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {classAssignments.length === 0 ? "No teacher assigned to this class" : "Select Teacher"}
              </option>
              {classAssignments.map((a) => (
                <option key={`${a.teacherId}|${a.subjectId ?? ""}`} value={`${a.teacherId}|${a.subjectId ?? ""}`}>
                  {a.teacherName} — {a.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Total Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              placeholder="e.g. 100"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
        </div>

        {classAssignments.length === 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-700">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Assign a teacher to this class first (Teachers → class assignment) before scheduling an exam for it.
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Link
            href="/dashboard/exams"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <XIcon className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || classAssignments.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? "Saving..." : "Save Exam"}
          </button>
        </div>
      </section>
    </form>
  );
}
