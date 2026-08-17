import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  UsersIcon,
  GraduationCapIcon,
  WalletIcon,
  ClockIcon,
  BellIcon,
  PlusIcon,
  ChevronRightIcon,
  BuildingIcon,
  HomeIcon,
} from "@/components/icons";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getAttendanceSnapshotToday, getFeeOverview, getTeacherRosterSnapshot } from "@/lib/dashboard-data";
import { getNoticesForPrincipal } from "@/lib/notices-data";
import { getSchoolSettings, formatTime12h } from "@/lib/school-settings-data";
import { noticeTypeMeta } from "@/lib/notice-meta";

export const metadata: Metadata = {
  title: "Principal Dashboard | Al-Emaan Model School",
  description: "Overview of students, teachers, attendance and fees.",
};

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const quickActions = [
  { label: "Add Student", href: "/dashboard/students/add" },
  { label: "Add Teacher", href: "/dashboard/teachers/add" },
  { label: "Collect Fee", href: "/dashboard/fees" },
  { label: "Create Notice", href: "/dashboard/notices/add" },
  { label: "Create Exam", href: "/dashboard/exams/add" },
  { label: "Generate Report", href: "/dashboard/reports" },
];

export default async function DashboardPage() {
  const sessionId = await getCurrentSessionId();

  const [attendance, feeOverview, { teachers, total: teacherTotal }, { notices }, settings] = await Promise.all([
    getAttendanceSnapshotToday(sessionId),
    getFeeOverview(sessionId),
    getTeacherRosterSnapshot(),
    getNoticesForPrincipal(),
    getSchoolSettings(),
  ]);

  const attendancePct = attendance.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : null;
  const recentNotices = notices.slice(0, 3);

  const statCards = [
    {
      icon: UsersIcon,
      iconBg: "bg-[#3AB67D]",
      label: "TOTAL TEACHERS",
      value: String(teacherTotal),
      sub: "All Staff",
    },
    {
      icon: GraduationCapIcon,
      iconBg: "bg-[#13714C]",
      label: "STUDENTS PRESENT TODAY",
      value: attendance.total > 0 ? `${attendance.present} / ${attendance.total}` : "—",
      sub: attendancePct !== null ? `${attendancePct}% Present` : "No attendance marked yet",
    },
    {
      icon: WalletIcon,
      iconBg: "bg-[#e8a13a]",
      label: "CURRENT MONTH FEE UNPAID",
      value: `${feeOverview.unpaidThisMonthCount} Students`,
      sub: `Rs ${money(feeOverview.unpaidThisMonthAmount)} Due`,
      subColor: "text-red-600",
      href: "/dashboard/fees?status=pending",
    },
    {
      icon: ClockIcon,
      iconBg: "bg-[#3AB67D]",
      label: "SCHOOL TIMING",
      value: `${formatTime12h(settings.openingTime)} – ${formatTime12h(settings.closingTime)}`,
      sub: "School Hours",
    },
  ];

  const schoolTiming = [
    { label: "School Opening Time", value: formatTime12h(settings.openingTime) },
    { label: "School Closing Time", value: formatTime12h(settings.closingTime) },
    { label: "Teacher Reporting Time", value: formatTime12h(settings.teacherReportingTime) },
    { label: "Break Time", value: `${formatTime12h(settings.breakStart)} – ${formatTime12h(settings.breakEnd)}` },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Dashboard" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-5 p-4 sm:p-6">
          <PageHeader
            icon={HomeIcon}
            title="Dashboard"
            subtitle="Welcome back! Here's what's happening at your school today."
            breadcrumb={[{ label: "Dashboard" }]}
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {/* Teacher roster / fee unpaid / fee pending */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex h-[225px] flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm lg:col-span-1">
              <h2 className="mb-2 flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#0f4d34]">
                <ClockIcon className="h-4 w-4" />
                TEACHER ARRIVAL TODAY
              </h2>
              {teachers.length === 0 ? (
                <p className="flex flex-1 items-center justify-center text-center text-xs font-semibold text-gray-400">
                  No teachers yet.
                </p>
              ) : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400">
                        <th className="pb-1.5 font-medium">#</th>
                        <th className="pb-1.5 font-medium">Name</th>
                        <th className="pb-1.5 font-medium">Time</th>
                        <th className="pb-1.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t, i) => (
                        <tr key={t.id} className="border-t border-gray-50">
                          <td className="py-1.5 text-gray-400">{i + 1}</td>
                          <td className="py-1.5 font-medium text-gray-700">{t.name}</td>
                          <td className="py-1.5 text-gray-400">—</td>
                          <td className="py-1.5">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                              Not Tracked
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Link
                href="/dashboard/teachers"
                className="mt-2.5 flex w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-[#F4F6F5] py-1.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/20"
              >
                View All Teachers <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex h-[225px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm">
              <h2 className="mb-1 self-start text-xs font-bold text-[#0f4d34]">
                CURRENT MONTH FEE UNPAID
              </h2>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
                <WalletIcon className="h-4 w-4" />
              </span>
              <p className="mt-1.5 text-lg font-extrabold text-[#0f4d34]">{feeOverview.unpaidThisMonthCount} Students</p>
              <p className="text-xs text-gray-500">Total Due Amount</p>
              <p className="text-lg font-extrabold text-red-600">Rs {money(feeOverview.unpaidThisMonthAmount)}</p>
              <Link
                href="/dashboard/fees?status=pending"
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl bg-[#F4F6F5] py-1.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/20"
              >
                View Pending List <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex h-[225px] flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <h2 className="mb-1.5 shrink-0 text-xs font-bold text-[#0f4d34]">2 – 3+ MONTHS FEE PENDING</h2>
              <ul className="flex-1 space-y-1 overflow-auto">
                {feeOverview.tiers.map((tier) => (
                  <li key={tier.label} className="flex items-center gap-2 rounded-xl bg-[#F4F6F5] p-1.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <ClockIcon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-semibold leading-tight text-gray-700">{tier.label}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-gray-500">{tier.studentCount} Students</p>
                      <p className="text-xs font-bold text-red-600">Rs {money(tier.amount)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/fees?status=pending"
                className="mt-2 flex w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-[#F4F6F5] py-1.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/20"
              >
                View Overdue Fees <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Notices / school timing */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <BellIcon className="h-4 w-4" />
                  RECENT NOTICES
                </h2>
                <Link
                  href="/dashboard/notices/add"
                  className="flex items-center gap-1 rounded-lg border border-[#13714C]/30 px-3 py-1.5 text-xs font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
                >
                  <PlusIcon className="h-3.5 w-3.5" /> Create Notice
                </Link>
              </div>
              {recentNotices.length === 0 ? (
                <p className="py-6 text-center text-sm font-semibold text-gray-400">No notices yet.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {recentNotices.map((n) => {
                    const [date, month] = n.publishDate.split(" ");
                    const meta = noticeTypeMeta[n.noticeType] ?? noticeTypeMeta.general;
                    return (
                      <li key={n.id} className="flex items-center gap-3 py-3">
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#F4F6F5] text-[#0f4d34]">
                          <span className="text-sm font-extrabold leading-none">{date}</span>
                          <span className="text-[9px] font-semibold uppercase leading-none">{month}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">{n.title}</p>
                          <p className="truncate text-xs text-gray-500">{n.description}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#A2E494]/25 px-2.5 py-1 text-xs font-semibold text-[#13714C]">
                          {meta.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link
                href="/dashboard/notices"
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl bg-[#F4F6F5] py-2 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/20"
              >
                View All Notices <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <ClockIcon className="h-4 w-4" />
                SCHOOL TIMING
              </h2>
              <div className="mb-3 flex items-center justify-center rounded-xl bg-[#F4F6F5] py-4">
                <BuildingIcon className="h-10 w-10 text-[#3AB67D]" />
              </div>
              <ul className="space-y-2 text-sm">
                {schoolTiming.map((t) => (
                  <li key={t.label} className="flex items-center justify-between">
                    <span className="text-gray-500">{t.label}</span>
                    <span className="font-semibold text-gray-800">{t.value}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/settings/timing"
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-[#F4F6F5] py-2 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/20"
              >
                Edit Timing <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-[#0f4d34]">QUICK ACTIONS</h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  <PlusIcon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
