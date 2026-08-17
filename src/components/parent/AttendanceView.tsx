"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  CheckSquareIcon,
  XCircleIcon,
  HourglassIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
} from "@/components/icons";
import { useToast } from "@/lib/toast";
import ParentPageHead from "./ParentPageHead";
import ChildDropdown from "./ChildDropdown";
import DonutChart from "@/components/dashboard/DonutChart";
import { fetchAttendanceMonth, fetchAttendanceSessionSummary } from "@/app/parent/actions";
import type { ParentChild, AttendanceDay, MonthlyAttendanceSummary } from "@/lib/parent-data";

type Status = "present" | "absent" | "leave" | "late" | "unmarked" | "off" | "upcoming";

const dotColor: Record<Status, string> = {
  present: "bg-[#3AB67D]",
  late: "bg-amber-400",
  absent: "bg-red-500",
  leave: "bg-blue-400",
  unmarked: "bg-transparent",
  off: "bg-gray-300",
  upcoming: "bg-transparent",
};

const statusLabel: Record<Status, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  leave: "Leave",
  unmarked: "Not Marked",
  off: "Holiday",
  upcoming: "Upcoming",
};

const legendStatuses: Status[] = ["present", "absent", "late", "leave", "off"];

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildMonth(year: number, month: number, days: AttendanceDay[]) {
  const statusByDate = new Map(days.map((d) => [d.date, d.status as Status]));
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: { day: number; date: Date | null; status: Status; isToday: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: 0, date: null, status: "off", isToday: false });

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    let status: Status;
    if (date.getDay() === 0) status = "off";
    else if (date > today) status = "upcoming";
    else status = statusByDate.get(iso) ?? "unmarked";
    const isToday = date.toDateString() === today.toDateString();
    cells.push({ day, date, status, isToday });
  }
  return cells;
}

