import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import NoticesTable from "@/components/dashboard/NoticesTable";
import { BellIcon } from "@/components/icons";
import { getNoticesForPrincipal } from "@/lib/notices-data";
import { getClasses } from "@/lib/classes-data";

export const metadata: Metadata = {
  title: "Notices | Al-Emaan Model School",
  description: "Manage announcements and notices for the school.",
};

export default async function NoticesPage() {
  const [{ notices, error }, { classes }] = await Promise.all([getNoticesForPrincipal(), getClasses()]);

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

          {/* Notices table */}
          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
              Couldn&apos;t load notices: {error}
            </div>
          ) : (
            <NoticesTable notices={notices} classes={classes} />
          )}
        </main>
      </div>
    </div>
  );
}
