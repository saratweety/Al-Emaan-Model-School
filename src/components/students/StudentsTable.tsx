"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PersonFilesButton from "@/components/dashboard/PersonFilesButton";
import StudentRowDeleteButton from "@/components/students/StudentRowDeleteButton";
import {
  SearchIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  EyeOutlineIcon,
  PencilIcon,
} from "@/components/icons";

export type StudentRow = {
  id: string;
  admission_no: string;
  full_name: string;
  father_name: string;
  contact_number: string | null;
  gender: string | null;
  photo_url: string | null;
  b_form_url: string | null;
  certificate_url: string | null;
  other_document_url: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function StudentsTable({
  students,
  classNameByStudentId,
  photoUrlByPath,
  classNames,
}: {
  students: StudentRow[];
  classNameByStudentId: Record<string, string>;
  photoUrlByPath: Record<string, string>;
  classNames: string[];
}) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "unenrolled">("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const cls = classNameByStudentId[s.id] ?? "Unassigned";
      const isActive = Boolean(classNameByStudentId[s.id]);

      if (q) {
        const haystack = `${s.full_name} ${s.admission_no} ${s.father_name}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (classFilter && cls !== classFilter) return false;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "unenrolled" && isActive) return false;
      return true;
    });
  }, [students, classNameByStudentId, search, classFilter, statusFilter]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, admission no. or father name..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>

        <div className="relative">
          <GraduationCapIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <select
            aria-label="Filter by class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold text-[#13714C] outline-none hover:bg-gray-50 focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          >
            <option value="">All Classes</option>
            {classNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
          <ShieldCheckIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "" | "active" | "unenrolled")}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold text-[#13714C] outline-none hover:bg-gray-50 focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="unenrolled">Unenrolled</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Students table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {filtered.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
            No students match your search/filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Student Name</th>
                  <th className="px-3 py-3">Admission No.</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Father Name</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="rounded-r-xl px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const isActive = Boolean(classNameByStudentId[s.id]);
                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {s.photo_url && photoUrlByPath[s.photo_url] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photoUrlByPath[s.photo_url]}
                              alt={s.full_name}
                              className="h-9 w-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                                s.gender === "male" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                              }`}
                            >
                              {initials(s.full_name)}
                            </span>
                          )}
                          <span className="font-semibold text-gray-800">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{s.admission_no}</td>
                      <td className="px-3 py-3 text-gray-600">{classNameByStudentId[s.id] ?? "Unassigned"}</td>
                      <td className="px-3 py-3 text-gray-600">{s.father_name}</td>
                      <td className="px-3 py-3 text-gray-600">{s.contact_number ?? "—"}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isActive ? "Active" : "Unenrolled"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/students/${s.id}`}
                            aria-label="View"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                          >
                            <EyeOutlineIcon className="h-4 w-4" />
                          </Link>
                          <PersonFilesButton
                            bucket="student-files"
                            personName={s.full_name}
                            files={[
                              { label: "B-Form Copy", path: s.b_form_url },
                              { label: "Previous School Certificate", path: s.certificate_url },
                              { label: "Other Document", path: s.other_document_url },
                            ].filter((f): f is { label: string; path: string } => Boolean(f.path))}
                          />
                          <Link
                            href={`/dashboard/students/${s.id}/edit`}
                            aria-label="Edit"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <StudentRowDeleteButton studentId={s.id} studentName={s.full_name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing {filtered.length} of {students.length} students
          </p>
        </div>
      </div>
    </>
  );
}
