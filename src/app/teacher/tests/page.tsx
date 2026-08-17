import type { Metadata } from "next";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import TestsBoard, { type TestRow } from "@/components/teacher/TestsBoard";
import { AwardIcon, InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getClasses } from "@/lib/classes-data";

export const metadata: Metadata = {
  title: "Tests | Al-Emaan Model School",
  description: "Create and manage tests for your classes.",
};

export default async function TeacherTestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { classes } = await getClasses();

  const { data: rows, error } = await supabase
    .from("exams")
    .select("id, class_id, name, max_marks, exam_date, created_at, classes(name)")
    .eq("teacher_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .returns<
      { id: string; class_id: string; name: string; max_marks: number; exam_date: string | null; created_at: string; classes: { name: string } | null }[]
    >();

  const tests: TestRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    classId: r.class_id,
    className: r.classes?.name ?? "Unknown Class",
    name: r.name,
    maxMarks: r.max_marks,
    examDate: r.exam_date,
  }));

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="Tests" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={AwardIcon}
            title="Tests"
            subtitle="Create tests for your classes, then enter marks from the Results page"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "Tests" }]}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load tests: {error.message}
            </div>
          ) : (
            <TestsBoard classes={classes} tests={tests} />
          )}
        </main>
      </div>
    </div>
  );
}
