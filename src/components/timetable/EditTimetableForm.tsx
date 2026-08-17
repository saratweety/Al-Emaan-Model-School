"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import {
  CalendarIcon,
  ClockIcon,
  InfoIcon,
  XIcon,
  SaveIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import type { SchoolClass } from "@/lib/classes-data";
import type { Subject } from "@/lib/subjects-data";
import { fetchClassSchedule, saveTimetable, type PeriodInput } from "@/app/dashboard/timetable/actions";

function toPeriodInput(rows: { id: string; label: string; start_time: string; end_time: string; is_break: boolean; subject_id: string | null }[]): PeriodInput[] {
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    start_time: r.start_time.slice(0, 5),
    end_time: r.end_time.slice(0, 5),
    is_break: r.is_break,
    subject_id: r.subject_id,
  }));
}

function PeriodRowsEditor({
  rows,
  subjects,
  onChange,
}: {
  rows: PeriodInput[];
  subjects: Subject[];
  onChange: (rows: PeriodInput[]) => void;
}) {
  function updateRow(index: number, patch: Partial<PeriodInput>) {
    onChange(
      rows.map((r, i) => {
        if (i === index) return { ...r, ...patch };
        // Chain period times: changing a period's end time fills the next period's start time.
        if (i === index + 1 && patch.end_time) return { ...r, start_time: patch.end_time };
        return r;
      })
    );
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([
      ...rows,
      { id: null, label: String(rows.filter((r) => !r.is_break).length + 1), start_time: "", end_time: "", is_break: false, subject_id: null },
    ]);
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 bg-[#F4F6F5] p-3 text-center text-xs text-gray-400">
          No periods yet. Add one below.
        </p>
      )}
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 p-2.5">
          <input
            type="text"
            value={row.label}
            onChange={(e) => updateRow(i, { label: e.target.value })}
            placeholder="Label"
            className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
          />
          <input
            type="time"
            value={row.start_time}
            onChange={(e) => updateRow(i, { start_time: e.target.value })}
            required
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="time"
            value={row.end_time}
            onChange={(e) => updateRow(i, { end_time: e.target.value })}
            required
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
          />
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={row.is_break}
              onChange={(e) => updateRow(i, { is_break: e.target.checked, subject_id: e.target.checked ? null : row.subject_id })}
            />
            Break
          </label>
          {!row.is_break && (
            <select
              value={row.subject_id ?? ""}
              onChange={(e) => updateRow(i, { subject_id: e.target.value || null })}
              className="min-w-[140px] flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
            aria-label="Remove period"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Add Period
      </button>
    </div>
  );
}

export default function EditTimetableForm({
  classes,
  subjects,
  sessionId,
  sessionLabel,
  initialClassId,
  initialWeekday,
  initialFriday,
}: {
  classes: SchoolClass[];
  subjects: Subject[];
  sessionId: string | null;
  sessionLabel: string;
  initialClassId: string;
  initialWeekday: { id: string; label: string; start_time: string; end_time: string; is_break: boolean; subject_id: string | null }[];
  initialFriday: { id: string; label: string; start_time: string; end_time: string; is_break: boolean; subject_id: string | null }[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [classId, setClassId] = useState(initialClassId);
  const [weekday, setWeekday] = useState<PeriodInput[]>(toPeriodInput(initialWeekday));
  const [friday, setFriday] = useState<PeriodInput[]>(toPeriodInput(initialFriday));
  const [loadingClass, setLoadingClass] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleClassChange(newClassId: string) {
    setClassId(newClassId);
    if (!sessionId || !newClassId) return;
    setLoadingClass(true);
    try {
      const schedule = await fetchClassSchedule(sessionId, newClassId);
      setWeekday(toPeriodInput(schedule.weekday));
      setFriday(toPeriodInput(schedule.friday));
    } catch {
      showToast("Couldn't load the schedule for that class.", "error");
    } finally {
      setLoadingClass(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!sessionId) {
      showToast("No current academic session is configured.", "error");
      return;
    }
    if (!classId) {
      showToast("Select a class first.", "error");
      return;
    }

    setSaving(true);
    const result = await saveTimetable({ sessionId, classId, weekday, friday });
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Timetable updated.", "success");
    router.push("/dashboard/timetable");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A2E494]/25 text-[#13714C]">
            <CalendarIcon className="h-4 w-4" />
          </span>
          TIMETABLE INFORMATION
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Academic Session</label>
            <div className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm text-gray-500">
              {sessionLabel}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A2E494]/25 text-[#13714C]">
            <ClockIcon className="h-4 w-4" />
          </span>
          WEEKLY SCHEDULE
        </h2>

        <div className="mb-5 flex items-start gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#13714C]" />
          Period times apply school-wide. Monday to Saturday share one schedule; Friday has its own. Type the start
          and end time for each period.
        </div>

        {loadingClass ? (
          <p className="text-sm text-gray-400">Loading schedule…</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Monday to Saturday (Same Schedule)</h3>
              <PeriodRowsEditor rows={weekday} subjects={subjects} onChange={setWeekday} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Friday (Early Closing)</h3>
              <PeriodRowsEditor rows={friday} subjects={subjects} onChange={setFriday} />
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/timetable")}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <XIcon className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <SaveIcon className="h-4 w-4" />
          {saving ? "Saving..." : "Update Timetable"}
        </button>
      </div>
    </form>
  );
}
