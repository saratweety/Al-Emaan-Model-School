import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import TeacherAttendanceRoster, { type AttendanceTeacher } from "@/components/teachers/TeacherAttendanceRoster";
import { ArrowLeftIcon, CalendarIcon, InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Teacher Attendance | Al-Emaan Model School",
  description: "Mark and review daily teacher attendance.",
};

export default async function TeacherAttendanceReportPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select("id, teacher_code, profiles(full_name), subjects(name)")
    .order("teacher_code", { ascending: true })
    .returns<{ id: string; teacher_code: string; profiles: { full_name: string } | null; subjects: { name: string } | null }[]>();

  const teachers: AttendanceTeacher[] = (data ?? []).map((t) => ({
    id: t.id,
    teacher_code: t.teacher_code,
    full_name: t.profiles?.full_name ?? "—",
    subject_name: t.subjects?.name ?? null,
  }));

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Teachers" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/teachers"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Teachers
          </Link>

          <PageHeader
            icon={CalendarIcon}
            title="Teacher Attendance"
            subtitle="Mark and review daily attendance for teaching staff"
            breadcrumb={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Teachers", href: "/dashboard/teachers" },
              { label: "Attendance Report" },
            ]}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load teachers: {error.message}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <TeacherAttendanceRoster teachers={teachers} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
