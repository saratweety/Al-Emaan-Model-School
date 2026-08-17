import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PersonFilesButton from "@/components/dashboard/PersonFilesButton";
import TeacherDeleteButton from "@/components/teachers/TeacherDeleteButton";
import {
  ArrowLeftIcon,
  PencilIcon,
  BriefcaseIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  BookIcon,
  InfoIcon,
} from "@/components/icons";
import { getTeacherDetail } from "@/lib/teachers-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Teacher Details | Al-Emaan Model School",
  description: "View a teacher's full profile and class assignments.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { teacher, error } = await getTeacherDetail(id);

  if (error || !teacher) {
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
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error ?? "This teacher could not be found."}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  let photoUrl: string | null = null;
  if (teacher.photoUrl) {
    const { data: signed } = await supabase.storage.from("teacher-files").createSignedUrl(teacher.photoUrl, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  const documents = [
    { label: "CNIC Copy", path: teacher.cnicDocumentUrl },
    { label: "Educational Certificate", path: teacher.certificateUrl },
    { label: "Other Document", path: teacher.otherDocumentUrl },
  ].filter((f): f is { label: string; path: string } => Boolean(f.path));

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Teachers" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard/teachers"
              className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Teachers
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/teachers/${teacher.id}/edit`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Teacher
              </Link>
              <TeacherDeleteButton teacherId={teacher.id} teacherName={teacher.fullName} />
            </div>
          </div>

          {/* Teacher header */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={teacher.fullName} className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-lg font-bold text-white">
                {initials(teacher.fullName)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-extrabold text-[#0f4d34] sm:text-xl">{teacher.fullName}</h1>
              <p className="text-sm text-gray-500">Teacher ID: {teacher.teacherCode}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MailIcon className="h-4 w-4 text-[#13714C]" />
                  {teacher.email}
                </span>
                {teacher.phone && (
                  <span className="flex items-center gap-1.5">
                    <PhoneIcon className="h-4 w-4 text-[#13714C]" />
                    {teacher.phone}
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    teacher.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {teacher.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <PersonFilesButton bucket="teacher-files" personName={teacher.fullName} files={documents} />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <BriefcaseIcon className="h-4 w-4" />
                Professional Information
              </h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">CNIC</dt>
                  <dd className="font-semibold text-gray-800">{teacher.cnic ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Qualification</dt>
                  <dd className="font-semibold text-gray-800">{teacher.qualification ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Specialization</dt>
                  <dd className="font-semibold text-gray-800">{teacher.specializationSubjectName ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Experience</dt>
                  <dd className="font-semibold text-gray-800">
                    {teacher.experienceYears !== null ? `${teacher.experienceYears} yrs` : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Joining Date
                  </dt>
                  <dd className="font-semibold text-gray-800">
                    {new Date(teacher.joiningDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <BookIcon className="h-4 w-4" />
                Class &amp; Subject Assignments
              </h2>
              {teacher.assignments.length === 0 ? (
                <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
                  Not assigned to any class or subject yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {teacher.assignments.map((a, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5 text-sm">
                      <div>
                        <p className="font-semibold text-gray-800">{a.className}</p>
                        <p className="text-xs text-gray-500">{a.subjectName}</p>
                      </div>
                      {a.isClassTeacher && (
                        <span className="rounded-full bg-[#A2E494]/25 px-2.5 py-1 text-xs font-semibold text-[#13714C]">
                          Class Teacher
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/dashboard/classes"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F4F6F5] py-2 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/20"
              >
                Manage Assignments
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
