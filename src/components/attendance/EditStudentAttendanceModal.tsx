"use client";

import { useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/toast";
import { SaveIcon } from "@/components/icons";
import type { AttendanceStatus, MonthlyAttendanceDay } from "@/lib/attendance-data";

const STATUS_OPTIONS: { status: AttendanceStatus; label: string; activeClass: string }[] = [
  { status: "present", label: "P", activeClass: "bg-green-600 text-white" },
  { status: "absent", label: "A", activeClass: "bg-red-600 text-white" },
  { status: "late", label: "L", activeClass: "bg-amber-600 text-white" },
  { status: "leave", label: "V", activeClass: "bg-blue-600 text-white" },
];

export type SaveAttendanceResult = { success: true } | { success: false; error: string };

export default function EditStudentAttendanceModal({
  open,
  onClose,
  studentName,
  studentId,
  classId,
  days,
  initialStatuses,
  onSave,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  studentName: string;
  studentId: string;
  classId: string;
  days: MonthlyAttendanceDay[];
  initialStatuses: Record<string, AttendanceStatus>;
  onSave: (studentId: string, classId: string, records: { date: string; status: AttendanceStatus }[]) => Promise<SaveAttendanceResult>;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(initialStatuses);
  const [isPending, startTransition] = useTransition();

  function setDayStatus(date: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [date]: status }));
  }

  function handleSave() {
    const records = days
      .filter((d) => statuses[d.date])
      .map((d) => ({ date: d.date, status: statuses[d.date] }));

    if (records.length === 0) {
      showToast("Nothing to save.", "error");
      return;
    }

    startTransition(async () => {
      const result = await onSave(studentId, classId, records);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast(`Attendance updated for ${studentName}.`, "success");
      onSaved();
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Attendance — ${studentName}`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SaveIcon className="h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </button>
        </>
      }
    >
      <div className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-1">
        {days.length === 0 ? (
          <p className="text-sm text-gray-500">No school days recorded for this month yet.</p>
        ) : (
          days.map((d) => (
            <div key={d.date} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-2.5 py-1.5">
              <span className="text-xs font-semibold text-gray-600">
                {d.dayLabel} <span className="text-gray-400">({d.dow})</span>
              </span>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => setDayStatus(d.date, opt.status)}
                    className={`h-7 w-7 rounded-full text-xs font-bold transition ${
                      statuses[d.date] === opt.status ? opt.activeClass : "border border-gray-200 text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
