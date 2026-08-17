"use client";

import { initials, avatarColorFor } from "@/lib/format";
import type { ParentChild } from "@/lib/parent-data";

export default function ChildPicker({
  students,
  selectedId,
  onSelect,
}: {
  students: ParentChild[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-bold text-[#0f4d34]">Select Child</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {students.map((c) => {
          const isSelected = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-[#3AB67D] bg-[#A2E494]/10 shadow-sm"
                  : "border-gray-100 hover:border-[#3AB67D]/40 hover:bg-gray-50"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColorFor(c.id)}`}>
                {initials(c.name)}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-bold text-gray-800">{c.name}</span>
                <span className="block text-xs text-gray-500">{c.className}</span>
              </span>
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#13714C] text-white">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
