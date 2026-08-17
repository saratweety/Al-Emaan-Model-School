import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import StatCard from "@/components/dashboard/StatCard";
import ClassStudentsTable, { type ClassStudent } from "@/components/dashboard/ClassStudentsTable";
import TeacherAssignmentsPanel, { type Assignment } from "@/components/classes/TeacherAssignmentsPanel";
import {
  ChevronRightIcon,
  GraduationCapIcon,
  ArrowLeftIcon,
  DownloadIcon,
  UsersIcon,
  UserIcon,
  CheckSquareIcon,
  FunnelIcon,
  InfoIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";

type EnrolledStudent = ClassStudent & { gender: string | null };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classId: string }>;
}): Promise<Metadata> {
  const { classId } = await params;
  const supabase = await createClient();
  const { data: classRow } = await supabase.from("classes").select("name").eq("id", classId).maybeSingle();

  return {
    title: `${classRow?.name ?? "Class"} | Al-Emaan Model School`,
    description: "Class roster, enrollment breakdown and attendance snapshot.",
  };
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const supabase = await createClient();

  const { data: classRow } = await supabase
    .from("classes")
    .select("id, name")
    .eq("id", classId)
    .maybeSingle();

  if (!classRow) {
    notFound();
  }

  const currentSessionId = await getCurrentSessionId();

  let list: EnrolledStudent[] = [];
  let error: string | null = null;

  if (currentSessionId) {
    const { data, error: queryError } = await supabase
      .from("student_enrollments")
      .select("students(id, full_name, father_name, contact_number, gender)")
      .eq("class_id", classId)
      .eq("session_id", currentSessionId)
      .eq("status", "active")
      .returns<{ students: EnrolledStudent | null }[]>();

    if (queryError) {
      error = queryError.message;
    } else {
      list = (data ?? [])
        .map((e) => e.students)
        .filter((s): s is EnrolledStudent => s !== null)
        .sort((a, b) => a.full_name.localeCompare(b.full_name));
    }
  }

  const total = list.length;
  const boys = list.filter((s) => s.gender === "male").length;
  const girls = list.filter((s) => s.gender === "female").length;

  const { data: subjects } = await supabase.from("subjects").select("id, name").order("name", { ascending: true });
  const { data: teacherProfiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "teacher")
    .order("full_name", { ascending: true });

  let assignments: Assignment[] = [];

  if (currentSessionId) {
    const { data: assignmentRows } = await supabase
      .from("teacher_assignments")
      .select("id, is_class_teacher, subjects(name), profiles(full_name)")
      .eq("class_id", classId)
      .eq("session_id", currentSessionId)
      .returns<
        { id: string; is_class_teacher: boolean; subjects: { name: string } | null; profiles: { full_name: string } | null }[]
      >();

    assignments = (assignmentRows ?? [])
      .filter((a) => a.subjects && a.profiles)
      .map((a) => ({
        id: a.id,
        isClassTeacher: a.is_class_teacher,
        subjectName: a.subjects!.name,
        teacherName: a.profiles!.full_name,
      }));
  }

  const classTeacherName = assignments.find((a) => a.isClassTeacher)?.teacherName ?? null;

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Classes" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#A2E494]/25 text-[#13714C]">
                <GraduationCapIcon className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Link href="/dashboard" className="hover:text-[#13714C] hover:underline">
                    Dashboard
                  </Link>
                  <ChevronRightIcon className="h-3 w-3" />
                  <Link href="/dashboard/classes" className="hover:text-[#13714C] hover:underline">
                    Classes
                  </Link>
                  <ChevronRightIcon className="h-3 w-3" />
                  <span className="font-semibold text-[#13714C]">{classRow.name}</span>
                </div>
                <h1 className="mt-0.5 truncate text-2xl font-extrabold text-[#0f4d34]">{classRow.name}</h1>
                <p className="text-sm text-gray-500">
                  Total Students: <span className="font-semibold text-gray-700">{total}</span>
                  <span className="mx-1.5">|</span>
                  Class Teacher:{" "}
                  <span className={`font-semibold ${classTeacherName ? "text-[#13714C]" : "text-gray-400"}`}>
                    {classTeacherName ?? "Not assigned yet"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/classes"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Classes
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <DownloadIcon className="h-4 w-4" />
                Export List
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={UsersIcon} iconBg="bg-[#13714C]" label="Total Students" value={String(total)} />
            <StatCard icon={UserIcon} iconBg="bg-blue-500" label="Boys" value={String(boys)} />
            <StatCard icon={UserIcon} iconBg="bg-[#e8608a]" label="Girls" value={String(girls)} />

            <div className="flex min-h-[124px] items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500">
                <CheckSquareIcon className="h-5 w-5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold leading-tight tracking-wide text-gray-500">TODAY&apos;S ATTENDANCE</p>
                <p className="mt-1 text-sm font-semibold text-gray-400">Attendance not connected yet</p>
              </div>
            </div>
          </div>

          {/* Students list */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#0f4d34]">Students List</h2>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4" />
                Filter
              </button>
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Couldn&apos;t load students: {error}
              </div>
            ) : (
              <ClassStudentsTable students={list} />
            )}
          </div>

          <TeacherAssignmentsPanel
            classId={classId}
            subjects={subjects ?? []}
            teachers={(teacherProfiles ?? []).map((t) => ({ id: t.id, name: t.full_name }))}
            assignments={assignments}
          />
        </main>
      </div>
    </div>
  );
}
