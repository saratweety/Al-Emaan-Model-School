import type { Metadata } from "next";
import Link from "next/link";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import StatCard from "@/components/dashboard/StatCard";
import ParentPageHead from "@/components/parent/ParentPageHead";
import {
  HomeIcon,
  UsersIcon,
  WalletIcon,
  BellIcon,
  ClipboardListIcon,
  CalendarIcon,
  BarChartIcon,
  CheckSquareIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { initials, avatarColorFor } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildSummary, getNoticesForParent, getHomeworkDueCount } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "Parent Dashboard | Al-Emaan Model School",
  description: "Overview of your children's attendance, fees, homework and notices.",
};

const quickActions = [
  { label: "View Fees", href: "/parent/fees", icon: WalletIcon },
  { label: "My Timetable", href: "/parent/timetable", icon: CalendarIcon },
  { label: "Homework & Tests", href: "/parent/homework", icon: ClipboardListIcon },
  { label: "Results", href: "/parent/results", icon: BarChartIcon },
];

export default async function ParentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const [summaries, notices, homeworkDue] = await Promise.all([
    Promise.all(children.map(async (c) => ({ child: c, summary: await getChildSummary(c) }))),
    getNoticesForParent(),
    getHomeworkDueCount(children),
  ]);

  const feesPending = summaries.filter((s) => s.summary.feeStatus === "Pending").length;
  const recentNotices = notices.slice(0, 3);

  const statCards = [
    { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "CHILDREN ENROLLED", value: String(children.length), sub: "All Active" },
    { icon: WalletIcon, iconBg: "bg-orange-500", label: "FEES PENDING", value: String(feesPending), sub: "This Month", href: "/parent/fees" },
    { icon: BellIcon, iconBg: "bg-[#3AB67D]", label: "NOTICES", value: String(notices.length), sub: "Recent", href: "/parent/notices" },
    { icon: ClipboardListIcon, iconBg: "bg-blue-500", label: "HOMEWORK DUE", value: String(homeworkDue), sub: "This Week", href: "/parent/homework" },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Dashboard" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <ParentPageHead
            icon={HomeIcon}
            title="Dashboard"
            subtitle="Here's what's happening with your children today."
            breadcrumb={[{ label: "Dashboard" }]}
          />

          {children.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm font-semibold text-gray-500 shadow-sm">
              No children are linked to your account yet. Contact the school office to get this set up.
            </p>
          ) : (
            <>
              {/* Children overview */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {summaries.map(({ child: c, summary }) => (
                  <Link
                    key={c.id}
                    href="/parent/children"
                    className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#3AB67D]/40 hover:shadow-md sm:p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColorFor(c.id)}`}>
                        {initials(c.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.className} • {c.admissionNo}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-50 pt-3 text-center">
                      <div>
                        <p className="text-sm font-bold text-[#13714C]">{summary.attendancePct}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Attendance</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{summary.latestResult}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Latest Test</p>
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${summary.feeStatus === "Pending" ? "text-orange-600" : "text-gray-800"}`}>
                          {summary.feeStatus}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Fee Status</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Quick actions */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <h2 className="mb-1 text-sm font-bold text-[#0f4d34]">Quick Actions</h2>
                  <p className="mb-3 text-xs text-gray-400">Jump to what you need</p>
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

                {/* Recent notices */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
                  <div className="mb-1 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#0f4d34]">Recent Notices</h2>
                    <Link href="/parent/notices" className="text-xs font-semibold text-[#13714C] hover:underline">
                      View All
                    </Link>
                  </div>
                  <p className="mb-3 text-xs text-gray-400">Latest announcements from the school</p>
                  {recentNotices.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">No notices yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {recentNotices.map((n) => (
                        <Link
                          key={n.id}
                          href="/parent/notices"
                          className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-gray-50"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#A2E494]/25 text-[#13714C]">
                            <BellIcon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">{n.title}</p>
                            <p className="text-xs text-gray-400">{n.noticeType} • {n.publishDate}</p>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Today's schedule teaser */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <CheckSquareIcon className="h-4 w-4" />
                  Today at a Glance
                </h2>
                <p className="mb-3 text-xs text-gray-400">A quick check-in across your children</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {children.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl bg-[#F4F6F5] p-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColorFor(c.id)}`}>
                        {initials(c.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.className} — check attendance for today&apos;s status</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
