"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { createHomework, updateHomework, deleteHomework } from "@/app/teacher/homework/actions";
import { createTest } from "@/app/teacher/tests/actions";
import { PlusIcon, ChevronDownIcon, PencilIcon, TrashIcon } from "@/components/icons";

export type HomeworkEntry = {
  id: string;
  classId: string;
  className: string;
  subjectId: string | null;
  subjectName: string | null;
  entryType: "homework" | "vacation_diary";
  title: string;
  description: string;
  dueDate: string | null;
  postedOn: string;
};

export type SubjectAssignment = {
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
};

function isActive(dueDate: string | null) {
  if (!dueDate) return true;
  return dueDate >= new Date().toISOString().slice(0, 10);
}

export default function HomeworkBoard({
  assignments,
  classTeacherClasses,
  entries,
}: {
  assignments: SubjectAssignment[];
  classTeacherClasses: { id: string; name: string }[];
  entries: HomeworkEntry[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const subjectClasses = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of assignments) map.set(a.classId, a.className);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [assignments]);

  const allTeacherClasses = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of subjectClasses) map.set(c.id, c.name);
    for (const c of classTeacherClasses) map.set(c.id, c.name);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [subjectClasses, classTeacherClasses]);

  const [filterClass, setFilterClass] = useState("All Classes");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeworkEntry | null>(null);
  const [form, setForm] = useState({
    kind: "homework" as "homework" | "test" | "vacation_diary",
    class_id: subjectClasses[0]?.id ?? "",
    subject_id: assignments.find((a) => a.classId === subjectClasses[0]?.id)?.subjectId ?? "",
    title: "",
    description: "",
    due_date: "",
    max_marks: "100",
  });
  const [pendingDelete, setPendingDelete] = useState<HomeworkEntry | null>(null);

  const subjectsForClass = (classId: string) => assignments.filter((a) => a.classId === classId);

  const visibleEntries = entries.filter((e) => {
    if (filterClass !== "All Classes" && e.className !== filterClass) return false;
    return true;
  });

  function openAdd() {
    setEditing(null);
    setForm({
      kind: "homework",
      class_id: subjectClasses[0]?.id ?? "",
      subject_id: subjectsForClass(subjectClasses[0]?.id ?? "")[0]?.subjectId ?? "",
      title: "",
      description: "",
      due_date: "",
      max_marks: "100",
    });
    setModalOpen(true);
  }

  function openEdit(entry: HomeworkEntry) {
    setEditing(entry);
    setForm({
      kind: entry.entryType,
      class_id: entry.classId,
      subject_id: entry.subjectId ?? subjectsForClass(entry.classId)[0]?.subjectId ?? "",
      title: entry.title,
      description: entry.description,
      due_date: entry.dueDate ?? "",
      max_marks: "100",
    });
    setModalOpen(true);
  }

  function handleClassChange(classId: string) {
    setForm((f) => ({ ...f, class_id: classId, subject_id: subjectsForClass(classId)[0]?.subjectId ?? "" }));
  }

  function handleKindChange(kind: "homework" | "test" | "vacation_diary") {
    const classId = kind === "vacation_diary" ? (classTeacherClasses[0]?.id ?? "") : (subjectClasses[0]?.id ?? "");
    setForm((f) => ({
      ...f,
      kind,
      class_id: classId,
      subject_id: kind === "vacation_diary" ? "" : (subjectsForClass(classId)[0]?.subjectId ?? ""),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.class_id || !form.title.trim()) return;
    if (form.kind === "homework" && (!form.subject_id || !form.description.trim())) return;
    if (form.kind === "vacation_diary" && !form.description.trim()) return;
    if (form.kind === "test" && (!form.subject_id || !form.max_marks || Number(form.max_marks) <= 0)) return;

    const isNewTest = !editing && form.kind === "test";

    startTransition(async () => {
      let result;

      if (isNewTest) {
        const testFormData = new FormData();
        testFormData.set("class_id", form.class_id);
        testFormData.set("subject_id", form.subject_id);
        testFormData.set("name", form.title.trim());
        testFormData.set("max_marks", form.max_marks);
        testFormData.set("exam_date", form.due_date);
        result = await createTest(testFormData);
      } else {
        const formData = new FormData();
        formData.set("class_id", form.class_id);
        formData.set("subject_id", form.kind === "homework" ? form.subject_id : "");
        formData.set("entry_type", form.kind === "vacation_diary" ? "vacation_diary" : "homework");
        formData.set("title", form.title.trim());
        formData.set("description", form.description.trim());
        formData.set("due_date", form.due_date);
        result = editing ? await updateHomework(editing.id, formData) : await createHomework(formData);
      }

      if (!result.success) {
        showToast(result.error, "error");
        return;
      }

      showToast(isNewTest ? "Test created — enter marks from the Tests page." : editing ? "Entry updated." : "Entry posted.", "success");
      setModalOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!pendingDelete) return;

    startTransition(async () => {
      const result = await deleteHomework(pendingDelete.id);

      if (!result.success) {
        showToast(result.error, "error");
        return;
      }

      showToast("Entry removed.", "success");
      setPendingDelete(null);
      router.refresh();
    });
  }

  const canAddHomework = subjectClasses.length > 0;
  const canAddVacationDiary = classTeacherClasses.length > 0;
  const canAdd = canAddHomework || canAddVacationDiary;
  const kindOptions = [
    ...(canAddHomework ? [{ value: "homework", label: "Homework" }] : []),
    ...(canAddHomework ? [{ value: "test", label: "Test" }] : []),
    ...(canAddVacationDiary ? [{ value: "vacation_diary", label: "Class / Vacation Diary" }] : []),
  ];
  const classOptionsForKind = form.kind === "vacation_diary" ? classTeacherClasses : subjectClasses;
  const subjectOptionsForKind = form.kind === "vacation_diary" ? [] : subjectsForClass(form.class_id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-fit">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-semibold text-gray-600 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          >
            <option>All Classes</option>
            {allTeacherClasses.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={!canAdd}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Entry
        </button>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-500">No entries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleEntries.map((entry) => {
            const active = isActive(entry.dueDate);
            return (
              <div key={entry.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      {entry.entryType === "vacation_diary" ? "Class / Vacation Diary" : "Homework"}
                    </span>
                    {entry.subjectName && (
                      <span className="ml-2 inline-block rounded-full bg-[#A2E494]/20 px-2.5 py-1 text-xs font-semibold text-[#0f4d34]">
                        {entry.subjectName}
                      </span>
                    )}
                    <p className="mt-2 text-base font-bold text-[#0f4d34]">{entry.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {entry.className} · {entry.postedOn}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-gray-700">Details: </span>
                      {entry.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {entry.dueDate && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Due Date</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(entry.dueDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {active ? "Active" : "Expired"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={() => openEdit(entry)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => setPendingDelete(entry)}
                        className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Entry" : "Add New Entry"}
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
              form="homework-form"
              disabled={isPending}
              className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Saving..." : editing ? "Save Changes" : form.kind === "test" ? "Create Test" : "Post"}
            </button>
          </>
        }
      >
        <form id="homework-form" onSubmit={handleSubmit} className="space-y-3">
          {!editing && (
            <Select
              label="Type"
              required
              value={form.kind}
              onChange={(e) => handleKindChange(e.target.value as "homework" | "test" | "vacation_diary")}
              options={kindOptions}
            />
          )}
          <div className={form.kind === "vacation_diary" ? "" : "grid grid-cols-2 gap-3"}>
            <Select
              label="Class"
              required
              value={form.class_id}
              onChange={(e) => handleClassChange(e.target.value)}
              options={classOptionsForKind.map((c) => ({ value: c.id, label: c.name }))}
            />
            {form.kind !== "vacation_diary" && (
              <Select
                label="Subject"
                required
                value={form.subject_id}
                onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
                options={subjectOptionsForKind.map((s) => ({ value: s.subjectId, label: s.subjectName }))}
              />
            )}
          </div>
          <Input
            label={form.kind === "test" ? "Test Name" : "Title"}
            required
            placeholder={form.kind === "test" ? "e.g. Mid Term Exam" : "e.g. Exercise 4.1"}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          {form.kind !== "test" && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the entry..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
          )}
          {form.kind === "test" && (
            <Input
              label="Total Marks"
              type="number"
              min={1}
              required
              value={form.max_marks}
              onChange={(e) => setForm((f) => ({ ...f, max_marks: e.target.value }))}
            />
          )}
          <Input
            label={form.kind === "test" ? "Test Date (optional)" : "Due Date (optional)"}
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Remove entry"
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
        {pendingDelete ? `Remove "${pendingDelete.title}" for ${pendingDelete.className}?` : ""}
      </Modal>
    </div>
  );
}