function MonthlyView({ studentId }: { studentId: string }) {
  const [months, setMonths] = useState<MonthlyAttendanceSummary[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      const { months: fresh, error } = await fetchAttendanceSessionSummary(studentId);
      if (cancelled) return;
      if (error) showToast(error, "error");
      setMonths(fresh);
    });
    return () => {
      cancelled = true;
    };
  }, [studentId, showToast]);

  if (isPending || months === null) {
    return <p className="py-10 text-center text-sm text-gray-400">Loading…</p>;
  }

  if (!months || months.length === 0) {
    return (
      <p className="rounded-xl bg-[#F4F6F5] p-6 text-center text-sm font-semibold text-gray-500">
        No attendance has been recorded yet this session.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
            <th className="rounded-l-xl px-3 py-3">Month</th>
            <th className="px-3 py-3">Present</th>
            <th className="px-3 py-3">Absent</th>
            <th className="px-3 py-3">Late</th>
            <th className="px-3 py-3">Leave</th>
            <th className="rounded-r-xl px-3 py-3">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.monthKey} className="border-b border-gray-50 last:border-0">
              <td className="px-3 py-3 font-semibold text-gray-800">{m.monthLabel}</td>
              <td className="px-3 py-3 text-[#13714C]">{m.present}</td>
              <td className="px-3 py-3 text-red-500">{m.absent}</td>
              <td className="px-3 py-3 text-amber-500">{m.late}</td>
              <td className="px-3 py-3 text-blue-500">{m.leave}</td>
              <td className="px-3 py-3">
                <span className="rounded-full bg-[#A2E494]/25 px-2.5 py-1 text-xs font-bold text-[#13714C]">{m.pct}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AttendanceView({
  students,
  initialChildId,
  initialYear,
  initialMonth,
  initialDays,
}: {
  students: ParentChild[];
  initialChildId: string;
  initialYear: number;
  initialMonth: number;
  initialDays: AttendanceDay[];
}) {
  const { showToast } = useToast();
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [days, setDays] = useState(initialDays);
  const [tab, setTab] = useState<"daily" | "monthly">("daily");
  const [isPending, startTransition] = useTransition();

  function loadMonth(childId: string, y: number, m: number) {
    startTransition(async () => {
      const { days: fresh, error } = await fetchAttendanceMonth(childId, y, m);
      if (error) showToast(error, "error");
      setDays(fresh);
    });
  }

  function changeChild(id: string) {
    setSelectedChildId(id);
    loadMonth(id, year, month);
  }

  function changeMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    loadMonth(selectedChildId, newYear, newMonth);
  }

  const cells = useMemo(() => buildMonth(year, month, days), [year, month, days]);
  const marked = cells.filter((c) => c.day > 0 && c.status !== "off" && c.status !== "upcoming" && c.status !== "unmarked");
  const present = marked.filter((c) => c.status === "present").length;
  const absent = marked.filter((c) => c.status === "absent").length;
  const late = marked.filter((c) => c.status === "late").length;
  const totalDays = cells.filter((c) => c.day > 0).length;
  const pct = marked.length ? Math.round(((present + late) / marked.length) * 100) : 0;

  if (students.length === 0) {
    return (
      <ParentPageHead
        icon={CheckSquareIcon}
        title="Attendance"
        subtitle="View attendance record of your child."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Attendance" }]}
      />
    );
  }

  return (
    <>
      <ParentPageHead
        icon={CheckSquareIcon}
        title="Attendance"
        subtitle="View attendance record of your child."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Attendance" }]}
        right={<ChildDropdown students={students} selectedId={selectedChildId} onSelect={changeChild} />}
      />

      {/* Summary */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-base font-bold text-[#0f4d34]">Attendance Summary</h2>
        <div className="flex flex-wrap items-center gap-8">
          <DonutChart
            size={150}
            strokeWidth={16}
            segments={[
              { value: pct, color: "#13714C" },
              { value: 100 - pct, color: "transparent" },
            ]}
            centerValue={`${pct}%`}
            centerLabel="Overall Attendance"
          />
          <div className="flex flex-1 flex-wrap items-center justify-around gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A2E494]/25 text-[#13714C]">
                <CheckSquareIcon className="h-5 w-5" />
              </span>
              <p className="text-xl font-extrabold text-gray-800">{present}</p>
              <p className="text-xs font-semibold text-gray-500">Present</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-500">
                <XCircleIcon className="h-5 w-5" />
              </span>
              <p className="text-xl font-extrabold text-gray-800">{absent}</p>
              <p className="text-xs font-semibold text-gray-500">Absent</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                <HourglassIcon className="h-5 w-5" />
              </span>
              <p className="text-xl font-extrabold text-gray-800">{late}</p>
              <p className="text-xs font-semibold text-gray-500">Late</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <CalendarIcon className="h-5 w-5" />
              </span>
              <p className="text-xl font-extrabold text-gray-800">{totalDays}</p>
              <p className="text-xs font-semibold text-gray-500">Total Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* View toggle + content */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-5 border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => setTab("daily")}
            className={`border-b-2 pb-2.5 text-sm font-bold transition ${
              tab === "daily" ? "border-[#13714C] text-[#13714C]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Daily View
          </button>
          <button
            type="button"
            onClick={() => setTab("monthly")}
            className={`border-b-2 pb-2.5 text-sm font-bold transition ${
              tab === "monthly" ? "border-[#13714C] text-[#13714C]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly View
          </button>
        </div>

        {tab === "daily" ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  disabled={isPending}
                  aria-label="Previous month"
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <CalendarIcon className="h-4 w-4 text-[#13714C]" />
                  {monthNames[month]} {year}
                </h3>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  disabled={isPending}
                  aria-label="Next month"
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                {legendStatuses.map((s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor[s]}`} />
                    {statusLabel[s]}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-center text-sm">
                <thead>
                  <tr>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <th key={d} className="border-b border-gray-100 pb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(cells.length / 7) }).map((_, row) => (
                    <tr key={row}>
                      {cells.slice(row * 7, row * 7 + 7).map((cell, i) =>
                        cell.day === 0 ? (
                          <td key={`pad-${row}-${i}`} className="border border-gray-50 p-2" />
                        ) : (
                          <td
                            key={cell.day}
                            title={`${cell.day} ${monthNames[month]} — ${statusLabel[cell.status]}`}
                            className={`border border-gray-50 p-2 align-top ${cell.isToday ? "bg-[#A2E494]/15" : ""}`}
                          >
                            <span className="text-sm font-semibold text-gray-700">{cell.day}</span>
                            <span className="mt-1 flex justify-center">
                              {cell.status !== "unmarked" && cell.status !== "upcoming" && (
                                <span className={`h-1.5 w-1.5 rounded-full ${dotColor[cell.status]}`} />
                              )}
                            </span>
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <MonthlyView studentId={selectedChildId} />
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#13714C]" />
        Attendance is updated daily by the school. Please contact the administration for any queries.
      </div>
    </>
  );
}
