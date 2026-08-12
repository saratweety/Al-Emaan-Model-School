import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  ChevronRightIcon,
  ClockIcon,
  InfoIcon,
  DoorOpenIcon,
  BuildingIcon,
  CoffeeIcon,
  DoorExitIcon,
  XIcon,
  SaveIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Edit School Timing | Al-Emaan Model School",
  description: "Update school timing details applied across attendance and timetables.",
};

const breadcrumb = [
  { label: "Settings", href: "/dashboard/settings" },
  { label: "School Timing" },
  { label: "Edit Timing", active: true },
];

const timingRows = [
  {
    icon: DoorOpenIcon,
    label: "School Opening Time",
    desc: "Students entry time",
    type: "single" as const,
    defaultValue: "08:00",
  },
  {
    icon: BuildingIcon,
    label: "Teacher Reporting Time",
    desc: "Teachers must report before",
    type: "single" as const,
    defaultValue: "07:45",
  },
  {
    icon: CoffeeIcon,
    label: "Break Time",
    desc: "Short break for students",
    type: "range" as const,
    defaultFrom: "11:00",
    defaultTo: "11:30",
  },
  {
    icon: DoorExitIcon,
    label: "School Closing Time",
    desc: "School closing time",
    type: "single" as const,
    defaultValue: "14:00",
  },
];

function TimeField({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="relative w-full sm:w-[220px]">
      <ClockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="time"
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
      />
    </div>
  );
}

export default function EditSchoolTimingPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Settings" />

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
                ) : crumb.active ? (
                  <span className="font-semibold text-[#13714C]">{crumb.label}</span>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Edit School Timing</h1>
            <p className="text-sm text-gray-500">Update school timing details. These timings will be applied across the system.</p>
          </div>

          <form className="space-y-4">
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#A2E494]/25 text-[#13714C]">
                  <ClockIcon className="h-4 w-4" />
                </span>
                SCHOOL TIMING DETAILS
              </h2>

              <div className="mb-5 flex items-start gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#13714C]" />
                These timings will be used for daily attendance, timetable periods and other school activities.
              </div>

              <div className="divide-y divide-gray-100">
                {timingRows.map((row) => (
                  <div key={row.label} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/20 text-[#13714C]">
                        <row.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{row.label}</p>
                        <p className="text-xs text-gray-400">{row.desc}</p>
                      </div>
                    </div>

                    {row.type === "single" ? (
                      <TimeField defaultValue={row.defaultValue} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <TimeField defaultValue={row.defaultFrom} />
                        <span className="text-sm text-gray-400">to</span>
                        <TimeField defaultValue={row.defaultTo} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/dashboard/settings"
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
                Save Timing
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
