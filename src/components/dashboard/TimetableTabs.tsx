"use client";

import { useState, type ReactNode } from "react";
import { CalendarIcon, DownloadIcon } from "@/components/icons";

export default function TimetableTabs({
  todayContent,
  weeklyContent,
}: {
  todayContent: ReactNode;
  weeklyContent: ReactNode;
}) {
  const [tab, setTab] = useState<"today" | "weekly">("today");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "today" ? "bg-[#F4F6F5] text-[#0f4d34] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            Today&apos;s Timetable
          </button>
          <button
            type="button"
            onClick={() => setTab("weekly")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "weekly" ? "bg-[#F4F6F5] text-[#0f4d34] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            Weekly View
          </button>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <DownloadIcon className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="space-y-4">{tab === "today" ? todayContent : weeklyContent}</div>
    </>
  );
}
