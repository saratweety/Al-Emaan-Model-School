import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PromoteStudentsBoard from "@/components/students/PromoteStudentsBoard";
import { ArrowLeftIcon } from "@/components/icons";
import { getClasses } from "@/lib/classes-data";
import { getPromotableRoster } from "@/lib/promotion-data";

export const metadata: Metadata = {
  title: "Promote Students | Al-Emaan Model School",
  description: "Move students to the next class at the end of the academic session.",
};

export default async function PromoteStudentsPage() {
  const { classes } = await getClasses();
  const initialClassId = classes[0]?.id ?? "";
  const initialRoster = initialClassId ? await getPromotableRoster(initialClassId) : [];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Students" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/students"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Students
          </Link>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Promote Students</h1>
            <p className="text-sm text-gray-500">
              Move students to the next class at the end of the academic session. Historical records for the
              current session are kept — nothing is overwritten.
            </p>
          </div>

          {classes.length === 0 ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              No classes are set up yet.
            </div>
          ) : (
            <PromoteStudentsBoard classes={classes} initialClassId={initialClassId} initialRoster={initialRoster} />
          )}
        </main>
      </div>
    </div>
  );
}
