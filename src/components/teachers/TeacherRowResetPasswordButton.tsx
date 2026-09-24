"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/lib/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LockIcon } from "@/components/icons";
import { sendTeacherPasswordReset } from "@/app/dashboard/teachers/[id]/actions";

export default function TeacherRowResetPasswordButton({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    startTransition(async () => {
      const result = await sendTeacherPasswordReset(teacherId);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast(`Password reset email sent to ${teacherName}.`, "success");
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Reset Password"
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20"
      >
        <LockIcon className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={open}
        title="Reset password"
        message={`Send a password reset email to "${teacherName}"? They'll get a link to set a new password.`}
        confirmLabel="Send Reset Email"
        loading={isPending}
        onConfirm={handleReset}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
