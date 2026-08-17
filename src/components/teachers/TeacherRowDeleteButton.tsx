"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { TrashIcon } from "@/components/icons";
import { deleteTeacher } from "@/app/dashboard/teachers/[id]/actions";

export default function TeacherRowDeleteButton({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTeacher(teacherId);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Teacher removed.", "success");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Delete"
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={open}
        title="Remove teacher"
        message={`Remove "${teacherName}"? This deletes their login and all class/subject assignments. This can't be undone.`}
        confirmLabel="Remove"
        danger
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
