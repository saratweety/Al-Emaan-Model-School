import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PersonFilesButton from "@/components/dashboard/PersonFilesButton";
import StudentDeleteButton from "@/components/students/StudentDeleteButton";
import {
  ArrowLeftIcon,
  PencilIcon,
  GraduationCapIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  WalletIcon,
  CheckSquareIcon,
  BarChartIcon,
  InfoIcon,
  FileTextIcon,
} from "@/components/icons";
import { getStudentDetail } from "@/lib/students-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Student Details | Al-Emaan Model School",
  description: "View a student's full profile.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { student, error } = await getStudentDetail(id);

  if (error || !student) {
    return (
      <div className="flex h-screen bg-[#F4F6F5]">
        <Sidebar active="Students" />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Topbar />
          <main className="flex-1 space-y-4 p-4 sm:p-6">
            <Link
              href="/dashboard/students"
              className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Students
            </Link>
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error ?? "This student could not be found."}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  let photoUrl: string | null = null;
  if (student.photoUrl) {
    const { data: signed } = await supabase.storage.from("student-files").createSignedUrl(student.photoUrl, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  const documents = [
    { label: "B-Form Copy", path: student.bFormUrl },
    { label: "Previous School Certificate", path: student.certificateUrl },
    { label: "Other Document", path: student.otherDocumentUrl },
  ].filter((f): f is { label: string; path: string } => Boolean(f.path));

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Students" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard/students"
              className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Students
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/students/${student.id}/edit`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Student
              </Link>
              <StudentDeleteButton studentId={student.id} studentName={student.fullName} />
            </div>
          </div>

          {/* Student header */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={student.fullName} className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${
                  student.gender === "male" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                }`}
              >
                {initials(student.fullName)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-extrabold text-[#0f4d34] sm:text-xl">{student.fullName}</h1>
              <p className="text-sm text-gray-500">Admission No: {student.admissionNo}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <GraduationCapIcon className="h-4 w-4 text-[#13714C]" />
                  {student.className}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-[#13714C]" />
                  Father: {student.fatherName}
                </span>
                {student.contactNumber && (
                  <span className="flex items-center gap-1.5">
                    <PhoneIcon className="h-4 w-4 text-[#13714C]" />
                    {student.contactNumber}
                  </span>
                )}
              </div>
            </div>
            <PersonFilesButton bucket="student-files" personName={student.fullName} files={documents} />
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
                <CheckSquareIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-500">Attendance</p>
                <p className="text-lg font-extrabold text-gray-800">{student.attendancePct}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <WalletIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-500">Fee Status</p>
                <p className={`text-lg font-extrabold ${student.feeStatus === "Pending" ? "text-red-600" : "text-gray-800"}`}>
                  {student.feeStatus}
                  {student.pendingMonths > 0 && <span className="ml-1 text-xs font-semibold text-gray-400">({student.pendingMonths} mo)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <BarChartIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-500">Latest Result</p>
                <p className="text-lg font-extrabold text-gray-800">{student.latestResult}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <UserIcon className="h-4 w-4" />
                Personal Information
              </h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Date of Birth</dt>
                  <dd className="font-semibold text-gray-800">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Gender</dt>
                  <dd className="font-semibold capitalize text-gray-800">{student.gender ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Contact Number</dt>
                  <dd className="font-semibold text-gray-800">{student.contactNumber ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Admission Date
                  </dt>
                  <dd className="font-semibold text-gray-800">
                    {new Date(student.admissionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <WalletIcon className="h-4 w-4" />
                Fee Structure
              </h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Monthly Fee</dt>
                  <dd className="font-semibold text-gray-800">Rs. {student.monthlyFee.toLocaleString("en-US")}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Admission Fee</dt>
                  <dd className="font-semibold text-gray-800">Rs. {student.admissionFee.toLocaleString("en-US")}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-500">Other Charges</dt>
                  <dd className="font-semibold text-gray-800">Rs. {student.otherCharges.toLocaleString("en-US")}</dd>
                </div>
              </dl>
              <Link
                href={`/dashboard/fees/${student.id}`}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F4F6F5] py-2 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/20"
              >
                <FileTextIcon className="h-4 w-4" />
                View Full Fee Record
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
