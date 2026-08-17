import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  UsersIcon,
  BriefcaseIcon,
  SearchIcon,
  BookIcon,
  ChevronDownIcon,
  EyeOutlineIcon,
  PencilIcon,
  CalendarIcon,
  FileTextIcon,
  InfoIcon,
} from "@/components/icons";
import PersonFilesButton from "@/components/dashboard/PersonFilesButton";
import TeacherRowDeleteButton from "@/components/teachers/TeacherRowDeleteButton";
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
  profiles: { full_name: string } | null;
  subjects: { name: string } | null;
};

const quickLinks = [
  { icon: CalendarIcon, title: "Attendance Report", sub: "Daily attendance record", href: "/dashboard/teachers/attendance" },
  { icon: BookIcon, title: "Subject Allocation", sub: "Manage classes & subjects", href: "/dashboard/classes" },
  { icon: FileTextIcon, title: "Teacher Documents", sub: "View certificates & files", href: "/dashboard/teachers/documents" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function TeachersPage() {
  const supabase = await createClient();

  const { data: teachers, error } = await supabase
    .from("teachers")
    .select(
      "id, teacher_code, qualification, experience_years, photo_url, cnic_document_url, certificate_url, other_document_url, profiles(full_name), subjects(name)"
    )
    .order("teacher_code", { ascending: true })
    .returns<TeacherRow[]>();

  const photoPaths = (teachers ?? []).map((t) => t.photo_url).filter((p): p is string => Boolean(p));
  const photoUrlByPath = new Map<string, string>();
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage.from("teacher-files").createSignedUrls(photoPaths, 3600);
    for (const s of signed ?? []) {
      if (s.signedUrl && !s.error) photoUrlByPath.set(s.path ?? "", s.signedUrl);
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teacher by name, ID or phone..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <UsersIcon className="h-4 w-4" />
              All Teachers
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <BookIcon className="h-4 w-4" />
              All Subjects
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Teachers table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
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
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">#</th>
                      <th className="px-3 py-3">Teacher Name</th>
                      <th className="px-3 py-3">Teacher ID</th>
                      <th className="px-3 py-3">Subject</th>
                      <th className="px-3 py-3">Class Teacher</th>
                      <th className="px-3 py-3">Qualification</th>
                      <th className="px-3 py-3">Experience</th>
                      <th className="rounded-r-xl px-3 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((t, i) => {
                      const name = t.profiles?.full_name ?? "—";
                      return (
                        <tr key={t.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              {t.photo_url && photoUrlByPath.get(t.photo_url) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={photoUrlByPath.get(t.photo_url)}
                                  alt={name}
                                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-xs font-bold text-white">
                                  {initials(name)}
                                </span>
                              )}
                              <span className="font-semibold text-gray-800">{name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-600">{t.teacher_code}</td>
                          <td className="px-3 py-3 text-gray-600">{t.subjects?.name ?? "—"}</td>
                          <td className="px-3 py-3 text-gray-600">{classTeacherByTeacher[t.id] ?? "—"}</td>
                          <td className="px-3 py-3 text-gray-600">{t.qualification ?? "—"}</td>
                          <td className="px-3 py-3 text-gray-600">
                            {t.experience_years !== null ? `${t.experience_years} yrs` : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/dashboard/teachers/${t.id}`}
                                aria-label="View"
                                className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20"
                              >
                                <EyeOutlineIcon className="h-4 w-4" />
                              </Link>
                              <PersonFilesButton
                                bucket="teacher-files"
                                personName={name}
                                files={[
                                  { label: "CNIC Copy", path: t.cnic_document_url },
                                  { label: "Educational Certificate", path: t.certificate_url },
                                  { label: "Other Document", path: t.other_document_url },
                                ].filter((f): f is { label: string; path: string } => Boolean(f.path))}
                              />
                              <Link
                                href={`/dashboard/teachers/${t.id}/edit`}
                                aria-label="Edit"
                                className="rounded-lg p-1.5 text-[#13714C] hover:bg-[#A2E494]/20"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Link>
                              <TeacherRowDeleteButton teacherId={t.id} teacherName={name} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {list.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Showing {list.length} of {list.length} teachers</p>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TeacherProfilePicker
              teachers={list.map((t) => ({ id: t.id, name: t.profiles?.full_name ?? "—", teacherCode: t.teacher_code }))}
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
