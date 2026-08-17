"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { createTest, deleteTest } from "@/app/teacher/tests/actions";
import { PlusIcon, TrashIcon, PencilIcon } from "@/components/icons";

export type TestRow = {
  id: string;
  classId: string;
  className: string;
  name: string;
  maxMarks: number;
  examDate: string | null;
};

export default function TestsBoard({ classes, tests }: { classes: { id: string; name: string }[]; tests: TestRow[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ class_id: classes[0]?.id ?? "", name: "", max_marks: "100", exam_date: "" });
  const [pendingDelete, setPendingDelete] = useState<TestRow | null>(null);

  function openAdd() {
    setForm({ class_id: classes[0]?.id ?? "", name: "", max_marks: "100", exam_date: "" });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.class_id || !form.name.trim() || !form.max_marks) return;

    const formData = new FormData();
    formData.set("class_id", form.class_id);
    formData.set("name", form.name.trim());
    formData.set("max_marks", form.max_marks);
    formData.set("exam_date", form.exam_date);

    startTransition(async () => {
      const result = await createTest(formData);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Test created.", "success");
      setModalOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deleteTest(pendingDelete.id);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Test removed.", "success");
      setPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAdd}
          disabled={classes.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlusIcon className="h-4 w-4" />
          Add Test
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {tests.length === 0 ? (
          <p className="p-6 text-center text-sm font-semibold text-gray-500">
            No tests created yet. Add one to start entering marks.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Test Name</th>
                  <th className="px-3 py-3">Total Marks</th>
                  <th className="px-3 py-3">Test Date</th>
                  <th className="rounded-r-xl px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t, i) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3 text-gray-600">{t.className}</td>
                    <td className="px-3 py-3 font-semibold text-gray-800">{t.name}</td>
                    <td className="px-3 py-3 text-gray-600">{t.maxMarks}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {t.examDate
                        ? new Date(t.examDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/teacher/results?examId=${t.id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-[#13714C]/30 px-2.5 py-1.5 text-xs font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                          Enter Marks
                        </Link>
                        <button
                          type="button"
                          aria-label="Delete"
                          onClick={() => setPendingDelete(t)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
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
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Test"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="test-form"
              disabled={isPending}
              className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Saving..." : "Create Test"}
            </button>
          </>
        }
      >
        <form id="test-form" onSubmit={handleSubmit} className="space-y-3">
          <Select
            label="Class"
            required
            value={form.class_id}
            onChange={(e) => setForm((f) => ({ ...f, class_id: e.target.value }))}
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Input
            label="Test Name"
            required
            placeholder="e.g. Mid Term Exam"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Total Marks"
            type="number"
            min={1}
            required
            value={form.max_marks}
            onChange={(e) => setForm((f) => ({ ...f, max_marks: e.target.value }))}
          />
          <Input
            label="Test Date (optional)"
            type="date"
            value={form.exam_date}
            onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Remove test"
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
        {pendingDelete ? `Remove "${pendingDelete.name}" for ${pendingDelete.className}? This also removes any marks entered.` : ""}
      </Modal>
    </div>
  );
}
