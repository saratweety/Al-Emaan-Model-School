"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createSubject, deleteSubject, updateSubjectClasses } from "@/app/dashboard/subjects/actions";
import { TrashIcon, PlusIcon, BookIcon, PencilIcon } from "@/components/icons";
import type { SubjectWithClasses } from "@/lib/subjects-data";
import type { SchoolClass } from "@/lib/classes-data";

function ClassCheckboxGrid({
  classes,
  selected,
  onChange,
}: {
  classes: SchoolClass[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const allSelected = classes.length > 0 && selected.size === classes.length;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  function toggleAll() {
    onChange(allSelected ? new Set() : new Set(classes.map((c) => c.id)));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">Classes</label>
        <button type="button" onClick={toggleAll} className="text-xs font-semibold text-[#13714C] hover:underline">
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-gray-200 p-3 sm:grid-cols-3">
        {classes.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selected.has(c.id)}
              onChange={() => toggle(c.id)}
              className="h-4 w-4 rounded border-gray-300 text-[#13714C] focus:ring-[#3AB67D]"
            />
            {c.name}
          </label>
        ))}
      </div>
    </div>
  );
}

function classSummary(subject: SubjectWithClasses, classes: SchoolClass[]) {
  if (subject.classIds.length === 0) return "No classes assigned";
  if (classes.length > 0 && subject.classIds.length === classes.length) return "All classes";
  return classes
    .filter((c) => subject.classIds.includes(c.id))
    .map((c) => c.name)
    .join(", ");
}

export default function SubjectsManager({ subjects, classes }: { subjects: SubjectWithClasses[]; classes: SchoolClass[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SubjectWithClasses | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithClasses | null>(null);
  const [editClassIds, setEditClassIds] = useState<Set<string>>(new Set());
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await createSubject(name, [...selectedClassIds]);
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Subject added.", "success");
    setName("");
    setSelectedClassIds(new Set());
    router.refresh();
  }

  function openEdit(subject: SubjectWithClasses) {
    setEditingSubject(subject);
    setEditClassIds(new Set(subject.classIds));
  }

  async function handleSaveEdit() {
    if (!editingSubject) return;
    setSavingEdit(true);
    const result = await updateSubjectClasses(editingSubject.id, [...editClassIds]);
    setSavingEdit(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Classes updated.", "success");
    setEditingSubject(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await deleteSubject(pendingDelete.id);
    setDeleting(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast(`${pendingDelete.name} was removed.`, "success");
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleAdd}
        className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
      >
        <Input
          label="Subject Name"
          required
          placeholder="e.g. Mathematics"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ClassCheckboxGrid classes={classes} selected={selectedClassIds} onChange={setSelectedClassIds} />
        <Button type="submit" loading={saving}>
          <PlusIcon className="h-4 w-4" />
          Add Subject
        </Button>
      </form>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {subjects.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
            <BookIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
            No subjects yet. Add the first one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                    <BookIcon className="h-4 w-4 shrink-0 text-[#3AB67D]" />
                    {s.name}
                  </span>
                  <p className="mt-0.5 truncate pl-6 text-xs text-gray-400">{classSummary(s, classes)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={`Edit classes for ${s.name}`}
                    onClick={() => openEdit(s)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${s.name}`}
                    onClick={() => setPendingDelete(s)}
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={editingSubject !== null}
        onClose={() => setEditingSubject(null)}
        title={editingSubject ? `Classes for ${editingSubject.name}` : ""}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingSubject(null)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingEdit ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <ClassCheckboxGrid classes={classes} selected={editClassIds} onChange={setEditClassIds} />
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove subject"
        message={pendingDelete ? `Remove "${pendingDelete.name}"? This can't be undone.` : ""}
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
