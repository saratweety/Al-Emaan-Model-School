import type { Metadata } from "next";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import StudentsRosterTable from "@/components/teacher/StudentsRosterTable";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { UsersIcon, UserIcon, GraduationCapIcon, InfoIcon, BuildingIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "My Classes | Al-Emaan Model School",
  description: "View your assigned classes and their students.",
};

type Student = {
  id: string;
  admission_no: string;
  full_name: string;
  father_name: string;
  contact_number: string | null;
  gender: string | null;
};

export default async function TeacherStudentsPage() {
  const supabase = await createClient();

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, admission_no, full_name, father_name, contact_number, gender")
    .order("full_name", { ascending: true })
    .returns<Student[]>();

  const currentSessionId = await getCurrentSessionId();

  const classNameByStudentId: Record<string, string> = {};
  let enrollmentsError: string | null = null;

  if (currentSessionId) {
    const { data: enrollments, error } = await supabase
      .from("student_enrollments")
      .select("student_id, classes(name)")
      .eq("session_id", currentSessionId)
      .eq("status", "active")
      .returns<{ student_id: string; classes: { name: string } | null }[]>();

    if (error) {
      enrollmentsError = error.message;
    } else {
      for (const e of enrollments ?? []) {
        if (e.classes) classNameByStudentId[e.student_id] = e.classes.name;
      }
    }
  }

  const error = studentsError?.message ?? enrollmentsError;

  const list = students ?? [];
  const total = list.length;
  const boys = list.filter((s) => s.gender === "male").length;
  const girls = list.filter((s) => s.gender === "female").length;

  const classCounts: Record<string, number> = {};
  for (const s of list) {
    const cls = classNameByStudentId[s.id];
    if (cls) classCounts[cls] = (classCounts[cls] ?? 0) + 1;
  }
  const classNames = Object.keys(classCounts).sort();

  const statCards = [
    { icon: BuildingIcon, iconBg: "bg-[#3AB67D]", label: "CLASSES", value: String(classNames.length), sub: "This Session" },
    { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL STUDENTS", value: String(total), sub: "All Classes" },
    { icon: UserIcon, iconBg: "bg-[#3AB67D]", label: "BOYS", value: String(boys), sub: total ? `${((boys / total) * 100).toFixed(0)}%` : "0%" },
    { icon: UserIcon, iconBg: "bg-[#e8608a]", label: "GIRLS", value: String(girls), sub: total ? `${((girls / total) * 100).toFixed(0)}%` : "0%" },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="My Classes" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={GraduationCapIcon}
            title="My Classes"
            subtitle="View-only roster of students in your classes"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "My Classes" }]}
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {classNames.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {classNames.map((cls) => (
                <div key={cls} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
                    <GraduationCapIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#0f4d34]">{cls}</p>
                    <p className="text-xs text-gray-500">{classCounts[cls]} students</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load students: {error}
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
              <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
              No students found in your classes yet.
            </div>
          ) : (
            <StudentsRosterTable students={list} classNameByStudentId={classNameByStudentId} />
          )}
        </main>
      </div>
    </div>
  );
}
