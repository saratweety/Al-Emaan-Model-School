import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import TimetableTabs from "@/components/dashboard/TimetableTabs";
import {
  CalendarIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ClockIcon,
  PencilIcon,
  InfoIcon,
  BuildingIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { getToday } from "@/lib/school-calendar";

export const metadata: Metadata = {
  title: "Timetable | Al-Emaan Model School",
  description: "View and manage the weekly class timetable.",
};

const periodTimes = [
  { period: "1", time: "08:00 AM - 08:40 AM" },
  { period: "2", time: "08:40 AM - 09:20 AM" },
  { period: "3", time: "09:20 AM - 10:00 AM" },
  { period: "4", time: "10:20 AM - 11:00 AM" },
  { period: "5", time: "11:00 AM - 11:40 AM" },
];

const subjectColors: Record<string, string> = {
  English: "bg-purple-100 text-purple-700",
  Urdu: "bg-blue-100 text-blue-700",
  Mathematics: "bg-green-100 text-green-700",
  Maths: "bg-green-100 text-green-700",
  Science: "bg-orange-100 text-orange-700",
  Computer: "bg-blue-100 text-blue-700",
  Islamiyat: "bg-teal-100 text-teal-700",
  Drawing: "bg-blue-100 text-blue-700",
  Rhymes: "bg-green-100 text-green-700",
  "Story Time": "bg-teal-100 text-teal-700",
  Activity: "bg-teal-100 text-teal-700",
  "General Knowledge": "bg-green-100 text-green-700",
};

const classSchedule = [
  { name: "Playgroup", icon: UserIcon, iconBg: "bg-pink-100 text-pink-600", subjects: ["English", "Rhymes", "Drawing", "Urdu", "Story Time"] },
  { name: "Nursery", icon: UserIcon, iconBg: "bg-orange-100 text-orange-600", subjects: ["English", "Maths", "Urdu", "Drawing", "Activity"] },
  { name: "Prep", icon: UserIcon, iconBg: "bg-purple-100 text-purple-600", subjects: ["English", "Maths", "Urdu", "Islamiyat", "General Knowledge"] },
  { name: "Class 1", icon: UsersIcon, iconBg: "bg-blue-100 text-blue-600", subjects: ["English", "Mathematics", "Urdu", "Science", "Islamiyat"] },
  { name: "Class 2", icon: UsersIcon, iconBg: "bg-green-100 text-green-600", subjects: ["Mathematics", "English", "Science", "Urdu", "Computer"] },
  { name: "Class 3", icon: UsersIcon, iconBg: "bg-orange-100 text-orange-600", subjects: ["English", "Mathematics", "Urdu", "Islamiyat", "Science"] },
  { name: "Class 4", icon: UsersIcon, iconBg: "bg-purple-100 text-purple-600", subjects: ["Mathematics", "English", "Science", "Urdu", "Computer"] },
  { name: "Class 5", icon: UsersIcon, iconBg: "bg-blue-100 text-blue-600", subjects: ["English", "Mathematics", "Science", "Urdu", "Islamiyat"] },
  { name: "Class 6", icon: UsersIcon, iconBg: "bg-green-100 text-green-600", subjects: ["Mathematics", "English", "Science", "Urdu", "Computer"] },
  { name: "Class 7", icon: UsersIcon, iconBg: "bg-orange-100 text-orange-600", subjects: ["English", "Mathematics", "Science", "Islamiyat", "Urdu"] },
  { name: "Class 8", icon: UsersIcon, iconBg: "bg-teal-100 text-teal-600", subjects: ["Mathematics", "English", "Science", "Urdu", "Computer"] },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const weeklyPeriods = [
  { time: "8:00 - 8:40", subjects: ["English", "Mathematics", "Science", "Urdu", "Computer"] },
  { time: "8:40 - 9:20", subjects: ["Mathematics", "Urdu", "English", "Science", "Islamiyat"] },
  { time: "9:20 - 10:00", subjects: ["Science", "Computer", "Mathematics", "English", "Urdu"] },
  { time: "10:00 - 10:20", subjects: ["Break", "Break", "Break", "Break", "Break"], isBreak: true },
  { time: "10:20 - 11:00", subjects: ["Islamiyat", "Science", "Urdu", "Computer", "Mathematics"] },
  { time: "11:00 - 11:40", subjects: ["Computer", "English", "Islamiyat", "Mathematics", "Science"] },
  { time: "11:40 - 12:20", subjects: ["Urdu", "Islamiyat", "Computer", "Islamiyat", "English"] },
];

export default function TimetablePage() {
  const dateLabel = getToday().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const todayContent = (
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
                <td className="w-[110px] py-2 pr-3 text-xs font-bold uppercase tracking-wide text-gray-400">Period</td>
                {periodTimes.map((p) => (
                  <td key={p.period} className="py-2 text-center font-bold text-[#0f4d34]">
                    {p.period}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-3 text-xs font-bold uppercase tracking-wide text-gray-400">Time</td>
                {periodTimes.map((p) => (
                  <td key={p.period} className="py-2 text-center text-xs font-semibold text-gray-600">
                    {p.time}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#A2E494]/15 px-3.5 py-2.5 text-sm text-[#0f4d34]">
          <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
          <span className="font-bold">Note:</span> Break Time 10:00 AM - 10:20 AM
        </div>
      </div>

      {/* Class x period grid */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed text-left text-sm">
            <thead>
              <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                <th className="w-[160px] rounded-l-xl px-3 py-3">Class</th>
                {periodTimes.map((p) => (
                  <th key={p.period} className="px-3 py-3 text-center">
                    {p.period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classSchedule.map((c) => (
                <tr key={c.name} className="border-b border-gray-50 last:border-0">
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2 font-semibold text-gray-700">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}>
                        <c.icon className="h-4 w-4" />
                      </span>
                      {c.name}
                    </span>
                  </td>
                  {c.subjects.map((subj, i) => (
                    <td key={i} className="px-3 py-2.5">
                      <span
                        className={`block rounded-lg px-2.5 py-2 text-center text-xs font-semibold ${
                          subjectColors[subj] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {subj}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const weeklyContent = (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#0f4d34]">
          <ClockIcon className="h-4 w-4" />
          Grade 5 - A Weekly Timetable
        </h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50"
        >
          <BuildingIcon className="h-4 w-4" />
          Grade 5 - A
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left text-sm">
          <thead>
            <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
              <th className="w-[120px] rounded-l-xl px-3 py-3">Time</th>
              {days.map((d) => (
                <th key={d} className="px-3 py-3">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeklyPeriods.map((p) => (
              <tr key={p.time} className="border-b border-gray-50 last:border-0">
                <td className="px-3 py-2.5 font-semibold text-gray-600">{p.time}</td>
                {p.subjects.map((subj, i) =>
                  p.isBreak ? (
                    <td key={i} className="px-3 py-2.5">
                      <span className="block rounded-lg bg-[#F4F6F5] px-2.5 py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
                        Break
                      </span>
                    </td>
                  ) : (
                    <td key={i} className="px-3 py-2.5">
                      <span
                        className={`block rounded-lg px-2.5 py-2 text-center text-xs font-semibold ${
                          subjectColors[subj] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {subj}
                      </span>
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Timetable" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
                <CalendarIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Link href="/dashboard" className="hover:text-[#13714C] hover:underline">
                    Dashboard
                  </Link>
                  <ChevronRightIcon className="h-3 w-3" />
                  <span className="font-semibold text-[#13714C]">Timetable</span>
                </div>
                <h1 className="mt-0.5 truncate text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Timetable</h1>
                <p className="text-sm text-gray-500">View today&apos;s class schedule for all classes.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <CalendarIcon className="h-4 w-4 text-[#13714C]" />
                Date: {dateLabel}
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
              <Link
                href="/dashboard/timetable/edit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Timetable
              </Link>
            </div>
          </div>

          <TimetableTabs todayContent={todayContent} weeklyContent={weeklyContent} />
        </main>
      </div>
    </div>
  );
}
