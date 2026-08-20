"use client";

import { useMemo, useState } from "react";
import { SearchIcon, DownloadIcon, InfoIcon } from "@/components/icons";
import type { MonthlyAttendanceGrid as MonthlyAttendanceGridData, AttendanceStatus } from "@/lib/attendance-data";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
  leave: "bg-blue-100 text-blue-700",
};

const STATUS_LETTER: Record<AttendanceStatus, string> = {
  present: "P",
  absent: "A",
  late: "L",
  leave: "V",
};

const RISK_STYLES: Record<string, string> = {
  Excellent: "bg-green-100 text-green-700",
  Good: "bg-blue-100 text-blue-700",
  "At Risk": "bg-red-100 text-red-700",
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function MonthlyAttendanceGrid({ grid, monthLabel }: { grid: MonthlyAttendanceGridData; monthLabel: string }) {
  const [search, setSearch] = useState("");
  const [onlyContinuousAbsent, setOnlyContinuousAbsent] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return grid.rows.filter((r) => {
      if (onlyContinuousAbsent && !r.continuousAbsent) return false;
      if (!q) return true;
      const haystack = `${r.fullName} ${r.admissionNo} ${r.rollNumber ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [grid.rows, search, onlyContinuousAbsent]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageRows = filtered.slice(pageStart, pageStart + rowsPerPage);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function toggleContinuousAbsent() {
    setOnlyContinuousAbsent((v) => !v);
    setPage(1);
  }

  function downloadCsv() {
    const header = ["#", "Student Name", "Admission No.", "Class", "Roll No.", ...grid.days.map((d) => d.dayLabel), "Present %", "Absent Days", "Status"];
    const lines = [header.join(",")];
    filtered.forEach((r, i) => {
      const cells = [
        String(i + 1),
        csvEscape(r.fullName),
        csvEscape(r.admissionNo),
        csvEscape(r.className),
        csvEscape(r.rollNumber ?? "—"),
        ...grid.days.map((d) => {
          const status = r.statusByDate[d.date];
          return status ? STATUS_LETTER[status] : "-";
        }),
        `${r.presentPct}%`,
        String(r.absentDays),
        r.statusLabel,
      ];
      lines.push(cells.join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${monthLabel.toLowerCase().replace(/\s+/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const pageNumbers = useMemo(() => {
    const nums: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let n = start; n <= end; n++) nums.push(n);
    return nums;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by name, roll no. or admission no."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <DownloadIcon className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {onlyContinuousAbsent && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          <span className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4 shrink-0" />
            Showing only students continuously absent for 2+ days.
          </span>
          <button type="button" onClick={toggleContinuousAbsent} className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs hover:bg-red-100">
            Clear
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {grid.days.length === 0 ? (
          <p className="p-8 text-center text-sm font-semibold text-gray-500">No attendance has been marked for {monthLabel} yet.</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm font-semibold text-gray-500">No students match your search/filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="sticky left-0 z-10 whitespace-nowrap bg-[#A2E494]/15 px-3 py-3">#</th>
                  <th className="sticky left-8 z-10 min-w-[200px] whitespace-nowrap bg-[#A2E494]/15 px-3 py-3">Student Name<br />Admission No.</th>
                  <th className="whitespace-nowrap px-3 py-3">Class</th>
                  <th className="whitespace-nowrap px-3 py-3">Roll No.</th>
                  <th className="whitespace-nowrap px-3 py-3">Present %</th>
                  {grid.days.map((d) => (
                    <th key={d.date} className="whitespace-nowrap px-2 py-3 text-center">
                      <div>{d.dayLabel}</div>
                      <div className="text-[10px] font-medium normal-case text-gray-400">{d.dow}</div>
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-3 py-3">Absent Days</th>
                  <th className="whitespace-nowrap px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => (
                  <tr key={r.studentId} className="border-b border-gray-50 last:border-0">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2.5 text-gray-400">{pageStart + i + 1}</td>
                    <td className="sticky left-8 z-10 bg-white px-3 py-2.5">
                      <p className="font-semibold text-gray-800">{r.fullName}</p>
                      <p className="text-xs text-gray-400">{r.admissionNo}</p>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{r.className}</td>
                    <td className="px-3 py-2.5 text-gray-600">{r.rollNumber ?? "—"}</td>
                    <td
                      className={`px-3 py-2.5 font-bold ${
                        r.presentPct >= 95 ? "text-green-600" : r.presentPct >= 80 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {r.presentPct}%
                    </td>
                    {grid.days.map((d) => {
                      const status = r.statusByDate[d.date];
                      return (
                        <td key={d.date} className="px-2 py-2.5 text-center">
                          {status ? (
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${STATUS_STYLES[status]}`}
                            >
                              {STATUS_LETTER[status]}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 font-semibold text-gray-700">{r.absentDays}</td>
                    <td className="px-3 py-2.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${RISK_STYLES[r.statusLabel]}`}>{r.statusLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">P</span>
              Present
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">A</span>
              Absent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">L</span>
              Late
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">V</span>
              Leave
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-300">-</span>
              No school that day
            </span>
          </div>

          {grid.totals.continuousAbsentCount > 0 && (
            <button
              type="button"
              onClick={toggleContinuousAbsent}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              Continuous Absent (2+ Days): {grid.totals.continuousAbsentCount} Students
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing {pageStart + 1}–{Math.min(pageStart + rowsPerPage, filtered.length)} of {filtered.length} students
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-500">
              Rows per page:
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D]"
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
              >
                «
              </button>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
              >
                ‹
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    n === currentPage ? "bg-[#13714C] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
              >
                ›
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
