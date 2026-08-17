import type { Metadata } from "next";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import HomeworkBoard, { type HomeworkEntry, type SubjectAssignment } from "@/components/teacher/HomeworkBoard";
import { ClipboardListIcon, InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export const metadata: Metadata = {
  title: "Homework | Al-Emaan Model School",
  description: "Post homework for your classes.",
};

export default async function TeacherHomeworkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionId = await getCurrentSessionId();

  const { data: assignmentRows } =
    sessionId && user
      ? await supabase
          .from("teacher_assignments")
          .select("class_id, subject_id, is_class_teacher, classes(name), subjects(name)")
          .eq("teacher_id", user.id)
          .eq("session_id", sessionId)
          .returns<
            {
              class_id: string;
              subject_id: string | null;
              is_class_teacher: boolean;
              classes: { name: string } | null;
              subjects: { name: string } | null;
            }[]
          >()
      : { data: [] };

  const assignments: SubjectAssignment[] = (assignmentRows ?? [])
    .filter((a): a is typeof a & { subject_id: string } => Boolean(a.subject_id))
    .map((a) => ({
      classId: a.class_id,
      className: a.classes?.name ?? "Unknown Class",
      subjectId: a.subject_id,
      subjectName: a.subjects?.name ?? "General",
    }));

  const classTeacherClasses = [
    ...new Map(
      (assignmentRows ?? [])
        .filter((a) => a.is_class_teacher)
        .map((a) => [a.class_id, { id: a.class_id, name: a.classes?.name ?? "Unknown Class" }] as const)
    ).values(),
  ];

  const { data: rows, error } = await supabase
    .from("homework")
    .select("id, class_id, subject_id, entry_type, title, description, due_date, created_at, classes(name), subjects(name)")
    .eq("teacher_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .returns<
      {
        id: string;
        class_id: string;
        subject_id: string | null;
        entry_type: string;
        title: string;
        description: string;
        due_date: string | null;
        created_at: string;
        classes: { name: string } | null;
        subjects: { name: string } | null;
      }[]
    >();

  const entries: HomeworkEntry[] = (rows ?? []).map((r) => ({
    id: r.id,
    classId: r.class_id,
    className: r.classes?.name ?? "Unknown Class",
    subjectId: r.subject_id,
    subjectName: r.subjects?.name ?? null,
    entryType: r.entry_type === "vacation_diary" ? "vacation_diary" : "homework",
    title: r.title,
    description: r.description,
    dueDate: r.due_date,
    postedOn: new Date(r.created_at).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="Homework" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={ClipboardListIcon}
            title="Homework"
            subtitle="Post homework for subjects you teach, or the class diary if you're the class teacher"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "Homework" }]}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load homework: {error.message}
            </div>
          ) : (
            <HomeworkBoard assignments={assignments} classTeacherClasses={classTeacherClasses} entries={entries} />
          )}
        </main>
      </div>
    </div>
  );
}
