"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useToast } from "@/lib/toast";
import { saveAttendance, getAttendanceForDate, type AttendanceStatus } from "@/app/teacher/attendance/actions";
import { ChevronDownIcon, SaveIcon, SearchIcon } from "@/components/icons";

export type RosterStudent = {
  id: string;
  full_name: string;
  father_name: string;
  rollNumber: string | null;
  classId: string;
  className: string;
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

export default function AttendanceRoster({ students }: { students: RosterStudent[] }) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const classNames = useMemo(() => Array.from(new Set(students.map((s) => s.className))).sort(), [students]);
  const [selectedClass, setSelectedClass] = useState(classNames[0] ?? "");
  const [date, setDate] = useState(todayISO());
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [isFetching, startFetchTransition] = useTransition();

  const roster = students.filter(
    (s) => s.className === selectedClass && s.full_name.toLowerCase().includes(search.toLowerCase())
  );
  const classId = students.find((s) => s.className === selectedClass)?.classId ?? "";

  function loadAttendance(cls: string, forDate: string) {
    const idsInClass = students.filter((s) => s.className === cls).map((s) => s.id);
    startFetchTransition(async () => {
      const { statuses: loadedStatuses, error } = await getAttendanceForDate(idsInClass, forDate);
      if (error) showToast(error, "error");
      setStatuses(loadedStatuses);
    });
  }

  useEffect(() => {
    loadAttendance(selectedClass, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setStatus(id: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }

  function statusOf(id: string): AttendanceStatus {
    return statuses[id] ?? "present";
  }

  const present = roster.filter((s) => statusOf(s.id) === "present").length;
  const absent = roster.filter((s) => statusOf(s.id) === "absent").length;
  const leave = roster.filter((s) => statusOf(s.id) === "leave").length;
  const late = roster.filter((s) => statusOf(s.id) === "late").length;

  function handleSave() {
    if (!classId) return;

    const records = students
      .filter((s) => s.className === selectedClass)
      .map((s) => ({ student_id: s.id, status: statusOf(s.id) }));

    startTransition(async () => {
      const result = await saveAttendance(classId, date, records);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast(`Attendance saved for ${selectedClass} (${records.length} students).`, "success");
    });
  }

  if (classNames.length === 0) {
    return (
      <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
        No students found in your classes yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Date</label>
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => {
                setDate(e.target.value);
                loadAttendance(selectedClass, e.target.value);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Class</label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  loadAttendance(e.target.value, date);
                }}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-semibold text-[#13714C] outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              >
                {classNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
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
          <p className="text-xs text-gray-500">Total Students</p>
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
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
              <th className="rounded-l-xl px-3 py-3">#</th>
              <th className="px-3 py-3">Roll No.</th>
              <th className="px-3 py-3">Student Name</th>
              <th className="px-3 py-3">Father Name</th>
              <th className="rounded-r-xl px-3 py-3">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s, i) => (
              <tr key={s.id} className="border-b border-gray-50 bg-white last:border-0">
                <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                <td className="px-3 py-2.5 text-gray-600">{s.rollNumber ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-xs font-bold text-white">
                      {initials(s.full_name)}
                    </span>
                    <span className="font-semibold text-gray-800">{s.full_name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-gray-600">{s.father_name}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "present")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(s.id) === "present"
                          ? "bg-[#13714C] text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "absent")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(s.id) === "absent"
                          ? "bg-red-500 text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "leave")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(s.id) === "leave"
                          ? "bg-blue-500 text-white"
                          : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Leave
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(s.id, "late")}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        statusOf(s.id) === "late"
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
