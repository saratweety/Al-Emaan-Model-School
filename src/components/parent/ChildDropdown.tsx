"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { initials, avatarColorFor } from "@/lib/format";
import type { ParentChild } from "@/lib/parent-data";

export default function ChildDropdown({
  students,
  selectedId,
  onSelect,
}: {
  students: ParentChild[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = students.find((c) => c.id === selectedId) ?? students[0];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!selected) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm hover:border-[#3AB67D]/40"
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColorFor(selected.id)}`}>
          {initials(selected.name)}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold text-gray-800">{selected.name}</span>
          <span className="block text-xs text-gray-500">{selected.className}</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          {students.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50 ${
                c.id === selectedId ? "bg-[#A2E494]/15" : ""
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColorFor(c.id)}`}>
                {initials(c.name)}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-gray-800">{c.name}</span>
                <span className="block text-xs text-gray-500">{c.className}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
