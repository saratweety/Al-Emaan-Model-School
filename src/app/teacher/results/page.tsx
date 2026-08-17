import type { Metadata } from "next";
import Link from "next/link";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import ResultsBoard, { type TestOption, type MarkRow } from "@/components/teacher/ResultsBoard";
import { BarChartIcon, InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getTeacherRoster } from "@/lib/teacher-roster";

export const metadata: Metadata = {
  title: "Results | Al-Emaan Model School",
  description: "Enter and view marks for your tests.",
};

export default async function TeacherResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string }>;
}) {
  const { examId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { roster, error: rosterError } = await getTeacherRoster();

  const { data: examRows, error: examsError } = await supabase
    .from("exams")
    .select("id, class_id, name, max_marks, exam_date, classes(name)")
    .eq("teacher_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .returns<{ id: string; class_id: string; name: string; max_marks: number; exam_date: string | null; classes: { name: string } | null }[]>();

  const tests: TestOption[] = (examRows ?? []).map((e) => ({
    id: e.id,
    classId: e.class_id,
    className: e.classes?.name ?? "Unknown Class",
    name: e.name,
    maxMarks: e.max_marks,
    examDate: e.exam_date,
  }));

  const examIds = tests.map((t) => t.id);
  let marks: MarkRow[] = [];
  let marksError: string | null = null;

  if (examIds.length > 0) {
    const { data: markRows, error } = await supabase
      .from("exam_marks")
      .select("exam_id, student_id, marks, updated_at")
      .in("exam_id", examIds)
      .returns<{ exam_id: string; student_id: string; marks: number; updated_at: string }[]>();

    if (error) {
      marksError = error.message;
    } else {
      marks = markRows ?? [];
    }
  }

  const error = rosterError ?? examsError?.message ?? marksError;

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="Results" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={BarChartIcon}
            title="Results"
            subtitle="Enter marks for your tests and view class performance"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "Results" }]}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load results: {error}
            </div>
          ) : tests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A2E494]/25 text-[#13714C]">
                <BarChartIcon className="h-7 w-7" />
              </span>
              <p className="text-base font-bold text-[#0f4d34]">No tests yet</p>
              <p className="max-w-sm text-sm text-gray-500">Create a test first, then come back here to enter marks.</p>
              <Link
                href="/teacher/tests"
                className="mt-1 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
              >
                Go to Tests
              </Link>
            </div>
          ) : (
            <ResultsBoard tests={tests} roster={roster} marks={marks} initialExamId={examId} />
          )}
        </main>
      </div>
    </div>
  );
}
