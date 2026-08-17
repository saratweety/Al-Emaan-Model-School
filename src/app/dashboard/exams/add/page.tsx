import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AddExamForm, { type Assignment } from "@/components/dashboard/AddExamForm";
import { ArrowLeftIcon } from "@/components/icons";
import { getClasses } from "@/lib/classes-data";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Add Exam | Al-Emaan Model School",
  description: "Schedule a new exam for a class.",
};

type AssignmentRow = {
  class_id: string;
  teacher_id: string;
  subject_id: string | null;
  profiles: { full_name: string } | null;
  subjects: { name: string } | null;
};

export default async function AddExamPage() {
  const { classes } = await getClasses();
  const sessionId = await getCurrentSessionId();

  let assignments: Assignment[] = [];

  if (sessionId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("teacher_assignments")
      .select("class_id, teacher_id, subject_id, profiles(full_name), subjects(name)")
      .eq("session_id", sessionId)
      .returns<AssignmentRow[]>();

    assignments = (data ?? []).map((a) => ({
      classId: a.class_id,
      teacherId: a.teacher_id,
      teacherName: a.profiles?.full_name ?? "Unknown Teacher",
      subjectId: a.subject_id,
      subjectName: a.subjects?.name ?? "General",
    }));
  }

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Exams" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/exams"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Exams
          </Link>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Add New Exam</h1>
            <p className="text-sm text-gray-500">Schedule a new exam and assign it to the class&apos;s teacher.</p>
          </div>

          {!sessionId && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              No current academic session is configured — set one before scheduling an exam.
            </div>
          )}

          <AddExamForm classes={classes} assignments={assignments} />
        </main>
      </div>
    </div>
  );
}
