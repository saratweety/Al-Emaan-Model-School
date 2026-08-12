import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  BellIcon,
  FunnelIcon,
  UsersIcon,
  TrendUpIcon,
  CalendarIcon,
  ChevronDownIcon,
  EyeOutlineIcon,
  MoreVerticalIcon,
  FlagIcon,
  PaperPlaneIcon,
  SparkleIcon,
  PalmTreeIcon,
  FileAlertIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Notices | Al-Emaan Model School",
  description: "Manage announcements and notices for the school.",
};

const tabs = ["All Notices", "Active", "Scheduled", "Expired", "Notice Archive"];

const filters = [
  { label: "All Types", icon: FunnelIcon },
  { label: "All Classes", icon: UsersIcon },
  { label: "All Status", icon: TrendUpIcon },
  { label: "From - To", icon: CalendarIcon },
];

const typeStyles: Record<string, string> = {
  Holiday: "bg-green-100 text-green-700",
  Event: "bg-blue-100 text-blue-700",
  General: "bg-purple-100 text-purple-700",
  Reminder: "bg-amber-100 text-amber-700",
};

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Scheduled: "bg-amber-100 text-amber-700",
  Expired: "bg-red-100 text-red-700",
};

const notices = [
  {
    icon: FlagIcon,
    iconBg: "bg-green-100 text-green-600",
    title: "Independence Day",
    desc: "School will remain closed on 14th August.",
    type: "Holiday",
    forClass: "All Classes",
    published: "11 Aug 2026",
    publishedBy: "by Principal",
    validUntil: "14 Aug 2026",
    status: "Active",
  },
  {
    icon: UsersIcon,
    iconBg: "bg-blue-100 text-blue-600",
    title: "Parent Teacher Meeting",
    desc: "PTM will be held on 20th August 2026 (Saturday).",
    type: "Event",
    forClass: "All Classes",
    published: "10 Aug 2026",
    publishedBy: "by Admin",
    validUntil: "20 Aug 2026",
    status: "Active",
  },
  {
    icon: PaperPlaneIcon,
    iconBg: "bg-purple-100 text-purple-600",
    title: "School Timings Update",
    desc: "New school timings will be effective from...",
    type: "General",
    forClass: "All Classes",
    published: "09 Aug 2026",
    publishedBy: "by Principal",
    validUntil: "31 Aug 2026",
    status: "Active",
  },
  {
    icon: SparkleIcon,
    iconBg: "bg-orange-100 text-orange-600",
    title: "Science Fair 2026",
    desc: "Science fair will be organized on 5th September.",
    type: "Event",
    forClass: "Grade 6 to 9",
    published: "08 Aug 2026",
    publishedBy: "by Science Dept.",
    validUntil: "05 Sep 2026",
    status: "Scheduled",
  },
  {
    icon: PalmTreeIcon,
    iconBg: "bg-teal-100 text-teal-600",
    title: "Summer Vacation Notice",
    desc: "Summer vacation will start from 1st June.",
    type: "Holiday",
    forClass: "All Classes",
    published: "01 May 2026",
    publishedBy: "by Admin",
    validUntil: "31 May 2026",
    status: "Expired",
  },
  {
    icon: FileAlertIcon,
    iconBg: "bg-pink-100 text-pink-600",
    title: "Fee Submission Reminder",
    desc: "Reminder to submit your pending fee before...",
    type: "Reminder",
    forClass: "All Classes",
    published: "28 Apr 2026",
    publishedBy: "by Admin",
    validUntil: "10 May 2026",
    status: "Expired",
  },
];

const pages = [1, 2, 3, 4];

export default function NoticesPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Notices" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={BellIcon}
            title="Notices"
            subtitle="Create and manage announcements for students, teachers and parents"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notices" }]}
            actionLabel="Add Notice"
            actionHref="/dashboard/notices/add"
          />

          {/* Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto border-b border-gray-200">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
                  i === 0
                    ? "border-[#13714C] text-[#13714C]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((f) => (
              <button
                key={f.label}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <f.icon className="h-4 w-4 text-[#13714C]" />
                {f.label}
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>

          {/* Notices table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Title</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">For</th>
                    <th className="px-3 py-3">Published On</th>
                    <th className="px-3 py-3">Valid Until</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map((n, i) => (
                    <tr key={n.title} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.iconBg}`}>
                            <n.icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800">{n.title}</p>
                            <p className="max-w-[220px] truncate text-xs text-gray-400">{n.desc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyles[n.type]}`}>
                          {n.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{n.forClass}</td>
                      <td className="px-3 py-3 text-gray-600">
                        <p>{n.published}</p>
                        <p className="text-xs text-gray-400">{n.publishedBy}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{n.validUntil}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[n.status]}`}>
                          {n.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button aria-label="View" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                            <EyeOutlineIcon className="h-4 w-4" />
                          </button>
                          <button aria-label="More actions" className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                            <MoreVerticalIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Showing 1 to 6 of 24 notices</p>
              <div className="flex items-center gap-1.5">
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">‹</button>
                {pages.map((p) => (
                  <button
                    key={p}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      p === 1 ? "bg-[#13714C] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50">›</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
