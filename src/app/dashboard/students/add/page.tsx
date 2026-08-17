import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AddStudentForm from "@/components/students/AddStudentForm";
import { ArrowLeftIcon } from "@/components/icons";
import { getClasses } from "@/lib/classes-data";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export const metadata: Metadata = {
  title: "Add Student | Al-Emaan Model School",
  description: "Enroll a new student.",
};

export default async function AddStudentPage() {
  const { classes } = await getClasses();
  const currentSessionId = await getCurrentSessionId();

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
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Add New Student (Admission Form)</h1>
            <p className="text-sm text-gray-500">Fill in the details below to add a new student to the school.</p>
          </div>

          {!currentSessionId && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              No current academic session is configured — the form will still work, but the new student can&apos;t be
              enrolled in a class until one is set.
            </div>
          )}

          <AddStudentForm classes={classes} currentSessionId={currentSessionId} />
        </main>
      </div>
    </div>
  );
}
