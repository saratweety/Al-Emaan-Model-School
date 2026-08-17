import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import EditTimingForm from "@/components/dashboard/EditTimingForm";
import { ChevronRightIcon } from "@/components/icons";
import { getSchoolSettings } from "@/lib/school-settings-data";

export const metadata: Metadata = {
  title: "Edit School Timing | Al-Emaan Model School",
  description: "Update school timing details applied across attendance and timetables.",
};

const breadcrumb = [
  { label: "Settings", href: "/dashboard/settings" },
  { label: "School Timing" },
  { label: "Edit Timing", active: true },
];

export default async function EditSchoolTimingPage() {
  const settings = await getSchoolSettings();

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

          <EditTimingForm settings={settings} />
        </main>
      </div>
    </div>
  );
}
