"use client";

import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/lib/toast";
import {
  saveTeacherAttendance,
  getTeacherAttendanceForDate,
  type TeacherAttendanceStatus,
} from "@/app/dashboard/teachers/attendance/actions";
import { SaveIcon, SearchIcon } from "@/components/icons";

export type AttendanceTeacher = {
  id: string;
  full_name: string;
  teacher_code: string;
  subject_name: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendanceRoster({ teachers }: { teachers: AttendanceTeacher[] }) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFetching, startFetchTransition] = useTransition();

  const [date, setDate] = useState(todayISO());
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Record<string, TeacherAttendanceStatus>>({});
  const [checkInTimes, setCheckInTimes] = useState<Record<string, string | null>>({});

  const roster = teachers.filter((t) => t.full_name.toLowerCase().includes(search.toLowerCase()));

  function loadAttendance(forDate: string) {
    startFetchTransition(async () => {
      const { statuses: loaded, checkInTimes: loadedTimes, error } = await getTeacherAttendanceForDate(
        teachers.map((t) => t.id),
        forDate
      );
      if (error) showToast(error, "error");
      setStatuses(loaded);
      setCheckInTimes(loadedTimes);
    });
  }

  function formatCheckInTime(value: string | null | undefined) {
    if (!value) return null;
    const [h, m] = value.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  }

  useEffect(() => {
    loadAttendance(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setStatus(id: string, status: TeacherAttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }

  function statusOf(id: string): TeacherAttendanceStatus {
    return statuses[id] ?? "present";
  }

  const present = roster.filter((t) => statusOf(t.id) === "present").length;
  const absent = roster.filter((t) => statusOf(t.id) === "absent").length;
  const leave = roster.filter((t) => statusOf(t.id) === "leave").length;
  const late = roster.filter((t) => statusOf(t.id) === "late").length;

  function handleSave() {
    const records = teachers.map((t) => ({ teacher_id: t.id, status: statusOf(t.id) }));

    startTransition(async () => {
      const result = await saveTeacherAttendance(date, records);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast(`Attendance saved for ${date} (${records.length} teachers).`, "success");
    });
  }

  if (teachers.length === 0) {
    return (
      <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
        No teachers found yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500">Date</label>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => {
              setDate(e.target.value);
              loadAttendance(e.target.value);
            }}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isFetching}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <SaveIcon className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Total Teachers</p>
          <p className="text-lg font-extrabold text-[#0f4d34]">{roster.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Present</p>
          <p className="text-lg font-extrabold text-[#13714C]">{present}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Absent</p>
          <p className="text-lg font-extrabold text-red-600">{absent}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Leave</p>
          <p className="text-lg font-extrabold text-blue-600">{leave}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Late</p>
          <p className="text-lg font-extrabold text-amber-600">{late}</p>
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search teacher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
              <th className="rounded-l-xl px-3 py-3">#</th>
              <th className="px-3 py-3">Teacher ID</th>
              <th className="px-3 py-3">Teacher Name</th>
              <th className="px-3 py-3">Subject</th>
              <th className="px-3 py-3">Check-in</th>
              <th className="rounded-r-xl px-3 py-3">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((t, i) => (
              <tr key={t.id} className="border-b border-gray-50 bg-white last:border-0">
                <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                <td className="px-3 py-2.5 text-gray-600">{t.teacher_code}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-xs font-bold text-white">
                      {initials(t.full_name)}
                    </span>
                    <span className="font-semibold text-gray-800">{t.full_name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-gray-600">{t.subject_name ?? "—"}</td>
                <td className="px-3 py-2.5 text-gray-600">
                  {formatCheckInTime(checkInTimes[t.id]) ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatus(t.id, "present")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(t.id) === "present"
                          ? "bg-[#13714C] text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(t.id, "absent")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(t.id) === "absent"
                          ? "bg-red-500 text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(t.id, "leave")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(t.id) === "leave"
                          ? "bg-blue-500 text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Leave
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(t.id, "late")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(t.id) === "late"
                          ? "bg-amber-500 text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Late
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
