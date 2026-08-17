"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { TrashIcon } from "@/components/icons";
import { deleteStudent } from "@/app/dashboard/students/[id]/actions";

export default function StudentDeleteButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteStudent(studentId);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Student removed.", "success");
      setOpen(false);
      router.push("/dashboard/students");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
      <ConfirmDialog
        open={open}
        title="Remove student"
        message={`Remove "${studentName}"? This also removes their enrollment, attendance, fee and result history. This can't be undone.`}
        confirmLabel="Remove"
        danger
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
