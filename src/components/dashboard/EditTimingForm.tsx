"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { ClockIcon, InfoIcon, DoorOpenIcon, BuildingIcon, CoffeeIcon, DoorExitIcon, XIcon, SaveIcon } from "@/components/icons";
import { updateSchoolTiming } from "@/app/dashboard/settings/actions";
import type { SchoolSettings } from "@/lib/school-settings-data";

function TimeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full sm:w-[220px]">
      <ClockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="time"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
      />
    </div>
  );
}

export default function EditTimingForm({ settings }: { settings: SchoolSettings }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [openingTime, setOpeningTime] = useState(settings.openingTime);
  const [closingTime, setClosingTime] = useState(settings.closingTime);
  const [teacherReportingTime, setTeacherReportingTime] = useState(settings.teacherReportingTime);
  const [breakStart, setBreakStart] = useState(settings.breakStart);
  const [breakEnd, setBreakEnd] = useState(settings.breakEnd);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await updateSchoolTiming({ openingTime, closingTime, teacherReportingTime, breakStart, breakEnd });
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("School timing updated.", "success");
    router.push("/dashboard/settings");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A2E494]/25 text-[#13714C]">
            <ClockIcon className="h-4 w-4" />
          </span>
          SCHOOL TIMING DETAILS
        </h2>

        <div className="mb-5 flex items-start gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#13714C]" />
          These timings will be used for daily attendance, timetable periods and other school activities.
        </div>

        <div className="divide-y divide-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/20 text-[#13714C]">
                <DoorOpenIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800">School Opening Time</p>
                <p className="text-xs text-gray-400">Students entry time</p>
              </div>
            </div>
            <TimeField value={openingTime} onChange={setOpeningTime} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/20 text-[#13714C]">
                <BuildingIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800">Teacher Reporting Time</p>
                <p className="text-xs text-gray-400">Teachers must report before</p>
              </div>
            </div>
            <TimeField value={teacherReportingTime} onChange={setTeacherReportingTime} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/20 text-[#13714C]">
                <CoffeeIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800">Break Time</p>
                <p className="text-xs text-gray-400">Short break for students</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TimeField value={breakStart} onChange={setBreakStart} />
              <span className="text-sm text-gray-400">to</span>
              <TimeField value={breakEnd} onChange={setBreakEnd} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/20 text-[#13714C]">
                <DoorExitIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800">School Closing Time</p>
                <p className="text-xs text-gray-400">School closing time</p>
              </div>
            </div>
            <TimeField value={closingTime} onChange={setClosingTime} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/settings")}
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
          {saving ? "Saving..." : "Save Timing"}
        </button>
      </div>
    </form>
  );
}
