"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { UserIcon, PlusIcon, TrashIcon, StarIcon } from "@/components/icons";
import { assignTeacher, removeAssignment } from "@/app/dashboard/classes/[classId]/actions";

export type AssignmentOption = { id: string; name: string };
export type Assignment = {
  id: string;
  isClassTeacher: boolean;
  subjectName: string;
  teacherName: string;
};

export default function TeacherAssignmentsPanel({
  classId,
  subjects,
  teachers,
  assignments,
}: {
  classId: string;
  subjects: AssignmentOption[];
  teachers: AssignmentOption[];
  assignments: Assignment[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  function closeModal() {
    setOpen(false);
    setSubjectId("");
    setTeacherId("");
    setIsClassTeacher(false);
  }

  async function handleAssign(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await assignTeacher(classId, subjectId, teacherId, isClassTeacher);
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Teacher assigned.", "success");
    closeModal();
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await removeAssignment(pendingDelete.id, classId);
    setDeleting(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Assignment removed.", "success");
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#0f4d34]">Teacher Assignments</h2>
        <Button type="button" onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          Assign Teacher
        </Button>
      </div>

      {assignments.length === 0 ? (
        <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
          No teachers assigned to this class yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A2E494]/25 text-[#13714C]">
                  <UserIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    {a.teacherName}
                    {a.isClassTeacher && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <StarIcon className="h-3 w-3" />
                        Class Teacher
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{a.subjectName}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label={`Remove ${a.teacherName} from ${a.subjectName}`}
                onClick={() => setPendingDelete(a)}
                className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={closeModal} title="Assign Teacher">
        <form onSubmit={handleAssign} className="space-y-4">
          <Select
            label="Subject"
            required
            placeholder="Select subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Select
            label="Teacher"
            required
            placeholder="Select teacher"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            options={teachers.map((t) => ({ value: t.id, label: t.name }))}
          />
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={isClassTeacher}
              onChange={(e) => setIsClassTeacher(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#13714C] focus:ring-[#3AB67D]"
            />
            Make this the class teacher (homeroom) for the current session
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Assign
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove assignment"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.teacherName} from ${pendingDelete.subjectName} for this class?`
            : ""
        }
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
