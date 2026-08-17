"use client";

import { useState } from "react";
import { CalendarIcon, DownloadIcon } from "@/components/icons";
import type { SchoolDaySchedule, DayType } from "@/lib/timetable-data";
import DaySchedule from "./DaySchedule";

export default function TimetableView({
  todayLabel,
  todayDayType,
  weekdaySchedule,
  fridaySchedule,
  sessionConfigured,
}: {
  todayLabel: string;
  todayDayType: DayType;
  weekdaySchedule: SchoolDaySchedule;
  fridaySchedule: SchoolDaySchedule;
  sessionConfigured: boolean;
}) {
  const [tab, setTab] = useState<"today" | "weekly">("today");
  const [weeklyDayType, setWeeklyDayType] = useState<DayType>(todayDayType);

  if (!sessionConfigured) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
        No current academic session is configured — set one to view the timetable.
      </div>
    );
  }

  const todaySchedule = todayDayType === "friday" ? fridaySchedule : weekdaySchedule;
  const weeklySchedule = weeklyDayType === "friday" ? fridaySchedule : weekdaySchedule;

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

      {tab === "today" ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {todayLabel} · {todayDayType === "friday" ? "Friday schedule" : "Monday–Saturday schedule"}
          </p>
          <DaySchedule
            schedule={todaySchedule}
            emptyHint={
              <>
                No periods have been set up for {todayDayType === "friday" ? "Friday" : "Monday–Saturday"} yet.
              </>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-1 rounded-xl bg-[#F4F6F5] p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setWeeklyDayType("weekday")}
              className={`rounded-lg px-3.5 py-1.5 transition ${
                weeklyDayType === "weekday" ? "bg-white text-[#13714C] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monday – Thursday
            </button>
            <button
              type="button"
              onClick={() => setWeeklyDayType("friday")}
              className={`rounded-lg px-3.5 py-1.5 transition ${
                weeklyDayType === "friday" ? "bg-white text-[#13714C] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Friday
            </button>
          </div>
          {weeklyDayType === "friday" && (
            <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 px-3.5 py-2.5 text-sm text-[#0f4d34]">
              Friday runs a shorter schedule than the rest of the week.
            </div>
          )}
          <DaySchedule
            schedule={weeklySchedule}
            emptyHint={
              <>No periods have been set up for {weeklyDayType === "friday" ? "Friday" : "Monday–Saturday"} yet.</>
            }
          />
        </div>
      )}
    </>
  );
}
