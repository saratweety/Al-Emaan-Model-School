import type { ReactNode } from "react";
import { ClockIcon } from "@/components/icons";
import { UserIcon, UsersIcon } from "@/components/icons";
import type { SchoolDaySchedule } from "@/lib/timetable-data";

const subjectColors: Record<string, string> = {
  English: "bg-purple-100 text-purple-700",
  Urdu: "bg-blue-100 text-blue-700",
  Mathematics: "bg-green-100 text-green-700",
  Maths: "bg-green-100 text-green-700",
  Math: "bg-green-100 text-green-700",
  Science: "bg-orange-100 text-orange-700",
  Computer: "bg-blue-100 text-blue-700",
  Islamiat: "bg-teal-100 text-teal-700",
  Islamiyat: "bg-teal-100 text-teal-700",
  Drawing: "bg-blue-100 text-blue-700",
  Rhymes: "bg-green-100 text-green-700",
  "Story Time": "bg-teal-100 text-teal-700",
  Activity: "bg-teal-100 text-teal-700",
  "General Knowledge": "bg-green-100 text-green-700",
};

const classIconStyles = [
  { icon: UserIcon, bg: "bg-pink-100 text-pink-600" },
  { icon: UserIcon, bg: "bg-orange-100 text-orange-600" },
  { icon: UsersIcon, bg: "bg-purple-100 text-purple-600" },
  { icon: UsersIcon, bg: "bg-blue-100 text-blue-600" },
  { icon: UsersIcon, bg: "bg-green-100 text-green-600" },
  { icon: UsersIcon, bg: "bg-teal-100 text-teal-600" },
];

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function DaySchedule({ schedule, emptyHint }: { schedule: SchoolDaySchedule; emptyHint: ReactNode }) {
  if (schedule.periods.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 px-3.5 py-2.5 text-sm text-[#0f4d34]">
        {emptyHint}
      </div>
    );
  }

  return (
    <>
      {/* Class Periods & Time */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <ClockIcon className="h-4 w-4 text-[#13714C]" />
          Class Periods &amp; Time
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] table-fixed text-left text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="w-[110px] py-2 pr-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Period
                </td>
                {schedule.periods.map((p) => (
                  <td key={p.id} className="py-2 text-center font-bold text-[#0f4d34]">
                    {p.label}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-3 text-xs font-bold uppercase tracking-wide text-gray-400">Time</td>
                {schedule.periods.map((p) => (
                  <td key={p.id} className="py-2 text-center text-xs font-semibold text-gray-600">
                    {formatTime(p.start_time)} - {formatTime(p.end_time)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Class x period grid */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed text-left text-sm">
            <thead>
              <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                <th className="w-[160px] rounded-l-xl px-3 py-3">Class</th>
                {schedule.periods.map((p) => (
                  <th key={p.id} className="px-3 py-3 text-center">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.classRows.map((c, i) => {
                const style = classIconStyles[i % classIconStyles.length];
                return (
                  <tr key={c.classId} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2 font-semibold text-gray-700">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
                          <style.icon className="h-4 w-4" />
                        </span>
                        {c.className}
                      </span>
                    </td>
                    {schedule.periods.map((p) => {
                      const cell = c.cellsByPeriod[p.id];
                      return (
                        <td key={p.id} className="px-3 py-2.5">
                          {p.is_break ? (
                            <span className="block rounded-lg bg-[#F4F6F5] px-2.5 py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
                              Break
                            </span>
                          ) : cell?.subject ? (
                            <span
                              className={`block rounded-lg px-2.5 py-2 text-center text-xs font-semibold ${
                                subjectColors[cell.subject] ?? "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {cell.subject}
                              {cell.teacher && <span className="mt-0.5 block text-[10px] font-medium opacity-75">{cell.teacher}</span>}
                            </span>
                          ) : (
                            <span className="block px-2.5 py-2 text-center text-xs text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
