import Link from "next/link";
import { GraduationCapIcon, CheckSquareIcon, WalletIcon, BarChartIcon, CalendarIcon } from "@/components/icons";
import { initials, avatarColorFor } from "@/lib/format";
import type { ParentChild, ChildSummary } from "@/lib/parent-data";
import ParentPageHead from "./ParentPageHead";

export default function MyChildrenView({ rows }: { rows: { child: ParentChild; summary: ChildSummary }[] }) {
  return (
    <>
      <ParentPageHead
        icon={GraduationCapIcon}
        title="My Children"
        subtitle="An overview of every child linked to your account."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "My Children" }]}
      />

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm font-semibold text-gray-500 shadow-sm">
          No children are linked to your account yet. Contact the school office to get this set up.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ child: c, summary: d }) => (
            <div key={c.id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${avatarColorFor(c.id)}`}>
                  {initials(c.name)}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-extrabold text-[#0f4d34]">{c.name}</h3>
                  <p className="text-sm text-gray-500">{c.className}</p>
                  <p className="text-xs text-gray-400">{c.admissionNo}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 border-t border-gray-50 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <GraduationCapIcon className="h-4 w-4 text-[#13714C]" />
                    Class
                  </span>
                  <span className="font-bold text-gray-800">{c.className}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <CheckSquareIcon className="h-4 w-4 text-[#3AB67D]" />
                    Attendance (This Month)
                  </span>
                  <span className="font-bold text-gray-800">{d.attendancePct}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <WalletIcon className="h-4 w-4 text-orange-500" />
                    Fee Status
                  </span>
                  <span className={`font-bold ${d.feeStatus === "Pending" ? "text-orange-600" : "text-gray-800"}`}>
                    {d.feeStatus === "Pending"
                      ? `Pending (${d.feePendingMonths} month${d.feePendingMonths === 1 ? "" : "s"})`
                      : d.feeStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500">
                    <BarChartIcon className="h-4 w-4 text-blue-500" />
                    Latest Result
                  </span>
                  <span className="font-bold text-gray-800">{d.latestResult}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 text-gray-500">
                    <CalendarIcon className="h-4 w-4 text-purple-500" />
                    Class Teacher
                  </span>
                  <span className="text-right font-semibold text-gray-700">{d.classTeacher}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/parent/timetable"
                  className="rounded-xl bg-[#F4F6F5] px-3 py-2 text-center text-xs font-bold text-[#13714C] hover:bg-[#A2E494]/20"
                >
                  Timetable
                </Link>
                <Link
                  href="/parent/results"
                  className="rounded-xl bg-[#F4F6F5] px-3 py-2 text-center text-xs font-bold text-[#13714C] hover:bg-[#A2E494]/20"
                >
                  Results
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
