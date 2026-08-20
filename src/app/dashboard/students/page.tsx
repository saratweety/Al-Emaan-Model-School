import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import StudentsTable from "@/components/students/StudentsTable";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getClasses } from "@/lib/classes-data";
import { UsersIcon, UserIcon, ShieldCheckIcon, GraduationCapIcon, InfoIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Students | Al-Emaan Model School",
  description: "Browse and manage the student list.",
};

type Student = {
  id: string;
  admission_no: string;
  full_name: string;
  father_name: string;
  contact_number: string | null;
  gender: string | null;
  admission_date: string;
  photo_url: string | null;
  b_form_url: string | null;
  certificate_url: string | null;
  other_document_url: string | null;
};

function startOfMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export default async function StudentsPage() {
  const supabase = await createClient();

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select(
      "id, admission_no, full_name, father_name, contact_number, gender, admission_date, photo_url, b_form_url, certificate_url, other_document_url"
    )
    .order("created_at", { ascending: false })
    .returns<Student[]>();

  const photoPaths = (students ?? []).map((s) => s.photo_url).filter((p): p is string => Boolean(p));
  const photoUrlByPath: Record<string, string> = {};
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage.from("student-files").createSignedUrls(photoPaths, 3600);
    for (const s of signed ?? []) {
      if (s.signedUrl && !s.error && s.path) photoUrlByPath[s.path] = s.signedUrl;
    }
  }

  const currentSessionId = await getCurrentSessionId();
  const { classes } = await getClasses();

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
  const monthStart = startOfMonthISO();
  const newThisMonth = list.filter((s) => s.admission_date >= monthStart).length;

  const statCards = [
    { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL STUDENTS", value: String(total), sub: "All Classes" },
    {
      icon: UserIcon,
      iconBg: "bg-[#3AB67D]",
      label: "BOYS",
      value: String(boys),
      sub: total ? `${((boys / total) * 100).toFixed(2)}%` : "0%",
    },
    {
      icon: UserIcon,
      iconBg: "bg-[#e8608a]",
      label: "GIRLS",
      value: String(girls),
      sub: total ? `${((girls / total) * 100).toFixed(2)}%` : "0%",
    },
    { icon: ShieldCheckIcon, iconBg: "bg-[#13714C]", label: "PRESENT TODAY", value: "—", sub: "Attendance not connected yet" },
    { icon: GraduationCapIcon, iconBg: "bg-[#3AB67D]", label: "NEW THIS MONTH", value: String(newThisMonth), sub: "New Admissions" },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Students" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={GraduationCapIcon}
            title="Students"
            subtitle="Manage student records and enrollment"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Students" }]}
            actionLabel="Add Student"
            actionHref="/dashboard/students/add"
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="flex justify-end">
            <Link
              href="/dashboard/students/promote"
              className="flex items-center gap-2 rounded-xl border border-[#13714C]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#13714C] shadow-sm hover:bg-[#A2E494]/10"
            >
              <GraduationCapIcon className="h-4 w-4" />
              Promote Students
            </Link>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load students: {error}
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
              <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
              No students yet. Use &quot;Add Student&quot; to enroll the first one.
            </div>
          ) : (
            <StudentsTable
              students={list}
              classNameByStudentId={classNameByStudentId}
              photoUrlByPath={photoUrlByPath}
              classNames={classes.map((c) => c.name)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
