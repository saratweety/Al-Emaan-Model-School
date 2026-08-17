import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AddStudentForm, { type ExistingStudentFiles } from "@/components/students/AddStudentForm";
import { ArrowLeftIcon, InfoIcon } from "@/components/icons";
import { getClasses } from "@/lib/classes-data";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getStudentDetail } from "@/lib/students-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Student | Al-Emaan Model School",
  description: "Update a student's details.",
};

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ classes }, currentSessionId, { student, error }] = await Promise.all([
    getClasses(),
    getCurrentSessionId(),
    getStudentDetail(id),
  ]);

  const existingFileUrls: ExistingStudentFiles = {};
  if (student) {
    const supabase = await createClient();
    const paths = [student.photoUrl, student.bFormUrl, student.certificateUrl, student.otherDocumentUrl].filter(
      (p): p is string => Boolean(p)
    );
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from("student-files").createSignedUrls(paths, 3600);
      const urlByPath = new Map((signed ?? []).filter((s) => s.signedUrl && !s.error).map((s) => [s.path ?? "", s.signedUrl]));
      existingFileUrls.photo = student.photoUrl ? urlByPath.get(student.photoUrl) : null;
      existingFileUrls.bForm = student.bFormUrl ? urlByPath.get(student.bFormUrl) : null;
      existingFileUrls.certificate = student.certificateUrl ? urlByPath.get(student.certificateUrl) : null;
      existingFileUrls.otherDoc = student.otherDocumentUrl ? urlByPath.get(student.otherDocumentUrl) : null;
    }
  }

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Students" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href={student ? `/dashboard/students/${student.id}` : "/dashboard/students"}
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Student
          </Link>

          {error || !student ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error ?? "This student could not be found."}
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Edit Student</h1>
                <p className="text-sm text-gray-500">Update {student.fullName}&apos;s details below.</p>
              </div>

              <AddStudentForm
                classes={classes}
                currentSessionId={currentSessionId}
                existingFileUrls={existingFileUrls}
                student={{
                  id: student.id,
                  admissionNo: student.admissionNo,
                  fullName: student.fullName,
                  fatherName: student.fatherName,
                  dateOfBirth: student.dateOfBirth,
                  gender: student.gender,
                  contactNumber: student.contactNumber,
                  classId: student.classId,
                  monthlyFee: student.monthlyFee,
                  admissionFee: student.admissionFee,
                  otherCharges: student.otherCharges,
                  photoUrl: student.photoUrl,
                  bFormUrl: student.bFormUrl,
                  certificateUrl: student.certificateUrl,
                  otherDocumentUrl: student.otherDocumentUrl,
                }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
