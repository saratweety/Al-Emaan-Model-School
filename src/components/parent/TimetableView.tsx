"use client";

import { useState, useTransition } from "react";
import { CalendarIcon, GraduationCapIcon, InfoIcon } from "@/components/icons";
import { useToast } from "@/lib/toast";
import ParentPageHead from "./ParentPageHead";
import ChildPicker from "./ChildPicker";
import { fetchChildTimetable } from "@/app/parent/actions";
import type { ParentChild } from "@/lib/parent-data";
import type { ClassSchedule, TimetablePeriod } from "@/lib/timetable-data";

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function ScheduleTable({ periods }: { periods: TimetablePeriod[] }) {
  if (periods.length === 0) {
    return <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">Not set up yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] table-fixed text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
            <th className="w-[64px] pb-2">Period</th>
            <th className="w-[170px] pb-2">Time</th>
            <th className="pb-2">Subject</th>
            <th className="pb-2">Teacher</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p) =>
            p.is_break ? (
              <tr key={p.id} className="bg-[#F4F6F5]/60">
                <td className="py-2.5 text-[#13714C]">{p.label}</td>
                <td className="py-2.5 font-semibold text-[#13714C]">
                  {formatTime(p.start_time)} - {formatTime(p.end_time)}
                </td>
                <td className="py-2.5 font-semibold text-[#13714C]" colSpan={2}>
                  Break
                </td>
              </tr>
            ) : (
              <tr key={p.id} className="border-t border-gray-50">
                <td className="py-2.5 font-semibold text-gray-600">{p.label}</td>
                <td className="py-2.5 text-gray-600">
                  {formatTime(p.start_time)} - {formatTime(p.end_time)}
                </td>
                <td className="py-2.5 text-gray-700">{p.subject_name ?? "—"}</td>
                <td className="py-2.5 text-gray-700">{p.teacher_name ?? "—"}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function TimetableView({
  students,
  initialChildId,
  initialSchedule,
}: {
  students: ParentChild[];
  initialChildId: string;
  initialSchedule: ClassSchedule;
}) {
  const { showToast } = useToast();
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [isPending, startTransition] = useTransition();

  const selectedChild = students.find((c) => c.id === selectedChildId);

  function changeChild(id: string) {
    setSelectedChildId(id);
    const child = students.find((c) => c.id === id);
    startTransition(async () => {
      if (!child?.classId) {
        setSchedule({ weekday: [], friday: [] });
        return;
      }
      const { schedule: fresh, error } = await fetchChildTimetable(child.classId);
      if (error) showToast(error, "error");
      setSchedule(fresh);
    });
  }

  if (students.length === 0 || !selectedChild) {
    return (
      <ParentPageHead
        icon={CalendarIcon}
        title="Timetable"
        subtitle="View your students's class timetable."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Timetable" }]}
      />
    );
  }

  return (
    <>
      <ParentPageHead
        icon={CalendarIcon}
        title="Timetable"
        subtitle="View your students's class timetable."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Timetable" }]}
      />

      <ChildPicker students={students} selectedId={selectedChildId} onSelect={changeChild} />

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#0f4d34]">
          <GraduationCapIcon className="h-4 w-4" />
          {selectedChild.className} Timetable ({selectedChild.name})
        </h2>

        {isPending ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Monday to Saturday (Same Schedule)</h3>
              <ScheduleTable periods={schedule.weekday} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Friday (Early Closing)</h3>
              <ScheduleTable periods={schedule.friday} />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
          <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
          This timetable applies Monday to Saturday. Friday has a different schedule.
        </div>
      </div>
    </>
  );
}
