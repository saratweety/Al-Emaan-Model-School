import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import { UsersIcon, BriefcaseIcon, BookIcon, CalendarIcon, FileTextIcon, InfoIcon } from "@/components/icons";
import TeachersTable from "@/components/teachers/TeachersTable";
import TeacherProfilePicker from "@/components/teachers/TeacherProfilePicker";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getTeacherAttendanceTodayCounts } from "@/lib/teachers-data";

export const metadata: Metadata = {
  title: "Teachers | Al-Emaan Model School",
  description: "Manage teachers and their class assignments.",
};

type TeacherRow = {
  id: string;
  teacher_code: string;
  qualification: string | null;
  experience_years: number | null;
  photo_url: string | null;
  cnic_document_url: string | null;
  certificate_url: string | null;
  other_document_url: string | null;
  profiles: { full_name: string; phone: string | null } | null;
  subjects: { name: string } | null;
};

const quickLinks = [
  { icon: CalendarIcon, title: "Attendance Report", sub: "Daily attendance record", href: "/dashboard/teachers/attendance" },
  { icon: BookIcon, title: "Subject Allocation", sub: "Manage classes & subjects", href: "/dashboard/classes" },
  { icon: FileTextIcon, title: "Teacher Documents", sub: "View certificates & files", href: "/dashboard/teachers/documents" },
];

export default async function TeachersPage() {
  const supabase = await createClient();

  const { data: teachers, error } = await supabase
    .from("teachers")
    .select(
      "id, teacher_code, qualification, experience_years, photo_url, cnic_document_url, certificate_url, other_document_url, profiles(full_name, phone), subjects(name)"
    )
    .order("teacher_code", { ascending: true })
    .returns<TeacherRow[]>();

  const photoPaths = (teachers ?? []).map((t) => t.photo_url).filter((p): p is string => Boolean(p));
  const photoUrlByPath: Record<string, string> = {};
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage.from("teacher-files").createSignedUrls(photoPaths, 3600);
    for (const s of signed ?? []) {
      if (s.signedUrl && !s.error && s.path) photoUrlByPath[s.path] = s.signedUrl;
    }
  }

  const currentSessionId = await getCurrentSessionId();

  const classTeacherByTeacher: Record<string, string> = {};
  if (currentSessionId) {
    const { data: rows } = await supabase
      .from("teacher_assignments")
      .select("teacher_id, classes(name)")
      .eq("session_id", currentSessionId)
      .eq("is_class_teacher", true)
      .returns<{ teacher_id: string; classes: { name: string } | null }[]>();

    for (const r of rows ?? []) {
      if (r.classes) classTeacherByTeacher[r.teacher_id] = r.classes.name;
    }
  }

  const list = teachers ?? [];
  const total = list.length;
  const todayAttendance = await getTeacherAttendanceTodayCounts();

  const statCards = [
    { icon: UsersIcon, iconBg: "bg-[#13714C]", label: "TOTAL TEACHERS", value: String(total), sub: "All Staff" },
    {
      icon: BriefcaseIcon,
      iconBg: "bg-[#3AB67D]",
      label: "PRESENT TODAY",
      value: String(todayAttendance.present),
      sub: todayAttendance.marked === 0 ? "Not marked yet" : `${todayAttendance.marked} marked`,
      href: "/dashboard/teachers/attendance",
    },
    {
      icon: BriefcaseIcon,
      iconBg: "bg-[#e0645f]",
      label: "ABSENT TODAY",
      value: String(todayAttendance.absent),
      sub: todayAttendance.marked === 0 ? "Not marked yet" : `${todayAttendance.marked} marked`,
      href: "/dashboard/teachers/attendance",
    },
    {
      icon: BriefcaseIcon,
      iconBg: "bg-amber-500",
      label: "LATE TODAY",
      value: String(todayAttendance.late),
      sub: todayAttendance.marked === 0 ? "Not marked yet" : `${todayAttendance.marked} marked`,
      href: "/dashboard/teachers/attendance",
    },
  ];

  const teacherRows = list.map((t) => ({
    id: t.id,
    teacher_code: t.teacher_code,
    qualification: t.qualification,
    experience_years: t.experience_years,
    photo_url: t.photo_url,
    cnic_document_url: t.cnic_document_url,
    certificate_url: t.certificate_url,
    other_document_url: t.other_document_url,
    name: t.profiles?.full_name ?? "—",
    phone: t.profiles?.phone ?? null,
    subjectName: t.subjects?.name ?? null,
  }));
  const subjectNames = Array.from(new Set(teacherRows.map((t) => t.subjectName).filter((s): s is string => Boolean(s)))).sort();
  const classNames = Array.from(new Set(Object.values(classTeacherByTeacher))).sort();

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Teachers" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={UsersIcon}
            title="Teachers"
            subtitle="Manage teachers and their class assignments"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Teachers" }]}
            actionLabel="Add Teacher"
            actionHref="/dashboard/teachers/add"
          />

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load teachers: {error.message}
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
              <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
              No teachers yet. Use &quot;Add Teacher&quot; to register the first one.
            </div>
          ) : (
            <TeachersTable
              teachers={teacherRows}
              classTeacherByTeacher={classTeacherByTeacher}
              photoUrlByPath={photoUrlByPath}
              subjectNames={subjectNames}
              classNames={classNames}
            />
          )}

          {/* Quick links */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TeacherProfilePicker
              teachers={teacherRows.map((t) => ({ id: t.id, name: t.name, teacherCode: t.teacher_code }))}
            />
            {quickLinks.map(({ icon: Icon, title, sub, href }) => (
              <Link
                key={title}
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4 text-left hover:bg-[#A2E494]/20"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#13714C] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0f4d34]">{title}</p>
                  <p className="truncate text-xs text-gray-500">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
