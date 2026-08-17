import type { Metadata } from "next";
import Link from "next/link";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  CalendarIcon,
  CheckSquareIcon,
  ClipboardListIcon,
  HomeIcon,
  GraduationCapIcon,
  UsersIcon,
  InfoIcon,
} from "@/components/icons";
import { formatLongDate, getToday } from "@/lib/school-calendar";
import { getTeacherRoster } from "@/lib/teacher-roster";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getTeacherSchedule, type DayType } from "@/lib/timetable-data";
import { createClient } from "@/lib/supabase/server";

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export const metadata: Metadata = {
  title: "Teacher Dashboard | Al-Emaan Model School",
  description: "Overview of your classes, attendance and homework for today.",
};

const quickActions = [
  { label: "Mark Attendance", href: "/teacher/attendance", icon: CheckSquareIcon },
  { label: "My Timetable", href: "/teacher/timetable", icon: CalendarIcon },
  { label: "Homework", href: "/teacher/homework", icon: ClipboardListIcon },
];

const quote = {
  text: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.",
  author: "Brad Henry",
};

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { roster, error } = await getTeacherRoster();

  const classCount = new Set(roster.map((s) => s.classId)).size;
  const studentCount = roster.length;

  const today = new Date().toISOString().slice(0, 10);
  const { data: attendanceToday } = await supabase
    .from("attendance")
    .select("class_id")
    .eq("marked_by", user?.id ?? "")
    .eq("date", today)
    .returns<{ class_id: string }[]>();

  const classesMarkedToday = new Set((attendanceToday ?? []).map((a) => a.class_id)).size;

  const sessionId = await getCurrentSessionId();
  const todayDayType: DayType = getToday().getDay() === 5 ? "friday" : "weekday";
  const schedule = sessionId && user ? await getTeacherSchedule(sessionId, user.id) : { weekday: [], friday: [] };
  const todaysPeriods = (todayDayType === "friday" ? schedule.friday : schedule.weekday).filter(
    (p) => !p.is_break && p.classId
  );

  const statCards = [
    { icon: GraduationCapIcon, iconBg: "bg-[#3AB67D]", label: "CLASSES ASSIGNED", value: String(classCount), sub: "Classes You Teach" },
    { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "STUDENTS TAUGHT", value: String(studentCount), sub: "Across All Classes" },
    { icon: CheckSquareIcon, iconBg: "bg-blue-500", label: "ATTENDANCE MARKED TODAY", value: String(classesMarkedToday), sub: `${classesMarkedToday === 1 ? "One Class" : `${classesMarkedToday} Classes`}` },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="Dashboard" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-5 p-4 sm:p-6">
          <PageHeader
            icon={HomeIcon}
            title="Dashboard"
            subtitle={`Here's your overview for ${formatLongDate(getToday())}.`}
            breadcrumb={[{ label: "Dashboard" }]}
          />

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load your classes: {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Today's periods */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <CalendarIcon className="h-4 w-4" />
                Today&apos;s Periods
              </h2>
              <p className="mb-3 text-xs text-gray-400">Your schedule for today</p>
              {todaysPeriods.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#F4F6F5] py-10 text-center">
                  <CalendarIcon className="h-6 w-6 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-500">No periods have been set up for your classes yet.</p>
                  <Link href="/teacher/timetable" className="text-xs font-semibold text-[#13714C] hover:underline">
                    View My Timetable
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {todaysPeriods.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{p.subjectName ?? "General"}</p>
                        <p className="text-xs text-gray-500">{p.className}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-gray-600">
                          {formatTime(p.start_time)} - {formatTime(p.end_time)}
                        </p>
                        <p className="text-[10px] text-gray-400">{p.label}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <h2 className="mb-1 text-sm font-bold text-[#0f4d34]">Quick Actions</h2>
              <p className="mb-3 text-xs text-gray-400">Shortcuts to your daily tasks</p>
              <div className="flex flex-col gap-2.5">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl bg-[#F4F6F5] px-3.5 py-3 text-sm font-semibold text-[#0f4d34] transition hover:bg-[#A2E494]/20"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#13714C] text-white">
                      <action.icon className="h-4 w-4" />
                    </span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-5">
            <p className="text-sm italic leading-relaxed text-[#0f4d34]">&ldquo;{quote.text}&rdquo;</p>
            <p className="mt-2 text-xs font-semibold text-[#13714C]">— {quote.author}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
