"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UsersIcon, SearchIcon } from "@/components/icons";

export type PickableTeacher = { id: string; name: string; teacherCode: string };

export default function TeacherProfilePicker({ teachers }: { teachers: PickableTeacher[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return teachers.slice(0, 8);
    return teachers
      .filter((t) => t.name.toLowerCase().includes(term) || t.teacherCode.toLowerCase().includes(term))
      .slice(0, 8);
  }, [teachers, query]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4 text-left hover:bg-[#A2E494]/20"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#13714C] text-white">
          <UsersIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#0f4d34]">Teacher Profile</p>
          <p className="truncate text-xs text-gray-500">View detailed information</p>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2.5">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teacher to view..."
                className="w-full rounded-lg border border-gray-200 bg-[#F4F6F5] py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-[#3AB67D]"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-xs font-semibold text-gray-400">No teachers found.</p>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/dashboard/teachers/${t.id}`);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50"
                >
                  <span className="truncate text-sm font-semibold text-gray-800">{t.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-gray-400">{t.teacherCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
