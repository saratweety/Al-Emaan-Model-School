"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PersonFilesButton from "@/components/dashboard/PersonFilesButton";
import TeacherRowDeleteButton from "@/components/teachers/TeacherRowDeleteButton";
import { SearchIcon, UsersIcon, BookIcon, ChevronDownIcon, EyeOutlineIcon, PencilIcon } from "@/components/icons";

export type TeacherRow = {
  id: string;
  teacher_code: string;
  qualification: string | null;
  experience_years: number | null;
  photo_url: string | null;
  cnic_document_url: string | null;
  certificate_url: string | null;
  other_document_url: string | null;
  name: string;
  phone: string | null;
  subjectName: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeachersTable({
  teachers,
  classTeacherByTeacher,
  photoUrlByPath,
  subjectNames,
  classNames,
}: {
  teachers: TeacherRow[];
  classTeacherByTeacher: Record<string, string>;
  photoUrlByPath: Record<string, string>;
  subjectNames: string[];
  classNames: string[];
}) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      if (q) {
        const haystack = `${t.name} ${t.teacher_code} ${t.phone ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (subjectFilter && t.subjectName !== subjectFilter) return false;
      if (classFilter && classTeacherByTeacher[t.id] !== classFilter) return false;
      return true;
    });
  }, [teachers, classTeacherByTeacher, search, subjectFilter, classFilter]);

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
            placeholder="Search teacher by name, ID or phone..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>

        <div className="relative">
          <UsersIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <select
            aria-label="Filter by class teacher"
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
          <BookIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <select
            aria-label="Filter by subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold text-[#13714C] outline-none hover:bg-gray-50 focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          >
            <option value="">All Subjects</option>
            {subjectNames.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Teachers table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {filtered.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
            No teachers match your search/filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Teacher Name</th>
                  <th className="px-3 py-3">Teacher ID</th>
                  <th className="px-3 py-3">Subject</th>
                  <th className="px-3 py-3">Class Teacher</th>
                  <th className="px-3 py-3">Qualification</th>
                  <th className="px-3 py-3">Experience</th>
                  <th className="rounded-r-xl px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {t.photo_url && photoUrlByPath[t.photo_url] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoUrlByPath[t.photo_url]}
                            alt={t.name}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-xs font-bold text-white">
                            {initials(t.name)}
                          </span>
                        )}
                        <span className="font-semibold text-gray-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{t.teacher_code}</td>
                    <td className="px-3 py-3 text-gray-600">{t.subjectName ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600">{classTeacherByTeacher[t.id] ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600">{t.qualification ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600">
                      {t.experience_years !== null ? `${t.experience_years} yrs` : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/teachers/${t.id}`}
                          aria-label="View"
                          className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20"
                        >
                          <EyeOutlineIcon className="h-4 w-4" />
                        </Link>
                        <PersonFilesButton
                          bucket="teacher-files"
                          personName={t.name}
                          files={[
                            { label: "CNIC Copy", path: t.cnic_document_url },
                            { label: "Educational Certificate", path: t.certificate_url },
                            { label: "Other Document", path: t.other_document_url },
                          ].filter((f): f is { label: string; path: string } => Boolean(f.path))}
                        />
                        <Link
                          href={`/dashboard/teachers/${t.id}/edit`}
                          aria-label="Edit"
                          className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <TeacherRowDeleteButton teacherId={t.id} teacherName={t.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing {filtered.length} of {teachers.length} teachers
          </p>
        </div>
      </div>
    </>
  );
}
