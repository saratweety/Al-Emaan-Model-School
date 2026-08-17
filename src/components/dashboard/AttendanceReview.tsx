"use client";

import { useEffect, useState, useTransition } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DonutChart from "@/components/dashboard/DonutChart";
import { UsersIcon, ShieldCheckIcon, XCircleIcon, CalendarIcon, ChevronDownIcon, SearchIcon, SaveIcon } from "@/components/icons";
import { useToast } from "@/lib/toast";
import {
  fetchAttendanceOverview,
  fetchClassAttendance,
  correctAttendance,
} from "@/app/dashboard/attendance/actions";
import type { AttendanceOverview, AttendanceStatus } from "@/lib/attendance-data";
import type { SchoolClass } from "@/lib/classes-data";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const statusStyles: Record<AttendanceStatus, string> = {
  present: "bg-[#13714C] text-white",
  absent: "bg-red-500 text-white",
  leave: "bg-blue-500 text-white",
  late: "bg-amber-500 text-white",
};

const statusLabels: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  late: "Late",
};

export default function AttendanceReview({
  classes,
  initialDate,
  initialOverview,
}: {
  classes: SchoolClass[];
  initialDate: string;
  initialOverview: AttendanceOverview;
}) {
  const { showToast } = useToast();
  const [date, setDate] = useState(initialDate);
  const [overview, setOverview] = useState(initialOverview);
  const [loadingOverview, startOverviewTransition] = useTransition();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [roster, setRoster] = useState<{ id: string; full_name: string; father_name: string; rollNumber: string | null }[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [search, setSearch] = useState("");
  const [loadingRoster, startRosterTransition] = useTransition();
  const [saving, startSaveTransition] = useTransition();

  function loadOverview(forDate: string) {
    startOverviewTransition(async () => {
      const { overview: fresh, error } = await fetchAttendanceOverview(forDate);
      if (error) {
        showToast(error, "error");
        return;
      }
      if (fresh) setOverview(fresh);
    });
  }

  function loadRoster(classId: string, forDate: string) {
    if (!classId) {
      setRoster([]);
      setStatuses({});
      return;
    }
    startRosterTransition(async () => {
      const { roster: r, statuses: s, error } = await fetchClassAttendance(classId, forDate);
      if (error) showToast(error, "error");
      setRoster(r);
      setStatuses(s);
    });
  }

  useEffect(() => {
    if (!selectedClassId) return;
    startRosterTransition(async () => {
      const { roster: r, statuses: s, error } = await fetchClassAttendance(selectedClassId, date);
      if (error) showToast(error, "error");
      setRoster(r);
      setStatuses(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDateChange(newDate: string) {
    setDate(newDate);
    loadOverview(newDate);
    loadRoster(selectedClassId, newDate);
  }

  function handleClassChange(newClassId: string) {
    setSelectedClassId(newClassId);
    loadRoster(newClassId, date);
  }

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  }

  function statusOf(studentId: string): AttendanceStatus {
    return statuses[studentId] ?? "present";
  }

  function handleSaveCorrections() {
    if (!selectedClassId || roster.length === 0) return;
    const records = roster.map((s) => ({ student_id: s.id, status: statusOf(s.id) }));

    startSaveTransition(async () => {
      const result = await correctAttendance(selectedClassId, date, records);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Attendance updated.", "success");
      loadOverview(date);
    });
  }

  const filteredRoster = roster.filter((s) => s.full_name.toLowerCase().includes(search.toLowerCase()));

  const { totals, totalPct, classRows } = overview;

  const statCards = [
    { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL STUDENTS", value: String(totals.total), sub: "All Students" },
    { icon: ShieldCheckIcon, iconBg: "bg-[#3AB67D]", label: "PRESENT", value: String(totals.present), sub: `${totalPct}%` },
    { icon: XCircleIcon, iconBg: "bg-[#e0645f]", label: "ABSENT", value: String(totals.absent), valueColor: "text-red-600" as const },
    { icon: CalendarIcon, iconBg: "bg-[#4a90e2]", label: "ON LEAVE", value: String(totals.leave), valueColor: "text-blue-600" as const },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <CalendarIcon className="h-4 w-4 text-[#13714C]" />
          Date:
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </label>
        {loadingOverview && <span className="text-xs font-semibold text-gray-400">Refreshing…</span>}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Attendance by class */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0f4d34]">Attendance by Class</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Total Students</th>
                  <th className="px-3 py-3">Present</th>
                  <th className="px-3 py-3">Absent</th>
                  <th className="px-3 py-3">Leave</th>
                  <th className="rounded-r-xl px-3 py-3">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {classRows.map((row, i) => (
                  <tr key={row.classId} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2.5 font-bold text-gray-800">{row.className}</td>
                    <td className="px-3 py-2.5 text-gray-600">{row.total}</td>
                    <td className="px-3 py-2.5 font-semibold text-[#13714C]">{row.present}</td>
                    <td className="px-3 py-2.5 font-semibold text-red-600">{row.absent}</td>
                    <td className="px-3 py-2.5 font-semibold text-blue-600">{row.leave}</td>
                    <td className="px-3 py-2.5 font-bold text-gray-800">{row.pct}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F4F6F5] font-bold text-gray-800">
                  <td className="rounded-l-xl px-3 py-3" colSpan={2}>
                    TOTAL
                  </td>
                  <td className="px-3 py-3">{totals.total}</td>
                  <td className="px-3 py-3 text-[#13714C]">{totals.present}</td>
                  <td className="px-3 py-3 text-red-600">{totals.absent}</td>
                  <td className="px-3 py-3 text-blue-600">{totals.leave}</td>
                  <td className="rounded-r-xl px-3 py-3">{totalPct}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Overview donut */}
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 self-start text-sm font-bold uppercase tracking-wide text-[#0f4d34]">
            Attendance Overview
          </h2>
          <DonutChart
            centerValue={String(totals.total)}
            centerLabel="Total Students"
            segments={[
              { value: totals.present, color: "#13714C" },
              { value: totals.absent, color: "#ef4444" },
              { value: totals.leave, color: "#3b82f6" },
            ]}
          />
          <ul className="mt-5 w-full space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-[#13714C]" /> Present
              </span>
              <span className="font-semibold text-gray-800">
                {totals.present} ({totalPct}%)
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Absent
              </span>
              <span className="font-semibold text-gray-800">{totals.absent}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Leave
              </span>
              <span className="font-semibold text-gray-800">{totals.leave}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Correction panel */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#0f4d34]">Review &amp; Correct Attendance</h2>
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-semibold text-[#13714C] outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loadingRoster ? (
          <p className="p-4 text-center text-sm text-gray-400">Loading roster…</p>
        ) : roster.length === 0 ? (
          <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
            No students enrolled in this class yet.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative min-w-[220px] flex-1">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveCorrections}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <SaveIcon className="h-4 w-4" />
                {saving ? "Saving..." : "Save Corrections"}
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full min-w-[640px] text-left text-sm">
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
                  {filteredRoster.map((s, i) => (
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
                          {(Object.keys(statusLabels) as AttendanceStatus[]).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setStatus(s.id, status)}
                              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                statusOf(s.id) === status
                                  ? statusStyles[status]
                                  : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
