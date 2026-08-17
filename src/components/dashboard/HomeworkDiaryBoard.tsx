"use client";

import { useMemo, useState } from "react";
import {
  GridIcon,
  CheckSquareIcon,
  HourglassIcon,
  BookIcon,
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { getToday } from "@/lib/school-calendar";
import type { PrincipalDiaryEntry } from "@/lib/homework-data";
import type { SchoolClass } from "@/lib/classes-data";

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: { day: number; current: boolean; iso: string }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, current: false, iso: toInputDate(new Date(y, m, d)) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, iso: toInputDate(new Date(year, month, d)) });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const idx = cells.length - (startOffset + daysInMonth);
    const d = idx + 1;
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: d, current: false, iso: toInputDate(new Date(y, m, d)) });
  }
  return cells;
}

export default function HomeworkDiaryBoard({ entries, classes, subjectCount }: { entries: PrincipalDiaryEntry[]; classes: SchoolClass[]; subjectCount: number }) {
  const todayDate = getToday();
  const todayStr = toInputDate(todayDate);

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [tab, setTab] = useState<"daily" | "vacation">("daily");
  const [calendarMonth, setCalendarMonth] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;

  const updatedTodayClassIds = useMemo(
    () => new Set(entries.filter((e) => e.entryType === "homework" && e.postedDate === todayStr).map((e) => e.classId)),
    [entries, todayStr]
  );

  const summary = [
    { icon: GridIcon, iconBg: "bg-[#3AB67D]", label: "Total Classes", value: classes.length },
    { icon: CheckSquareIcon, iconBg: "bg-purple-500", label: "Updated Today", value: updatedTodayClassIds.size },
    { icon: HourglassIcon, iconBg: "bg-amber-500", label: "Pending", value: Math.max(classes.length - updatedTodayClassIds.size, 0) },
    { icon: BookIcon, iconBg: "bg-blue-500", label: "Total Subjects", value: subjectCount },
  ];

  const classStatus = classes.map((c) => ({ cls: c.name, status: updatedTodayClassIds.has(c.id) ? "Updated" : "Pending" }));

  const dailyEntries = useMemo(
    () => entries.filter((e) => e.entryType === "homework" && e.classId === selectedClassId && e.postedDate === selectedDate),
    [entries, selectedClassId, selectedDate]
  );

  const vacationEntries = useMemo(
    () => entries.filter((e) => e.entryType === "vacation_diary" && e.classId === selectedClassId),
    [entries, selectedClassId]
  );

  const calendarCells = useMemo(
    () => buildCalendar(calendarMonth.getFullYear(), calendarMonth.getMonth()),
    [calendarMonth]
  );

  function goToMonth(offset: number) {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));
  }

  function pickDate(iso: string) {
    setSelectedDate(iso);
    setCalendarMonth(new Date(iso + "T00:00:00"));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.iconBg}`}>
              <s.icon className="h-[18px] w-[18px] text-white" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-extrabold text-[#0f4d34]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <CalendarIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => pickDate(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm font-semibold text-gray-600 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-gray-600 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={() => setTab("daily")}
          className={
            tab === "daily"
              ? "rounded-xl bg-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
              : "rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          }
        >
          Daily Diary
        </button>
        <button
          type="button"
          onClick={() => setTab("vacation")}
          className={
            tab === "vacation"
              ? "rounded-xl bg-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
              : "rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          }
        >
          Holiday / Vacation Diary
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Diary table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="bg-[#A2E494]/20 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
              <CalendarIcon className="h-4 w-4" />
              {tab === "daily" ? "Daily Diary" : "Holiday / Vacation Diary"} - {selectedClass?.name ?? "No class"}
            </h2>
          </div>
          <div className="overflow-x-auto p-4">
            {classes.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-gray-500">No classes yet.</p>
            ) : tab === "daily" ? (
              dailyEntries.length === 0 ? (
                <p className="py-8 text-center text-sm font-semibold text-gray-500">
                  No homework posted for {selectedClass?.name} on this date.
                </p>
              ) : (
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      <th className="pb-2">Subject</th>
                      <th className="pb-2">Homework / Diary</th>
                      <th className="pb-2">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyEntries.map((d) => (
                      <tr key={d.id} className="border-t border-gray-50">
                        <td className="py-3 font-semibold text-gray-800">{d.subjectName ?? "General"}</td>
                        <td className="max-w-[260px] py-3">
                          <p className="font-semibold text-gray-800">{d.title}</p>
                          <p className="text-xs text-gray-500">{d.description}</p>
                        </td>
                        <td className="py-3 text-gray-700">{d.teacherName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : vacationEntries.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold text-gray-500">
                No vacation diary posted for {selectedClass?.name} yet.
              </p>
            ) : (
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    <th className="pb-2">Diary Entry</th>
                    <th className="pb-2">Class Teacher</th>
                    <th className="pb-2">Posted On</th>
                  </tr>
                </thead>
                <tbody>
                  {vacationEntries.map((d) => (
                    <tr key={d.id} className="border-t border-gray-50">
                      <td className="max-w-[260px] py-3">
                        <p className="font-semibold text-gray-800">{d.title}</p>
                        <p className="text-xs text-gray-500">{d.description}</p>
                      </td>
                      <td className="py-3 text-gray-700">{d.teacherName}</td>
                      <td className="py-3 text-gray-500">{d.postedLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "daily" && (
              <p className="mt-4 text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Note:</span> Homework diary must be updated daily
                before 6:00 PM.
              </p>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#0f4d34]">Class Update Status (Today)</h2>
            {classStatus.length === 0 ? (
              <p className="text-sm text-gray-500">No classes yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {classStatus.map((c) => (
                  <li key={c.cls} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{c.cls}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.status === "Updated" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" aria-label="Previous month" onClick={() => goToMonth(-1)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-50">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-bold text-[#0f4d34]">
                {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
              <button type="button" aria-label="Next month" onClick={() => goToMonth(1)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-50">
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className="font-semibold text-gray-400">
                  {d}
                </span>
              ))}
              {calendarCells.map((c) => (
                <button
                  type="button"
                  key={c.iso}
                  onClick={() => pickDate(c.iso)}
                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                    c.iso === selectedDate
                      ? "bg-[#13714C] font-bold text-white"
                      : c.current
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {c.day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
