import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import PersonFilesButton from "@/components/dashboard/PersonFilesButton";
import StudentRowDeleteButton from "@/components/students/StudentRowDeleteButton";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import {
  UsersIcon,
  UserIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  EyeOutlineIcon,
  PencilIcon,
  ChevronDownIcon,
  SearchIcon,
  InfoIcon,
} from "@/components/icons";

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

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
  const photoUrlByPath = new Map<string, string>();
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage.from("student-files").createSignedUrls(photoPaths, 3600);
    for (const s of signed ?? []) {
      if (s.signedUrl && !s.error) photoUrlByPath.set(s.path ?? "", s.signedUrl);
    }
  }

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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student by name, admission no. or roll no..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <GraduationCapIcon className="h-4 w-4" />
              All Classes
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-gray-50">
              <ShieldCheckIcon className="h-4 w-4" />
              All Status
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            <Link
              href="/dashboard/students/promote"
              className="flex items-center gap-2 rounded-xl border border-[#13714C]/30 px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
            >
              <GraduationCapIcon className="h-4 w-4" />
              Promote Students
            </Link>
          </div>

          {/* Students table */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
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
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">#</th>
                      <th className="px-3 py-3">Student Name</th>
                      <th className="px-3 py-3">Admission No.</th>
                      <th className="px-3 py-3">Class</th>
                      <th className="px-3 py-3">Father Name</th>
                      <th className="px-3 py-3">Phone</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="rounded-r-xl px-3 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((s, i) => (
                      <tr key={s.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            {s.photo_url && photoUrlByPath.get(s.photo_url) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={photoUrlByPath.get(s.photo_url)}
                                alt={s.full_name}
                                className="h-9 w-9 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                                  s.gender === "male" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                                }`}
                              >
                                {initials(s.full_name)}
                              </span>
                            )}
                            <span className="font-semibold text-gray-800">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{s.admission_no}</td>
                        <td className="px-3 py-3 text-gray-600">{classNameByStudentId[s.id] ?? "Unassigned"}</td>
                        <td className="px-3 py-3 text-gray-600">{s.father_name}</td>
                        <td className="px-3 py-3 text-gray-600">{s.contact_number ?? "—"}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/dashboard/students/${s.id}`}
                              aria-label="View"
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                            >
                              <EyeOutlineIcon className="h-4 w-4" />
                            </Link>
                            <PersonFilesButton
                              bucket="student-files"
                              personName={s.full_name}
                              files={[
                                { label: "B-Form Copy", path: s.b_form_url },
                                { label: "Previous School Certificate", path: s.certificate_url },
                                { label: "Other Document", path: s.other_document_url },
                              ].filter((f): f is { label: string; path: string } => Boolean(f.path))}
                            />
                            <Link
                              href={`/dashboard/students/${s.id}/edit`}
                              aria-label="Edit"
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <StudentRowDeleteButton studentId={s.id} studentName={s.full_name} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {list.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Showing {list.length} of {list.length} students</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
