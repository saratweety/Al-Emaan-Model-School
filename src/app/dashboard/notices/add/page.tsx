import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AddNoticeForm from "@/components/dashboard/AddNoticeForm";
import { ArrowLeftIcon } from "@/components/icons";
import { getClasses } from "@/lib/classes-data";

export const metadata: Metadata = {
  title: "Add Notice | Al-Emaan Model School",
  description: "Create an announcement for students, teachers or parents.",
};

export default async function AddNoticePage() {
  const { classes } = await getClasses();

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Notices" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/notices"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Notices
          </Link>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Add New Notice</h1>
            <p className="text-sm text-gray-500">Create an announcement for students, teachers or parents.</p>
          </div>

          <AddNoticeForm classes={classes} />
        </main>
      </div>
    </div>
  );
}
