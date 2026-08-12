import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  ClipboardListIcon,
  GridIcon,
  CheckSquareIcon,
  HourglassIcon,
  BookIcon,
  FlaskIcon,
  MonitorIcon,
  BuildingIcon,
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeOutlineIcon,
} from "@/components/icons";
import { formatShortDate, getToday } from "@/lib/school-calendar";

export const metadata: Metadata = {
  title: "Homework | Al-Emaan Model School",
  description: "Daily homework and holiday diary of each subject for all classes.",
};

const summary = [
  { icon: GridIcon, iconBg: "bg-[#3AB67D]", label: "Total Classes", value: "18" },
  { icon: CheckSquareIcon, iconBg: "bg-purple-500", label: "Updated Today", value: "14" },
  { icon: HourglassIcon, iconBg: "bg-amber-500", label: "Pending", value: "4" },
  { icon: BookIcon, iconBg: "bg-blue-500", label: "Total Subjects", value: "9" },
];

const diary = [
  {
    subject: "Mathematics",
    icon: GridIcon,
    iconBg: "bg-green-100 text-green-700",
    title: "Exercise 4.1",
    desc: "Solve question 1 to 5 on page 45.",
    teacher: "Mrs. Ayesha Khan",
    gender: "g",
  },
  {
    subject: "English",
    icon: BookIcon,
    iconBg: "bg-purple-100 text-purple-700",
    title: "Learn paragraph",
    desc: 'Write and learn paragraph "My School".',
    teacher: "Ms. Sana Malik",
    gender: "g",
  },
  {
    subject: "Science",
    icon: FlaskIcon,
    iconBg: "bg-orange-100 text-orange-700",
    title: "Read Chapter 3",
    desc: "Read lesson 3 and write key points.",
    teacher: "Mrs. Hina Fatima",
    gender: "g",
  },
  {
    subject: "Urdu",
    icon: BookIcon,
    iconBg: "bg-blue-100 text-blue-700",
    title: "سبق نمبر 4 یاد کریں",
    desc: "سبق نمبر 4 کو یاد کریں اور جواب سوال کریں۔",
    teacher: "Mr. Imran Ahmed",
    gender: "b",
  },
  {
    subject: "Islamiyat",
    icon: BuildingIcon,
    iconBg: "bg-green-100 text-green-700",
    title: "Learn Questions 1 to 5",
    desc: "Learn short questions from lesson 2.",
    teacher: "Ma'am Sarah",
    gender: "g",
  },
  {
    subject: "Computer",
    icon: MonitorIcon,
    iconBg: "bg-blue-100 text-blue-700",
    title: "Practical",
    desc: "Do exercise 2 in your notebook.",
    teacher: "Mr. Usman Tariq",
    gender: "b",
  },
];

const classStatus = [
  { cls: "Grade 5-A", status: "Updated" },
  { cls: "Grade 5-B", status: "Updated" },
  { cls: "Grade 6-A", status: "Pending" },
  { cls: "Grade 6-B", status: "Updated" },
  { cls: "Grade 7-A", status: "Pending" },
];

function initials(name: string) {
  return name
    .replace(/^(Mrs\.|Mr\.|Ms\.|Ma'am)\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: { day: number; current: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ day: cells.length - (startOffset + daysInMonth) + 1, current: false });
  }
  return cells;
}

const todayDate = getToday();
const calendarCells = buildCalendar(todayDate.getFullYear(), todayDate.getMonth());
const today = todayDate.getDate();
const currentMonthLabel = todayDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function HomeworkPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Homework" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={ClipboardListIcon}
            title="Homework Diary"
            subtitle="Daily homework and holiday diary of each subject for all classes."
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Homework" }]}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summary.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.iconBg}`}>
                  <s.icon className="h-[18px] w-[18px] text-white" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-extrabold text-[#0f4d34]">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-xl bg-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
              Daily Diary
            </button>
            <button className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Holiday / Vacation Diary
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <CalendarIcon className="h-4 w-4 text-[#13714C]" />
                {formatShortDate(todayDate)}
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <UserIcon className="h-4 w-4 text-[#13714C]" />
                Grade 5-A
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              View by
              <div className="flex overflow-hidden rounded-lg border border-gray-200">
                <button className="bg-[#13714C] px-3 py-1.5 text-xs font-semibold text-white">Table View</button>
                <button className="bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Subject View</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Diary table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
              <div className="bg-[#A2E494]/20 px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <CalendarIcon className="h-4 w-4" />
                  Daily Diary - Grade 5-A
                </h2>
              </div>
              <div className="overflow-x-auto p-4">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Subject</th>
                      <th className="pb-2">Homework / Diary</th>
                      <th className="pb-2">Teacher</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diary.map((d, i) => (
                      <tr key={d.subject} className="border-t border-gray-50">
                        <td className="py-3 text-gray-400">{i + 1}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-2 font-semibold text-gray-800">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${d.iconBg}`}>
                              <d.icon className="h-4 w-4" />
                            </span>
                            {d.subject}
                          </span>
                        </td>
                        <td className="max-w-[220px] py-3">
                          <p className="font-semibold text-gray-800">{d.title}</p>
                          <p className="text-xs text-gray-500">{d.desc}</p>
                        </td>
                        <td className="py-3">
                          <span className="flex items-center gap-2">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                                d.gender === "b" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                              }`}
                            >
                              {initials(d.teacher)}
                            </span>
                            <span className="text-gray-700">{d.teacher}</span>
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-[#A2E494]/25 px-2.5 py-1 text-xs font-semibold text-[#13714C]">
                            Daily Homework
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                            <EyeOutlineIcon className="h-3.5 w-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Note:</span> Homework diary must be updated daily
                  before 6:00 PM.
                </p>
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-bold text-[#0f4d34]">Class Update Status (Today)</h2>
                <ul className="space-y-2.5">
                  {classStatus.map((c) => (
                    <li key={c.cls} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{c.cls}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          c.status === "Updated" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </li>
                  ))}
                </ul>
                <button className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  View All Classes
                </button>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <button aria-label="Previous month" className="rounded-lg p-1 text-gray-400 hover:bg-gray-50">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <h2 className="text-sm font-bold text-[#0f4d34]">{currentMonthLabel}</h2>
                  <button aria-label="Next month" className="rounded-lg p-1 text-gray-400 hover:bg-gray-50">
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span key={d} className="font-semibold text-gray-400">
                      {d}
                    </span>
                  ))}
                  {calendarCells.map((c, i) => (
                    <span
                      key={i}
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                        c.current && c.day === today
                          ? "bg-[#13714C] font-bold text-white"
                          : c.current
                            ? "text-gray-700"
                            : "text-gray-300"
                      }`}
                    >
                      {c.day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
