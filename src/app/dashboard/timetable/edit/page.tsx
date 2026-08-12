import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  InfoIcon,
  XIcon,
  SaveIcon,
} from "@/components/icons";
import { getCurrentSessionLabel } from "@/lib/school-calendar";

export const metadata: Metadata = {
  title: "Edit Timetable | Al-Emaan Model School",
  description: "Update timetable details for the class.",
};

const breadcrumb = [
  { label: "Timetable", href: "/dashboard/timetable" },
  { label: "Edit Timetable", active: true },
];

const classOptions = [
  "Play Group - A",
  "Nursery - A",
  "Prep - A",
  "Grade 1 - A",
  "Grade 2 - A",
  "Grade 3 - A",
  "Grade 4 - A",
  "Grade 5 - A",
  "Grade 6 - A",
  "Grade 7 - A",
  "Grade 8 - A",
];

const subjectOptions = ["English", "Urdu", "Math", "Science", "Computer", "Islamiat"];

type PeriodRow = { period: string; time: string; subject?: string; isBreak?: boolean };

const weekdaySchedule: PeriodRow[] = [
  { period: "1", time: "08:00 AM - 08:45 AM", subject: "English" },
  { period: "2", time: "08:45 AM - 09:30 AM", subject: "Math" },
  { period: "3", time: "09:30 AM - 10:15 AM", subject: "Science" },
  { period: "4", time: "10:15 AM - 11:00 AM", subject: "Urdu" },
  { period: "BREAK", time: "11:00 AM - 11:15 AM", isBreak: true },
  { period: "5", time: "11:15 AM - 12:00 PM", subject: "Computer" },
  { period: "6", time: "12:00 PM - 12:45 PM", subject: "Islamiat" },
];

const fridaySchedule: PeriodRow[] = [
  { period: "1", time: "08:00 AM - 08:45 AM", subject: "English" },
  { period: "2", time: "08:45 AM - 09:30 AM", subject: "Math" },
  { period: "3", time: "09:30 AM - 10:15 AM", subject: "Science" },
  { period: "4", time: "10:15 AM - 11:00 AM", subject: "Urdu" },
  { period: "BREAK", time: "11:00 AM - 11:15 AM", isBreak: true },
  { period: "5", time: "11:15 AM - 12:00 PM", subject: "Islamiat" },
];

function ScheduleTable({ rows }: { rows: PeriodRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] table-fixed text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
            <th className="w-[64px] pb-2">Period</th>
            <th className="w-[160px] pb-2">Time</th>
            <th className="pb-2">Subject</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            row.isBreak ? (
              <tr key={row.period} className="rounded-lg bg-[#A2E494]/10">
                <td className="py-2.5 pl-1 text-xs font-extrabold uppercase tracking-wide text-[#13714C]">{row.period}</td>
                <td className="py-2.5 font-semibold text-gray-600">{row.time}</td>
                <td className="py-2.5 text-center text-gray-300">—</td>
              </tr>
            ) : (
              <tr key={row.period} className="border-t border-gray-50">
                <td className="py-2.5 pl-1 font-semibold text-gray-600">{row.period}</td>
                <td className="py-2.5 font-semibold text-gray-600">{row.time}</td>
                <td className="py-2 pr-1">
                  <select
                    defaultValue={row.subject}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-2 focus:ring-[#A2E494]/30"
                  >
                    {subjectOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function EditTimetablePage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Timetable" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRightIcon className="h-3 w-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#13714C] hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#13714C]">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Edit Timetable</h1>
            <p className="text-sm text-gray-500">Update timetable details for the class.</p>
          </div>

          <form className="space-y-4">
            {/* Timetable Information */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A2E494]/25 text-[#13714C]">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                TIMETABLE INFORMATION
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Academic Session <span className="text-red-500">*</span>
                  </label>
                  <select
                    defaultValue={getCurrentSessionLabel().replace("–", " - ")}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  >
                    <option>{getCurrentSessionLabel().replace("–", " - ")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Class</label>
                  <select
                    defaultValue="Grade 1 - A"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  >
                    {classOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Weekly Schedule */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A2E494]/25 text-[#13714C]">
                  <ClockIcon className="h-4 w-4" />
                </span>
                WEEKLY SCHEDULE
              </h2>

              <div className="mb-5 flex items-start gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#13714C]" />
                This timetable will be applied to all days (Monday to Saturday). Friday has a different schedule.
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Monday to Saturday (Same Schedule)</h3>
                  <ScheduleTable rows={weekdaySchedule} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Friday (Early Closing)</h3>
                  <ScheduleTable rows={fridaySchedule} />
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-3 text-sm font-semibold text-[#0f4d34]">
                    <CalendarIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
                    School will close at 12:00 PM on Friday.
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/dashboard/timetable"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <XIcon className="h-4 w-4" />
                Cancel
              </Link>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <SaveIcon className="h-4 w-4" />
                Update Timetable
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
