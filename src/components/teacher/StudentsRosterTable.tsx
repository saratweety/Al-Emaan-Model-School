"use client";

import { useMemo, useState } from "react";
import { SearchIcon, EyeOutlineIcon, InfoIcon } from "@/components/icons";

export type RosterStudent = {
  id: string;
  admission_no: string;
  full_name: string;
  father_name: string;
  contact_number: string | null;
  gender: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function StudentsRosterTable({
  students,
  classNameByStudentId,
}: {
  students: RosterStudent[];
  classNameByStudentId: Record<string, string>;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => `${s.full_name} ${s.admission_no} ${s.father_name}`.toLowerCase().includes(q));
  }, [students, search]);

  return (
    <>
      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name or admission no..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>
      </div>

      {/* Students table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {filtered.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
            <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
            No students match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Student Name</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Father Name</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="rounded-r-xl px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                            s.gender === "male" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                          }`}
                        >
                          {initials(s.full_name)}
                        </span>
                        <span className="font-semibold text-gray-800">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{classNameByStudentId[s.id] ?? "Unassigned"}</td>
                    <td className="px-3 py-3 text-gray-600">{s.father_name}</td>
                    <td className="px-3 py-3 text-gray-600">{s.contact_number ?? "—"}</td>
                    <td className="px-3 py-3">
                      <button
                        aria-label="View"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <EyeOutlineIcon className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {students.length} students
        </p>
      </div>
    </>
  );
}
